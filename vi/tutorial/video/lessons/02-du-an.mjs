// Chapter 2: log in as the learner, create the project, tour the seven steps, paste the script.
import fs from 'node:fs';
import path from 'node:path';
import { start, snap, pasteText, OUT, STATE, WEB } from '../lib.mjs';
import { SCRIPT } from '../content.mjs';

const learner = JSON.parse(fs.readFileSync(path.join(OUT, '.learner'), 'utf8'));
fs.rmSync(STATE, { force: true });
const { page, h, finish } = await start('02-du-an', { login: true });

try {
  await h.card('Chương 2', 'Tạo dự án và kịch bản', 'Đăng nhập, tạo dự án phim, dán kịch bản tiếng Việt.');

  await page.goto(WEB);
  await page.waitForLoadState('networkidle').catch(() => {});
  h.mark('login');
  await h.click(page.getByRole('button', { name: 'Đăng nhập' }).first(), 'Mở trang AID. Bấm Đăng nhập ở góc trái dưới.', { after: 1500 });
  await h.type(page.getByRole('textbox', { name: 'Vui lòng nhập số điện thoại hoặc email' }), learner.email,
    'Nhập email người quản trị đã tạo cho bạn.');
  await h.type(page.getByRole('textbox', { name: 'Vui lòng nhập mật khẩu' }), learner.password,
    'Nhập mật khẩu ban đầu. Ô này che ký tự.', { delay: 60 });
  await h.click(page.getByRole('dialog').getByRole('button', { name: 'Đăng nhập' }), 'Bấm Đăng nhập.', { after: 3000 });
  await h.point(page.getByRole('group', { name: 'điểm' }), 'Góc trái dưới hiện 1000 điểm là đã đăng nhập thành công.',
    { say: 'Góc trái dưới hiện một nghìn điểm là đã đăng nhập thành công.' });

  // ---------------------------------------------------------------- project
  h.mark('project');
  await h.click(page.getByRole('button', { name: 'Bắt đầu sáng tác' }), 'Bấm Bắt đầu sáng tác để tạo dự án mới.', { after: 1800 });
  const d = page.getByRole('dialog');
  await h.click(d.getByRole('button', { name: 'Phim điện ảnh' }), 'Loại tác phẩm: chọn Phim điện ảnh, tức là phim một tập.');
  await h.type(d.getByRole('textbox').first(), 'Chiếc ô vàng', 'Đặt tên phim: Chiếc ô vàng.');
  await h.click(d.getByRole('button', { name: '16 : 9 16 : 9' }), 'Tỉ lệ khung hình: 16:9 cho video ngang trên YouTube. Làm TikTok thì chọn 9:16.');
  await h.point(d.getByRole('button', { name: '剧情演绎' }), 'Loại kịch bản: 剧情演绎, nghĩa là diễn kịch, đã chọn sẵn.',
    { say: 'Loại kịch bản: diễn kịch, đã chọn sẵn.' });
  await h.point(d.getByRole('button', { name: '经济模式' }), 'Chiến lược mô hình: để mặc định 经济模式, chế độ tiết kiệm.',
    { say: 'Chiến lược mô hình: để mặc định là chế độ tiết kiệm.' });
  await h.click(d.getByRole('button', { name: '图生视频' }), 'Chế độ sáng tác: chọn 图生视频, tạo video từ ảnh. Mình làm ảnh trước rồi mới thành video. Đây là cách giữ nhân vật ổn định nhất.',
    { say: 'Chế độ sáng tác: chọn tạo video từ ảnh. Mình làm ảnh trước rồi mới thành video. Đây là cách giữ nhân vật ổn định nhất.' });
  const style = d.getByText('治愈动画', { exact: true });
  await h.click(style, 'Phong cách: ở lưới bên phải, bấm ô 治愈动画, hoạt hình chữa lành. Ô chưa có hình minh hoạ vẫn bấm được.',
    { say: 'Phong cách: ở lưới bên phải, bấm ô hoạt hình chữa lành. Ô chưa có hình minh hoạ vẫn bấm được.' });
  await h.click(d.getByRole('button', { name: 'Tạo tác phẩm' }), 'Bấm Tạo tác phẩm.', { after: 4000 });

  // ---------------------------------------------------------------- the seven steps
  h.mark('steps');
  await h.cap('Dự án đã được tạo. Thanh trên cùng là bảy bước làm phim của AID. Mình đi qua từng bước.');
  const steps = [
    ['Cấu hình dự án', 'Một: Cấu hình dự án, những gì bạn vừa chọn.'],
    ['Sáng tác kịch bản', 'Hai: Sáng tác kịch bản, nơi mình đang đứng.'],
    ['Chuẩn bị tư liệu', 'Ba: Chuẩn bị tư liệu, AI tách nhân vật và bối cảnh từ kịch bản.'],
    ['Thiết kế phân cảnh', 'Bốn: Thiết kế phân cảnh, chia phim thành từng cảnh quay, mỗi cảnh một ảnh.'],
    ['Tạo video', 'Năm: Tạo video, mỗi cảnh thành một đoạn video ngắn.'],
    ['Đồng bộ hình tiếng', 'Sáu: Đồng bộ hình tiếng, phần lồng tiếng.'],
    ['Xem trước thành phẩm', 'Bảy: Xem trước thành phẩm, ghép tất cả thành phim và xuất ra.'],
  ];
  for (const [name, text] of steps) await h.point(page.getByRole('button', { name, exact: true }), text);

  // ---------------------------------------------------------------- script
  h.mark('script');
  await h.point(page.getByRole('button', { name: 'Mở AI viết kịch bản' }),
    'Nút AI viết kịch bản cũng có. Nhưng với Gemini miễn phí, ô chat này đang báo lỗi. Vì vậy mình tự viết, hoặc nhờ ứng dụng Gemini viết hộ rồi dán vào.');
  await h.point(page.getByRole('button', { name: /Nhập kịch bản/ }), 'Có kịch bản trong file thì bấm Nhập kịch bản để tải lên. Ở đây mình dán thẳng vào vùng soạn thảo.');
  const editor = page.locator('[contenteditable=true]').first();
  await h.click(editor, 'Bấm vào vùng soạn thảo, rồi dán kịch bản mẫu. Kịch bản đầy đủ có trong file prompt-pack.',
    { say: 'Bấm vào vùng soạn thảo, rồi dán kịch bản mẫu. Kịch bản đầy đủ có trong file prom pách.', after: 600 });
  await pasteText(editor, SCRIPT);
  await h.wait(2000);
  await h.cap('Kịch bản cho AI nên chia thành từng cảnh đánh số. Mỗi cảnh ghi rõ trong nhà hay ngoài trời, ở đâu, lúc nào.', { top: true });
  await h.point(page.getByText(/^Cảnh 1\. Ngoại cảnh/), 'Ví dụ: Cảnh 1, ngoại cảnh, góc phố cổ Hà Nội, chiều tối, trời mưa.', { top: true });
  await h.point(page.getByText(/Ông Tư, 70 tuổi/), 'Lần đầu nhân vật xuất hiện, tả kỹ ngoại hình: tuổi, tóc, quần áo, đồ vật đặc trưng. AI dựa vào đó để tách nhân vật ở bước sau.',
    { top: true });
  await h.point(page.getByText(/^MAI: /), 'Câu thoại viết dạng TÊN, dấu hai chấm, rồi lời thoại.', { top: true });
  await h.cap('Phim ngắn 30 giây thì khoảng 6 cảnh, mỗi cảnh 5 giây.', { top: true });
  await h.click(page.getByRole('button', { name: 'Lưu nháp' }), 'Dán xong, bấm Lưu nháp ở góc trên bên phải.', { after: 1500 });
  await h.cap('AID báo Đã lưu bản nháp. Kịch bản đã sẵn sàng cho bước tiếp theo.');
} catch (e) {
  await snap(page, '02-error').catch(() => {});
  throw e;
} finally {
  await finish();
}
