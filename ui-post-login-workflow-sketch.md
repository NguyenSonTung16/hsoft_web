# Phac thao UI sau dang nhap - Ban phu hop quy trinh 8 buoc

## 1) Muc tieu thiet ke
- Mot man hinh dieu phoi tong cho toan bo quy trinh, khong tach roi menu.
- Moi vai tro vao he thong thay ngay viec can lam o buoc nghiep vu cua minh.
- Theo doi duoc dong mau xet nghiem end-to-end: tiep nhan -> chi dinh -> lay mau -> nhan mau -> phan tich -> duyet -> in -> thanh toan.

## 2) Screen map sau dang nhap

```text
Dashboard Dieu Phoi (home sau dang nhap)
|- Queue theo 8 buoc + canh bao SLA
|- Tim kiem BN/Ma mau/Barcode
|- Panel chi tiet benh nhan + timeline 8 buoc
|
|-- Buoc 1: Tiep nhan benh nhan (frmAddbenhnhan)
|-- Buoc 2: Chi dinh xet nghiem (frmChidinh_n, frmChidinhxetnghiem)
|-- Buoc 3: Lay mau benh pham (frmLaymau, frmPhieulaymau)
|-- Buoc 4: Nhan mau (luong check-in barcode)
|-- Buoc 5: Phan tich va nhap ket qua (frmPhieuketqua)
|-- Buoc 6: Duyet ket qua (frmDuyetketqua, frmxacnhanchukyso)
|-- Buoc 7: In/Phat hanh ket qua (frmPhieuketqua_Print, frmReport)
|-- Buoc 8: Thanh toan vien phi (frmVienphi, frmDongtien)
```

## 3) Wireframe tong quan desktop

```text
+--------------------------------------------------------------------------------------------------------------------+
| [LIS] Co so: BV-TW | Khu XN: HH | Ngay: 2026-03-16 | Ca: Sang | [Canh bao SLA: 4] | [Thong bao] | [User]      |
+--------------------------------------------------------------------------------------------------------------------+
| [Tim nhanh: Ma BN / Ma mau / Barcode.................................................................] [Quet ma] |
+-------------------------------+---------------------------------------------------------+--------------------------+
| MENU QUY TRINH               | BANG CONG VIEC BUOC DANG CHON                           | CHI TIET PHIEU/MAU      |
| (1) Tiep nhan         [12|2] | Loc: [Cho xu ly] [Dang xu ly] [Qua han] [Cap cuu]       | Ma BN: BN000123         |
| (2) Chi dinh          [18|3] |---------------------------------------------------------| Ho ten: Nguyen Van A    |
| (3) Lay mau           [25|6] | Ma mau | Benh nhan | Dich vu | Gio vao buoc | SLA      | Ma phieu: PXN24031601   |
| (4) Nhan mau          [14|1] | XM001  | A         | HH,SH   | 08:10        | 00:35    | Khoa chi dinh: Noi Tong |
| (5) Nhap ket qua      [31|7] | XM002  | B         | VS      | 08:12        | Qua han  | Chan doan ICD: E11      |
| (6) Duyet ket qua      [9|2] | XM003  | C         | SH      | 08:18        | 00:20    | Trang thai: Buoc 5      |
| (7) In ket qua         [7|0] |---------------------------------------------------------| Timeline 8 buoc         |
| (8) Thanh toan        [16|4] | [Nhan xu ly] [Chuyen buoc] [Tu choi] [Danh dau STAT]    | 1 done, 2 done, 3 done  |
| Chu thich [Cho|QuaHan]       |                                                         | 4 done, 5 in progress   |
+-------------------------------+---------------------------------------------------------+--------------------------+
```

## 4) Wireframe chi tiet theo buoc nghiep vu

### Buoc 1 - Tiep nhan benh nhan

```text
+-----------------------------------------------------------------------------------+
| TIEP NHAN BENH NHAN                                                               |
| Ma BN [..............] (tu sinh neu moi)                                          |
| Ho ten [....................]  Ngay sinh [..../..../....]  Gioi tinh [Nam/Nu]    |
| Dia chi [.......................................................]                  |
| SDT [..............]   So the BHYT [......................]                       |
| Loai BN [Ngoai tru/Noi tru]  Doi tuong [BHYT/Dich vu/Mien phi]                   |
| [Luu ho so] [Lam moi] [In ma BN]                                                  |
+-----------------------------------------------------------------------------------+
```

