// Chapter 4: character consistency. The Gemini app part is shown with real screenshots and the exact
// prompts and images from the sample film (Gemini cannot be driven in this browser); the import into
// AID is recorded live.
import path from 'node:path';
import { start, snap, thumb, esc, markParts, ROOT } from '../lib.mjs';
import { CHARACTER, SCENES } from '../content.mjs';
import { projectUrl } from '../flow.mjs';

const { page, h, finish } = await start('04-nhan-vat', { login: true });
const film = (f) => path.resolve(ROOT, '../assets/film', f);
const still = (f) => path.join(ROOT, 'stills', f);

const promptSlide = (label, promptHtml, image) =>
  `<div class="lbl">${esc(label)}</div><div class="two"><div class="prompt">${promptHtml}</div><img src="${thumb(image)}"></div>`;

// Import one image into the form (character look or scene) whose title matches `title`.
// Each caption is [shown text, spoken text] (spoken defaults to shown).
async function importInto(title, file, captions) {
  const say = (c) => (Array.isArray(c) ? { text: c[0], say: c[1] } : { text: c });
  const [c0, c1, c2] = captions.map((c) => (c ? say(c) : null));
  const block = page.getByText(title).first().locator('xpath=ancestor::*[.//button[normalize-space(.)="Nhập ảnh"]][1]');
  await h.click(block.getByRole('button', { name: 'Nhập ảnh' }), c0.text, { say: c0.say, after: 1500 });
  const dlg = page.getByRole('dialog').filter({ has: page.getByRole('button', { name: /Chọn tệp từ máy/ }) }).last();
  const chooser = page.waitForEvent('filechooser', { timeout: 60000 });
  await h.click(dlg.getByRole('button', { name: /Chọn tệp từ máy/ }), c1.text, { say: c1.say, after: 300 });
  await (await chooser).setFiles(file);
  await page.getByText(/Nhập thành công/).first().waitFor({ timeout: 30000 }).catch(() => {});
  await h.wait(1800);
  // The dialog closes by itself after a successful import; close it only if it stays open.
  if (!(await dlg.waitFor({ state: 'hidden', timeout: 6000 }).then(() => true).catch(() => false))) {
    await h.click(dlg.getByRole('button', { name: 'Đóng' }), null, { after: 1000 });
  }
  if (c2) await h.cap(c2.text, { say: c2.say });
}

