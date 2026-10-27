// Chapter 1: run AID locally, create a free Gemini key, check the free-only models, create the
// learner account. The real Gemini key is never typed: the key field gets a placeholder and the
// dialog is cancelled. The learner's generated password is blurred and saved to out/.learner.
import fs from 'node:fs';
import path from 'node:path';
import { start, sh, snap, REPO, OUT, ROOT, WEB, ADMIN, FAST } from '../lib.mjs';

export const LEARNER = 'hocvien@aid.local';
const { page, h, finish } = await start('01-cai-dat');
const still = (f) => path.join(ROOT, 'stills', f);
const inRepo = { cwd: REPO };
const shell = (cmd) => () => sh('sh', ['-c', cmd], { ...inRepo, allowFail: true });

try {
  await h.card('Chương 1', 'Cài AID và bật Gemini miễn phí',
    'Dành cho người tự cài AID trên máy Mac.\nĐã có tài khoản AID do người khác cấp? Tua tới chương 2.');

  // ---------------------------------------------------------------- terminal
  h.mark('terminal');
  await h.term([
    { text: 'AID chạy trên máy Mac bằng Docker và Java. Mọi lệnh đã được gom sẵn trong thư mục vi/local, mình chạy lần lượt theo file README ở đó.',
      say: 'AID chạy trên máy Mac bằng Docker và Java. Mọi lệnh đã được gom sẵn trong thư mục vi local, mình chạy lần lượt theo file README ở đó.' },
    { text: 'Lệnh đầu tiên chạy cơ sở dữ liệu MySQL và Redis. Lần đầu mất vài phút. Khi cả hai báo Healthy là xong.',
      say: 'Lệnh đầu tiên chạy cơ sở dữ liệu Mai-ét-kiu-eo và Rê-đít. Lần đầu mất vài phút. Khi cả hai báo Heo-thi là xong.',
      cmd: 'docker compose -f deploy/docker/docker-compose.middleware.yml -f vi/local/docker-compose.mac.yml up -d --wait',
      run: shell('docker compose -f deploy/docker/docker-compose.middleware.yml -f vi/local/docker-compose.mac.yml up -d --wait 2>&1') },
    { text: 'Tiếp theo nạp nhãn menu tiếng Việt, rồi nạp file cấu hình chỉ bật các model miễn phí.',
      cmd: 'docker exec -i aid-dev-mysql mysql -uroot -p123456 aid_test < vi/sql/vi-labels.sql',
      run: shell('docker exec -i aid-dev-mysql mysql -uroot -p123456 aid_test < vi/sql/vi-labels.sql 2>&1') },
    { cmd: 'docker exec -i aid-dev-mysql mysql -uroot -p123456 aid_test < vi/local/free-only.sql',
      run: shell('docker exec -i aid-dev-mysql mysql -uroot -p123456 aid_test < vi/local/free-only.sql 2>&1') },
    { text: 'Dòng Warning về mật khẩu là bình thường, không phải lỗi.' },
    { text: 'Lệnh build giao diện tiếng Việt chạy khoảng vài phút. Mình đã chạy trước, nên video bỏ qua phần chờ.',
      cmd: 'vi/scripts/build.sh', out: '' },
    { text: 'Chạy máy chủ web cho trang làm phim và trang quản trị.',
      cmd: 'vi/local/run-frontend.sh', run: shell('vi/local/run-frontend.sh 2>&1 | cut -c1-12') },
    { text: 'Cuối cùng chạy backend. Lần đầu thêm chữ build ở cuối lệnh. Cửa sổ Terminal này phải để mở suốt lúc dùng AID. Mình đã chạy sẵn từ trước.',
      cmd: 'vi/local/run-backend.sh build', out: '' },
    { text: 'Mở thêm một cửa sổ Terminal thứ hai để kiểm tra. Thấy số 200 nghĩa là backend đã sẵn sàng.',
      cmd: "curl -s -o /dev/null -w '%{http_code}\\n' localhost:8080/auth/public-config",
      run: shell("curl -s -o /dev/null -w '%{http_code}\\n' localhost:8080/auth/public-config") },
  ]);

  await page.goto(WEB);
  await page.waitForLoadState('networkidle').catch(() => {});
  await h.cap('Mở trình duyệt, vào địa chỉ localhost, cổng 3000. Đây là trang chủ AID tiếng Việt.',
    { say: 'Mở trình duyệt, vào địa chỉ lo-cồ-hốt, cổng ba nghìn. Đây là trang chủ AID tiếng Việt.' });

  // ---------------------------------------------------------------- Gemini key (stills)
  h.mark('gemini-key');
  await h.still(still('aistudio-list.png'), [
    { text: 'Bây giờ tạo API key Gemini miễn phí. Vào trang aistudio.google.com/apikey và đăng nhập tài khoản Google.',
      say: 'Bây giờ tạo API key Gemini miễn phí. Vào trang Gu-gồ ây ai xờ-tiu-đi-ô, mục API key, và đăng nhập tài khoản Google.' },
    { text: 'Bấm nút Create API key ở góc trên bên phải.', say: 'Bấm nút Cờ-ri-ết a pi ai ki ở góc trên bên phải.', zoom: { x: 0.78, y: 0.0, w: 0.2, h: 0.14 } },
  ], 'Google AI Studio');
  await h.still(still('aistudio-create.png'), [
    { text: 'Ô Name your key: đặt tên là AID Studio Tutorial.', say: 'Ô Nêm dua ki: đặt tên là AID Studio Tu-tô-ri-ồ.', zoom: { x: 0.34, y: 0.3, w: 0.32, h: 0.38 } },
  ], 'Google AI Studio');
  await h.still(still('aistudio-project.png'), [
    { text: 'Ở ô chọn project, chọn Create project, đặt tên AID Tutorial, rồi bấm Create project.',
      say: 'Ở ô chọn prô-dét, chọn Cờ-ri-ết prô-dét, đặt tên AID Tu-tô-ri-ồ, rồi bấm Cờ-ri-ết prô-dét.', zoom: { x: 0.34, y: 0.3, w: 0.32, h: 0.43 } },
    { text: 'Quan trọng nhất: đây là project mới, không gắn thẻ thanh toán. Project như vậy không thể bị tính tiền. Hết lượt miễn phí trong ngày thì nó chỉ báo lỗi, không trừ tiền.',
      say: 'Quan trọng nhất: đây là prô-dét mới, không gắn thẻ thanh toán. Prô-dét như vậy không thể bị tính tiền. Hết lượt miễn phí trong ngày thì nó chỉ báo lỗi, không trừ tiền.' },
    { text: 'Bấm Create key, rồi bấm biểu tượng sao chép để copy key. Đừng chia sẻ key cho ai. Trong video này mình không mở key thật.',
      say: 'Bấm Cờ-ri-ết ki, rồi bấm biểu tượng sao chép để cóp-pi ki. Đừng chia sẻ ki cho ai. Trong video này mình không mở ki thật.' },
  ], 'Google AI Studio');
  await h.still(still('aistudio-list.png'), [
    { text: 'Kiểm tra lại danh sách: cột Billing Tier phải ghi Free tier. Nếu ghi Paid, hãy xoá key đó.',
      say: 'Kiểm tra lại danh sách: cột Bi-linh Tia phải ghi Phri tia, tức là miễn phí. Nếu ghi Pết, tức là trả phí, hãy xoá ki đó.', zoom: { x: 0.16, y: 0.19, w: 0.8, h: 0.15 } },
  ], 'Google AI Studio');

  // ---------------------------------------------------------------- admin: key and free models
  h.mark('admin');
  await page.goto(ADMIN + '/login');
  await page.waitForLoadState('networkidle').catch(() => {});
  await h.cap('Giờ dán key vào AID. Mở trang quản trị ở cổng 8090.', { say: 'Giờ dán ki vào AID. Mở trang quản trị ở cổng tám không chín không.' });
  await h.type(page.getByPlaceholder('Vui lòng nhập tài khoản'), 'admin', 'Tài khoản mặc định là admin.', { say: 'Tài khoản mặc định là át-min.' });
  await h.type(page.getByPlaceholder('Vui lòng nhập mật khẩu'), 'admin123', 'Mật khẩu mặc định là admin123. Nhớ đổi mật khẩu ngay sau khi đăng nhập.',
    { say: 'Mật khẩu mặc định là át-min một hai ba. Nhớ đổi mật khẩu ngay sau khi đăng nhập.' });
  await h.click(page.getByRole('button', { name: 'Đăng nhập' }), null, { after: 3000 });

  await h.click(page.getByRole('menuitem', { name: /Trung tâm năng lực AI/ }), 'Menu bên trái: Trung tâm năng lực AI.', { after: 1200 });
  await h.click(page.getByRole('menuitem', { name: /Quản lý mô hình/ }), 'Chọn Quản lý mô hình.', { after: 2500 });
  await h.click(page.getByRole('button', { name: /Nhà cung cấp chính hãng/ }), 'Mở nhóm Nhà cung cấp chính hãng.', { after: 1200 });
  await h.click(page.getByRole('button', { name: 'Google Gemini' }), 'Chọn Google Gemini.', { after: 2500 });
  await h.click(page.getByRole('button', { name: 'edit Sửa' }).first(), 'Bấm Sửa ngay trên thẻ Google Gemini.', { after: 1800 });

  const dlg = page.getByRole('dialog', { name: 'Sửa nhà cung cấp' });
  const keyBox = dlg.getByRole('textbox', { name: 'Khoá bí mật API' });
  await keyBox.scrollIntoViewIfNeeded();
  await h.wait(800);
  await h.point(keyBox, 'Cuộn xuống ô Khoá bí mật API. Dán key vừa copy vào đây. Ô này che ký tự, nên bạn chỉ thấy dấu chấm.',
    { say: 'Cuộn xuống ô Khoá bí mật a pi ai. Dán ki vừa cóp-pi vào đây. Ô này che ký tự, nên bạn chỉ thấy dấu chấm.' });
  await h.point(dlg.getByRole('button', { name: 'Đồng ý' }), 'Rồi bấm Đồng ý để lưu. AID trong video đã có key từ trước, nên mình bấm Hủy để giữ nguyên.',
    { say: 'Rồi bấm Đồng ý để lưu. AID trong video đã có ki từ trước, nên mình bấm Huỷ để giữ nguyên.' });
  await h.click(dlg.getByRole('button', { name: 'Hủy' }), null, { after: 1500 });

  const flash = page.getByRole('row', { name: /^Gemini 3\.6 Flash/ });
  await h.point(flash.getByRole('switch'), 'File free-only đã chỉ bật hai model miễn phí: Gemini 3.6 Flash và Gemini 3.1 Flash-Lite. Mọi model khác đều tắt, để không ai lỡ dùng model trả phí.',
    { say: 'File phri ôn-li đã chỉ bật hai model miễn phí: Gemini ba chấm sáu Flash và Gemini ba chấm một Flash-Lite. Mọi model khác đều tắt, để không ai lỡ dùng model trả phí.' });
  await h.click(flash.getByRole('button', { name: /Kiểm tra/ }), 'Bấm Kiểm tra ở dòng Gemini 3.6 Flash để thử key.',
    { say: 'Bấm Kiểm tra ở dòng Gemini ba chấm sáu Flash để thử ki.', after: 2500 });
  const result = page.getByRole('dialog', { name: 'Kết quả kiểm tra kết nối' });
  await result.waitFor({ timeout: 60000 });
  await h.point(result.getByText(/Kết nối thành công/), 'Báo Kết nối thành công là key đã chạy.', { say: 'Báo Kết nối thành công là ki đã chạy.' });
  await h.click(result.getByRole('button', { name: 'Close' }), null, { after: 1200 });
  await h.cap('Cột Cấu hình tính phí là cách AID quy ra điểm nội bộ. Google không tính tiền project ở gói miễn phí.',
    { say: 'Cột Cấu hình tính phí là cách AID quy ra điểm nội bộ. Gu-gồ không tính tiền prô-dét ở gói miễn phí.' });

  // ---------------------------------------------------------------- learner account
  h.mark('user');
  await h.click(page.getByRole('menuitem', { name: /Quản lý người dùng/ }), 'Tiếp theo tạo tài khoản cho người làm phim. Menu Quản lý người dùng.', { after: 1200 });
  await h.click(page.getByRole('menuitem', { name: /Danh sách người dùng/ }), 'Chọn Danh sách người dùng.', { after: 2500 });
  await h.click(page.getByRole('button', { name: /Thêm người dùng/ }), 'AID chưa bật tự đăng ký bằng email, nên người quản trị tạo tài khoản giúp. Bấm Thêm người dùng.', { after: 1500 });
  const add = page.getByRole('dialog', { name: 'Thêm người dùng' });
  await h.click(add.locator('label').filter({ hasText: /^Email$/ }), 'Loại tài khoản: chọn Email.', { after: 1000 });
  await h.type(add.getByRole('textbox'), LEARNER, 'Nhập email của người dùng. Ở đây mình dùng hocvien@aid.local.',
    { say: 'Nhập email của người dùng. Ở đây mình dùng học viên a còng ây ai đi chấm lo-cồ.' });
  await h.click(add.getByRole('button', { name: 'Xác nhận tạo' }), 'Bấm Xác nhận tạo.', { after: 2000 });

  // The generated password: blur it on screen, keep it for chapter 2.
  const pw = page.getByRole('dialog').filter({ has: page.getByRole('button', { name: /Tôi đã lưu/ }) });
  await pw.waitFor({ timeout: 30000 });
  await h.wait(800);
  const pwText = await pw.innerText();
  const m = pwText.match(/[A-Za-z0-9!@#$%^&*_\-]{8,}/g)?.find((s) => !s.includes('@') && /\d/.test(s) && /[A-Za-z]/.test(s));
  if (!m) throw new Error('password not found in dialog: ' + pwText.replace(/\s+/g, ' ').slice(0, 200));
  await page.evaluate((secret) => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let t; while ((t = w.nextNode())) if (t.textContent.includes(secret)) t.parentElement.classList.add('__blur');
    document.querySelectorAll('input').forEach((i) => { if (i.value === secret) i.classList.add('__blur'); });
  }, m);
  fs.writeFileSync(path.join(OUT, '.learner'), JSON.stringify({ email: LEARNER, password: m }), { mode: 0o600 });
  await h.cap('Hệ thống tạo sẵn mật khẩu ban đầu. Nhớ lưu lại để đưa cho người dùng. Trong video mình làm mờ mật khẩu.');
  await h.click(pw.getByRole('button', { name: /Tôi đã lưu/ }), 'Lưu xong, bấm Tôi đã lưu.', { after: 2000 });

  const row = page.getByRole('row', { name: new RegExp(LEARNER.replace('.', '\\.')) });
  await h.click(row.getByRole('button', { name: /Điều chỉnh số dư/ }), 'Nạp điểm cho tài khoản mới: bấm Điều chỉnh số dư.', { after: 1500 });
  const bal = page.getByRole('dialog', { name: 'Điều chỉnh số dư người dùng' });
  await h.point(bal.locator('label').filter({ hasText: /^Cộng số dư$/ }), 'Chọn Cộng số dư.');
  await h.type(bal.getByRole('spinbutton'), '1000', 'Số tiền: 1000. Đây là điểm ảo trong AID, không phải tiền thật.',
    { say: 'Số tiền: một nghìn. Đây là điểm ảo trong AID, không phải tiền thật.' });
  await h.type(bal.getByRole('textbox', { name: 'Lý do điều chỉnh' }), 'Điểm ảo', 'Lý do: Điểm ảo.');
  await h.click(bal.getByRole('button', { name: 'Đồng ý' }), 'Bấm Đồng ý.', { after: 2000 });
  await h.cap('Phần cài đặt đã xong. Từ chương sau, mình làm phim bằng tài khoản vừa tạo.');
} catch (e) {
  await snap(page, '01-error').catch(() => {});
  throw e;
} finally {
  await finish();
}
