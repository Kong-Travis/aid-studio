# Bộ hướng dẫn: Làm phim AI giữ nhân vật nhất quán với AID Studio

Bộ hướng dẫn bằng tiếng Việt cho người chưa từng làm phim AI, gồm **một video hướng dẫn liền mạch** (có
giọng đọc và phụ đề) và các bài viết đi kèm. Học xong, người xem nắm được quy trình đầy đủ của một bộ phim
AI: viết kịch bản, tạo nhân vật và bối cảnh nhất quán, chia phân cảnh, sinh video, lồng tiếng, xuất phim.

**Video làm bằng công cụ miễn phí, nên phim mẫu chỉ ở mức minh hoạ.** Làm phim xịn, đủ chất lượng để
thương mại hoá thì đi đúng các bước đó, chỉ khác là chọn model trả phí (cần điểm hoặc API key). Mỗi bài
đều có mục "Bản chuyên nghiệp" nói rõ bấm nút nào, chọn model nào.

## Video hướng dẫn

**Xem trên YouTube: https://youtu.be/-Y5GHugKAC0** (kênh Xưởng Phim AI Miễn Phí).

Video được quay tự động bằng `video/` (xem [video/README.md](video/README.md)): trình duyệt tự bấm từng
bước trên AID thật, chậm để người xem theo kịp; phụ đề và giọng đọc (giọng nam Quang Huy, Piper) nói đúng
thao tác đang làm. File video không nằm trong git (quá giới hạn 100 MB của GitHub). Mốc chương nằm trong
phần mô tả của video.

![Sáu phân cảnh của phim mẫu](assets/screens/31-sau-phan-canh.png)

## Cùng một quy trình, hai mức chất lượng

| Bước | Video này (miễn phí) | Làm phim xịn (có điểm hoặc API key) |
|---|---|---|
| Đọc kịch bản, tách nhân vật, viết tạo hình | Gemini 3.1 Flash-Lite, gói miễn phí | GPT-5.5, Qwen 3.7 Max, DeepSeek V4 Pro (chọn trong "Cấu hình tạo") |
| Vẽ nhân vật, bối cảnh, ảnh phân cảnh | Ứng dụng Gemini, rồi "Nhập ảnh" | "Tạo tự động" / "Bắt đầu tạo ảnh" với Nano Banana Pro, Seedream 5.0 Pro, GPT Image 2 |
| Sinh video | Chuyển động máy quay từ ảnh (`tools/make-clips.sh`) | "Bắt đầu tạo video" với Seedance, Kling 3.0, Vidu Q3 Pro, Wan 3.0, MiniMax H3 |
| Lồng tiếng | Giọng đọc có sẵn trên máy (`say`), ghép bằng `tools/add-voice.sh` | Lồng tiếng AI trong AID: Doubao TTS, MiniMax Speech (chưa chạy thử) |
| Ghép phim, phụ đề | AID và `tools/add-subtitles.sh` | Như bên trái |

Tên model lấy từ danh sách model của AID Studio v2.2.4. Model nào dùng được trên trang AID của bạn tùy
nhà cung cấp mà trang đó bật.

## Chọn model video và chi phí (khi có API key)

- **Có sẵn trong AID:** Seedance 2.0 / 2.5 (ByteDance), Kling 3.0 và Kling 3.0 Omni (Kuaishou), Vidu Q3
  Pro, Wan 3.0 (Alibaba), MiniMax H3. Gợi ý thử: Seedance cho cảnh nhiều góc máy và ảnh tham chiếu;
  Kling cho cảnh nhân vật chuyển động, hội thoại. Luôn soi khuôn mặt và trang phục giữa các cảnh.
