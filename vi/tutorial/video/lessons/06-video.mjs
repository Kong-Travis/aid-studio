// Chapter 6: free camera-motion clips and voices made with the tutorial's FFmpeg scripts (run for real,
// in out/work standing in for the home folder, so the screen shows the same paths as the docs), then
// the six clips uploaded into AID.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { start, snap, OUT, REPO, ROOT } from '../lib.mjs';
import { projectUrl } from '../flow.mjs';

const W = path.join(OUT, 'work');
const DESK = path.join(W, 'Desktop');
const PHIM = path.join(DESK, 'phim');
fs.rmSync(PHIM, { recursive: true, force: true });
fs.mkdirSync(path.join(DESK, 'anh'), { recursive: true });
for (let n = 1; n <= 6; n++) fs.copyFileSync(path.resolve(ROOT, `../assets/film/shot-${n}.png`), path.join(DESK, 'anh', `shot-${n}.png`));
// The viewer downloads the free scripts from the fork into ~/Desktop/aid-tools.
const TOOLS = path.join(DESK, 'aid-tools');
fs.rmSync(TOOLS, { recursive: true, force: true });
fs.symlinkSync(path.resolve(ROOT, '../tools'), TOOLS);

// Run a command the way the viewer types it, with ~ meaning out/work; show ~ again in the output.
const run = (cmd, cwd = REPO, tail = 0) => () => {
  let out;
  try {
    out = execFileSync('sh', ['-c', `${cmd} 2>&1`], { cwd, encoding: 'utf8', env: { ...process.env, HOME: W, T: TOOLS, P: PHIM } });
  } catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  out = out.split(W).join('~').split(REPO + '/').join('');
  const lines = out.trimEnd().split('\n');
  return tail && lines.length > tail ? ['...', ...lines.slice(-tail)].join('\n') : lines.join('\n');
};

const { page, h, finish } = await start('06-video', { login: true });

