# Bộ hướng dẫn: Làm phim AI giữ nhân vật nhất quán với AID Studio (miễn phí)

Bộ hướng dẫn bằng tiếng Việt cho người chưa từng làm phim AI, gồm **một video hướng dẫn liền mạch**
(khoảng 37 phút, có giọng đọc và phụ đề) và các bài viết đi kèm. Học xong, người xem tự làm được một phim
ngắn hoàn chỉnh: có nhân vật giữ nguyên khuôn mặt và trang phục qua mọi cảnh, có chuyển động máy quay,
có giọng nói và phụ đề.

## Video hướng dẫn

**Xem trên YouTube: https://youtu.be/qIy4o5XEPpc** (kênh Xưởng Phim AI Miễn Phí).

Video được quay tự động bằng `video/` (xem [video/README.md](video/README.md)): trình duyệt tự bấm từng
bước trên AID thật, chậm để người xem theo kịp; phụ đề và giọng đọc (giọng nam Quang Huy, Piper, chạy trên
máy) nói đúng thao tác đang làm. File video không nằm trong git (175 MB, quá giới hạn của GitHub); dựng lại
bằng `video/` hoặc lấy bản đã dựng ở `video/out/aid-studio-huong-dan.mp4` trên máy đã quay.

Mốc chương (dán vào mô tả YouTube):

```text
00:00 Mở đầu
00:26 Phim thành phẩm
00:56 Giới thiệu
02:32 1. Cài AID và bật Gemini miễn phí
08:27 2. Tạo dự án và kịch bản
11:55 3. Để AI tách nhân vật và bối cảnh
16:43 4. Giữ nhân vật nhất quán
22:27 5. Phân cảnh
27:52 6. Video và giọng nói
33:34 7. Xuất phim và phụ đề
36:25 Phim thành phẩm
36:55 Tổng kết
```

Đường đi chính của bộ này đã được **chạy thật** từ đầu đến cuối trên AID Studio v2.2.4 bản tiếng Việt
ngày 2026-10-26; những chỗ chưa kiểm chứng đều ghi rõ "chưa chạy thử". Phim mẫu "Chiếc ô vàng" làm ra
từ chính các bước này nằm ở `assets/film/chiec-o-vang.mp4`.

> **Cảnh báo tiền:** bộ này chỉ dùng các nút miễn phí. Trên AID tự cài theo bài 01, model tạo ảnh và
> video trả phí đã bị tắt nên không thể lỡ tay. Nếu bạn dùng AID do người khác quản trị, "điểm" có thể là
> tiền thật: **không bấm** "Tạo tự động", "Tạo hàng loạt ảnh bối cảnh", "Bắt đầu tạo ảnh", "Làm nét",
> "Đa góc máy", "Bắt đầu tạo video"; chỉ dùng các bước trích xuất chữ (Bắt đầu trích xuất, Tạo tạo hình)
> sau khi hỏi người quản trị.

![Sáu phân cảnh của phim mẫu](assets/screens/31-sau-phan-canh.png)

## Chi phí: 0 đồng

| Phần việc | Công cụ | Vì sao miễn phí |
|---|---|---|
| Tách nhân vật, bối cảnh, viết mô tả tạo hình | AID + Gemini API | Key trong project Google không gắn thanh toán (free tier) |
| Vẽ nhân vật, bối cảnh, ảnh phân cảnh | Ứng dụng Gemini (gemini.google.com) | Gói miễn phí của tài khoản Google |
| Biến ảnh thành video có chuyển động | `tools/make-clips.sh` (FFmpeg trên máy) | Chạy trên máy |
| Giọng nói | Tự thu giọng, hoặc giọng "Linh" có sẵn trên macOS | Chạy trên máy |
| Ghép phim | AID (FFmpeg trên máy) | Chạy trên máy |
| Phụ đề tiếng Việt | `tools/add-subtitles.sh` | Chạy trên máy |

"Điểm" hiện ở góc trái AID là điểm ảo do người quản trị nạp, không phải tiền thật.

