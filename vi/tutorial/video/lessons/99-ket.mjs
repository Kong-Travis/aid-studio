// Closing: the five rules once more.
import { start } from '../lib.mjs';

const { h, finish } = await start('99-ket');
try {
  await h.slide(`<div class="lbl">Tóm lại năm điều</div><ol>
    <li class="r1">Một phim, một cuộc chat Gemini</li><li class="r2">Vẽ thẻ nhân vật ba góc nhìn trước</li>
    <li class="r3">Lặp lại câu tả cố định trong mọi prompt</li><li class="r4">Soi và sửa ngay khi lệch</li>
    <li class="r5">Dùng chính ảnh đã duyệt để làm video</li></ol>`, [
    { mark: 'li', text: 'Tóm lại năm điều: một phim một cuộc chat; vẽ thẻ nhân vật ba góc nhìn trước; lặp lại câu tả cố định trong mọi prompt; soi và sửa ngay khi lệch; và dùng chính ảnh đã duyệt để làm video.' },
  ]);
  await h.cap('Nhắc lại: phim trong video làm bằng công cụ miễn phí, chỉ để học quy trình. Muốn phim xịn để thương mại hoá: cùng các bước này, chọn model chữ, ảnh, video và giọng đọc trả phí trong Cấu hình tạo, thử trước trên vài cảnh, rồi mới sản xuất hàng loạt.');
  await h.card('Cảm ơn bạn đã xem', 'Chúc bạn làm được bộ phim đầu tiên', 'Tài liệu, prompt và script: fork AID Studio tiếng Việt, link ở mô tả.',
    { say: 'Cảm ơn bạn đã xem. Chúc bạn làm được bộ phim đầu tiên của mình. Tài liệu, prompt và script có trong fork AID Studio tiếng Việt, link ở phần mô tả.' });
} finally {
  await finish();
}
