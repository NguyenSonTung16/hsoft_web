# Man hinh chinh sau dang nhap (LIS)

## 1) Muc tieu man hinh chinh
- La trung tam dieu phoi, khong thay the cac man hinh thao tac chuyen sau.
- Giup nguoi dung thay ngay: viec nao dang cho, viec nao qua han, viec nao can uu tien.
- Cho phep vao nhanh dung buoc nghiep vu theo vai tro.

## 2) Nhung gi PHAI hien thi tren man hinh chinh

### A. Thanh ngữ cảnh lam viec (top bar)
- Co so dang lam viec.
- Khu xet nghiem dang lam viec.
- Ngay lam viec, ca truc.
- Ten nguoi dung + vai tro.
- Ket noi he thong (online/offline).

### B. O tim nhanh + quet barcode
- Tim theo: Ma BN, Ma phieu, Ma mau, So dien thoai.
- Nut Quet barcode de vao thang phieu/mau can xu ly.

### C. Tong quan 8 buoc quy trinh
- Danh sach 8 buoc theo thu tu nghiep vu.
- Moi buoc hien 3 so:
  - So cho xu ly
  - So dang xu ly
  - So qua han SLA
- Mau sac canh bao ro (binh thuong/canh bao/nghiem trong).

### D. Bang cong viec uu tien (queue trung tam)
- Danh sach phieu/mau can lam ngay, sap theo do uu tien:
  - Cap cuu (STAT)
  - Sap qua han
  - Qua han
- Cot goi y:
  - Ma phieu/ma mau
  - Ma BN/ten BN
  - Buoc hien tai
  - Thoi gian vao buoc
  - SLA con lai
  - Muc do uu tien

### E. Panel chi tiet nhanh (ben phai)
- Thong tin hanh chinh tom tat BN.
- Danh sach xet nghiem dang xu ly.
- Timeline 8 buoc (da xong/dang lam/cho/lỗi).
- Nut hanh dong nhanh theo buoc hien tai.

### F. Canh bao he thong
- Mau bi tra ve do chat luong.
- Phieu cho duyet lau.
- Ket qua bat thuong quan trong.
- Loi dong bo voi may xet nghiem (neu co).

### G. KPI van hanh theo ca
- Tong phieu trong ca.
- Ty le dung SLA.
- Thoi gian trung binh tu lay mau den duyet.
- So phieu da duyet chua in, da in chua thanh toan.

## 3) Hanh dong nhanh tren man hinh chinh
- Vao Buoc 1: Tao tiep nhan moi.
- Vao Buoc 2: Tao phieu chi dinh moi.
- Vao Buoc 3-4: Quet de lay/nhan mau.
- Vao Buoc 5: Mo man hinh nhap ket qua cho phieu dang chon.
- Vao Buoc 6: Mo man hinh duyet cho phieu dang chon.
- Vao Buoc 7: In/phat hanh.
- Vao Buoc 8: Thanh toan.

## 4) Wireframe de xuat (Desktop)

```text
+------------------------------------------------------------------------------------------------------------------+
| [LIS] Co so: BV-TW | Khu XN: HH | Ngay: 2026-03-16 | Ca: Sang | [Canh bao 4] | [Thong bao] | [User/Vai tro] |
+------------------------------------------------------------------------------------------------------------------+
| Tim nhanh: [Ma BN / Ma phieu / Ma mau / Barcode.....................................................] [Quet]   |
+--------------------------------------+--------------------------------------------------+------------------------+
| QUY TRINH 8 BUOC                    | QUEUE UU TIEN                                     | CHI TIET NHANH         |
| 1 Tiep nhan      [12|5|1]           | Loc: [Tat ca] [STAT] [Sap qua han] [Qua han]      | BN: Nguyen Van A       |
| 2 Chi dinh       [18|6|2]           |--------------------------------------------------| Ma phieu: PXN24031601  |
| 3 Lay mau        [25|8|4]           | Ma phieu | Buoc | BN | Vao buoc | SLA | Uu tien  | Buoc hien tai: 5      |
| 4 Nhan mau       [14|4|1]           | PX001    | 5    | A  | 08:10    | 00:20| Cao      | Timeline: 1,2,3,4 done |
| 5 Nhap ket qua   [31|9|5]           | PX002    | 6    | B  | 08:12    | Qua han| Cao     | 5 in progress          |
| 6 Duyet KQ       [9|3|1]            | PX003    | 3    | C  | 08:18    | 00:35| TB       | [Mo man hinh buoc]     |
| 7 In ket qua     [7|2|0]            |--------------------------------------------------| [Lich su thao tac]      |
| 8 Thanh toan     [16|7|2]           | [Nhan viec] [Chuyen buoc] [Tam dung]             |                        |
| Chu thich: [Cho|Dang|Qua han]       |                                                  |                        |
+--------------------------------------+--------------------------------------------------+------------------------+
| KPI ca truc: Tong phieu 142 | Dung SLA 93% | Lay mau->Duyet TB 47p | Da duyet chua in: 11 | Da in chua thu: 6    |
+------------------------------------------------------------------------------------------------------------------+
```

## 5) Quy tac hien thi theo vai tro
- Tiep nhan: mac dinh focus buoc 1-2.
- KTV lay mau: mac dinh focus buoc 3-4.
- KTV xet nghiem: mac dinh focus buoc 5.
- Bac si duyet: mac dinh focus buoc 6.
- Thu ngan: mac dinh focus buoc 8.
- Van xem duoc tong quan 8 buoc, nhung chi thao tac o buoc duoc cap quyen.

## 6) Nguyen tac UX quan trong
- Man hinh chinh chi de dieu phoi + dieu huong, khong nhoi toan bo form chi tiet.
- Moi dong trong queue phai co nut mo den man hinh buoc tuong ung.
- Tat ca canh bao qua han phai click vao duoc danh sach cu the.
- Ho tro phim tat va quet barcode de thao tac nhanh tai quay.
