// Chapter 3, part b: AI writes the look ("tạo hình") of each character, one at a time.
import { start, snap } from '../lib.mjs';
import { projectUrl, aiTask } from '../flow.mjs';

const { page, h, finish } = await start('03b-tao-hinh', { login: true });

// Some actions ask for a confirmation that shows the points they will use.
async function confirmIfAsked() {
  const ok = page.locator('.ant-modal:visible button.bgam-btn-ok').last();
  if (await ok.isVisible({ timeout: 2500 }).catch(() => false)) await h.click(ok, 'AID hỏi xác nhận số điểm sẽ dùng. Bấm đồng ý.', { after: 1500 });
}

try {
  await page.goto(await projectUrl(page, 'scene-character'));
  await page.waitForLoadState('networkidle').catch(() => {});
  await h.wait(1500);

  // ---------------------------------------------------------------- characters
  h.mark('characters');
  await h.click(page.getByRole('button', { name: '角色', exact: true }), 'Bây giờ AI viết mô tả ngoại hình chi tiết cho từng nhân vật. Mở tab 角色, nhân vật.',
    { say: 'Bây giờ AI viết mô tả ngoại hình chi tiết cho từng nhân vật. Mở tab nhân vật.', after: 1800 });
  const pending = page.getByRole('listitem');
  await h.point(page.getByText(/cần "Tạo tạo hình"/), 'Mỗi nhân vật có nút Tạo tạo hình. Tạo hình là bộ mô tả ngoại hình mà các bước sau sẽ bám theo.');
  // AID runs one shaping task per project at a time: wait for each character before the next.
  for (const name of ['Ông Tư', 'Mai']) {
    const item = pending.filter({ hasText: new RegExp(`^${name}`) });
    await aiTask(h, async (attempt) => {
      await h.click(item.getByRole('button', { name: 'Tạo tạo hình' }), attempt === 1 ? `Bấm Tạo tạo hình ở nhân vật ${name}.` : 'Bấm lại Tạo tạo hình.', { after: 1200 });
      await confirmIfAsked();
    }, name === 'Ông Tư'
      ? ['AI đang viết tạo hình. Mỗi lần AID chỉ chạy một việc như vậy, nên chờ xong nhân vật này rồi mới bấm nhân vật tiếp theo.']
      : ['Chờ AI viết tạo hình cho Mai.']);
    await page.getByText(new RegExp(`${name}_初始形象`)).first().waitFor({ timeout: 30000 });
    await h.wait(1500);
  }
  await h.wait(2500);
  await h.cap('Xong. Mỗi trạng thái của nhân vật là một tạo hình riêng. 初始形象 nghĩa là hình ban đầu.',
    { say: 'Xong. Mỗi trạng thái của nhân vật là một tạo hình riêng. Chữ Trung ở đây nghĩa là hình ban đầu.' });
  const maiForms = await page.getByText(/^Mai_/).count();
  if (maiForms > 1) {
    await h.point(page.getByText(/^Mai_/).nth(1), 'Với Mai, AI còn tự hiểu là có thêm một trạng thái: lúc vai áo bị mưa làm ướt. Sau này mỗi tạo hình sẽ có một ảnh riêng.');
  }

} catch (e) {
  await snap(page, '03b-error').catch(() => {});
  throw e;
} finally {
  await snap(page, '03b-end').catch(() => {});
  await finish();
}