- **Mạnh nhưng chưa có trong AID:** Google Veo 3.1 (tạo kèm âm thanh), Runway Gen-4.5. Muốn dùng phải thêm
  adapter theo [tài liệu tích hợp nhà cung cấp của AID](https://github.com/gzxx-2025/aid-studio/blob/main/doc/public-provider-integration.md)
  (AID dùng lại client có sẵn khi giao thức khớp, chỉ viết client mới khi không khớp).

Giá tham khảo mỗi giây video trên [Runway Dev](https://dev.runwayml.com/pricing), xem ngày 2026-10-27
(giá qua nền tảng tổng hợp; mua trực tiếp từ nhà phát triển có thể khác, và giá thay đổi theo thời gian):

| Model | Không âm thanh | Có âm thanh |
|---|---|---|
| Kling 3.0 Standard | $0,09 | $0,13 |
| Kling 3.0 Pro | $0,12 | $0,17 |
| Veo 3.1 Fast | $0,10 | $0,15 |
| Veo 3.1 | $0,20 | $0,40 |
| Seedance 2.0 | $0,30 (720p), $0,40 (1080p) | trang không tách giá |
| Wan 3.0 | $0,10 (720p), $0,20 (1080p) | trang không tách giá |

Ví dụ: phim tổng 200 phút ở mức $0,10 mỗi giây là khoảng $1.200 cho **một lượt** tạo. Thực tế còn tạo lại
cảnh lỗi và thử nhiều phiên bản, nên ngân sách cao hơn đáng kể.

Nên bắt đầu thế nào:

1. Muốn chạy nhanh: mua API key trực tiếp từ nhà cung cấp mà AID đã hỗ trợ sẵn.
2. Muốn thử nhiều model bằng một tài khoản: nền tảng tổng hợp như Runway API, nhưng AID phải hỗ trợ giao
   thức đó; chưa có thì cần thêm adapter.
3. Thử 5 đến 10 cảnh trên hai model (ví dụ Kling 3.0 Standard và một model khác), chấm điểm rồi mới sản
   xuất hàng loạt. Đừng khoá cả dự án vào một model trước khi có kết quả thử.
4. Làm phim để bán: đọc điều khoản sử dụng của từng nhà cung cấp. Quyền dùng thương mại của ảnh từ ứng
   dụng Gemini miễn phí (đường miễn phí của video) chưa được kiểm chứng.

## Danh sách bài

| Bài | Nội dung |
|---|---|
| [00](00-gioi-thieu.md) | AID là gì, 7 bước làm phim, hai mức chất lượng |
| [02](02-du-an-va-kich-ban.md) | 1. Tạo dự án, viết và dán kịch bản |
| [03](03-tu-lieu.md) | 2. Chọn model, để AI tách nhân vật, bối cảnh và viết tạo hình |
| [04](04-nhat-quan-nhan-vat.md) | 3. **Bài chính:** giữ nhân vật nhất quán |
| [05](05-phan-canh.md) | 4. Chia phân cảnh, ảnh phân cảnh giữ đúng nhân vật |
| [06](06-video-va-giong-noi.md) | 5. Sinh video, lồng tiếng, chọn model và chi phí |
| [07](07-xuat-phim.md) | 6. Ghép phim, thêm phụ đề tiếng Việt |

Tự dựng trang AID trên máy của mình (không có trong video): [01-cai-dat-aid.md](01-cai-dat-aid.md) và
[`../local/README.md`](../local/README.md).

Kèm theo:

- [prompt-pack.md](prompt-pack.md): toàn bộ kịch bản và prompt đã dùng, sao chép là chạy.
- [loi-thuong-gap.md](loi-thuong-gap.md): các lỗi đã gặp khi chạy thật và cách xử lý.
- `tools/`: ba script FFmpeg miễn phí (tạo clip, ghép giọng, in phụ đề). Tải thư mục này về máy (ví dụ
  `~/Desktop/aid-tools`) là chạy được, không cần cả AID Studio.
- `assets/screens/`: ảnh chụp màn hình từng bước.
- `assets/film/`: ảnh nhân vật, bối cảnh, phân cảnh và phim thành phẩm của phim mẫu.
- `video/`: bộ công cụ quay và dựng video hướng dẫn.

## Giới hạn đã gặp khi chạy thật (AID v2.2.4)

1. Ô chat "AI viết kịch bản" báo lỗi trong lần chạy thử với Gemini miễn phí. Ta dán kịch bản viết sẵn
   (bài 02).
2. "Tự động tạo phân cảnh" báo lỗi khi thử với Gemini miễn phí. Ta thêm phân cảnh bằng tay (bài 05).
3. Giọng **tải lên** ở bước "Đồng bộ hình tiếng" chưa được đưa vào phim khi xuất. Ta ghép giọng thẳng vào
   clip trước khi tải lên (bài 06). Lồng tiếng AI trả phí trong AID chưa được thử.
4. Phụ đề của AID được chia theo tối đa 12 ký tự mỗi màn hình (thiết kế cho chữ Trung), làm đứt chữ tiếng
   Việt. Ta để trống phụ đề trong AID và in phụ đề bằng script (bài 07).
5. Một số nhãn vẫn là chữ Trung. Bảng tra ở [loi-thuong-gap.md](loi-thuong-gap.md#bang-tra-nhan-chu-trung).
