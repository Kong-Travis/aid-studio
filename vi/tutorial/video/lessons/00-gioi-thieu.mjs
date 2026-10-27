// Introduction after the film: why characters drift, the seven steps, the free path, what to prepare.
import path from 'node:path';
import { start, thumb, ROOT } from '../lib.mjs';

const { h, finish } = await start('00-gioi-thieu');
const film = (f) => path.resolve(ROOT, '../assets/film', f);
try {
  await h.slide(`<div class="lbl">Vì sao nhân vật AI hay bị "đổi mặt"</div><div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">
    <div class="cell"><div class="t">Bản gốc</div><img src="${thumb(film('mai-sheet.png'), 900)}"></div>
    <div class="cell bad"><div class="t">Lần vẽ sau: tóc dài, vết ướt màu nâu</div><img src="${thumb(film('mai-wet-drift.png'), 900)}"></div>
    <div class="cell"><div class="t">Đã sửa</div><img src="${thumb(film('mai-wet.png'), 900)}"></div></div>`, [
    { text: 'Giữ nhân vật giống nhau qua mọi cảnh là phần khó nhất khi làm phim bằng AI. Mỗi lần bạn bảo AI vẽ, nó vẽ lại từ đầu.' },
    { text: 'Ở ví dụ này, lần vẽ thứ hai AI cho Mai tóc dài quá vai, vết ướt thành màu bùn. Bí quyết là vẽ nhân vật một lần thật kỹ, rồi mọi cảnh sau đều bám theo hình đó. Video này sẽ chỉ cách phát hiện và sửa lỗi này.' },
  ]);
  await h.slide(`<div class="lbl">Bảy bước làm phim trong AID Studio</div><ol>
    <li class="s1">Cấu hình dự án</li><li class="s2">Sáng tác kịch bản</li><li class="s3">Chuẩn bị tư liệu: nhân vật, bối cảnh</li>
    <li class="s4">Thiết kế phân cảnh</li><li class="s5">Tạo video</li><li class="s6">Đồng bộ hình tiếng</li><li class="s7">Xem trước thành phẩm và xuất phim</li></ol>`, [
    { mark: 'li', text: 'AID Studio là phần mềm mã nguồn mở để làm phim AI và truyện tranh động. Mọi dự án đi qua bảy bước, giữ mọi thứ của một phim ở một chỗ: kịch bản, nhân vật, bối cảnh, từng cảnh quay, rồi ghép thành phim.',
      say: 'AID Studio là phần mềm mã nguồn mở để làm phim AI và truyện tranh động. Mọi dự án đi qua bảy bước, giữ mọi thứ của một phim ở một chỗ: kịch bản, nhân vật, bối cảnh, từng cảnh quay, rồi ghép thành phim.' },
  ]);
  await h.slide(`<div class="lbl">Chi phí: 0 đồng</div><ol>
    <li class="c1">AI hiểu kịch bản: Gemini API, gói miễn phí</li>
    <li class="c2">Vẽ nhân vật, bối cảnh, phân cảnh: ứng dụng Gemini miễn phí</li>
    <li class="c3">Chuyển động máy quay, giọng nói, ghép phim, phụ đề: FFmpeg trên máy</li>
    <li class="c4">"Điểm" trong AID: điểm ảo, không phải tiền</li></ol>`, [
    { mark: '.c1', text: 'Các phần tạo ảnh và video bằng AI ngay trong AID cần trả phí cho nhà cung cấp. Trong video này, mình chỉ dùng thứ miễn phí. Một: Gemini bản miễn phí để AID hiểu kịch bản.' },
    { mark: '.c2', text: 'Hai: ứng dụng Gemini để vẽ nhân vật và cảnh.' },
    { mark: '.c3', text: 'Ba: chuyển động máy quay, giọng nói và phụ đề làm ngay trên máy tính bằng FFmpeg.', say: 'Ba: chuyển động máy quay, giọng nói và phụ đề làm ngay trên máy tính bằng ép ép em peg.' },
    { mark: '.c4', text: 'Và điểm trong AID chỉ là điểm ảo, không phải tiền.' },
  ]);
  await h.slide(`<div class="lbl">Cần chuẩn bị</div><ol>
    <li class="hl">Một tài khoản AID Studio (người quản trị tạo, hoặc tự cài ở chương 1)</li>
    <li class="hl">Một tài khoản Google để dùng ứng dụng Gemini</li>
    <li class="hl">Một máy Mac có FFmpeg (cho chuyển động, giọng nói, phụ đề)</li></ol>`, [
    { text: 'Bạn cần: một tài khoản AID Studio, người quản trị sẽ tạo cho bạn, hoặc bạn tự cài theo chương 1. Một tài khoản Google để dùng ứng dụng Gemini. Và một máy Mac có FFmpeg.',
      say: 'Bạn cần: một tài khoản AID Studio, người quản trị sẽ tạo cho bạn, hoặc bạn tự cài theo chương một. Một tài khoản Google để dùng ứng dụng Gemini. Và một máy Mac có ép ép em peg.' },
    { text: 'Mọi kịch bản và prompt trong video đều có trong file prompt-pack.md, thư mục vi/tutorial. Bắt đầu thôi.', say: 'Mọi kịch bản và prompt trong video đều có trong file prom pách, thư mục tutorial. Bắt đầu thôi.' },
  ]);
} finally {
  await finish();
}
