// Chapter 5: six storyboard shots added by hand, their images drawn in the same Gemini chat (shown with
// the real prompts and results), then imported into each shot.
import path from 'node:path';
import { start, snap, thumb, esc, markParts, pasteText, ROOT } from '../lib.mjs';
import { SHOT_SCRIPTS, SHOT_PROMPTS } from '../content.mjs';
import { projectUrl } from '../flow.mjs';

const { page, h, finish } = await start('05-phan-canh', { login: true });
const film = (f) => path.resolve(ROOT, '../assets/film', f);

const SHOT_SAY = [
  'Cảnh 1: toàn cảnh góc phố, ông Tư đứng sau xe bánh mì trong mưa.',
  'Cảnh 2: Mai cầm ô vàng bước trên vỉa hè, phía xa gió thổi bay tấm bạt.',
  'Cảnh 3: Mai che ô cho ông Tư, có câu thoại của Mai.',
  'Cảnh 4: cận cảnh ông Tư mỉm cười, có câu thoại của ông.',
  'Cảnh 5: hai người đứng dưới chiếc ô vàng.',
  'Cảnh 6: toàn cảnh từ xa lúc lên đèn.',
];

try {
  await h.card('Chương 4', 'Phân cảnh', 'Chia phim thành 6 cảnh quay, vẽ ảnh cho từng cảnh\nmà vẫn giữ đúng nhân vật.');
  await page.goto(await projectUrl(page, 'scene-character'));
  await page.waitForLoadState('networkidle').catch(() => {});
  await h.wait(1200);
  await h.click(page.getByRole('button', { name: 'Tiếp theo' }), 'Tư liệu đã đủ. Bấm Tiếp theo để sang bước Thiết kế phân cảnh.', { after: 3500 });
  if (await page.locator('.ant-modal:visible').count()) { await page.keyboard.press('Escape'); await h.wait(800); }

  // ---------------------------------------------------------------- shots by hand
  h.mark('shots');
  await h.point(page.getByRole('button', { name: /Thao tác hàng loạt/ }),
    'Trong Thao tác hàng loạt có nút Tự động tạo phân cảnh: AI đọc kịch bản và chia cảnh giúp bạn. Khi mình thử với Gemini miễn phí, nút này báo lỗi, nên mình thêm phân cảnh bằng tay. Phim 6 cảnh chỉ mất vài phút, và mình kiểm soát được từng cảnh.');
  const scriptButtons = page.getByRole('button', { name: 'Sửa kịch bản phân cảnh' });
  for (let i = 0; i < 6; i++) {
    if (i > 1) await h.nocap();
    const before = await scriptButtons.count();
    const add = before === 0 ? page.getByText('Thêm phân cảnh', { exact: true }).last() : page.getByRole('button', { name: 'plus Thêm phân cảnh' });
    await h.click(add, i === 0 ? 'Bấm Thêm phân cảnh. Một thẻ phân cảnh mới hiện ra.' : (i === 1 ? 'Thêm phân cảnh tiếp theo.' : null), { after: 1500 });
    await page.waitForFunction((n) => document.querySelectorAll('button').length && [...document.querySelectorAll('button')].filter((b) => b.textContent.trim() === 'Sửa kịch bản phân cảnh').length > n, before);
    await h.click(scriptButtons.last(), i === 0 ? 'Bấm Sửa kịch bản phân cảnh.' : null, { after: 1500 });
    const modal = page.locator('.ant-modal:visible').last();
    const editor = modal.locator('[contenteditable=true]').last();
    await editor.click();
    await pasteText(editor, SHOT_SCRIPTS[i]);
    await h.wait(1200);
    if (i === 0) {
      await h.cap('Viết kịch bản cho cảnh: cỡ cảnh là toàn, trung hay cận; ai làm gì; câu thoại nếu có; máy quay chuyển động thế nào; và thời lượng 5 giây. Mình dán từ prompt-pack.',
        { say: 'Viết kịch bản cho cảnh: cỡ cảnh là toàn, trung hay cận; ai làm gì; câu thoại nếu có; máy quay chuyển động thế nào; và thời lượng năm giây. Mình dán từ file prom pách.', top: true });
    } else {
      await h.cap(SHOT_SAY[i], { top: true });
    }
    await h.click(modal.getByRole('button', { name: 'Lưu' }), i === 0 ? 'Bấm Lưu.' : null, { after: 1500 });
    if (i === 0) await h.cap('AID báo Đã lưu kịch bản phân cảnh. Làm tương tự cho cả 6 cảnh.');
  }
  await h.point(page.getByText(/Tiến độ phân cảnh/), 'Dòng Tiến độ phân cảnh ghi 0 trên 6: đã có 6 phân cảnh, chưa có ảnh.');

  // ---------------------------------------------------------------- shot images in Gemini (stills)
  h.mark('gemini');
  const p1 = markParts(SHOT_PROMPTS[0], [
    'giữ đúng nhân vật và bối cảnh ở các ảnh trước',
    '(đúng bối cảnh ảnh góc phố đầu tiên)',
    '(đúng nhân vật ông Tư ở trên: nón lá, áo khoác nâu, râu bạc)',
    'đứng sau xe bánh mì, ngước nhìn tấm bạt xanh đang bị gió giật rung mạnh',
  ]);
  await h.slide(`<div class="lbl">Ảnh phân cảnh: vẫn trong cuộc chat Gemini cũ</div><div class="two"><div class="prompt">${p1}</div><img src="${thumb(film('shot-1.png'))}"></div>`, [
    { text: 'Giờ vẽ ảnh cho từng cảnh. Quay lại đúng cuộc chat Gemini đã vẽ nhân vật, để Gemini còn nhớ các ảnh trước.' },
    { mark: '.p1', text: 'Prompt mở đầu: giữ đúng nhân vật và bối cảnh ở các ảnh trước.' },
    { mark: '.p2', text: 'Mỗi prompt luôn có ba phần. Một: đúng bối cảnh nào ở trên.' },
    { mark: '.p3', text: 'Hai: đúng nhân vật nào ở trên, kèm câu tả cố định: nón lá, áo khoác nâu, râu bạc.' },
    { mark: '.p4', text: 'Ba: hành động trong cảnh.' },
  ]);
  await h.slide(`<div class="lbl">Sáu ảnh phân cảnh</div><div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr))">
    ${[1, 2, 3, 4, 5, 6].map((n) => `<div class="cell"><div class="t">Cảnh ${n}</div><img src="${thumb(film(`shot-${n}.png`), 800)}"></div>`).join('')}</div>`, [
    { text: 'Dán lần lượt 6 prompt, cảnh 1 tới cảnh 6. Tải từng ảnh về, đặt tên shot-1 tới shot-6, để chung một thư mục.',
      say: 'Dán lần lượt sáu prompt, cảnh một tới cảnh sáu. Tải từng ảnh về, đặt tên shot một tới shot sáu, để chung một thư mục.' },
    { text: 'Đây là lúc năm quy tắc vàng phát huy tác dụng: qua cả sáu ảnh, Mai vẫn tóc ngắn, áo len kem; ông Tư vẫn nón lá, áo nâu.' },
    { text: 'Soi lỗi: ở cảnh 1, phía xa có thêm một xe bánh mì thứ hai. Lỗi nhỏ ở hậu cảnh thì chấp nhận được. Lỗi ở nhân vật chính thì phải sửa.' },
  ]);

  // ---------------------------------------------------------------- import into each shot
  h.mark('import');
  await h.click(page.getByText('Sửa phân cảnh', { exact: true }).first(), 'Quay lại AID. Ở ô ảnh của phân cảnh đầu tiên, bấm Sửa phân cảnh.', { after: 3500 });
  await h.point(page.getByText(/分镜脚本01/).last(), 'Màn hình chỉnh ảnh mở ra. Trên cùng là các tab 分镜脚本 01 tới 06, tức phân cảnh 1 tới 6.',
    { say: 'Màn hình chỉnh ảnh mở ra. Trên cùng là các tab phân cảnh một tới sáu.' });
  await h.point(page.getByRole('button', { name: /Bắt đầu tạo ảnh/ }), 'Có API key xịn thì làm ngay tại đây: viết mô tả ở khung bên phải, thêm ảnh thẻ nhân vật làm ảnh tham chiếu, chọn model ảnh, rồi bấm Bắt đầu tạo ảnh. AI vẽ ảnh phân cảnh bám theo ảnh tham chiếu. Bản miễn phí, mình nhập ảnh đã vẽ bằng Gemini.');
  for (let n = 1; n <= 6; n++) {
    if (n > 2) await h.nocap();
    if (n > 1) await h.click(page.getByText(new RegExp(`分镜脚本0${n}`)).last(), n === 2 ? 'Bấm tab 02 và làm tiếp.' : null, { say: 'Bấm tab hai và làm tiếp.', after: 2000 });
    const chooser = page.waitForEvent('filechooser', { timeout: 60000 });
    await h.click(page.getByRole('button', { name: /Chọn tệp từ/ }).first(), n === 1 ? 'Góc dưới bên trái, bấm Chọn tệp từ máy, chọn shot-1.png.' : null,
      { say: 'Góc dưới bên trái, bấm Chọn tệp từ máy, chọn ảnh shot một.', after: 300 });
    await (await chooser).setFiles(film(`shot-${n}.png`));
    await h.wait(3500);
    if (n === 1) await h.cap('Ảnh vào mục Bản ghi tạo ở bên trái. Nhưng chưa xong đâu: ảnh này chưa phải ảnh chính của phân cảnh.');
    const setBtn = page.getByRole('button', { name: 'Thêm ảnh phân cảnh' });
    await h.click(setBtn, n === 1 ? 'Phải bấm Thêm ảnh phân cảnh, nút cuối cùng bên phải thanh công cụ phía trên ảnh.' : null, { after: 800 });
    await page.getByText(/Thiết lập thành công/).first().waitFor({ timeout: 20000 });
    await h.wait(1500);
    if (n === 1) await h.cap('AID báo Thiết lập thành công. Giờ ảnh mới là ảnh chính của phân cảnh 1.');
    if (n === 3) await h.cap('Làm tương tự cho các phân cảnh còn lại: bấm tab, chọn tệp, rồi Thêm ảnh phân cảnh.');
  }
  await h.click(page.getByRole('button', { name: /Quay lại/ }), 'Xong cả 6, bấm Quay lại.', { after: 3000 });
  await h.point(page.getByText(/Tiến độ phân cảnh/), 'Tiến độ phân cảnh giờ là 6 trên 6: mọi phân cảnh đều đã có ảnh.');
} catch (e) {
  await snap(page, '05-error').catch(() => {});
  throw e;
} finally {
  await snap(page, '05-end').catch(() => {});
  await finish();
}
