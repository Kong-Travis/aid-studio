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

// Run a command the way the viewer types it, with ~ meaning out/work; show ~ again in the output.
const run = (cmd, cwd = REPO, tail = 0) => () => {
  let out;
  try {
    out = execFileSync('sh', ['-c', `${cmd} 2>&1`], { cwd, encoding: 'utf8', env: { ...process.env, HOME: W, T: 'vi/tutorial/tools', P: PHIM } });
  } catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  out = out.split(W).join('~').split(REPO + '/').join('');
  const lines = out.trimEnd().split('\n');
  return tail && lines.length > tail ? ['...', ...lines.slice(-tail)].join('\n') : lines.join('\n');
};

const { page, h, finish } = await start('06-video', { login: true });

try {
  await h.card('Chương 6', 'Video và giọng nói', 'Biến ảnh thành video có chuyển động máy quay,\nthêm giọng nói, rồi gắn vào AID. Tất cả miễn phí.');

  await page.goto(await projectUrl(page, 'storyboard-script'));
  await page.waitForLoadState('networkidle').catch(() => {});
  await h.wait(1500);
  await h.click(page.getByRole('button', { name: 'Tiếp theo' }), 'Sáu phân cảnh đã có ảnh. Bấm Tiếp theo để sang bước Tạo video.', { after: 3500 });
  h.mark('why');
  await h.cap('Đây là bước Tạo video. AID có thể nhờ các model video AI biến ảnh thành video chuyển động thật. Các model đó đều trả phí.');
  await h.cap('Cách miễn phí: tạo chuyển động máy quay từ chính ảnh phân cảnh. Phóng to chậm, lia ngang, kéo ra xa. Kỹ thuật này gọi là Ken Burns, phim truyện tranh động dùng rất nhiều. Và vì dùng chính ảnh đã duyệt, nhân vật không thể bị đổi mặt.');

  // ---------------------------------------------------------------- clips
  h.mark('clips');
  await h.term([
    { text: 'Cần cài FFmpeg một lần bằng Homebrew. Ba script nằm trong thư mục vi/tutorial/tools của AID Studio.',
      say: 'Cần cài ép ép em peg một lần bằng Hôm-bru. Ba script nằm trong thư mục tools của AID Studio.',
      cmd: 'brew install ffmpeg ffmpeg-full   # chỉ cần một lần', out: '' },
    { text: 'Mở Terminal, vào thư mục AID Studio. Giả sử 6 ảnh shot-1 tới shot-6 nằm trong thư mục anh trên Desktop.',
      say: 'Mở tơ-mi-nồ, vào thư mục AID Studio. Giả sử sáu ảnh shot một tới shot sáu nằm trong thư mục ảnh trên Desktop.',
      cmd: 'cd ~/Desktop/Projects/Business/aid-studio   # đổi theo nơi bạn để AID Studio', out: '' },
    { cmd: 'T=vi/tutorial/tools', out: '' },
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
  await h.point(page.getByRole('button', { name: 'Bắt đầu tạo video' }), 'Đừng bấm Bắt đầu tạo video: đó là model video trả phí.');
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
