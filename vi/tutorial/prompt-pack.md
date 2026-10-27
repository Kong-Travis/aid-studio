# Bộ prompt và kịch bản đã dùng cho phim mẫu "Chiếc ô vàng"

Nội dung dưới đây đã dùng nguyên văn trong lần chạy thật ngày 2026-10-26, trừ mẫu "nhờ Gemini viết kịch
bản" ở mục 1. Sao chép, đổi tên nhân vật và chi tiết là dùng được cho phim của bạn.

<a id="kich-ban-mau"></a>
## 1. Kịch bản (dán vào bước "Sáng tác kịch bản")

```text
CHIẾC Ô VÀNG

Cảnh 1. Ngoại cảnh - Góc phố cổ Hà Nội - Chiều tối, trời mưa
Mưa bắt đầu nặng hạt. Ông Tư, 70 tuổi, tóc bạc, râu bạc, mặc áo khoác nâu, đội nón lá, đứng sau chiếc xe bánh mì nhỏ. Tấm bạt xanh che phía trên rung lên trong gió.

Cảnh 2. Ngoại cảnh - Vỉa hè phố cổ - Liên tục
Mai, 24 tuổi, tóc đen ngắn ngang vai, mặc áo len màu kem, bước nhanh trên vỉa hè, tay cầm chiếc ô vàng. Một cơn gió mạnh thổi bay tấm bạt của ông Tư, mưa đổ thẳng xuống người ông và xe bánh mì.

Cảnh 3. Ngoại cảnh - Bên xe bánh mì - Liên tục
Mai khựng lại, thấy ông Tư loay hoay che xe bánh mì. Cô chạy tới, giơ chiếc ô vàng che cho ông, vai áo cô ướt sũng.
MAI: Ông ơi, để cháu che cho!

Cảnh 4. Ngoại cảnh - Bên xe bánh mì - Liên tục
Ông Tư ngẩng lên, mỉm cười hiền hậu. Ông nhanh tay gói thêm một ổ bánh mì nóng đưa cho Mai.
ÔNG TƯ: Cảm ơn cháu. Cầm lấy ổ này, ông mời!

Cảnh 5. Ngoại cảnh - Dưới chiếc ô vàng - Liên tục
Mai nhận ổ bánh mì, bật cười. Hai người đứng sát nhau dưới chiếc ô vàng, mưa rơi quanh họ.

Cảnh 6. Ngoại cảnh - Góc phố cổ - Lúc lên đèn
Đèn đường bật sáng, ánh vàng ấm hắt lên mặt đường ướt. Nhìn từ xa, chiếc ô vàng nổi bật giữa phố cổ trong mưa.
```

**Muốn nhờ Gemini viết kịch bản cho phim của bạn**, dán vào ứng dụng Gemini (mẫu gợi ý, viết dựa trên
cấu trúc kịch bản ở trên; phim mẫu không dùng mẫu này):

```text
Viết kịch bản phim ngắn khoảng 30 giây bằng tiếng Việt, tên "<TÊN PHIM>". Bối cảnh: <NƠI CHỐN, THỜI GIAN>.
Nhân vật: <TÊN> (<tuổi>, <tóc>, <quần áo>, <đồ vật đặc trưng>) và <TÊN> (...). Câu chuyện: <TÓM TẮT>.
Chia đúng 6 cảnh, mỗi cảnh ghi "Cảnh N. Ngoại cảnh/Nội cảnh - Địa điểm - Thời gian", rồi hành động, câu
thoại viết dạng TÊN: lời. Có 2 đến 3 câu thoại ngắn. Chỉ viết bằng tiếng Việt.
```

<a id="the-nhan-vat"></a>
## 2. Thẻ nhân vật (ứng dụng Gemini, cùng một cuộc chat cho cả phim)

**Lưu ý khi đăng công khai:** các prompt dưới đây nhắc tên một hãng phim ("kiểu Ghibli") để mô tả phong
cách. Nếu đăng video công khai, nên thay bằng mô tả trung tính như "hoạt hình 2D vẽ tay, màu nước mềm,
gam ấm" (chưa chạy thử với cách viết này). Trước khi đăng, tự đọc điều khoản sử dụng ảnh tạo bằng ứng
dụng Gemini của Google.

**Thẻ nhân vật Mai** (prompt đầu tiên của cuộc chat):

```text
Tạo một ảnh nhân vật (character sheet) theo phong cách hoạt hình 2D vẽ tay kiểu Ghibli, màu nước mềm mại, khung ngang 16:9. Nhân vật: Mai, cô gái Việt Nam 24 tuổi, gương mặt thanh tú hiền lành, mắt sáng, tóc đen ngắn ngang vai cắt gọn, mặc áo len đan màu kem, quần jean xanh đậm, giày thể thao trắng, tay cầm một chiếc ô màu vàng tươi cán dài đang gập. Vẽ cùng một nhân vật ở ba góc: chính diện toàn thân, nghiêng 3/4, và sau lưng, đứng cạnh nhau trên nền trắng trơn, ánh sáng đều. Không có chữ, không có logo.
```