Du lieu chinh:
- Nguon bang: hanhchanh, btdbn.
- Ket qua: Tao ho so BN co ma BN duy nhat.

### Buoc 2 - Chi dinh xet nghiem

```text
+--------------------------------------------------------------------------------------------------+
| CHI DINH XET NGHIEM                                                                              |
| Ma BN [........] [Tim] -> Tu dong nap thong tin hanh chinh                                       |
| Bac si chi dinh [.............]   Khoa phong [.............]   ICD [.....]                      |
|--------------------------------------------------------------------------------------------------|
| Danh sach dich vu xet nghiem                                                                      |
| [Them tu goi] [Them tu danh muc]                                                                  |
| Ma DV | Ten xet nghiem | So luong | Don gia | Thanh tien                                         |
| ......|.................|.........|.........|...........                                         |
|--------------------------------------------------------------------------------------------------|
| [Luu phieu chi dinh] [In phieu] [Huy]                                                             |
+--------------------------------------------------------------------------------------------------+
```

Du lieu chinh:
- Nguon bang: xn_chidinh, xn_chidinh_ct.
- Ket qua: Phieu chi dinh xet nghiem.

### Buoc 3 + 4 - Lay mau va Nhan mau barcode

```text
+------------------------------------------------------------------------------------------------+
| LAY MAU BENH PHAM / NHAN MAU                                                                   |
| Ma BN hoac Barcode [.................................] [Quet] [Tim]                            |
| Benh nhan: Nguyen Van A | Lan dieu tri: [Lan 1 v] | Lich su lay mau [Xem]                     |
|------------------------------------------------------------------------------------------------|
| Ngay gio lay mau [..../..../.... ..:..]  Loai mau [Mau/Nuoc tieu/Dich]                        |
| KTV lay mau [..............]  Vi tri lay [..............]  Dia diem [..............]           |
| Tinh trang mau [Dat/Vo ong/Thieu the tich/Tan mau]  Ghi chu [.........................]       |
|------------------------------------------------------------------------------------------------|
| [Luu phieu lay mau] [In nhan barcode] [Xac nhan nhan mau] [Cap nhat tinh trang nhan]          |
| Thoi gian nhan mau: [tu dong ghi khi xac nhan]                                                  |
+------------------------------------------------------------------------------------------------+
```

Du lieu chinh:
- Nguon bang: xn_laymau, xn_phieu, xn_tinhtrang.
- Quy tac: Quet barcode -> xac nhan nhan mau -> cap nhat tinh trang + timestamp nhan.

### Buoc 5 - Phan tich va nhap ket qua (man hinh trong tam)

```text
+----------------------------------------------------------------------------------------------------------------------+
| PHAN TICH VA NHAP KET QUA                                                                                            |
| Ma phieu [........] [Tim] | Benh nhan [...] | Trang thai mau [...] | TSBT theo tuoi/gioi [ON/OFF]                 |
|----------------------------------------------------------------------------------------------------------------------|
| Che do nhap: ( ) Tu dong tu may   ( ) Thu cong                                                                    |
|----------------------------------------------------------------------------------------------------------------------|
| KQ GRID: Ma XN | Ten XN | Ket qua | Don vi | TSBT | Co bat thuong | Nhan xet                                      |
|         |      |        |        |      |              |                                                        |
|----------------------------------------------------------------------------------------------------------------------|
| Tu dong tu may: [Doc du lieu may] [Map ma thong so] [Tinh toan BILI/LDL/GLO/A-G] [Luu auto]                       |
| Thu cong      : [Nhap nhanh] [Viet tat] [Kiem tra gia tri] [Luu dong dang sua]                                     |
| Tong ket      : Nhan xet [..................] Ket luan [..................] De nghi [..................]          |
| [Luu ket qua toan bo] [Tam khoa phieu] [Chuyen duyet]                                                              |
+----------------------------------------------------------------------------------------------------------------------+
```