## Danh sách bài

| Bài | Nội dung | Thời lượng video gợi ý |
|---|---|---|
| [00](00-gioi-thieu.md) | AID là gì, 7 bước làm phim, phim mẫu sẽ làm | 3 phút |
| [01](01-cai-dat-aid.md) | (Cho người quản trị) Chạy AID, bật Gemini miễn phí, tạo tài khoản | 8 phút |
| [02](02-du-an-va-kich-ban.md) | Tạo dự án, viết và dán kịch bản | 5 phút |
| [03](03-tu-lieu.md) | Để AI tách nhân vật, bối cảnh và viết mô tả tạo hình | 5 phút |
| [04](04-nhat-quan-nhan-vat.md) | **Bài chính:** vẽ nhân vật nhất quán bằng Gemini và nhập vào AID | 12 phút |
| [05](05-phan-canh.md) | Chia phân cảnh, vẽ ảnh phân cảnh giữ đúng nhân vật | 10 phút |
| [06](06-video-va-giong-noi.md) | Biến ảnh thành video, thêm giọng nói | 8 phút |
| [07](07-xuat-phim.md) | Ghép phim, thêm phụ đề tiếng Việt | 6 phút |

Kèm theo:

- [prompt-pack.md](prompt-pack.md): toàn bộ kịch bản và prompt đã dùng, sao chép là chạy.
- [loi-thuong-gap.md](loi-thuong-gap.md): các lỗi đã gặp khi chạy thật và cách xử lý.
- `tools/`: ba script FFmpeg (tạo clip, ghép giọng, in phụ đề).
- `assets/screens/`: ảnh chụp màn hình từng bước, dùng làm hình minh họa hoặc chèn vào video.
- `assets/film/`: ảnh nhân vật, bối cảnh, phân cảnh và phim thành phẩm của phim mẫu (clip trung gian
  không nằm trong git; tạo lại bằng `tools/make-clips.sh`).
- `video/`: bộ công cụ quay và dựng video hướng dẫn.

## Muốn tự quay lại bằng giọng của mình

Mỗi bài có các **cảnh quay** đánh số. Mỗi cảnh quay gồm:

- **Lời dẫn**: đọc nguyên văn hoặc nói lại theo ý mình.
- **Thao tác**: bấm gì, gõ gì trên màn hình.
- **Màn hình**: ảnh chụp lúc chạy thật, để đối chiếu.

Gợi ý quay: dùng QuickTime (File > New Screen Recording) hoặc OBS, khung 1920x1080, trình duyệt ở mức
phóng 100% và cửa sổ rộng ít nhất 1600 px (phóng to hơn sẽ che mất các nút ở mép phải). Quay từng cảnh
quay, ghép lại sau.

## Giới hạn hiện tại của AID v2.2.4 (người xem cần biết)

1. Ô chat "AI viết kịch bản" báo lỗi trong lần chạy thử với Gemini miễn phí. Ta tự viết kịch bản (hoặc
   nhờ ứng dụng Gemini viết) rồi dán vào (bài 02).
2. Tạo ảnh và video bằng AI ngay trong AID cần model trả phí. Ta tạo ảnh bằng ứng dụng Gemini miễn phí
   rồi nhập vào AID (bài 04, 05), và tạo video bằng script FFmpeg (bài 06).
3. Giọng tải lên ở bước "Đồng bộ hình tiếng" chưa được đưa vào phim khi xuất. Ta ghép giọng thẳng vào
   clip trước khi tải lên (bài 06).
4. Phụ đề của AID được chia theo tối đa 12 ký tự mỗi màn hình (thiết kế cho chữ Trung), làm đứt
   chữ tiếng Việt. Ta để trống phụ đề trong AID và in phụ đề bằng script (bài 07).
5. Một số nhãn vẫn là chữ Trung. Bảng tra ở [loi-thuong-gap.md](loi-thuong-gap.md#bang-tra-nhan-chu-trung).