**Thẻ nhân vật ông Tư:**

```text
Giữ nguyên đúng phong cách vẽ, nét vẽ và bảng màu của ảnh vừa rồi. Tạo character sheet thứ hai, khung ngang 16:9: Ông Tư, ông lão Việt Nam 70 tuổi bán bánh mì, dáng gầy, gương mặt hiền hậu có nếp nhăn ở khóe mắt, tóc bạc trắng cắt ngắn, râu bạc tỉa gọn, đội nón lá, mặc áo khoác vải màu nâu đậm bên ngoài áo sơ mi xám nhạt, quần vải tối màu ống rộng, đi dép quai hậu. Vẽ ba góc: chính diện toàn thân, nghiêng 3/4, và sau lưng, đứng cạnh nhau trên nền trắng trơn, ánh sáng đều. Không có chữ, không có logo.
```

**Mai ướt vai** (tạo hình thứ hai của Mai):

```text
Dùng đúng nhân vật Mai trong ảnh đầu tiên (giữ nguyên khuôn mặt, kiểu tóc, áo len kem, quần jean, giày trắng và phong cách vẽ). Vẽ một ảnh khung ngang 16:9, Mai đứng toàn thân góc 3/4 trên nền trắng trơn, tay giơ cao chiếc ô vàng đang mở nghiêng sang một bên, một bên vai áo len bị mưa làm ướt sẫm màu, tóc hơi ướt, nét mặt ấm áp quan tâm. Không có chữ, không có logo.
```

**Sửa lệch** (lần đầu Gemini vẽ tóc dài và vết ướt màu nâu):

```text
Ảnh vừa rồi bị lệch so với nhân vật gốc. Sửa lại: tóc Mai phải ngắn ngang vai, cắt gọn y như ảnh đầu tiên (không dài quá vai). Vết ướt trên vai áo chỉ là màu kem sẫm hơn một chút do thấm nước, không phải màu nâu. Giữ nguyên mọi thứ khác.
```

## 3. Bối cảnh (không có người)

```text
Giữ đúng phong cách vẽ màu nước Ghibli như các ảnh trước. Vẽ ảnh bối cảnh (không có người), khung ngang 16:9: một góc phố cổ Hà Nội lúc chiều tối, trời mưa to, những ngôi nhà ống cũ tường vàng mái ngói nâu, dây điện chằng chịt, mặt đường ướt loang loáng phản chiếu ánh sáng. Ở góc phố có một chiếc xe bánh mì nhỏ bằng kim loại có tủ kính, phía trên che tấm bạt xanh. Đèn đường chưa bật, bầu trời xám xanh. Góc máy toàn cảnh ngang tầm mắt. Không có chữ, không có logo.
```

```text
Cùng phong cách và cùng con phố trong ảnh vừa rồi. Vẽ ảnh bối cảnh (không có người), khung ngang 16:9: đoạn vỉa hè hẹp dọc theo dãy nhà cổ tường vàng rêu phong, mái hiên nhỏ, trời mưa to lúc chiều tối, vũng nước phản chiếu, xa xa cuối vỉa hè thấy chiếc xe bánh mì với tấm bạt xanh. Góc máy ngang tầm mắt nhìn dọc vỉa hè. Không có chữ, không có logo.
```

```text
Cùng phong cách và cùng chiếc xe bánh mì trong các ảnh trước. Vẽ ảnh bối cảnh cận cảnh (không có người), khung ngang 16:9: chiếc xe bánh mì kim loại nhỏ có tủ kính đựng những ổ bánh mì vàng giòn, một bếp than nhỏ đỏ lửa bên cạnh, tấm bạt xanh phía trên bị gió giật bung một góc, nước mưa xối xuống, chiều tối, nền là bức tường vàng cũ mờ đi trong mưa. Không có chữ, không có logo.
```

```text
Vẽ lại đúng góc phố cổ trong ảnh bối cảnh đầu tiên (cùng nhà cửa, cột điện, xe bánh mì, tấm bạt xanh), nhưng lúc trời vừa tối, đèn đường đã bật sáng, ánh đèn vàng ấm hắt xuống mặt đường ướt, mưa nhẹ hơn, cửa sổ vài nhà sáng đèn. Không có người. Khung ngang 16:9. Không có chữ, không có logo.
```

<a id="kich-ban-phan-canh"></a>
## 4. Kịch bản phân cảnh (dán vào "Sửa kịch bản phân cảnh")

```text
Cảnh 1 - Toàn cảnh góc phố cổ Hà Nội, chiều tối, trời mưa to. Ông Tư đứng sau chiếc xe bánh mì, tấm bạt xanh phía trên rung mạnh trong gió. Máy quay đứng yên, ngang tầm mắt. Thời lượng 5 giây.
```

```text
Cảnh 2 - Trung cảnh vỉa hè phố cổ, chiều tối, mưa to. Mai cầm chiếc ô vàng bước nhanh trên vỉa hè ướt. Phía xa, một cơn gió mạnh thổi bay tấm bạt xanh của xe bánh mì. Máy quay lia nhẹ theo Mai. Thời lượng 5 giây.
```

