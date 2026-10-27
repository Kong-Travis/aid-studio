// Helpers shared by the chapter scripts: where the learner's project lives, and waiting on AI work.
import { execFileSync } from 'node:child_process';
import { WEB } from './lib.mjs';

const sql = (q) => execFileSync('docker', ['exec', 'aid-dev-mysql', 'mysql', '-uroot', '-p123456', '--default-character-set=utf8mb4', 'aid_test', '-N', '-e', q],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

// The newest project (the learner's), as ids for the step URLs; the web app uses it for both.
export function projectIds() {
  const projectId = sql('select max(id) from aid_comic_project');
  if (!projectId || projectId === 'NULL') throw new Error('no project yet');
  return { projectId, id: projectId };
}

// step: story-script, scene-character, storyboard-script, storyboard-video, dubbing, preview
export async function projectUrl(_page, step) {
  const { projectId, id } = projectIds();
  return `${WEB}/create/${step}/?projectId=${projectId}&id=${id}`;
}

// Wait for `done` (a locator, or an async function returning true) while the narrator fills the time; then a short "still working" line if needed.
export async function waitWhileTalking(h, done, lines, timeout = 180000) {
  const until = Date.now() + timeout;
  const ready = typeof done === 'function' ? done : () => done.first().isVisible().catch(() => false);
  for (const line of lines) {
    if (await ready()) return;
    await h.cap(line);
  }
  if (await ready()) return;
  await h.cap('Vẫn đang xử lý. Đoạn chờ này mình cho video chạy nhanh.');
  await h.nocap();
  await h.fastForward(async () => {
    while (!(await ready())) {
      if (Date.now() > until) throw new Error('timed out waiting for AI result');
      await h.page.waitForTimeout(500);
    }
  });
}

const FINISHED = new Set(['SUCCEEDED', 'FAILED', 'PARTIAL_FAILED', 'CANCELLED', 'CANCELED']);

// The newest AI asset task of the project: { id, status, ok, fail }.
export function latestTask() {
  const { projectId } = projectIds();
  const row = sql(`select id, status, ifnull(json_extract(result_data,'$.successCount'),-1), ifnull(json_extract(result_data,'$.failCount'),-1) from aid_extract_task where project_id=${projectId} order by id desc limit 1`);
  if (!row) return { id: 0 };
  const [id, status, ok, fail] = row.split(/\s+/);
  return { id: Number(id), status, ok: Number(ok), fail: Number(fail) };
}

// Run one AI action and wait for its task; when Google fails it (503 overload is common on the free
// tier), say so on screen and run it again. start() clicks whatever starts the task.
export async function aiTask(h, start, lines, { tries = 3, timeout = 300000 } = {}) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    const before = latestTask().id;
    await start(attempt);
    let task;
    const finished = async () => { task = latestTask(); return task.id > before && FINISHED.has(task.status); };
    await waitWhileTalking(h, finished, attempt === 1 ? lines : [], timeout);
    if (task.status === 'SUCCEEDED' && task.fail <= 0) return task;
    if (attempt < tries) {
      await h.cap('Lần này Google báo quá tải nên chưa xong. Đây là lỗi hay gặp với gói miễn phí, vốn chỉ cho vài lượt mỗi phút. Chờ khoảng một phút rồi bấm lại.');
      await h.fastForward(() => h.page.waitForTimeout(65000));
    }
  }
  throw new Error('AI task still failing after retries');
}
