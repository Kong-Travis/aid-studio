# Việt hoá AID Studio (fork Kong-Travis/aid-studio)

Thư mục `vi/` chứa toàn bộ phần Việt hoá. Quy tắc cốt lõi: **fork chỉ thêm file, không sửa file của
upstream.** Bản dịch được áp vào lúc build trên một bản copy (hoặc trên checkout của CI), nên khi
merge bản mới của upstream sẽ không có conflict. Trường hợp xấu nhất là vài chuỗi mới còn tiếng Trung.

## Nhánh

| Nhánh | Vai trò |
|---|---|
| `main` | Gương của `upstream/main`, chỉ fast-forward, không commit vào. |
| `vi` | Nhánh làm việc mặc định: upstream + thư mục `vi/` + 2 workflow `vi-*.yml`. |
| `sync/<tag>` | Nhánh tạm để merge một bản release của upstream, mở PR vào `vi`. |

Remote: `origin` = fork của bạn, `upstream` = https://github.com/gzxx-2025/aid-studio (đã chặn push).

## Cấu trúc

```
vi/
  glossary.md            thuật ngữ bắt buộc cho bản dịch
  dict/ui.vi.json        từ điển: câu tiếng Trung gốc -> tiếng Việt (web, admin, menu DB)
  dict/deny.json         (tuỳ chọn) danh sách chuỗi buộc giữ nguyên tiếng Trung
  catalog/*.json         danh mục chuỗi sinh tự động từ mã nguồn upstream (commit để thấy diff)
  catalog/*.skipped.json chuỗi bị giữ nguyên vì dùng trong logic, kèm lý do
  patches.mjs            sửa locale cố định: antd vi_VN, dayjs vi, lang="vi", og:locale
  sql/vi-labels.sql      UPDATE menu admin và nhãn từ điển dữ liệu sang tiếng Việt
  scripts/
    extract.mjs          quét mã nguồn, cập nhật catalog, báo chuỗi chưa dịch
    apply.mjs            tạo bản copy đã dịch (vi/build/<app>) hoặc dịch tại chỗ (--in-place)
    batch.mjs            chia chuỗi chưa dịch thành lô để dịch, gộp kết quả về từ điển
    sql.mjs              lấy nhãn menu/từ điển từ sql/*.sql và sinh vi/sql/vi-labels.sql
    build.sh             build admin + web bản tiếng Việt
    sync.sh              merge một bản release của upstream qua nhánh sync/<tag>
```

## Cách hoạt động

1. `extract.mjs` đọc AST TypeScript của `frontend/web` và `frontend/admin`, tìm mọi chuỗi chứa chữ Hán.
2. Mỗi chuỗi được phân loại. Chuỗi hiển thị (chữ JSX, nhãn, thông báo) thì dịch. Chuỗi dùng cho
   logic thì giữ nguyên tiếng Trung: so sánh `===`, `case`, key của object, `includes`/`startsWith`,
   kiểu literal, các thuộc tính `value`/`key`/`type`..., nội dung prompt AI, các token mà regex parse lại
   (`@图片1[...]`, `音频-xxx`, `分镜{0}`) và chuỗi chứa từ khoá mà regex cùng file dò. Một chuỗi bị
   giữ nguyên ở một chỗ thì giữ nguyên ở mọi chỗ trong app.
3. `apply.mjs` thay chuỗi theo từ điển, giữ đúng `{0}` -> `${...}` trong template, rồi áp `patches.mjs`.

## Build bản tiếng Việt

```sh
npm ci --prefix frontend/web && npm ci --prefix frontend/admin   # lần đầu
vi/scripts/build.sh
# -> vi/build/admin/dist          (admin, như npm run build)
# -> vi/build/web/dist/public     (web, như npm run generate)
```

Database: sau khi chạy `sql/aid-init.sql` hoặc file nâng cấp của upstream, chạy thêm
`vi/sql/vi-labels.sql` (luôn chạy sau SQL của upstream). Chạy lại nhiều lần vẫn an toàn. Nhãn từ
điển dữ liệu được backend cache trong Redis, nên sau đó vào trang quản lý từ điển bấm làm mới cache,
hoặc khởi động lại backend. SQL nâng cấp của upstream tìm menu theo `perms` chứ không theo tên, nên
việc đổi tên menu sang tiếng Việt không ảnh hưởng tới các lần nâng cấp sau.

Lưu ý: bộ cài/updater chính thức (`deploy/`) tải mã nguồn từ repo gốc `gzxx-2025`, nên sẽ ra bản
tiếng Trung. Với bản tiếng Việt, hãy deploy thư mục build ở trên vào chỗ của frontend (nginx).

## Khi upstream ra bản mới

Workflow `Upstream release watch` chạy hằng ngày và báo lỗi (GitHub gửi email) khi có tag mới chưa
merge. Khi đó:

```sh
vi/scripts/sync.sh            # hoặc: vi/scripts/sync.sh v2.2.5
```

Script sẽ: fetch upstream, đẩy `upstream/main` lên `origin/main`, tạo nhánh `sync/<tag>` từ `vi`, merge
tag, cập nhật catalog và `vi-labels.sql`, rồi in danh sách chuỗi mới cần dịch. Dịch xong:

```sh
node vi/scripts/batch.mjs split vi/reports/tr    # dịch các file vi/reports/tr/batch-*.in.tsv
node vi/scripts/batch.mjs merge vi/reports/tr    # kiểm tra placeholder, dấu câu, gộp vào từ điển
node vi/scripts/sql.mjs build
git add vi && git commit -m "feat(vi): translate strings from <tag>"
git push -u origin sync/<tag>
gh pr create --repo Kong-Travis/aid-studio --base vi --head sync/<tag>
```

Workflow `Vietnamese build` chạy trên PR: dịch tại chỗ, typecheck, build cả hai app, và đính kèm
`vi-missing.json` (chuỗi chưa dịch). Merge PR khi CI xanh.

Không bấm nút "Sync fork" trên nhánh `vi`. Bấm trên `main` thì không sao.

## Giới hạn đã biết

- Thông báo lỗi trả về từ backend Java (khoảng 5.000 câu) vẫn là tiếng Trung. Đây là giai đoạn 2.
- Nội dung prompt gửi cho mô hình AI vẫn là tiếng Trung (cố ý, vì đổi prompt là đổi chất lượng đầu ra).
- Khoảng 300 chuỗi web được giữ nguyên tiếng Trung vì dùng trong logic. Xem `catalog/web.skipped.json`.
  Một chuỗi đã kiểm tra là an toàn có thể được mở dịch bằng cách nới luật trong `scripts/lib/scan.mjs`.
- Nhãn hiển thị nhưng đồng thời được gửi lên API (luồng dữ liệu, không thấy được qua AST) có thể bị
  dịch nhầm. Nếu thấy chức năng nào chạy sai sau khi Việt hoá, thêm chuỗi đó vào `dict/deny.json`.
- Unit test của upstream có test so sánh chuỗi tiếng Trung, nên chỉ chạy trên mã nguồn gốc.
