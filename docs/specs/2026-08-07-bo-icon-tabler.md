# Spec — Thay bộ icon tự vẽ bằng Tabler Icons (07/08/2026)

**TRẠNG THÁI**: chờ người dùng duyệt.

## 1. Vấn đề

Bộ 21×2 icon hiện tại do agent tự vẽ bằng tọa độ số. Đánh giá 05/08 (`docs/research/danh-gia-tham-my-mascot-icon-2026-08-05.md`) đã chỉ ra: bản outline "tạm được kiểu lucide", bản filled là **dẫn xuất cơ học từ outline** (offset centerline rồi khoét evenodd) chứ không thiết kế theo ngữ pháp filled, kèm artifact hình học thật. Soi lại 06/08 còn thấy: `incorrect` bản filled mất hình chữ ✗, `spark` đổi ẩn dụ giữa hai bộ, `learner-profile` filled cắt cằm, `learning-evidence` filled huy hiệu tràn mép giấy.

Nguyên nhân gốc không phải tay nghề từng icon mà là **phương pháp**: vẽ 42 hình nhất quán bằng mô tả text là việc agent làm kém, và không có vòng chấm thẩm mỹ nào bắt được.

## 2. Quyết định

Dùng **Tabler Icons** (MIT) làm nguồn, sinh file bằng code, restyle theo brand. Không tự vẽ icon nào.

### 2.1 Vì sao Tabler

Ba ứng viên đã tải về và đo thật, không dựa vào trí nhớ:

|                            | Tabler                   | Phosphor    | Material Symbols |
| -------------------------- | ------------------------ | ----------- | ---------------- |
| Giấy phép                  | MIT                      | MIT         | Apache-2.0       |
| Icon nền                   | 5335                     | 1533        | 4010             |
| Có đủ cặp outline+filled   | 1089 (20.4%)             | 1533 (100%) | 4009 (100%)      |
| Outline vẽ bằng            | **nét** (`stroke-width`) | hình đặc    | hình đặc         |
| Phủ 127 khái niệm của mình | **đủ**                   | đủ          | đủ               |

Tỷ lệ 20.4% của Tabler trông tệ nhưng **không phải tiêu chí đúng** — câu hỏi đúng là "127 khái niệm CỦA MÌNH có nằm trong 1089 cái đó không", và câu trả lời là có (93 cái cần filled đều có, xem §4).

Lý do chọn, theo thứ tự quan trọng:

1. **Outline vẽ bằng nét nên restyle được.** File Tabler chứa đường tim (`<path fill="none" stroke="currentColor" stroke-width="2" d="…">`); bề dày do `stroke-width` quyết định lúc render. Đổi một con số là đổi độ dày, liên tục và tùy ý. Hai bộ kia nướng bề dày vào hình đặc — muốn khác thì phải dùng file khác đã vẽ sẵn, không có núm nào để chỉnh, và không thể ra đúng 1.75 của brand.
2. **Giữ nguyên hợp đồng `brand:check` hiện có** (viewBox 24, `stroke="currentColor"`, cấm hex trần) — không phải viết lại checker.
3. **Dễ vá về sau.** Khi có khái niệm domain không bộ nào có (rất dễ xảy ra khi đi sâu vào Toán THCS), tự vẽ MỘT đường tim rồi đặt cùng `stroke-width` là khớp cả bộ ngay. Khớp với bộ hình đặc thì phải dựng lại đúng hình học viền — chính là việc đã làm hỏng lần này.
4. Bản filled của Tabler được **vẽ lại thật sự**, không phải outline tô đặc (xem `badge`, `learner-profile`, `learning-path`).

### 2.2 Bỏ quy tắc "mọi icon phải có hai bộ"

Spec cũ bắt mọi icon có cả outline lẫn filled. Khi đối chiếu 132 khái niệm ứng viên với Tabler, 25 cái không có bản filled — và **toàn bộ 25 cái đó là hành động hoặc trạng thái thoáng qua** (`back`, `sort`, `share`, `print`, `refresh`, `attach`, `loading`, `login`, `logout`, `trend-up`…). Không cái nào từng cần filled, vì filled chỉ tồn tại để diễn đạt trạng thái _đang chọn / đang bật_.

Quy tắc mới: **filled chỉ bắt buộc với icon xuất hiện ở ngữ cảnh có trạng thái chọn/bật** (mục điều hướng, chip trạng thái, toggle). Manifest khai báo từng khái niệm cần biến thể nào; `brand:check` kiểm theo khai báo đó chứ không kiểm mù cả bộ.

