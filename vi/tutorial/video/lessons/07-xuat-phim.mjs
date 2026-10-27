// Chapter 7: sync the timeline, export the film from AID (local FFmpeg), then burn Vietnamese subtitles
// in with the tutorial script. The exported and subtitled files are real; the subtitled one becomes
// out/final-film.mp4, which build.mjs plays after this chapter.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { start, snap, esc, OUT, REPO } from '../lib.mjs';
import { SRT } from '../content.mjs';
import { projectUrl } from '../flow.mjs';

const W = path.join(OUT, 'work');
const PHIM = path.join(W, 'Desktop', 'phim');
const DL = path.join(W, 'Downloads');
fs.mkdirSync(DL, { recursive: true });
fs.mkdirSync(PHIM, { recursive: true });
for (const f of fs.readdirSync(DL)) fs.rmSync(path.join(DL, f));
fs.rmSync(path.join(PHIM, 'chiec-o-vang.mp4'), { force: true });

const run = (cmd, cwd = REPO) => () => {
  let out;
  try {
    out = execFileSync('sh', ['-c', `${cmd} 2>&1`], { cwd, encoding: 'utf8', env: { ...process.env, HOME: W, T: path.join(W, 'Desktop', 'aid-tools') } });
  } catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  return out.split(W).join('~').trimEnd();
};

const { page, h, finish } = await start('07-xuat-phim', { login: true });