try {
  await h.card('Chương 3', 'Giữ nhân vật nhất quán', 'Vẽ "thẻ nhân vật" cho từng nhân vật và bối cảnh,\nrồi đưa vào AID. Đây là chương quan trọng nhất.');

  // ---------------------------------------------------------------- five rules
  h.mark('rules');
  await h.slide(`<div class="lbl">Năm quy tắc vàng</div><ol>
    <li class="r1">Một phim, một cuộc trò chuyện Gemini.</li>
    <li class="r2">Vẽ thẻ nhân vật trước: ba góc nhìn, nền trắng.</li>
    <li class="r3">Một câu tả cố định cho mỗi nhân vật, lặp lại trong mọi prompt.</li>
    <li class="r4">Soi từng ảnh mới với thẻ nhân vật.</li>
    <li class="r5">Lệch thì sửa bằng một câu cụ thể.</li></ol>`, [
    { mark: '.r1', text: 'Quy tắc một: một phim, một cuộc trò chuyện. Tạo mọi ảnh của phim trong cùng một cuộc chat Gemini. Gemini nhớ các ảnh trước, nên nét vẽ và khuôn mặt giữ nguyên.' },
    { mark: '.r2', text: 'Hai: vẽ thẻ nhân vật trước, gồm chính diện, nghiêng ba phần tư và sau lưng, đứng cạnh nhau trên nền trắng.' },
    { mark: '.r3', text: 'Ba: mỗi nhân vật có một câu tả ngắn không bao giờ đổi, ví dụ Mai tóc đen ngắn ngang vai, áo len kem, ô vàng. Lặp lại câu này trong mọi prompt.' },
    { mark: '.r4', text: 'Bốn: soi từng ảnh mới với thẻ nhân vật: độ dài tóc, màu áo, phụ kiện, khuôn mặt.' },
    { mark: '.r5', text: 'Năm: lệch là sửa ngay, bằng một câu cụ thể. Đừng viết vẽ lại cho giống.' },
  ]);

  // ---------------------------------------------------------------- two ways
  h.mark('two-ways');
  await h.slide(`<div class="lbl">Hai cách vẽ thẻ nhân vật</div><div class="two" style="grid-template-columns:1fr 1fr;align-items:start">
    <div class="prompt p1"><b style="color:#F5B700">Chuyên nghiệp (có API key)</b><br>- Trong AID, ở từng tạo hình bấm Tạo tự động<br>- Model ảnh: Nano Banana Pro, Seedream 5.0 Pro, GPT Image 2...<br>- Ảnh thẻ nhân vật thành ảnh tham chiếu cho mọi cảnh sau<br>- Muốn bán phim: đọc điều khoản của nhà cung cấp</div>
    <div class="prompt p2"><b style="color:#F5B700">Miễn phí (video này)</b><br>- Vẽ bằng ứng dụng Gemini<br>- Tải ảnh về, bấm Nhập ảnh trong AID<br>- Đủ để học quy trình<br>- Quyền dùng thương mại của ảnh này: mình chưa kiểm chứng</div></div>`, [
    { mark: '.p1', text: 'Có API key xịn thì vẽ thẻ nhân vật ngay trong AID: ở từng tạo hình bấm Tạo tự động, chọn model ảnh như Nano Banana Pro, Seedream hay GPT Image. Ảnh thẻ nhân vật sau đó làm ảnh tham chiếu cho mọi cảnh.' },
    { mark: '.p2', text: 'Trong video này mình làm bản miễn phí bằng ứng dụng Gemini, đủ để học quy trình. Làm phim để bán thì nên dùng model trả phí và đọc kỹ điều khoản của nhà cung cấp, vì quyền dùng thương mại của ảnh từ ứng dụng miễn phí mình chưa kiểm chứng.' },
    { text: 'Dù cách nào, năm quy tắc vừa rồi vẫn giữ nguyên. Bây giờ làm thử bằng Gemini.' },
  ]);

  // ---------------------------------------------------------------- Gemini app
  h.mark('gemini');
  await h.still(still('gemini-chat.png'), [
    { text: 'Mở gemini.google.com, đăng nhập tài khoản Google, bắt đầu một cuộc trò chuyện mới. Dán prompt vào ô Ask Gemini ở dưới cùng.',
      say: 'Mở trang Giê-mi-nai chấm gu-gồ chấm com, đăng nhập tài khoản Google, bắt đầu một cuộc trò chuyện mới. Dán prompt vào ô hỏi Giê-mi-nai ở dưới cùng.',
      zoom: { x: 0.36, y: 0.83, w: 0.42, h: 0.17 } },
    { text: 'Đây là cuộc chat mình đã dùng cho phim mẫu: prompt ở bên phải, ảnh Gemini vẽ ở bên dưới.', zoom: null },
  ], 'Ứng dụng Gemini');

  const mai = markParts(CHARACTER.mai, [
    'theo phong cách hoạt hình 2D vẽ tay kiểu Ghibli, màu nước mềm mại',
    'khung ngang 16:9',
    'Nhân vật: Mai, cô gái Việt Nam 24 tuổi, gương mặt thanh tú hiền lành, mắt sáng, tóc đen ngắn ngang vai cắt gọn, mặc áo len đan màu kem, quần jean xanh đậm, giày thể thao trắng, tay cầm một chiếc ô màu vàng tươi cán dài đang gập.',
    'Vẽ cùng một nhân vật ở ba góc: chính diện toàn thân, nghiêng 3/4, và sau lưng, đứng cạnh nhau trên nền trắng trơn, ánh sáng đều.',
  ]);
  await h.slide(promptSlide('Prompt 1: thẻ nhân vật Mai', mai, film('mai-sheet.png')), [
    { text: 'Prompt đầu tiên: thẻ nhân vật cho Mai. Prompt có bốn phần.' },
    { mark: '.p1', text: 'Một: phong cách vẽ. Ở đây là hoạt hình 2D vẽ tay, màu nước. Nếu đăng video công khai, nên thay tên hãng phim bằng mô tả trung tính.' },
    { mark: '.p2', text: 'Hai: khung hình ngang 16:9.' },
    { mark: '.p3', text: 'Ba: mô tả nhân vật thật cụ thể: tuổi, tóc, quần áo, đồ vật đặc trưng là chiếc ô vàng.' },
    { mark: '.p4', text: 'Bốn: ba góc nhìn trên nền trắng. Nền trắng giúp AI tập trung vào nhân vật, không lẫn với cảnh.' },
    { text: 'Chờ khoảng một phút là có ảnh bên phải. Đây là bản gốc của Mai, mọi ảnh sau đều phải giống ảnh này.' },
  ]);

  await h.still(still('gemini-download.png'), [
    { text: 'Tải ảnh về đúng cách: rê chuột lên ảnh, bấm biểu tượng tải xuống ở góc trên bên phải ảnh, tên là Download full size image. Đừng chụp màn hình.',
      say: 'Tải ảnh về đúng cách: rê chuột lên ảnh, bấm biểu tượng tải xuống ở góc trên bên phải ảnh, tên là Đao-lốt phun sai im-mịch. Đừng chụp màn hình.',
      zoom: { x: 0.66, y: 0.59, w: 0.14, h: 0.1 } },
    { text: 'Ảnh về thư mục Downloads với tên kiểu Gemini_Generated_Image. Đổi tên ngay cho dễ nhớ, ví dụ mai-sheet.png.',
      say: 'Ảnh về thư mục Đao-lốt với tên kiểu Giê-mi-nai Gen-nờ-rết-tịt Im-mịch. Đổi tên ngay cho dễ nhớ, ví dụ mai gạch ngang sheet chấm pê en gờ.', zoom: null },
  ], 'Ứng dụng Gemini');

  const ongTu = markParts(CHARACTER.ongTu, ['Giữ nguyên đúng phong cách vẽ, nét vẽ và bảng màu của ảnh vừa rồi.']);
  await h.slide(promptSlide('Prompt 2: thẻ nhân vật ông Tư (cùng cuộc chat)', ongTu, film('ong-tu-sheet.png')), [
    { mark: '.p1', text: 'Vẫn trong cuộc chat đó, mình yêu cầu thẻ nhân vật ông Tư, mở đầu bằng câu: giữ nguyên đúng phong cách vẽ, nét vẽ và bảng màu của ảnh vừa rồi.' },
    { text: 'Nhờ vậy hai nhân vật trông như cùng một bộ phim. Tải về, đặt tên ong-tu-sheet.png.', say: 'Nhờ vậy hai nhân vật trông như cùng một bộ phim. Tải về, đặt tên ông tư sheet.' },
  ]);

  // ---------------------------------------------------------------- drift and fix
  h.mark('drift');
  const wet = markParts(CHARACTER.maiWet, ['Dùng đúng nhân vật Mai trong ảnh đầu tiên (giữ nguyên khuôn mặt, kiểu tóc, áo len kem, quần jean, giày trắng và phong cách vẽ).']);
  await h.slide(promptSlide('Prompt 3: Mai ướt vai (trạng thái thứ hai)', wet, film('mai-wet-drift.png')), [
    { text: 'Trong phim, Mai bị ướt vai khi che mưa cho ông Tư. Đó là trạng thái thứ hai của nhân vật, nên cần một ảnh riêng.' },
    { mark: '.p1', text: 'Prompt mở đầu bằng: dùng đúng nhân vật Mai trong ảnh đầu tiên, giữ nguyên khuôn mặt, kiểu tóc, quần áo.' },
    { text: 'Nhưng kết quả lần đầu bị lệch: tóc dài quá vai, và vết ướt thành màu bùn nâu. So với thẻ nhân vật là thấy sai ngay.' },
  ]);
  await h.slide(promptSlide('Prompt 4: sửa lệch bằng một câu cụ thể', esc(CHARACTER.fix), film('mai-wet.png')), [
    { text: 'Mình không vẽ lại từ đầu, mà sửa bằng câu cụ thể: tóc phải ngắn ngang vai, vết ướt chỉ là màu kem sẫm hơn, giữ nguyên mọi thứ khác.' },
    { text: 'Lần hai thì đúng. Tải về, đặt tên mai-wet.png.', say: 'Lần hai thì đúng. Tải về, đặt tên mai wet.' },
  ]);
  await h.slide(`<div class="lbl">Soi lỗi: gốc, bị lệch, đã sửa</div><div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">
    <div class="cell"><div class="t">Thẻ nhân vật gốc</div><img src="${thumb(film('mai-sheet.png'), 900)}"></div>
    <div class="cell bad"><div class="t">Lần 1: tóc dài, vết ướt màu nâu</div><img src="${thumb(film('mai-wet-drift.png'), 900)}"></div>
    <div class="cell"><div class="t">Lần 2: đã sửa</div><img src="${thumb(film('mai-wet.png'), 900)}"></div></div>`, [
    { text: 'Đặt cạnh nhau sẽ thấy rõ: luôn soi ảnh mới với thẻ nhân vật gốc trước khi dùng.' },
  ]);

  // ---------------------------------------------------------------- scenes
  h.mark('scenes-gemini');
  const sceneImgs = ['scene-corner.png', 'scene-sidewalk.png', 'scene-cart.png', 'scene-corner-night.png'];
  const sceneNames = ['Góc phố cổ, chiều mưa', 'Vỉa hè phố cổ', 'Cận cảnh xe bánh mì', 'Góc phố lúc lên đèn'];
  await h.slide(`<div class="lbl">Bối cảnh: cùng nguyên tắc, không có người</div><div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr))">
    ${sceneImgs.map((f, i) => `<div class="cell"><div class="t">${esc(sceneNames[i])}</div><img src="${thumb(film(f), 900)}"></div>`).join('')}</div>`, [
    { text: 'Bối cảnh cũng cần nhất quán: cùng con phố, cùng chiếc xe bánh mì. Vẫn trong cuộc chat cũ, mình vẽ góc phố trước.' },
    { text: 'Các góc khác ghi: cùng phong cách và cùng con phố trong ảnh vừa rồi. Lưu ý: ảnh bối cảnh không có người. Bốn prompt bối cảnh có đủ trong prompt-pack.',
      say: 'Các góc khác ghi: cùng phong cách và cùng con phố trong ảnh vừa rồi. Lưu ý: ảnh bối cảnh không có người. Bốn prompt bối cảnh có đủ trong file prom pách.' },
  ]);

  // ---------------------------------------------------------------- import into AID
  h.mark('import');
  await page.goto(await projectUrl(page, 'scene-character'));
  await page.waitForLoadState('networkidle').catch(() => {});
  await h.wait(1500);
  await h.cap('Quay lại AID, bước Chuẩn bị tư liệu.');
  await h.click(page.getByRole('button', { name: '角色', exact: true }), 'Mở tab 角色, nhân vật.', { say: 'Mở tab nhân vật.', after: 1800 });
  await importInto('Ông Tư_初始形象', film('ong-tu-sheet.png'), [
    'Ở tạo hình ban đầu của ông Tư, bấm Nhập ảnh.',
    ['Hộp thoại Nhập nhân vật mở ra. Bấm Chọn tệp từ máy, rồi chọn file ong-tu-sheet.png.', 'Hộp thoại Nhập nhân vật mở ra. Bấm Chọn tệp từ máy, rồi chọn file ảnh thẻ nhân vật ông Tư.'],
    'AID báo Nhập thành công, ảnh hiện ngay trong tạo hình.',
  ]);
  await importInto('Mai_初始形象', film('mai-sheet.png'), [
    'Làm tương tự với tạo hình ban đầu của Mai.',
    ['Chọn tệp từ máy, chọn mai-sheet.png.', 'Chọn tệp từ máy, chọn ảnh thẻ nhân vật Mai.'],
  ]);
  // Use the AI's second Mai look if it made one; otherwise add one.
  const maiTitles = (await page.getByText(/^Mai_/).allInnerTexts()).map((t) => t.split(/\s/)[0]);
  const second = maiTitles.find((t) => !t.includes('初始形象'));
  if (second) {
    await importInto(second, film('mai-wet.png'), [
      ['AI đã tạo thêm trạng thái thứ hai cho Mai. Bấm Nhập ảnh ở tạo hình đó.', 'AI đã tạo thêm trạng thái thứ hai cho Mai. Bấm Nhập ảnh ở tạo hình đó.'],
      ['Chọn mai-wet.png.', 'Chọn ảnh Mai ướt vai.'],
      'Nhân vật đã đủ ảnh: ông Tư, Mai, và Mai ướt vai.',
    ]);
  } else {
    const maiBlock = page.getByText('Mai_初始形象').first().locator('xpath=ancestor::*[.//button[contains(normalize-space(.),"Thêm tạo hình")]][1]');
    await h.click(maiBlock.getByRole('button', { name: /Thêm tạo hình/ }),
      'Lần này AI chỉ tạo một trạng thái cho Mai. Mình tự thêm trạng thái ướt vai: bấm Thêm tạo hình ở nhân vật Mai.', { after: 2000 });
    await importInto('未命名', film('mai-wet.png'), [
      ['Một tạo hình mới hiện ra, tên 未命名, nghĩa là chưa đặt tên. Bấm Nhập ảnh.', 'Một tạo hình mới hiện ra, chưa có tên. Bấm Nhập ảnh.'],
      ['Chọn mai-wet.png.', 'Chọn ảnh Mai ướt vai.'],
      'Nhân vật đã đủ ảnh: ông Tư, Mai, và Mai ướt vai.',
    ]);
  }
  await h.scroll(-2000, 6);

  await h.click(page.getByRole('button', { name: '场景', exact: true }), 'Bối cảnh cũng vậy. Mở tab 场景.', { say: 'Bối cảnh cũng vậy. Mở tab bối cảnh.', after: 1800 });
  const mapping = [[/Hà Nội/, 'scene-corner.png', 'ảnh góc phố'], [/Vỉa hè/, 'scene-sidewalk.png', 'ảnh vỉa hè'],
    [/xe bánh mì|ô vàng/, 'scene-cart.png', 'ảnh xe bánh mì'], [/Góc phố/, 'scene-corner-night.png', 'ảnh phố lúc lên đèn']];
  // Scene titles are "<name>_<time of day in Chinese>"; read them from the page, whatever the AI chose.
  const titles = [...new Set(await page.evaluate(() => [...document.querySelectorAll('*')]
    .filter((e) => e.children.length === 0 && e.offsetParent && /^.+_[\u4e00-\u9fff]{1,6}$/.test(e.textContent.trim()))
    .map((e) => e.textContent.trim())))];
  let first = true;
  for (const title of titles) {
    const [, file, spoken] = mapping.find(([re]) => re.test(title)) ?? mapping[0];
    const shown = title.replace(/_.*/, '');
    await importInto(title, film(file), first
      ? [`Bối cảnh ${shown}: bấm Nhập ảnh.`, [`Chọn tệp từ máy, chọn ${file}.`, `Chọn tệp từ máy, chọn ${spoken}.`]]
      : [`${shown}: Nhập ảnh.`, [`Chọn ${file}.`, `Chọn ${spoken}.`]]);
    first = false;
  }
  const left = await page.getByRole('button', { name: 'Nhập ảnh' }).count();
  if (left) throw new Error(`${left} scene(s) still without an image`);
  await h.scroll(-3000, 6);
  await h.cap('Xong. Nhân vật và bối cảnh đều có ảnh, cùng một nét vẽ, cùng một bảng màu. Đó là nền móng để cả phim giữ được nhân vật.');
} catch (e) {
  await snap(page, '04-error').catch(() => {});
  throw e;
} finally {
  await snap(page, '04-end').catch(() => {});
  await finish();
}
