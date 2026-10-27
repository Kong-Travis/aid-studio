// Opening: title, then build.mjs plays the finished film.
import { start } from '../lib.mjs';

const { h, finish } = await start('00-mo-dau');
try {
  await h.card('AID Studio - hướng dẫn tiếng Việt', 'Làm phim AI giữ nhân vật nhất quán', 'Từ kịch bản tới phim hoàn chỉnh, chỉ dùng công cụ miễn phí.',
    { say: 'Làm phim AI giữ nhân vật nhất quán với AID Studio. Từ kịch bản tới phim hoàn chỉnh, chỉ dùng công cụ miễn phí.' });
  await h.card('Xem trước', 'Chiếc ô vàng', 'Phim ngắn 30 giây bạn sẽ làm được sau video này.',
    { say: 'Đây là Chiếc ô vàng, phim ngắn ba mươi giây làm bằng các công cụ miễn phí. Hãy để ý cô gái tên Mai và ông Tư bán bánh mì: từ cảnh đầu tới cảnh cuối, khuôn mặt, kiểu tóc, chiếc áo len, chiếc nón lá đều giữ nguyên.' });
} finally {
  await finish();
}