```text
Cảnh 3 - Trung cảnh bên xe bánh mì. Mai chạy tới, giơ chiếc ô vàng che cho ông Tư, vai áo len của cô ướt sũng.
MAI: Ông ơi, để cháu che cho!
Thời lượng 5 giây.
```

```text
Cảnh 4 - Cận cảnh ông Tư dưới chiếc ô vàng. Ông ngẩng lên mỉm cười hiền hậu, đưa cho Mai một ổ bánh mì nóng gói giấy.
ÔNG TƯ: Cảm ơn cháu. Cầm lấy ổ này, ông mời!
Thời lượng 5 giây.
```

```text
Cảnh 5 - Trung cảnh. Mai nhận ổ bánh mì, bật cười. Hai người đứng sát nhau dưới chiếc ô vàng, mưa rơi quanh họ. Thời lượng 5 giây.
```

```text
Cảnh 6 - Toàn cảnh từ xa, lúc lên đèn. Đèn đường bật sáng, ánh vàng ấm hắt lên mặt đường ướt. Chiếc ô vàng nổi bật giữa phố cổ trong mưa. Máy quay lùi xa dần. Thời lượng 5 giây.
```

## 5. Ảnh phân cảnh (ứng dụng Gemini, tiếp tục cùng cuộc chat)

```text
Bây giờ vẽ ảnh phân cảnh cho phim, giữ đúng nhân vật và bối cảnh ở các ảnh trước, cùng phong cách màu nước Ghibli, khung ngang 16:9, không có chữ. Cảnh 1: toàn cảnh góc phố cổ (đúng bối cảnh ảnh góc phố đầu tiên) lúc chiều tối mưa to, ông Tư (đúng nhân vật ông Tư ở trên: nón lá, áo khoác nâu, râu bạc) đứng sau xe bánh mì, ngước nhìn tấm bạt xanh đang bị gió giật rung mạnh. Máy quay ngang tầm mắt.
```

```text
Cảnh 2 (cùng phong cách, 16:9, không có chữ): trung cảnh trên vỉa hè phố cổ (đúng bối cảnh ảnh vỉa hè ở trên) lúc chiều tối mưa to. Mai (đúng nhân vật Mai: tóc đen ngắn ngang vai, áo len kem, quần jean, giày trắng) bước nhanh về phía máy quay, tay cầm chiếc ô vàng đang mở. Phía xa sau lưng cô, tấm bạt xanh của xe bánh mì bị gió thổi bay lên.
```

```text
Cảnh 3 (cùng phong cách, 16:9, không có chữ): trung cảnh bên xe bánh mì (đúng xe bánh mì ở trên) lúc chiều tối mưa to. Mai (đúng nhân vật Mai) vừa chạy tới, giơ cao chiếc ô vàng che cho ông Tư (đúng nhân vật ông Tư), một bên vai áo len của cô bị mưa làm ướt sẫm. Mai nhìn ông với vẻ quan tâm, ông Tư ngạc nhiên ngẩng lên. Tấm bạt xanh đã bị gió thổi lệch.
```

```text
Cảnh 4 (cùng phong cách, 16:9, không có chữ): cận cảnh ông Tư (đúng nhân vật ông Tư) đứng dưới chiếc ô vàng mà Mai đang che, ông mỉm cười hiền hậu, hai tay đưa ra một ổ bánh mì nóng gói trong giấy. Nhìn thấy một phần tay áo len kem của Mai và cán ô vàng ở mép khung hình. Nền là xe bánh mì và mưa rơi mờ phía sau.
```

```text
Cảnh 5 (cùng phong cách, 16:9, không có chữ): trung cảnh Mai và ông Tư (đúng hai nhân vật ở trên) đứng sát nhau dưới chiếc ô vàng bên xe bánh mì, Mai cầm ổ bánh mì gói giấy và bật cười, ông Tư cũng cười hiền. Mưa rơi quanh tán ô, ánh sáng chiều tối dịu ấm.
```

```text
Cảnh 6 (cùng phong cách, 16:9, không có chữ): toàn cảnh từ xa con phố cổ lúc vừa lên đèn (đúng bối cảnh ảnh phố lúc lên đèn ở trên), đèn đường vàng ấm hắt xuống mặt đường ướt, mưa nhẹ. Ở góc phố, xe bánh mì và hai người nhỏ xíu đứng chung dưới chiếc ô vàng nổi bật giữa khung cảnh.
```

<a id="phu-de"></a>
## 6. Phụ đề (`chiec-o-vang.srt`)

```text
1
00:00:10,600 --> 00:00:13,000
Mai: Ông ơi, để cháu che cho!

2
00:00:15,600 --> 00:00:19,400
Ông Tư: Cảm ơn cháu.
Cầm lấy ổ này, ông mời!
```

Cách tính thời gian: cảnh N bắt đầu ở giây (N - 1) x 5. Cộng thêm độ trễ đã dùng trong `add-voice.sh`
(ở đây 0,6 giây).
