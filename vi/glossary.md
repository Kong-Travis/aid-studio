# Bảng thuật ngữ Việt hoá AID Studio

Mọi bản dịch trong `vi/dict/` phải dùng đúng các thuật ngữ dưới đây để giao diện nhất quán.
Sửa thuật ngữ ở đây trước, rồi mới sửa từ điển.

## Quy tắc chung

- Giọng văn: ngắn gọn, lịch sự, xưng "bạn" khi cần. Nút bấm dùng động từ: "Lưu", "Xoá", "Tạo".
- Chỉ dùng dấu câu ASCII: `...` thay cho dấu ba chấm Unicode, `-` thay cho gạch dài, `x` thay cho dấu nhân,
  `->` thay cho mũi tên, ` - ` hoặc ` | ` thay cho dấu chấm giữa. Không dùng dấu ngoặc kép cong.
- Dấu câu tiếng Trung đổi sang dấu ASCII: `，` -> `, ` / `。` -> `.` / `：` -> `: ` / `（）` -> `()` /
  `「」` và mọi kiểu ngoặc kép -> `"..."` / `、` -> `, ` / `！` -> `!` / `？` -> `?`.
- Giữ nguyên `{0}`, `{1}`... (placeholder), số, đơn vị kỹ thuật, tên riêng, tên sản phẩm và tên
  nhà cung cấp (Kling, Vidu, MiniMax, Seedance, OpenAI, OSS...), mã lỗi, tên trường kỹ thuật.
- Tên nhà cung cấp Trung Quốc có tên Latin thì dùng tên Latin: 腾讯云 -> Tencent Cloud,
  阿里云 -> Alibaba Cloud, 七牛云 -> Qiniu Cloud, 火山引擎 -> Volcengine, 即梦 -> Jimeng,
  可灵 -> Kling, 豆包 -> Doubao, 通义 -> Tongyi, 百度 -> Baidu, 微信 -> WeChat, 支付宝 -> Alipay.
- Không dịch thừa, không thêm ý. Câu quá dài so với bản gốc thì rút gọn tự nhiên.

## Thuật ngữ sản phẩm

| Tiếng Trung | Tiếng Việt |
|---|---|
| 漫剧 / AI漫剧 | phim hoạt hình truyện tranh / phim truyện tranh AI |
| 短剧 | phim ngắn |
| 漫画 | truyện tranh |
| 电影 | phim điện ảnh |
| 电视剧 / 剧集 | phim bộ |
| 分集 / 集 | tập |
| 剧本 | kịch bản |
| 剧本诊断 | chẩn đoán kịch bản |
| 分镜 | phân cảnh |
| 分镜脚本 | kịch bản phân cảnh |
| 分镜图 | ảnh phân cảnh |
| 分镜视频 | video phân cảnh |
| 分镜配音 | lồng tiếng phân cảnh |
| 场次 | cảnh (trong kịch bản) |
| 角色 | nhân vật |
| 场景 | bối cảnh |
| 道具 | đạo cụ |
| 形态 | tạo hình |
| 形态图 | ảnh tạo hình |
| 三视图 | ảnh ba góc nhìn |
| 主图 | ảnh chính |
| 素材 | tư liệu |
| 资产 | tài sản (asset) |
| 资产库 / 素材库 | thư viện tài sản / thư viện tư liệu |
| 参考图 / 参考图片 | ảnh tham chiếu |
| 参考视频 / 参考音频 | video tham chiếu / âm thanh tham chiếu |
| 提示词 | prompt |
| 反向提示词 | prompt phủ định |
| 生成 | tạo |
| 续生 | tạo tiếp |
| 重新生成 | tạo lại |
| 批量生成 | tạo hàng loạt |
| 文生图 / 图生图 | văn bản thành ảnh / ảnh thành ảnh |
| 图生视频 | ảnh thành video |
| 文生视频 | văn bản thành video |
| 多参 / 多参数 | đa tham chiếu |
| 首帧 / 尾帧 / 收尾帧 | khung hình đầu / khung hình cuối / khung kết |
| 九宫格 / 四宫格 | lưới 9 ô / lưới 4 ô |
| 多机位 | đa góc máy |
| 运镜 | chuyển động máy quay |
| 镜头 | cảnh quay (camera: góc máy) |
| 景别 | cỡ cảnh |
| 构图 | bố cục |
| 配音 | lồng tiếng |
| 音色 | giọng đọc |
| 音画同步 | đồng bộ hình tiếng |
| 背景音乐 | nhạc nền |
| 成片 | thành phẩm |
| 合成 | ghép video |
| 画布 / 无限画布 / 流程画布 | canvas / canvas vô hạn / canvas quy trình |
| 节点 | node |
| 导演台 | bàn đạo diễn |
| 智能体 | agent |
| 技能 | kỹ năng (skill) |
| 对话作图 | vẽ qua hội thoại |
| 自动创作 | sáng tác tự động |
| 项目 | dự án |
| 案例广场 | sảnh dự án mẫu |
| 作品 | tác phẩm |
| 清晰度 / 分辨率 | độ nét / độ phân giải |
| 比例 / 画幅 | tỉ lệ khung hình |
| 时长 | thời lượng |

## Thuật ngữ tài khoản, thanh toán, quản trị

| Tiếng Trung | Tiếng Việt |
|---|---|
| 积分 | điểm |
| 充值 | nạp tiền |
| 余额 | số dư |
| 会员 | hội viên |
| 套餐 | gói |
| 订单 | đơn hàng |
| 计费 | tính phí |
| 原价 / 官方原价 | giá gốc / giá gốc chính thức |
| 额度 | hạn mức |
| 并发 | đồng thời (số luồng) |
| 模型 | mô hình |
| 供应商 | nhà cung cấp |
| 能力 | năng lực (capability) |
| 业务分类 | danh mục nghiệp vụ |
| 密钥 | khoá bí mật (key) |
| 回调地址 | URL callback |
| 域名 | tên miền |
| 授权 | uỷ quyền |
| 审核 | kiểm duyệt |
| 租户 | tenant |
| 字典 | từ điển dữ liệu |
| 菜单 | menu |
| 角色 (quản trị, phân quyền) | vai trò |
| 权限 | quyền |
| 部门 | phòng ban |
| 岗位 | chức vụ |
| 定时任务 | tác vụ định kỳ |
| 日志 | nhật ký |
| 启用 / 停用 | bật / tắt (trạng thái: đang bật / đã tắt) |
| 新增 / 编辑 / 删除 | thêm mới / sửa / xoá |
| 留空 | để trống |
| 选填 / 必填 | không bắt buộc / bắt buộc |
| 请稍后重试 | vui lòng thử lại sau |
