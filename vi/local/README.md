# Chạy AID Studio bản tiếng Việt trên máy Mac (miễn phí)

Thư mục này chứa các script để chạy AID Studio bản tiếng Việt trên một máy Mac (Apple Silicon), chỉ
dùng dịch vụ miễn phí. Dùng để quay bộ hướng dẫn trong `vi/tutorial/`.

Đã dùng để làm trọn phim mẫu ngày 2026-10-26 trên macOS 26, Apple M2 Pro, 16 GB RAM, Docker Desktop.
Các lệnh dưới đây là bản đã sửa sau lần chạy đó (thêm `--wait`, khóa cổng về `127.0.0.1`, `ffmpeg-full`);
chưa chạy lại từ một máy trắng theo đúng thứ tự này.

## Cần cài trước

| Công cụ | Cách cài | Ghi chú |
|---|---|---|
| Docker Desktop | docker.com | Chạy MySQL, Redis, nginx |
| JDK 21 | `brew install openjdk@21` | Backend cần Java 17 trở lên |
| Maven | `brew install maven` | Build backend |
| Node.js 22 | `brew install node` | Build giao diện |
| FFmpeg | `brew install ffmpeg ffmpeg-full` | AID dùng `ffmpeg-full` (bản thường không có `drawtext`, xuất phim sẽ lỗi). Nếu sau đó lệnh `ffmpeg` báo thiếu thư viện x265: `brew upgrade ffmpeg` |

## Chạy lần đầu

```sh
# 1. Cơ sở dữ liệu (MySQL 5.7 + Redis). Lần đầu tự nạp toàn bộ sql/*.sql (vài phút, MySQL chạy giả lập
#    amd64). --wait chờ tới khi MySQL thật sự sẵn sàng.
docker compose -f deploy/docker/docker-compose.middleware.yml -f vi/local/docker-compose.mac.yml up -d --wait

# 2. Nhãn menu tiếng Việt và cấu hình miễn phí
docker exec -i aid-dev-mysql mysql -uroot -p123456 aid_test < vi/sql/vi-labels.sql
docker exec -i aid-dev-mysql mysql -uroot -p123456 aid_test < vi/local/free-only.sql

# 3. Giao diện tiếng Việt
vi/scripts/build.sh
vi/local/run-frontend.sh

# 4. Backend (lần đầu thêm "build"). Chạy ở cửa sổ này; mở terminal khác cho việc khác.
vi/local/run-backend.sh build
```

Backend sẵn sàng khi `curl -s -o /dev/null -w '%{http_code}' localhost:8080/auth/public-config` trả về
`200` (log có dòng "Started AidApplication"). Dừng backend: Ctrl+C ở cửa sổ đó.

Mở:

- Trang làm phim: http://localhost:3000
- Trang quản trị: http://localhost:8090 (tài khoản mặc định `admin` / `admin123`, nên đổi ngay)

Những lần sau chỉ cần `docker compose ... up -d`, `vi/local/run-frontend.sh` và `vi/local/run-backend.sh`.

## Các file

| File | Việc nó làm |
|---|---|
| `docker-compose.mac.yml` | Chạy `mysql:5.7` dưới dạng amd64 (không có bản arm64), ép bảng mã utf8mb4, chỉ mở cổng 3306 và 6379 cho chính máy này (`127.0.0.1`) |
| `run-backend.sh` | Chạy backend với thư mục dữ liệu `~/aid-local`, log chi tiết, trỏ tới `ffmpeg-full` |
| `run-frontend.sh` | Chạy nginx phục vụ web (cổng 3000) và trang quản trị (cổng 8090) |
| `nginx.conf` | Cấu hình nginx tương ứng |
| `free-only.sql` | Chỉ bật model Gemini miễn phí, bật xuất phim bằng FFmpeg trên máy |
| `run-tunnel.sh` | (Không cần khi dùng Gemini) Mở đường hầm công khai cho ảnh, chỉ dùng với nhà cung cấp tải ảnh qua đường link |

## Vì sao cấu hình như vậy (các lỗi đã gặp khi chạy thật)

1. **Chữ Trung bị lỗi font trong database.** 14 file nâng cấp trong `sql/` không có `SET NAMES utf8mb4`,
   MySQL đọc chúng như latin1. `docker-compose.mac.yml` thêm `--skip-character-set-client-handshake`.
   Nếu đã lỡ nạp sai: `docker compose ... down -v` rồi chạy lại từ bước 1.
2. **Backend không khởi động: không ghi được `/home/aid/logs`.** `run-backend.sh` đặt `LOG_PATH`.
3. **Không thấy log của AID.** `application.yml` đặt `com.aid: error`. Script đặt lại `INFO`.
4. **Xuất phim lỗi "No such filter: 'drawtext'".** Dùng `ffmpeg-full`. Lưu ý: cài `ffmpeg-full` có thể
   nâng cấp thư viện x265 và làm hỏng lệnh `ffmpeg` thường; chạy `brew upgrade ffmpeg` để sửa.
5. **Giới hạn của Gemini miễn phí:** khoảng 20 lượt gọi mỗi ngày cho mỗi model (quota
   `GenerateRequestsPerDayPerProjectPerModel-FreeTier`), và đôi khi báo 503 (máy chủ quá tải).
   Project không gắn tài khoản thanh toán thì không thể bị tính tiền; hết quota chỉ báo lỗi 429.

## An toàn chi phí

- Chỉ dùng API key Gemini tạo trong **project mới, không gắn thanh toán** (trang Google AI Studio ghi
  "Free tier").
- `free-only.sql` tắt mọi model khác. Đừng bật model trả phí trong trang quản trị nếu không định trả tiền.
- "Điểm" trong AID là điểm ảo trong database trên máy (nạp tay ở trang quản trị), không phải tiền.

## Tắt

```sh
pkill -f aid-admin.jar
docker rm -f aid-local-nginx
docker compose -f deploy/docker/docker-compose.middleware.yml -f vi/local/docker-compose.mac.yml down
```
