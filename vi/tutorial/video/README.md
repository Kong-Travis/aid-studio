# Quay và dựng video hướng dẫn

Thư mục này quay video hướng dẫn trên AID thật, rồi ghép thành **một video duy nhất** có phụ đề và giọng
đọc tiếng Việt. Không cần quyền quay màn hình: mỗi chương chạy trong một trình duyệt Chromium riêng của
Playwright, có bật quay video sẵn.

Đã dùng để dựng bản 37 phút ngày 2026-10-27 trên chính AID chạy theo `vi/local/README.md`.

## Cần có

| Thứ | Ghi chú |
|---|---|
| AID chạy trên máy | Theo `vi/local/README.md`, đã có key Gemini miễn phí |
| Node.js 22, FFmpeg | `npm install` trong thư mục này, rồi `npx playwright install chromium` |
| Giọng đọc | Dịch vụ Piper của dự án ImmortalReader (`backend/tts`), chạy trên máy ở cổng 8001. Mặc định giọng nam `piper-vi-quang-huy`; đổi bằng biến `TTS_VOICE` |

Chạy dịch vụ giọng đọc (một lần build, sau đó chỉ cần `docker start aid-tutorial-tts`):

```sh
cd <ImmortalReader>/backend/tts
docker build --target runtime -t ir-tts:aid-tutorial -f Dockerfile .
docker run -d --name aid-tutorial-tts -p 127.0.0.1:8001:8001 ir-tts:aid-tutorial
```

## Quay

Mỗi chương là một file trong `lessons/`. Các chương nối tiếp nhau trên cùng một database, nên quay đúng
thứ tự và lưu database sau mỗi chương bằng `./db.sh save <tên>`; quay lại một chương thì
`./db.sh restore <tên chương trước>` rồi chạy lại.

```sh
./db.sh save 00                      # trạng thái trước khi quay
node lessons/00-mo-dau.mjs
node lessons/00-gioi-thieu.mjs
node lessons/01-cai-dat.mjs && ./db.sh save 01      # chỉ để tạo tài khoản hocvien@aid.local; không đưa vào video
node lessons/02-du-an.mjs && ./db.sh save 02
node lessons/03a-trich-xuat.mjs && ./db.sh save 03a # chọn Flash-Lite trong Cấu hình tạo, rồi trích xuất
node lessons/03b-tao-hinh.mjs && ./db.sh save 03b   # gọi Gemini Flash-Lite
node lessons/03c-boi-canh.mjs && ./db.sh save 03c   # gọi Gemini Flash-Lite
node lessons/04-nhan-vat.mjs && ./db.sh save 04
node lessons/05-phan-canh.mjs && ./db.sh save 05
node lessons/06-video.mjs && ./db.sh save 06
node lessons/07-xuat-phim.mjs && ./db.sh save 07
node lessons/99-ket.mjs
node build.mjs                       # ra out/aid-studio-huong-dan.mp4 và out/chapters.txt
```

`FAST=1 node lessons/<chương>.mjs` chạy nhanh, không quay, để thử các bước trước khi quay thật (vẫn bấm
thật trên AID, nên khôi phục database sau đó). Ảnh chụp lỗi nằm ở `out/debug/`.

## Các file

| File | Việc nó làm |
|---|---|
| `lib.mjs` | Lớp phủ trên trang: phụ đề, con trỏ, khung đánh dấu, thẻ tiêu đề, ảnh tĩnh, trình chiếu, terminal; tạo giọng đọc cho từng câu |
| `flow.mjs` | Tìm dự án của học viên, chờ tác vụ AI (tự bấm lại khi Google quá tải) |
| `content.mjs` | Lấy kịch bản và prompt từ `../prompt-pack.md`, để video và tài liệu luôn khớp |
| `build.mjs` | Ghép giọng vào từng chương, tua nhanh đoạn chờ AI, nối thành một video, ghi mốc chương |
| `db.sh` | Lưu và khôi phục database giữa các lần quay |
| `explore.mjs` | Công cụ dò giao diện khi viết chương mới |
| `stills/` | Ảnh chụp thật của Google AI Studio và ứng dụng Gemini (đã làm mờ email, key, lịch sử chat) |

## Những điều đã gặp khi quay

- Ứng dụng Gemini và Google AI Studio cần đăng nhập Google, nên không quay trực tiếp: video dùng ảnh chụp
  thật cùng đúng prompt và ảnh kết quả của phim mẫu.
- Video coi AID như một trang web online: không có phần cài đặt, mỗi bước dùng đồ miễn phí đều nói kèm cách
  làm bằng model trả phí (đúng nút, đúng tên model trong danh sách của AID).
- Gemini 3.6 Flash miễn phí chỉ khoảng 20 lượt mỗi ngày và 5 lượt mỗi phút; tạo hình hàng loạt gửi một
  lượt cho mỗi bối cảnh cùng lúc. Vì vậy chương 2 chọn Gemini 3.1 Flash-Lite (500 lượt mỗi ngày) cho mọi
  việc chữ ngay trên màn hình, qua "Cấu hình tạo".
- AID chỉ chạy một tác vụ tạo hình mỗi lúc cho một dự án: bấm nhân vật thứ hai khi nhân vật đầu chưa xong
  thì bị từ chối.
- Kết quả AI mỗi lần mỗi khác (lần quay này: 5 bối cảnh, Mai chỉ có một trạng thái), nên chương 4 thêm
  trạng thái "Mai ướt vai" bằng nút "Thêm tạo hình".
