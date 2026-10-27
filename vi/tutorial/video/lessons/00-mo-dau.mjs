// Opening: title and what the viewer will learn, then build.mjs plays the sample film.
import { start } from '../lib.mjs';

const { h, finish } = await start('00-mo-dau');
try {
  await h.card('AID Studio - hướng dẫn tiếng Việt', 'Làm phim AI giữ nhân vật nhất quán', 'Quy trình đầy đủ: kịch bản, nhân vật, bối cảnh,\nsinh video, lồng tiếng, xuất phim.',
    { say: 'Làm phim AI giữ nhân vật nhất quán với AID Studio. Quy trình đầy đủ của một bộ phim AI: kịch bản, nhân vật, bối cảnh, sinh video, lồng tiếng và xuất phim.' });
  await h.card('Phim mẫu', 'Chiếc ô vàng', 'Làm bằng công cụ miễn phí, chỉ để minh hoạ quy trình.',
    { say: 'Đây là Chiếc ô vàng, phim mẫu ba mươi giây. Mình làm hoàn toàn bằng công cụ miễn phí, nên hình ảnh chỉ ở mức minh hoạ. Với API key và model xịn, cùng quy trình này có thể cho ra những cảnh quay như người thật đóng. Hãy để ý cô gái tên Mai và ông Tư bán bánh mì: từ cảnh đầu tới cảnh cuối, khuôn mặt, kiểu tóc, chiếc áo len, chiếc nón lá đều giữ nguyên.' });
} finally {
  await finish();
}
