// Chapter 3, part a: AI extracts scenes, characters and props from the script (Gemini free tier).
// Split from part b so a failed take does not spend the extraction calls again.
import { start, snap, WEB } from '../lib.mjs';
import { projectUrl, waitWhileTalking } from '../flow.mjs';

const { page, h, finish } = await start('03a-trich-xuat', { login: true });

try {
  await h.card('Chương 3', 'Để AI tách nhân vật và bối cảnh', 'AID đọc kịch bản, lập danh sách nhân vật, bối cảnh,\nrồi viết mô tả tạo hình. Bước này dùng Gemini miễn phí.');
  await page.goto(await projectUrl(page, 'story-script'));
  await page.waitForLoadState('networkidle').catch(() => {});
  await h.click(page.getByRole('button', { name: 'Tiếp theo' }), 'Kịch bản đã lưu. Bấm Tiếp theo để sang bước Chuẩn bị tư liệu.', { after: 3000 });

  const dlg = page.locator('.ant-modal').filter({ hasText: 'Bắt đầu trích xuất' }).last();
  await dlg.waitFor({ timeout: 20000 });
  await h.cap('AID mở ngay hộp thoại trích xuất. Ba ô là: trích xuất bối cảnh, trích xuất nhân vật, và trích xuất đạo cụ.');
  await h.point(dlg.getByText(/预扣约/), 'Góc phải ghi số điểm dự kiến sẽ dùng. Đây là điểm ảo trong AID, không phải tiền.', { say: 'Góc phải ghi số điểm dự kiến sẽ dùng. Đây là điểm ảo trong AID, không phải tiền.' });
  await h.click(dlg.getByRole('button', { name: /Bắt đầu trích xuất/ }), 'Bấm Bắt đầu trích xuất.', { after: 1500 });

  h.mark('extracting');
  const done = page.getByText(/Đã nhận diện \d+ bối cảnh/);
  await waitWhileTalking(h, done, [
    'Gemini đang đọc kịch bản. Thường mất từ hai mươi giây đến một phút.',
    'Trong lúc chờ: nếu AID báo lần tạo này chưa xong, thử lại sau, nghĩa là máy chủ Google đang quá tải. Chờ vài giây rồi bấm lại.',
  ], 240000);
  await h.wait(1500);
  h.mark('result');
  await h.point(done, 'Xong. AID đã tìm ra các bối cảnh trong kịch bản.');
  await h.point(page.getByRole('tablist', { name: 'Chuyển mục chuẩn bị tư liệu' }),
    'Ba tab ở góc trái là 场景, bối cảnh; 角色, nhân vật; và 道具, đạo cụ.',
    { say: 'Ba tab ở góc trái là bối cảnh, nhân vật, và đạo cụ.' });
  await h.click(page.getByRole('button', { name: '角色', exact: true }), 'Bấm tab 角色 để xem nhân vật.', { say: 'Bấm tab nhân vật để xem danh sách nhân vật.', after: 2000 });
  await h.point(page.getByText(/Đã nhận diện \d+ nhân vật/), 'AI nhận ra hai nhân vật: ông Tư và Mai.');
  await h.click(page.getByRole('button', { name: '场景', exact: true }), 'Quay lại tab 场景, bối cảnh.', { say: 'Quay lại tab bối cảnh.', after: 2000 });
  await h.cap('Luôn đọc lại kết quả của AI. Ví dụ AI hay ghi bối cảnh là 上午, buổi sáng, dù kịch bản nói chiều tối. Mình sẽ tự quyết định ánh sáng khi vẽ ảnh ở bước sau.',
    { say: 'Luôn đọc lại kết quả của AI. Ví dụ AI hay ghi bối cảnh là buổi sáng, dù kịch bản nói chiều tối. Mình sẽ tự quyết định ánh sáng khi vẽ ảnh ở bước sau.' });
} catch (e) {
  await snap(page, '03a-error').catch(() => {});
  throw e;
} finally {
  await snap(page, '03a-end').catch(() => {});
  await finish();
}