try {
  await h.card('Chương 6', 'Xuất phim và phụ đề', 'Ghép các cảnh thành phim ngay trong AID,\nrồi gắn phụ đề tiếng Việt.');
  await page.goto(await projectUrl(page, 'storyboard-video'));
  await page.waitForLoadState('networkidle').catch(() => {});
  await h.wait(1500);
  await h.click(page.getByRole('button', { name: 'Tiếp theo' }), 'Video đã đủ. Bấm Tiếp theo, sang bước Đồng bộ hình tiếng.', { after: 3500 });
  await h.cap('Giọng đã nằm sẵn trong clip, nên bước này không cần làm gì.');
  await h.click(page.getByRole('button', { name: 'Tiếp theo' }), 'Bấm Tiếp theo một lần nữa, sang bước cuối: Xem trước thành phẩm.', { after: 4000 });

  // ---------------------------------------------------------------- timeline
  h.mark('timeline');
  await h.cap('Đây là dòng thời gian, gồm các rãnh: Video, Âm lượng, Lồng tiếng, Phụ đề và Nhạc.', { top: true });
  await h.click(page.getByRole('button', { name: /Đồng bộ từ các bước trước/ }),
    'Nếu vừa thay clip ở bước trước, bấm Đồng bộ từ các bước trước lên dòng thời gian, để AID lấy bản mới nhất.', { after: 2500 });
  await h.point(page.getByText('Không có phụ đề').first(),
    'Rãnh Phụ đề nên ghi Không có phụ đề ở mọi cảnh. Phụ đề tự động của AID chia mỗi màn hình tối đa 12 ký tự, cách chia dành cho chữ Trung, nên cắt đôi chữ tiếng Việt. Mình sẽ gắn phụ đề chuẩn ở bước sau.',
    { top: true });
  await h.cap('Nếu cảnh nào có chữ trong rãnh Phụ đề, rê chuột lên, bấm Sửa phụ đề, xoá hết nội dung, rồi bấm OK.', { top: true });

  // ---------------------------------------------------------------- export
  h.mark('export');
  await h.click(page.getByRole('button', { name: 'Xuất/Đăng' }), 'Bấm Xuất/Đăng ở góc trên bên phải.', { after: 1200 });
  const exportItem = page.getByText('Xuất video hoàn chỉnh', { exact: true }).last();
  const download = page.waitForEvent('download', { timeout: 300000 });
  await h.click(exportItem, 'Chọn Xuất video hoàn chỉnh. AID ghép 6 cảnh thành một phim.', { say: 'Chọn Xuất video hoàn chỉnh. AID ghép sáu cảnh thành một phim.', after: 1500 });
  await h.cap('Góc trên hiện Đang ghép video kèm phần trăm. Phim ngắn thì xong rất nhanh.', { top: true });
  const dl = await download;
  const name = dl.suggestedFilename();
  const saved = path.join(DL, name);
  await dl.saveAs(saved);
  await h.wait(1500);
  await h.cap(`Xong, trình duyệt tự tải phim về thư mục Downloads, tên dạng ${name}. Tên file có thể mất dấu tiếng Việt, đổi tên lại là được.`,
    { say: 'Xong, trình duyệt tự tải phim về thư mục Đao-lốt. Tên file có thể mất dấu tiếng Việt, đổi tên lại là được.' });

  // ---------------------------------------------------------------- subtitles
  h.mark('subtitles');
  const srt = path.join(PHIM, 'chiec-o-vang.srt');
  fs.writeFileSync(srt, SRT + '\n');
  await h.slide(`<div class="lbl">File phụ đề chiec-o-vang.srt (văn bản thuần, mã UTF-8)</div><div class="two"><div class="prompt" style="font-family:Menlo,monospace;font-size:26px">${esc(SRT)}</div>
    <div style="font-size:26px;line-height:1.6;color:#ddd">Mỗi đoạn gồm:<br>1. Số thứ tự<br>2. Thời gian bắt đầu --&gt; kết thúc<br>3. Câu thoại<br><br>Cảnh N bắt đầu ở giây (N - 1) x 5,<br>cộng 0,6 giây giọng nói bắt đầu trễ.</div></div>`, [
    { text: 'Phụ đề viết thành một file .srt: số thứ tự, thời gian bắt đầu và kết thúc, rồi câu thoại. Lưu dạng văn bản thuần, mã UTF-8, không phải file Word.',
      say: 'Phụ đề viết thành một file ét a tê: số thứ tự, thời gian bắt đầu và kết thúc, rồi câu thoại. Lưu dạng văn bản thuần, mã u tê ép tám, không phải file Word.' },
    { text: 'Mai nói ở cảnh 3, nên từ giây 10,6. Ông Tư ở cảnh 4, từ giây 15,6. Mỗi cảnh 5 giây, cộng 0,6 giây vì giọng bắt đầu trễ 0,6 giây.',
      say: 'Mai nói ở cảnh ba, nên từ giây mười phẩy sáu. Ông Tư ở cảnh bốn, từ giây mười lăm phẩy sáu. Mỗi cảnh năm giây, cộng không phẩy sáu giây vì giọng bắt đầu trễ không phẩy sáu giây.' },
  ]);
  const quoted = `~/Downloads/${name}`;
  await h.term([
    { text: 'Chạy script add-subtitles trong bộ công cụ: file phim vừa tải, file phụ đề, và tên file thành phẩm.',
      say: 'Chạy script át xáp-tai-tồ trong bộ công cụ: file phim vừa tải, file phụ đề, và tên file thành phẩm.',
      cmd: 'T=~/Desktop/aid-tools', out: '' },
    { cmd: `$T/add-subtitles.sh ${quoted} ~/Desktop/phim/chiec-o-vang.srt ~/Desktop/phim/chiec-o-vang.mp4`,
      run: run(`$T/add-subtitles.sh "$HOME/Downloads/${name}" ~/Desktop/phim/chiec-o-vang.srt ~/Desktop/phim/chiec-o-vang.mp4`) },
    { text: 'Phim hoàn chỉnh đã có phụ đề tiếng Việt.' },
  ]);
  const final = path.join(PHIM, 'chiec-o-vang.mp4');
  if (!fs.existsSync(final)) throw new Error('subtitled film missing');
  fs.copyFileSync(final, path.join(OUT, 'final-film.mp4'));
  await h.card('Thành phẩm', 'Chiếc ô vàng', 'Phim bạn vừa làm cùng mình, từ đầu tới cuối.', { say: 'Và đây là thành phẩm: Chiếc ô vàng.' });
} catch (e) {
  await snap(page, '07-error').catch(() => {});
  throw e;
} finally {
  await finish();
}
