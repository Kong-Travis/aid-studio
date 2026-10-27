// Chapter 2, part a: choose the models, then AI extracts scenes, characters and props from the script.
// Split from part b so a failed take does not spend the extraction calls again.
import { start, snap, WEB } from '../lib.mjs';
import { projectUrl, waitWhileTalking } from '../flow.mjs';

const { page, h, finish } = await start('03a-trich-xuat', { login: true });

try {
  await h.card('Chương 2', 'Để AI tách nhân vật và bối cảnh', 'Chọn model AI cho dự án, rồi để AID đọc kịch bản,\nlập danh sách nhân vật, bối cảnh và viết mô tả tạo hình.');
  await page.goto(await projectUrl(page, 'story-script'));
  await page.waitForLoadState('networkidle').catch(() => {});
  await h.wait(1200);

  // ---------------------------------------------------------------- choosing models
  h.mark('models');
  await h.click(page.getByRole('button', { name: 'Cấu hình tạo' }), 'Trước khi để AI làm việc, bấm Cấu hình tạo ở góc trên. Đây là nơi chọn model AI cho từng việc trong dự án.', { after: 1500 });
  const cfg = page.getByRole('dialog', { name: 'Cấu hình tạo' });
  await h.point(cfg.getByRole('navigation', { name: 'Danh mục cấu hình tạo' }),
    'Bên trái là các nhóm việc: trích xuất tư liệu, viết tạo hình, vẽ ảnh tạo hình, viết kịch bản phân cảnh, vẽ ảnh phân cảnh.');
  await h.cap('Khi có API key xịn, đây là chỗ quyết định chất lượng phim. Phần chữ có thể chọn GPT-5.5, Qwen 3.7 Max hay DeepSeek V4 Pro. Phần ảnh có thể chọn Nano Banana Pro, Seedream 5.0 Pro hay GPT Image 2.',
    { say: 'Khi có API key xịn, đây là chỗ quyết định chất lượng phim. Phần chữ có thể chọn GPT năm chấm năm, Qwen ba chấm bảy Max hay DeepSeek V bốn Pro. Phần ảnh có thể chọn Nano Banana Pro, Seedream năm chấm không Pro hay GPT Image hai.' });
  await h.cap('Trang trong video này chỉ bật model Gemini miễn phí. Mình chọn Gemini 3.1 Flash-Lite cho mọi việc chữ, vì gói miễn phí của nó có tới 500 lượt mỗi ngày.',
    { say: 'Trang trong video này chỉ bật model Gemini miễn phí. Mình chọn Gemini ba chấm một Flash-Lite cho mọi việc chữ, vì gói miễn phí của nó có tới năm trăm lượt mỗi ngày.' });
  const picker = page.getByRole('dialog', { name: 'Chọn agent' });
  let firstPick = true;
  for (const [tab, agents] of [['Trích xuất tài sản (văn bản)', [/^角色提取/, /^场景提取/, /^道具提取/]], ['Trích xuất tạo hình (văn bản)', [/^角色构建/, /^场景图/, /^道具图/]]]) {
    await h.click(cfg.getByRole('button', { name: tab }), firstPick ? 'Mục Trích xuất tài sản.' : 'Rồi mục Trích xuất tạo hình.', { after: 1000 });
    for (const agent of agents) {
      await h.click(cfg.getByRole('button', { name: agent }), firstPick ? 'Bấm vào ô model của từng việc.' : null, { after: 1200 });
      await h.click(picker.getByRole('button', { name: /^Gemini 3\.1 Flash-Lite/ }), firstPick ? 'Ở Mô hình khả dụng, chọn model. Có key xịn thì danh sách này dài hơn nhiều.' : null, { after: 600 });
      await h.click(picker.getByRole('button', { name: 'OK' }), firstPick ? 'Bấm OK.' : null, { after: 1000 });
      if (firstPick) await h.nocap();
      firstPick = false;
    }
  }
  await h.click(cfg.getByRole('button', { name: 'OK' }), 'Bấm OK để lưu cấu hình.', { after: 1500 });

  await h.click(page.getByRole('button', { name: 'Tiếp theo' }), 'Kịch bản đã lưu. Bấm Tiếp theo để sang bước Chuẩn bị tư liệu.', { after: 3000 });

  const dlg = page.locator('.ant-modal').filter({ hasText: 'Bắt đầu trích xuất' }).last();
  await dlg.waitFor({ timeout: 20000 });
  await h.cap('AID mở ngay hộp thoại trích xuất. Ba ô là: trích xuất bối cảnh, trích xuất nhân vật, và trích xuất đạo cụ.');
  await h.point(dlg.getByText(/预扣约/), 'Góc phải ghi số điểm dự kiến sẽ dùng, chỉ vài điểm cho bước này.');
  await h.click(dlg.getByRole('button', { name: /Bắt đầu trích xuất/ }), 'Bấm Bắt đầu trích xuất.', { after: 1500 });

  h.mark('extracting');
  const done = page.getByText(/Đã nhận diện \d+ bối cảnh/);
  await waitWhileTalking(h, done, [
    'AI đang đọc kịch bản. Thường mất từ hai mươi giây đến một phút.',
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