Du lieu chinh:
- Nguon bang: xn_ketqua va cac bang xn_phieu_* chuyen biet.
- Chuc nang bat buoc:
	- Auto import tu may va mapping ma thong so.
	- Tinh toan chi so dan xuat.
	- So sanh TSBT theo gioi/tuoi va danh dau bat thuong.

### Buoc 6 - Duyet ket qua + Ky so

```text
+-------------------------------------------------------------------------------------------------------------+
| DUYET KET QUA                                                                                               |
| Danh sach cho duyet: [Ma phieu] [Benh nhan] [Muc do bat thuong] [Thoi gian cho]                            |
|-------------------------------------------------------------------------------------------------------------|
| Chi tiet phieu: ket qua tung xet nghiem + canh bao TSBT                                                     |
| STT phieu [.......] [Tu dong tang theo ngay/thang/dia diem] [Kiem tra trung STT]                           |
| Nguoi duyet [Bac si ...]   Hinh thuc ky [Ky tay/Ky so PKI]                                                  |
| [Duyet phieu] [Huy duyet] [Ky so]                                                                           |
+-------------------------------------------------------------------------------------------------------------+
```

Du lieu chinh:
- Nguon bang: xn_phieu (DADUYET, maktv_duyet, ngayduyet).
- Kiem soat bat buoc: check trung STT truoc duyet.

### Buoc 7 - In va phat hanh ket qua

```text
+-------------------------------------------------------------------------------------------------------------+
| IN / PHAT HANH KET QUA                                                                                      |
| Ma phieu [........] [Lay du lieu da duyet]                                                                   |
| Kenh dau ra: [In giay] [PDF] [Barcode ZPL] [LCD] [Email] [HL7] [XML]                                       |
| Mau in [........]  So ban [..]                                                                              |
| [Xem truoc] [In] [Xuat PDF] [Gui email] [Gui HL7] [Xuat XML]                                                |
+-------------------------------------------------------------------------------------------------------------+
```

Du lieu chinh:
- Nguon du lieu in: ket qua da duyet.
- Dau ra da kenh theo cau hinh benh vien.

### Buoc 8 - Thanh toan vien phi

```text
+-------------------------------------------------------------------------------------------------------------+
| THANH TOAN VIEN PHI                                                                                         |
| Ma BN [........] [Tim]   Doi tuong [BHYT/Dich vu/Mien phi]                                                  |
|-------------------------------------------------------------------------------------------------------------|
| Danh sach dich vu da thuc hien                                                                              |
| Ma DV | Ten DV | So luong | Don gia | Bao hiem chi tra | Benh nhan chi tra                                  |
|-------------------------------------------------------------------------------------------------------------|
| Tong tien [........]  Da thu [........]  Con lai [........]                                                 |
| [Thu tien] [Xac nhan thanh toan] [In bien lai]                                                              |
+-------------------------------------------------------------------------------------------------------------+
```

Du lieu chinh:
- Nguon bang: xn_vienphi.

## 5) Rule phan quyen va trang thai

- Tiep nhan: thao tac buoc 1, xem buoc 2-8.
- Bac si chi dinh: thao tac buoc 2.
- KTV lay mau: thao tac buoc 3-4.
- KTV xet nghiem: thao tac buoc 5.
- Bac si duyet: thao tac buoc 6.
- Hanh chinh/tra ket qua: thao tac buoc 7.
- Thu ngan: thao tac buoc 8.

Trang thai phieu/mau de hien thi toan he thong:
- waiting
- in_progress
- blocked
- rejected
- approved
- printed
- paid

## 6) KPI can co tren dashboard

- So phieu cho xu ly theo tung buoc.
- Ty le phieu qua SLA theo buoc.
- Thoi gian trung binh tu buoc 3 -> 6.
- So phieu da duyet nhung chua in.
- So phieu da in nhung chua thanh toan.

## 7) Ghi chu trien khai UI

- Desktop uu tien workboard + panel chi tiet de thao tac nhanh.
- Tablet/mobile chuyen thanh tab theo buoc + danh sach gon.
- Cac thao tac gay anh huong du lieu (duyet, huy duyet, thanh toan) can xac nhan 2 lop.
- Luu audit moi thao tac: ai lam, luc nao, hanh dong gi, tu buoc nao sang buoc nao.