### 2.3 Ràng buộc sản phẩm áp lên việc chọn icon

Theo mục "Ràng buộc sản phẩm bất biến" trong CLAUDE.md, **không đưa vào bộ**: icon camera, micro, khuôn mặt, ánh mắt, vân tay (cấm vĩnh viễn mọi dữ liệu sinh trắc) và icon bảng xếp hạng / bục huy chương / cúp thi đua (cấm leaderboard xuyên học sinh). Icon nằm sẵn trong repo là một lời mời dùng nó — không để sẵn thứ mình đã cấm.

## 3. Nguồn của danh mục khái niệm

Danh mục 127 khái niệm không tự nghĩ ra, rút từ ba nguồn:

1. **`CONTEXT.md`** — 25 khái niệm domain đã chuẩn hóa (learner_profile, learning_sprint, skill_graph, assessment_item, attempt, diagnostic, exam_blueprint, mock_exam, readiness, calibration, verification, mastery, mastery_map, parent_report, daily_digest, learning_evidence, misconception…).
2. **`docs/background/bao-cao-du-an-gia-su-ai-parent-first.md` §6** — 8 engine + accountability layer, và §8 (consent, lưu trữ tối thiểu, quyền xóa dữ liệu) → nhóm "Người dùng & quyền".
3. **Bề mặt LMS thực tế** — danh mục + tìm kiếm, dashboard tiến độ, chấm/phân tích, báo cáo, quản trị người dùng ([riseapps](https://riseapps.co/lms-ui-ux-design/), [adminlte](https://adminlte.io/blog/lms-dashboard-templates/)) → nhóm Điều hướng, Hành động, Trạng thái.

Nhóm "Thanh toán & hỗ trợ" giữ lại vì phụ huynh là người mua — bỏ được nếu muốn hoãn.

## 4. Phạm vi

- **127 khái niệm** chia 9 nhóm.
- **93 khái niệm có cặp** outline + filled; **34 khái niệm chỉ outline** → **220 file SVG**.
- **4 alias** (tên phụ trỏ vào cùng file, không nhân bản): `success`→`correct`, `privacy`→`locked`, `timer`→`clock`, `expand`→`chevron-down` → tổng **131 tên gọi**.
- Đã kiểm bằng script: **0 khái niệm trùng hình với khái niệm khác**, **0 tên Tabler không tồn tại**.

Xóa toàn bộ 42 file icon tự vẽ hiện có trong `frontend/public/brand/icons/` và bản gốc trong `frontend/scripts/brand/proto-v2/icons/`.

## 5. Kiến trúc

### 5.1 Nguồn và cách lấy

Thêm devDependency **`@iconify-json/tabler`** vào `frontend/package.json`. Gói chứa toàn bộ 5335 icon dạng JSON, offline — build không gọi mạng. Bản đang dùng: 1.2.38.

### 5.2 Generator

File mới `frontend/scripts/brand/generate-icons.mjs`:

1. Đọc manifest (§5.3) và `icons.json` của gói.
2. Với mỗi khái niệm: lấy `body` của icon nguồn, thay `stroke-width="2"` → `stroke-width="1.75"`, bọc trong `<svg xmlns viewBox="0 0 24 24" role="img" aria-label="<khái niệm>">`.
3. Bản filled: lấy icon `<tên>-filled`, giữ `fill="currentColor"`.
4. Ghi ra `frontend/public/brand/icons/{outline,filled}/<khái niệm>.svg`.
5. **Fail to** nếu: tên nguồn không tồn tại, hoặc manifest khai cần filled mà `<tên>-filled` không có. Không im lặng bỏ qua — đây là hàng rào chống việc lại đi tự vẽ.

Thêm script `brand:icons` vào `package.json`.

### 5.3 Manifest

Manifest là nguồn sự thật duy nhất, đặt trong `frontend/scripts/brand/icon-manifest.mjs`, xuất một object:

```js
export const ICONS = {
  "learning-sprint": { tabler: "bolt", filled: true, group: "Học tập" },
  print: { tabler: "printer", filled: false, group: "Hành động" },
  // …
};
export const ALIASES = {
  success: "correct",
  privacy: "locked",
  timer: "clock",
  expand: "chevron-down",
};
```

`check-icons.mjs` đọc chính manifest này thay cho `ICON_MANIFEST` cứng hiện tại.

### 5.4 Restyle theo brand

- `stroke-width` **1.75** cho outline (Tabler mặc định 2) — mảnh hơn, hợp tông chữ.
- Màu: **thuần `currentColor`**, không nướng accent hổ phách vào file. Accent do component quyết định lúc dùng. Lý do: accent trong file làm icon không tái dùng được ở ngữ cảnh khác, và chính là nguồn của lỗi "filled = outline đảo màu" trong bộ cũ.
- Giữ `stroke-linecap="round"`, `stroke-linejoin="round"` của Tabler.
- Không đụng vào hình học đường tim — không "sửa nhẹ cho đẹp", vì đó là cửa quay lại vấn đề cũ.

### 5.5 brand:check sau thay đổi

| Kiểm                                                            | Outline | Filled |
| --------------------------------------------------------------- | ------- | ------ |
| `viewBox="0 0 24 24"`                                           | có      | có     |
| `stroke="currentColor"` + `stroke-width="1.75"` + `fill="none"` | có      | —      |
| `fill="currentColor"`                                           | —       | có     |
| Cấm hex trần                                                    | có      | có     |
| Tên thuộc manifest                                              | có      | có     |
| Có đủ biến thể như manifest khai                                | có      | có     |

Rule mascot giữ nguyên không đổi.

### 5.6 Giấy phép

Tabler là MIT — được dùng thương mại, phải giữ notice. Thêm `frontend/public/brand/icons/LICENSE.txt` (nguyên văn MIT của Tabler + link repo + version 1.2.38) và một dòng trong `frontend/public/brand/README.md`.

## 6. Tiêu chí hoàn thành

1. `pnpm brand:icons` sinh đúng 220 file, chạy lại hai lần cho kết quả byte-identical.
2. `pnpm brand:check` PASS với 220 icon + 6 mascot.
3. Sửa manifest khai `filled: true` cho một khái niệm không có bản filled → generator **fail** (có test).
4. `pnpm test` xanh, `pnpm lint` 0 error, `pnpm format:check` xanh.
5. `frontend/public/brand/icons/` không còn file nào của bộ tự vẽ cũ.
6. Trang preview `scripts/brand/preview-icons.html` hiển thị đủ 9 nhóm.

## 7. Ngoài phạm vi

- Không đụng mascot, logo, wordmark.
- Không xuất PNG cho icon (icon chỉ dùng SVG inline).
- Không xây component `<Icon>` trong lần này — chỉ sinh file + manifest; component để lần sau khi dựng UI thật.
- Không thêm icon ngoài 127 khái niệm; thêm sau là một dòng manifest.

## 8. Rủi ro và đánh đổi

| Rủi ro                                            | Xử lý                                                                              |
| ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Icon thêm về sau không có bản filled trong Tabler | Generator fail to lúc build, buộc chọn tên khác có cặp — không im lặng để lọt      |
| Bộ Tabler đổi hình giữa các version               | Pin version trong `package.json`; file sinh ra được commit nên diff nhìn thấy được |
| 220 file trong repo                               | Mỗi file 200-400 byte; tổng dưới 100KB                                             |
| Ẩn dụ Tabler không khớp domain Việt Nam           | Bảng §9 để người dùng duyệt từng dòng trước khi code                               |

## 9. Bảng ánh xạ đầy đủ

| Nhóm                | Khái niệm           | Tên Tabler               | Biến thể         |
| ------------------- | ------------------- | ------------------------ | ---------------- |
| Học tập             | `learning-sprint`   | `bolt`                   | outline + filled |
| Học tập             | `learning-path`     | `directions`             | outline + filled |
| Học tập             | `learning-session`  | `presentation`           | outline + filled |
| Học tập             | `lesson`            | `book`                   | outline + filled |
| Học tập             | `skill-graph`       | `binary-tree`            | outline + filled |
| Học tập             | `skill`             | `puzzle`                 | outline + filled |
| Học tập             | `milestone`         | `map-pin`                | outline + filled |
| Học tập             | `goal`              | `flag-3`                 | outline + filled |
| Học tập             | `goal-intake`       | `clipboard-list`         | outline + filled |
| Học tập             | `learner-profile`   | `id`                     | outline + filled |
| Học tập             | `hint`              | `bulb`                   | outline + filled |
| Học tập             | `solution`          | `list-numbers`           | chỉ outline      |
| Học tập             | `practice`          | `barbell`                | outline + filled |
| Học tập             | `review`            | `history`                | chỉ outline      |
| Học tập             | `curriculum`        | `books`                  | chỉ outline      |
| Học tập             | `math`              | `math`                   | chỉ outline      |
| Học tập             | `formula`           | `math-function`          | chỉ outline      |
| Học tập             | `function-graph`    | `chart-line`             | chỉ outline      |
| Học tập             | `geometry`          | `triangle`               | outline + filled |
| Học tập             | `calculator`        | `calculator`             | outline + filled |
| Học tập             | `worked-example`    | `clipboard-check`        | outline + filled |
| Học tập             | `homework`          | `notebook`               | chỉ outline      |
| Đánh giá            | `assessment-item`   | `list-check`             | outline + filled |
| Đánh giá            | `attempt`           | `click`                  | outline + filled |
| Đánh giá            | `diagnostic`        | `zoom-scan`              | outline + filled |
| Đánh giá            | `exam-blueprint`    | `table`                  | outline + filled |
| Đánh giá            | `mock-exam`         | `clipboard-text`         | outline + filled |
| Đánh giá            | `readiness`         | `gauge`                  | outline + filled |
| Đánh giá            | `calibration`       | `adjustments`            | outline + filled |
| Đánh giá            | `verification`      | `shield-check`           | outline + filled |
| Đánh giá            | `misconception`     | `alert-hexagon`          | outline + filled |
| Đánh giá            | `correct`           | `circle-check`           | outline + filled |
| Đánh giá            | `incorrect`         | `circle-x`               | outline + filled |
| Đánh giá            | `partially-correct` | `circle-half`            | chỉ outline      |
| Đánh giá            | `difficulty`        | `stairs`                 | chỉ outline      |
| Đánh giá            | `retry`             | `rotate-clockwise`       | chỉ outline      |
| Đánh giá            | `skip`              | `player-skip-forward`    | outline + filled |
| Đánh giá            | `flag-question`     | `pin`                    | outline + filled |
| Theo dõi & báo cáo  | `mastery`           | `star`                   | outline + filled |
| Theo dõi & báo cáo  | `mastery-map`       | `sitemap`                | outline + filled |
| Theo dõi & báo cáo  | `parent-report`     | `file-analytics`         | outline + filled |
| Theo dõi & báo cáo  | `daily-digest`      | `mail`                   | outline + filled |
| Theo dõi & báo cáo  | `learning-evidence` | `rosette-discount-check` | outline + filled |
| Theo dõi & báo cáo  | `progress-chart`    | `graph`                  | outline + filled |
| Theo dõi & báo cáo  | `before-after`      | `arrows-diff`            | chỉ outline      |
| Theo dõi & báo cáo  | `trend-up`          | `trending-up`            | chỉ outline      |
| Theo dõi & báo cáo  | `trend-down`        | `trending-down`          | chỉ outline      |
| Theo dõi & báo cáo  | `badge`             | `award`                  | outline + filled |
| Theo dõi & báo cáo  | `spark`             | `sparkles`               | outline + filled |
| Theo dõi & báo cáo  | `summary`           | `article`                | outline + filled |
| Theo dõi & báo cáo  | `streak`            | `flame`                  | outline + filled |
| Người dùng & quyền  | `parent`            | `users`                  | chỉ outline      |
| Người dùng & quyền  | `student`           | `school`                 | outline + filled |
| Người dùng & quyền  | `reviewer`          | `user-check`             | chỉ outline      |
| Người dùng & quyền  | `account`           | `user`                   | outline + filled |
| Người dùng & quyền  | `login`             | `login`                  | chỉ outline      |
| Người dùng & quyền  | `logout`            | `logout`                 | chỉ outline      |
| Người dùng & quyền  | `consent`           | `writing-sign`           | outline + filled |
| Người dùng & quyền  | `permission`        | `key`                    | outline + filled |
| Người dùng & quyền  | `locked`            | `lock`                   | outline + filled |
| Người dùng & quyền  | `unlocked`          | `lock-open`              | chỉ outline      |
| Người dùng & quyền  | `data-export`       | `file-download`          | outline + filled |
| Người dùng & quyền  | `data-delete`       | `trash-x`                | outline + filled |
| Người dùng & quyền  | `switch-child`      | `switch-horizontal`      | chỉ outline      |
| Điều hướng          | `home`              | `home`                   | outline + filled |
| Điều hướng          | `dashboard`         | `layout-dashboard`       | outline + filled |
| Điều hướng          | `menu`              | `menu-2`                 | outline + filled |
| Điều hướng          | `close`             | `x`                      | outline + filled |
| Điều hướng          | `back`              | `arrow-left`             | chỉ outline      |
| Điều hướng          | `forward`           | `arrow-right`            | chỉ outline      |
| Điều hướng          | `chevron-down`      | `chevron-down`           | outline + filled |
| Điều hướng          | `chevron-up`        | `chevron-up`             | chỉ outline      |
| Điều hướng          | `external-link`     | `external-link`          | outline + filled |
| Điều hướng          | `more`              | `dots`                   | outline + filled |
| Điều hướng          | `sidebar`           | `layout-sidebar`         | outline + filled |
| Điều hướng          | `view-grid`         | `layout-grid`            | outline + filled |
| Điều hướng          | `view-list`         | `list`                   | outline + filled |
| Hành động           | `search`            | `search`                 | outline + filled |
| Hành động           | `filter`            | `filter`                 | outline + filled |
| Hành động           | `sort`              | `arrows-sort`            | chỉ outline      |
| Hành động           | `add`               | `plus`                   | outline + filled |
| Hành động           | `edit`              | `pencil`                 | outline + filled |
| Hành động           | `delete`            | `trash`                  | outline + filled |
| Hành động           | `save`              | `device-floppy`          | outline + filled |
| Hành động           | `copy`              | `copy`                   | outline + filled |
| Hành động           | `share`             | `share`                  | chỉ outline      |
| Hành động           | `download`          | `download`               | outline + filled |
| Hành động           | `upload`            | `file-upload`            | outline + filled |
| Hành động           | `print`             | `printer`                | chỉ outline      |
| Hành động           | `refresh`           | `refresh`                | chỉ outline      |
| Hành động           | `send`              | `send`                   | outline + filled |
| Hành động           | `attach`            | `paperclip`              | chỉ outline      |
| Hành động           | `bookmark`          | `bookmark`               | outline + filled |
| Hành động           | `play`              | `player-play`            | outline + filled |
| Hành động           | `pause`             | `player-pause`           | outline + filled |
| Hành động           | `next`              | `player-track-next`      | outline + filled |
| Hành động           | `previous`          | `player-track-prev`      | outline + filled |
| Hành động           | `collapse`          | `arrows-minimize`        | chỉ outline      |
| Trạng thái          | `info`              | `info-circle`            | outline + filled |
| Trạng thái          | `warning`           | `alert-triangle`         | outline + filled |
| Trạng thái          | `error`             | `exclamation-circle`     | outline + filled |
| Trạng thái          | `loading`           | `loader`                 | chỉ outline      |
| Trạng thái          | `empty`             | `mood-empty`             | outline + filled |
| Trạng thái          | `visible`           | `eye`                    | outline + filled |
| Trạng thái          | `hidden`            | `eye-off`                | chỉ outline      |
| Trạng thái          | `notification`      | `bell`                   | outline + filled |
| Trạng thái          | `notification-off`  | `bell-x`                 | outline + filled |
| Trạng thái          | `offline`           | `cloud-off`              | chỉ outline      |
| Trạng thái          | `sync`              | `cloud-computing`        | outline + filled |
| Nội dung            | `file`              | `file`                   | outline + filled |
| Nội dung            | `folder`            | `folder`                 | outline + filled |
| Nội dung            | `pdf`               | `file-type-pdf`          | chỉ outline      |
| Nội dung            | `image`             | `photo`                  | outline + filled |
| Nội dung            | `text`              | `typography`             | chỉ outline      |
| Nội dung            | `handwriting`       | `writing`                | outline + filled |
| Nội dung            | `keyboard`          | `keyboard`               | outline + filled |
| Nội dung            | `calendar`          | `calendar-month`         | outline + filled |
| Nội dung            | `clock`             | `clock`                  | outline + filled |
| Nội dung            | `reminder`          | `bell-plus`              | outline + filled |
| Thanh toán & hỗ trợ | `payment`           | `credit-card`            | outline + filled |
| Thanh toán & hỗ trợ | `invoice`           | `file-invoice`           | outline + filled |
| Thanh toán & hỗ trợ | `subscription`      | `repeat`                 | chỉ outline      |
| Thanh toán & hỗ trợ | `pricing`           | `tag`                    | outline + filled |
| Thanh toán & hỗ trợ | `voucher`           | `gift`                   | outline + filled |
| Thanh toán & hỗ trợ | `support`           | `message-circle`         | outline + filled |
| Thanh toán & hỗ trợ | `faq`               | `help-hexagon`           | outline + filled |
| Thanh toán & hỗ trợ | `contact`           | `phone`                  | outline + filled |

**Alias** (tên phụ dùng chung file với tên chính):

- `success` → `correct`
- `privacy` → `locked`
- `timer` → `clock`
- `expand` → `chevron-down`