try {
  await h.card('Chương 5', 'Sinh video và lồng tiếng', 'Biến mỗi ảnh phân cảnh thành một cảnh quay,\nthêm giọng nói, rồi gắn vào AID.');

  await page.goto(await projectUrl(page, 'storyboard-script'));
  await page.waitForLoadState('networkidle').catch(() => {});
  await h.wait(1500);
  await h.click(page.getByRole('button', { name: 'Tiếp theo' }), 'Sáu phân cảnh đã có ảnh. Bấm Tiếp theo để sang bước Tạo video.', { after: 3500 });
  h.mark('why');
  await h.cap('Đây là bước Tạo video, bước quyết định phim của bạn trông như phim thật hay không.');

  // ---------------------------------------------------------------- choosing a video model (knowledge)
  h.mark('models');
  await h.slide(`<div class="lbl">Có API key: chọn model video</div><div class="two" style="grid-template-columns:1fr 1fr;align-items:start">
    <div class="prompt p1"><b style="color:#F5B700">Có sẵn trong AID</b><br>- Seedance 2.0, 2.5 (ByteDance)<br>- Kling 3.0, Kling 3.0 Omni (Kuaishou)<br>- Vidu Q3 Pro<br>- Wan 3.0 (Alibaba)<br>- MiniMax H3</div>
    <div class="prompt p2"><b style="color:#F5B700">Mạnh nhưng chưa có trong AID</b><br>- Google Veo 3.1 (tạo kèm âm thanh)<br>- Runway Gen-4.5<br>Cần thêm adapter vào AID<br>(xem tài liệu tích hợp nhà cung cấp)</div></div>`, [
    { text: 'Có API key xịn, model video AI biến mỗi ảnh phân cảnh thành một cảnh quay thật sự: nhân vật cử động, biểu cảm, máy quay chuyển động. Model tốt có thể cho cảm giác như người thật đóng phim.' },
    { mark: '.p1', text: 'Trong AID có sẵn Seedance của ByteDance, Kling 3.0 của Kuaishou, Vidu, Wan 3.0 của Alibaba và MiniMax. Gợi ý thử: Seedance cho cảnh nhiều góc máy và ảnh tham chiếu; Kling cho cảnh nhân vật chuyển động, hội thoại.',
      say: 'Trong AID có sẵn Seedance của Bai-đần, Kling ba chấm không của Khoái Thủ, Vidu, Wan ba chấm không của A-li-ba-ba và MiniMax. Gợi ý thử: Seedance cho cảnh nhiều góc máy và ảnh tham chiếu; Kling cho cảnh nhân vật chuyển động, hội thoại.' },
    { mark: '.p2', text: 'Google Veo 3.1 và Runway Gen-4.5 cũng rất đáng thử, nhưng hiện chưa có trong AID; muốn dùng phải thêm adapter theo tài liệu tích hợp nhà cung cấp của AID.',
      say: 'Google Veo ba chấm một và Runway Gen bốn chấm năm cũng rất đáng thử, nhưng hiện chưa có trong AID; muốn dùng phải thêm adapter theo tài liệu tích hợp nhà cung cấp của AID.' },
    { text: 'Dù chọn model nào, hãy soi kỹ khuôn mặt và trang phục nhân vật giữa các cảnh, đúng như năm quy tắc ở chương 3.' },
  ]);
  await h.slide(`<div class="lbl">Giá tham khảo mỗi giây video (Runway Dev, xem ngày 27/10/2026)</div>
    <div class="prompt" style="font-size:26px;line-height:1.9;max-width:1250px;margin:20px auto">
    Kling 3.0 Standard: $0,09 (không âm thanh), $0,13 (có âm thanh)<br>
    Veo 3.1 Fast: $0,10 (không âm thanh), $0,15 (có âm thanh)<br>
    Veo 3.1: $0,20 (không âm thanh), $0,40 (có âm thanh)<br>
    Seedance 2.0: $0,30 (720p), $0,40 (1080p)<br>
    <span style="color:#aaa;font-size:22px">Giá qua nền tảng Runway Dev; mua trực tiếp từ nhà phát triển có thể khác. Giá thay đổi theo thời gian.</span></div>`, [
    { text: 'Về chi phí: đây là giá tham khảo mỗi giây video trên nền tảng Runway Dev, mình xem ngày 27 tháng 10 năm 2026. Kling 3.0 Standard khoảng 9 xu mỗi giây; Veo 3.1 Fast 10 xu; Seedance 2.0 từ 30 xu ở 720p.',
      say: 'Về chi phí: đây là giá tham khảo mỗi giây video trên nền tảng Runway Dev, mình xem ngày hai mươi bảy tháng mười năm hai nghìn không trăm hai mươi sáu. Kling ba chấm không Standard khoảng chín xu đô la mỗi giây; Veo ba chấm một Fast mười xu; Seedance hai chấm không từ ba mươi xu ở bảy trăm hai mươi pê.' },
    { text: 'Ví dụ: phim tổng 200 phút, ở mức 10 xu mỗi giây, đã tốn khoảng 1.200 đô cho một lượt tạo. Thực tế còn phải tạo lại cảnh lỗi và thử nhiều phiên bản, nên ngân sách cao hơn đáng kể.',
      say: 'Ví dụ: phim tổng hai trăm phút, ở mức mười xu đô la mỗi giây, đã tốn khoảng một nghìn hai trăm đô la cho một lượt tạo. Thực tế còn phải tạo lại cảnh lỗi và thử nhiều phiên bản, nên ngân sách cao hơn đáng kể.' },
  ]);
  await h.slide(`<div class="lbl">Nên bắt đầu thế nào</div><ol>
    <li class="b1">Muốn chạy nhanh: mua API key trực tiếp từ nhà cung cấp AID đã hỗ trợ sẵn</li>
    <li class="b2">Muốn thử nhiều model bằng một tài khoản: nền tảng tổng hợp như Runway API, nhưng AID phải hỗ trợ giao thức đó, chưa có thì cần thêm adapter</li>
    <li class="b3">Thử 5 đến 10 cảnh trên hai model, chấm điểm rồi mới sản xuất hàng loạt</li>
    <li class="b4">Làm phim để bán: đọc điều khoản sử dụng của từng nhà cung cấp</li></ol>`, [
    { mark: '.b1', text: 'Nên bắt đầu thế nào? Muốn chạy nhanh: mua API key trực tiếp từ nhà cung cấp mà AID đã hỗ trợ sẵn, rồi dán vào AID.' },
    { mark: '.b2', text: 'Muốn thử nhiều model bằng một tài khoản: dùng nền tảng tổng hợp như Runway API, nhưng phải chắc AID hỗ trợ giao thức đó; chưa có thì cần thêm adapter.' },
    { mark: '.b3', text: 'Đừng khoá cả dự án vào một model ngay. Thử 5 đến 10 cảnh trên hai model, ví dụ Kling Standard và một model khác, chấm điểm chất lượng rồi mới sản xuất hàng loạt.',
      say: 'Đừng khoá cả dự án vào một model ngay. Thử năm đến mười cảnh trên hai model, ví dụ Kling Standard và một model khác, chấm điểm chất lượng rồi mới sản xuất hàng loạt.' },
    { mark: '.b4', text: 'Và làm phim để bán thì đọc kỹ điều khoản sử dụng của từng nhà cung cấp.' },
  ]);
  await h.cap('Video này không dùng key trả phí, nên mình làm bản miễn phí: tạo chuyển động máy quay từ chính ảnh phân cảnh. Phóng to chậm, lia ngang, kéo ra xa, gọi là hiệu ứng Ken Burns. Không đẹp bằng video AI, nhưng đủ để đi hết quy trình.');

  // ---------------------------------------------------------------- clips
  h.mark('clips');
  await h.term([
    { text: 'Trên máy Mac, cài FFmpeg một lần bằng Homebrew.', say: 'Trên máy Mac, cài ép ép em peg một lần bằng Hôm-bru.',
      cmd: 'brew install ffmpeg ffmpeg-full   # chỉ cần một lần', out: '' },
    { text: 'Bộ script miễn phí nằm trong thư mục tools của fork AID Studio tiếng Việt, link ở phần mô tả. Tải về, để trên Desktop với tên aid-tools. Sáu ảnh shot-1 tới shot-6 để trong thư mục anh.',
      say: 'Bộ script miễn phí nằm trong thư mục tools của fork AID Studio tiếng Việt, link ở phần mô tả. Tải về, để trên Desktop với tên aid tools. Sáu ảnh shot một tới shot sáu để trong thư mục ảnh.',
      cmd: 'T=~/Desktop/aid-tools', out: '' },
    { cmd: 'mkdir -p ~/Desktop/phim', run: run('mkdir -p ~/Desktop/phim') },
    { text: 'Chạy script make-clips. Mỗi ảnh thành một clip 5 giây, 1280x720, với chuyển động lần lượt: phóng vào, lia ngang, phóng vào, đẩy vào nhân vật, kéo ra, kéo ra.',
      say: 'Chạy script mếch clíp. Mỗi ảnh thành một clip năm giây, độ phân giải một nghìn hai trăm tám mươi nhân bảy trăm hai mươi, với chuyển động lần lượt: phóng vào, lia ngang, phóng vào, đẩy vào nhân vật, kéo ra, kéo ra.',
      cmd: '$T/make-clips.sh ~/Desktop/anh ~/Desktop/phim/clips', run: run('$T/make-clips.sh ~/Desktop/anh ~/Desktop/phim/clips') },
    { text: 'Xong trong vài giây. Muốn đổi chuyển động, sửa dòng MOVES trong script.', say: 'Xong trong vài giây. Muốn đổi chuyển động, sửa dòng mút trong script.' },
  ]);

  const clip = path.join(PHIM, 'clips', 'shot-4.mp4');
  const webm = path.join(OUT, 'thumbs', 'shot-4-preview.webm');
  fs.mkdirSync(path.dirname(webm), { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', clip, '-c:v', 'libvpx-vp9', '-b:v', '3M', '-an', webm]);
  const src = 'data:video/webm;base64,' + fs.readFileSync(webm).toString('base64');
  await h.slide(`<div class="lbl">Clip cảnh 4: máy quay đẩy vào nhân vật</div><div style="height:calc(100% - 50px);display:flex;align-items:center;justify-content:center"><video src="${src}" autoplay muted loop playsinline style="max-width:100%;max-height:100%;border-radius:10px"></video></div>`, [
    { text: 'Đây là clip cảnh 4 vừa tạo: máy quay chậm rãi đẩy vào ông Tư.' },
  ]);

  // ---------------------------------------------------------------- voices
  h.mark('voices');
  await h.cap('Về giọng nói: có API key, AID có lồng tiếng AI ở bước Đồng bộ hình tiếng, với các giọng như Doubao TTS hay MiniMax Speech, có cả nhân bản giọng. Phần này mình chưa thử được vì cần key trả phí. Một số model video như Veo còn tạo âm thanh kèm.',
    { say: 'Về giọng nói: có API key, AID có lồng tiếng AI ở bước Đồng bộ hình tiếng, với các giọng như Đậu Bao TTS hay MiniMax Speech, có cả nhân bản giọng. Phần này mình chưa thử được vì cần key trả phí. Một số model video như Veo còn tạo âm thanh kèm.' });
  await h.term([
    { text: 'Giọng nói tốt nhất là tự thu bằng QuickTime. Nếu chỉ cần giọng tạm, máy Mac có sẵn giọng đọc tiếng Việt tên Linh.',
      say: 'Giọng nói tốt nhất là tự thu bằng Quích-tai. Nếu chỉ cần giọng tạm, máy Mac có sẵn giọng đọc tiếng Việt tên Linh.',
      cmd: 'cd ~/Desktop/phim', out: '' },
    { text: 'Giọng Linh cho Mai.', cmd: 'say -v Linh -r 175 -o mai.aiff "Ông ơi, để cháu che cho!"', run: run('say -v Linh -r 175 -o mai.aiff "Ông ơi, để cháu che cho!"', PHIM) },
    { text: 'Và chính giọng Linh, nhưng hạ tông, cho ông Tư.', cmd: 'say -v Linh -r 160 -o ongtu-raw.aiff "Cảm ơn cháu. Cầm lấy ổ này, ông mời!"',
      run: run('say -v Linh -r 160 -o ongtu-raw.aiff "Cảm ơn cháu. Cầm lấy ổ này, ông mời!"', PHIM) },
    { cmd: 'ffmpeg -i ongtu-raw.aiff -af "asetrate=22050*0.8,aresample=44100,atempo=1.15" ongtu.mp3',
      run: run('ffmpeg -y -i ongtu-raw.aiff -af "asetrate=22050*0.8,aresample=44100,atempo=1.15" ongtu.mp3', PHIM, 2) },
    { cmd: 'ffmpeg -i mai.aiff mai.mp3', run: run('ffmpeg -y -i mai.aiff mai.mp3', PHIM, 2), end: false },
  ]);
  await h.playAudio(path.join(PHIM, 'mai.mp3'), 'Nghe thử giọng Mai.');
  await h.playAudio(path.join(PHIM, 'ongtu.mp3'), 'Và giọng ông Tư.');
  await h.ev(() => window.__demo.term(false));
  await h.wait(700);

  h.mark('add-voice');
  await h.term([
    { text: 'Mẹo quan trọng: AID có bước Đồng bộ hình tiếng, nhưng ở bản hiện tại, giọng tải lên ở đó chưa được đưa vào phim khi xuất. AID chỉ giữ âm thanh có sẵn trong mỗi clip.' },
    { text: 'Vì vậy mình ghép giọng thẳng vào clip. Clip không có thoại vẫn cần một rãnh âm thanh im lặng, để phim xuất ra có tiếng liền mạch.',
      cmd: 'P=~/Desktop/phim; mkdir -p $P/voiced', run: run('mkdir -p $P/voiced') },
    { cmd: '$T/add-voice.sh $P/clips/shot-1.mp4 $P/voiced/shot-1.mp4                # im lặng', run: run('$T/add-voice.sh $P/clips/shot-1.mp4 $P/voiced/shot-1.mp4') },
    { cmd: '$T/add-voice.sh $P/clips/shot-2.mp4 $P/voiced/shot-2.mp4', run: run('$T/add-voice.sh $P/clips/shot-2.mp4 $P/voiced/shot-2.mp4') },
    { text: 'Cảnh 3 có giọng Mai, bắt đầu từ giây 0.6. Số giây viết bằng dấu chấm, không dùng dấu phẩy.',
      say: 'Cảnh ba có giọng Mai, bắt đầu từ giây không chấm sáu. Số giây viết bằng dấu chấm, không dùng dấu phẩy.',
      cmd: '$T/add-voice.sh $P/clips/shot-3.mp4 $P/voiced/shot-3.mp4 $P/mai.mp3 0.6', run: run('$T/add-voice.sh $P/clips/shot-3.mp4 $P/voiced/shot-3.mp4 $P/mai.mp3 0.6') },
    { text: 'Cảnh 4 có giọng ông Tư.', cmd: '$T/add-voice.sh $P/clips/shot-4.mp4 $P/voiced/shot-4.mp4 $P/ongtu.mp3 0.6', run: run('$T/add-voice.sh $P/clips/shot-4.mp4 $P/voiced/shot-4.mp4 $P/ongtu.mp3 0.6') },
    { cmd: '$T/add-voice.sh $P/clips/shot-5.mp4 $P/voiced/shot-5.mp4', run: run('$T/add-voice.sh $P/clips/shot-5.mp4 $P/voiced/shot-5.mp4') },
    { cmd: '$T/add-voice.sh $P/clips/shot-6.mp4 $P/voiced/shot-6.mp4', run: run('$T/add-voice.sh $P/clips/shot-6.mp4 $P/voiced/shot-6.mp4') },
    { text: 'Sáu clip đã có tiếng nằm trong thư mục voiced.' },
  ]);

  // ---------------------------------------------------------------- upload into AID
  h.mark('upload');
  await h.click(page.getByText('Sửa video phân cảnh', { exact: true }).first(), 'Quay lại AID. Có 6 ô video tương ứng 6 phân cảnh. Bấm Sửa video phân cảnh ở ô đầu tiên.', { after: 3500 });
  await h.point(page.getByText(/分镜视频01/).last(), 'Trên cùng là các tab 分镜视频 01 tới 06, tức video phân cảnh 1 tới 6.', { say: 'Trên cùng là các tab video phân cảnh một tới sáu.' });
  await h.point(page.getByRole('button', { name: 'Bắt đầu tạo video' }), 'Có API key thì ở đây bấm Bắt đầu tạo video: chọn model như Seedance hay Kling, AI sinh video ngay cho phân cảnh này từ ảnh phân cảnh. Bản miễn phí, mình tải clip đã làm lên.');
  for (let n = 1; n <= 6; n++) {
    if (n > 2) await h.nocap();
    if (n > 1) await h.click(page.getByText(new RegExp(`分镜视频0${n}`)).last(), n === 2 ? 'Bấm tab 02.' : null, { say: 'Bấm tab hai.', after: 2000 });
    const chooser = page.waitForEvent('filechooser', { timeout: 60000 });
    await h.click(page.getByRole('button', { name: /Tải video lên từ máy/ }).first(),
      n === 1 ? 'Góc dưới bên trái, bấm Tải video lên, chọn voiced/shot-1.mp4.' : null, { say: 'Góc dưới bên trái, bấm Tải video lên, chọn clip shot một trong thư mục voiced.', after: 300 });
    await (await chooser).setFiles(path.join(PHIM, 'voiced', `shot-${n}.mp4`));
    const setBtn = page.getByRole('button', { name: /Đặt làm video phân cảnh/ }).first();
    await setBtn.waitFor({ timeout: 60000 });
    await h.wait(1500);
    await h.click(setBtn, n === 1 ? 'Tải xong, bấm Đặt làm video phân cảnh.' : null, { after: 800 });
    await page.getByText(/thành công/).first().waitFor({ timeout: 20000 });
    await h.wait(1500);
    if (n === 1) await h.cap('AID báo thành công. Làm tương tự cho cả 6 phân cảnh.');
  }
  await h.click(page.getByRole('button', { name: /Quay lại/ }), 'Xong cả 6, bấm Quay lại.', { after: 3000 });
  await h.point(page.getByText(/Tiến độ video/), 'Tiến độ video ghi 6 trên 6. Đừng dùng nút Tải lên lồng tiếng ở bước Đồng bộ hình tiếng, vì giọng đã nằm trong clip.');
} catch (e) {
  await snap(page, '06-error').catch(() => {});
  throw e;
} finally {
  await snap(page, '06-end').catch(() => {});
  await finish();
}
