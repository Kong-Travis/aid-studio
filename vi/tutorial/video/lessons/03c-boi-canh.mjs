// Chapter 3, part c: AI writes the look of every scene in one batch. The free tier allows 5 requests
// a minute and the batch sends one per scene at once, so the take starts after a quiet minute.
import { start, snap } from '../lib.mjs';
import { projectUrl, aiTask } from '../flow.mjs';

const { page, h, finish } = await start('03c-boi-canh', { login: true });

// Some actions ask for a confirmation that shows the points they will use.
async function confirmIfAsked() {
  const ok = page.locator('.ant-modal:visible button.bgam-btn-ok').last();
  if (await ok.isVisible({ timeout: 2500 }).catch(() => false)) await h.click(ok, 'AID hỏi xác nhận số điểm sẽ dùng. Bấm đồng ý.', { after: 1500 });
}

try {
  await page.goto(await projectUrl(page, 'scene-character'));
  await page.waitForLoadState('networkidle').catch(() => {});
  await h.wait(1500);

  h.mark('model');
  await h.cap('Trước khi tạo hàng loạt, một mẹo về lượt miễn phí. Gemini 3.6 Flash chỉ có khoảng 20 lượt mỗi ngày, và 5 lượt mỗi phút. Gemini 3.1 Flash-Lite có tới 500 lượt mỗi ngày.',
    { say: 'Trước khi tạo hàng loạt, một mẹo về lượt miễn phí. Gemini ba chấm sáu Flash chỉ có khoảng hai mươi lượt mỗi ngày, và năm lượt mỗi phút. Gemini ba chấm một Flash-Lite có tới năm trăm lượt mỗi ngày.' });
  await h.click(page.getByRole('button', { name: 'Cấu hình tạo' }), 'Việc tạo hàng loạt nên dùng Flash-Lite. Bấm Cấu hình tạo ở góc trên.', { after: 1500 });
  const cfg = page.getByRole('dialog', { name: 'Cấu hình tạo' });
  await h.click(cfg.getByRole('button', { name: 'Trích xuất tạo hình (văn bản)' }), 'Chọn mục Trích xuất tạo hình.', { after: 1200 });
  await h.click(cfg.getByRole('button', { name: /^场景图/ }), 'Ở dòng Tạo hình bối cảnh, bấm vào ô model.', { after: 1500 });
  const picker = page.getByRole('dialog', { name: 'Chọn agent' });
  await h.click(picker.getByRole('button', { name: /^Gemini 3\.1 Flash-Lite/ }), 'Ở mục Mô hình khả dụng, chọn Gemini 3.1 Flash-Lite.',
    { say: 'Ở mục Mô hình khả dụng, chọn Gemini ba chấm một Flash-Lite.', after: 1000 });
  await h.click(picker.getByRole('button', { name: 'OK' }), 'Bấm OK.', { after: 1200 });
  await h.click(cfg.getByRole('button', { name: 'OK' }), 'Bấm OK để lưu cấu hình.', { after: 1500 });

  h.mark('scenes');
  await h.click(page.getByRole('button', { name: '场景', exact: true }), 'Giờ tạo hình cho bối cảnh, dùng thao tác hàng loạt cho nhanh. Mở tab 场景.',
    { say: 'Giờ tạo hình cho bối cảnh, dùng thao tác hàng loạt cho nhanh. Mở tab bối cảnh.', after: 1800 });
  const batch = page.getByRole('dialog').filter({ hasText: 'Tạo hàng loạt tạo hình' });
  await aiTask(h, async (attempt) => {
    await h.click(page.getByRole('button', { name: /Thao tác hàng loạt/ }), attempt === 1 ? 'Bấm Thao tác hàng loạt.' : 'Mở lại Thao tác hàng loạt cho các bối cảnh còn thiếu.', { after: 1000 });
    await h.click(page.getByRole('menuitem', { name: /Tạo hàng loạt tạo hình bối cảnh/ }), 'Chọn Tạo hàng loạt tạo hình bối cảnh.', { after: 1500 });
    await h.click(batch.getByRole('button', { name: /Chọn tất cả/ }), 'Bấm Chọn tất cả.', { after: 1000 });
    await h.click(batch.getByRole('button', { name: 'Tạo hàng loạt' }), 'Bấm Tạo hàng loạt.', { after: 1500 });
    await confirmIfAsked();
  }, ['AI đang viết tạo hình cho tất cả bối cảnh. Mỗi bối cảnh là một lượt gọi Gemini, chạy cùng lúc.']);
  await h.wait(2500);
  await h.cap('Các bối cảnh đã có tạo hình.');

  // ---------------------------------------------------------------- why not auto images
  h.mark('why-import');
  const auto = page.getByRole('button', { name: 'Tạo tự động' }).first();
  const imp = page.getByRole('button', { name: 'Nhập ảnh' }).first();
  await h.point(auto, 'Giờ mỗi tạo hình có hai nút. Tạo tự động sẽ vẽ ảnh bằng model tạo ảnh của AID, mà model đó phải trả phí. Đừng bấm.');
  await h.point(imp, 'Mình dùng Nhập ảnh, với ảnh vẽ miễn phí bằng ứng dụng Gemini. Đó là chương tiếp theo, và là chương quan trọng nhất.');
} catch (e) {
  await snap(page, '03c-error').catch(() => {});
  throw e;
} finally {
  await snap(page, '03c-end').catch(() => {});
  await finish();
}
