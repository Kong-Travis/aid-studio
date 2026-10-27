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
    { mark: 'li', text: 'AID Studio là nền tảng làm phim AI và truyện tranh động. Mọi dự án đi qua bảy bước, giữ mọi thứ của một phim ở một chỗ: kịch bản, nhân vật, bối cảnh, từng cảnh quay, rồi ghép thành phim.',
      say: 'AID Studio là nền tảng làm phim AI và truyện tranh động. Mọi dự án đi qua bảy bước, giữ mọi thứ của một phim ở một chỗ: kịch bản, nhân vật, bối cảnh, từng cảnh quay, rồi ghép thành phim.' },
  ]);
  await h.slide(`<div class="lbl">Cùng một quy trình, hai mức chất lượng</div>
    <div class="prompt" style="font-size:22px;line-height:1.75;padding:18px 24px">
    <table style="width:100%;border-collapse:collapse">
    <tr style="color:#F5B700"><td style="padding:4px 10px">Bước</td><td style="padding:4px 10px">Video này (miễn phí)</td><td style="padding:4px 10px">Làm phim xịn (có API key)</td></tr>
    <tr class="r1"><td style="padding:4px 10px">Đọc kịch bản, tách nhân vật</td><td style="padding:4px 10px">Gemini Flash-Lite miễn phí</td><td style="padding:4px 10px">GPT-5.5, Qwen 3.7 Max, DeepSeek V4 Pro</td></tr>
    <tr class="r2"><td style="padding:4px 10px">Vẽ nhân vật, bối cảnh, phân cảnh</td><td style="padding:4px 10px">Ứng dụng Gemini</td><td style="padding:4px 10px">Nano Banana Pro, Seedream 5.0 Pro, GPT Image 2</td></tr>
    <tr class="r3"><td style="padding:4px 10px">Sinh video</td><td style="padding:4px 10px">Chuyển động máy quay từ ảnh</td><td style="padding:4px 10px">Seedance, Kling 3.0, Vidu, Wan 3.0</td></tr>
    <tr class="r4"><td style="padding:4px 10px">Lồng tiếng</td><td style="padding:4px 10px">Giọng đọc có sẵn trên máy</td><td style="padding:4px 10px">Doubao TTS, MiniMax Speech</td></tr>
    <tr class="r5"><td style="padding:4px 10px">Ghép phim, phụ đề</td><td style="padding:4px 10px">AID và script miễn phí</td><td style="padding:4px 10px">AID và script miễn phí</td></tr>
    </table></div>`, [
    { text: 'Video này đi đúng quy trình làm một bộ phim AI thật, nhưng mình không có API key trả phí, nên dùng công cụ miễn phí ở mọi bước. Bảng này cho thấy ở mỗi bước, nếu có key xịn thì bạn chọn gì.' },
    { mark: '.r1', text: 'Đọc kịch bản và tách nhân vật: video dùng Gemini miễn phí; bản xịn chọn GPT-5.5, Qwen 3.7 Max hay DeepSeek V4 Pro.',
      say: 'Đọc kịch bản và tách nhân vật: video dùng Gemini miễn phí; bản xịn chọn GPT năm chấm năm, Qwen ba chấm bảy Max hay DeepSeek V bốn Pro.' },
    { mark: '.r2', text: 'Vẽ nhân vật và cảnh: video dùng ứng dụng Gemini; bản xịn vẽ ngay trong AID bằng Nano Banana Pro, Seedream hay GPT Image.' },
    { mark: '.r3', text: 'Sinh video: video dùng chuyển động máy quay từ ảnh; bản xịn dùng Seedance, Kling, Vidu hay Wan để nhân vật cử động thật.' },
    { mark: '.r4', text: 'Lồng tiếng: video dùng giọng đọc có sẵn trên máy; bản xịn dùng giọng AI như Doubao hay MiniMax.', say: 'Lồng tiếng: video dùng giọng đọc có sẵn trên máy; bản xịn dùng giọng AI như Đậu Bao hay MiniMax.' },
    { mark: '.r5', text: 'Còn ghép phim và phụ đề thì giống nhau. Các nút bấm và thứ tự các bước không đổi, nên học xong quy trình này là bạn làm được bản xịn.' },
  ]);
  await h.slide(`<div class="lbl">Cần chuẩn bị</div><ol>
    <li class="hl">Một tài khoản trên trang AID Studio, có điểm trong tài khoản</li>
    <li class="hl">Làm bản xịn: điểm hoặc API key cho các model trả phí</li>
    <li class="hl">Làm bản miễn phí như video: tài khoản Google (ứng dụng Gemini) và máy tính có FFmpeg</li></ol>`, [
    { text: 'Bạn cần một tài khoản trên trang AID Studio. Làm bản xịn thì cần điểm hoặc API key cho các model trả phí. Làm bản miễn phí như video thì cần thêm tài khoản Google để dùng ứng dụng Gemini, và máy tính có FFmpeg.',
      say: 'Bạn cần một tài khoản trên trang AID Studio. Làm bản xịn thì cần điểm hoặc API key cho các model trả phí. Làm bản miễn phí như video thì cần thêm tài khoản Google để dùng ứng dụng Giê-mi-nai, và máy tính có ép ép em peg.' },
    { text: 'Mọi kịch bản, prompt và script trong video đều có trong fork AID Studio tiếng Việt, link ở phần mô tả. Bắt đầu thôi.' },
  ]);
} finally {
  await finish();
}
