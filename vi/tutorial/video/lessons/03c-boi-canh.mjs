// Chapter 2, part c: AI writes the look of every scene in one batch (models were chosen in part a).
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

  h.mark('scenes');
  await h.click(page.getByRole('button', { name: '场景', exact: true }), 'Với bối cảnh, dùng thao tác hàng loạt cho nhanh. Mở tab 场景.',
    { say: 'Với bối cảnh, dùng thao tác hàng loạt cho nhanh. Mở tab bối cảnh.', after: 1800 });
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
  await h.point(auto, 'Giờ mỗi tạo hình có hai nút. Tạo tự động: AI vẽ ảnh ngay trong AID bằng model tạo ảnh, ví dụ Nano Banana Pro, Seedream hay GPT Image, dựa đúng vào mô tả tạo hình vừa viết. Có API key xịn, đây là cách làm chuyên nghiệp.');
  await h.point(imp, 'Trang trong video này không bật model tạo ảnh trả phí, nên mình bấm Nhập ảnh, với ảnh vẽ bằng ứng dụng Gemini miễn phí. Các quy tắc giữ nhân vật ở chương sau đúng cho cả hai cách.');
} catch (e) {
  await snap(page, '03c-error').catch(() => {});
  throw e;
} finally {
  await snap(page, '03c-end').catch(() => {});
  await finish();
}
