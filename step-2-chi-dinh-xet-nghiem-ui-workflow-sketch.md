# Phac thao UI + dieu huong thao tac - Buoc 2: Chi dinh xet nghiem

## 1) Muc tieu man hinh
- Hoan tat thao tac tao phieu chi dinh xet nghiem trong mot luot.
- Tu dong nap thong tin hanh chinh BN tu ma BN de giam nhap lieu.
- Ho tro them dich vu tu danh muc hoac tu goi XN.
- Tinh tong tien ro rang truoc khi luu.

## 2) Luong dieu huong vao man hinh Buoc 2

```text
Main Screen
|- danh sách bệnh nhân ->nút "Chi dinh xet nghiem"
```

## 3) Cau truc UI man hinh Buoc 2 (Desktop)

```text
+-------------------------------------------------------------------------------------------------------------------+
| CHI DINH XET NGHIEM                                                                                |Về trang chủ|               |
+-------------------------------------------------------------------------------------------------------------------+
| THONG TIN HANH CHINH BN (read-only, lấy thông tin từ trang nhập thông tin)                                                                   |
| Ma BN: BN2603190001 | Ho ten: Nguyen Van A | Ngay sinh: 1990-01-01 | Gioi tinh: Nam                             |
| SDT: 090xxxxxxx     | BHYT: DN4010...      | Doi tuong: BHYT      | Dia chi: ...                                 |
+-------------------------------------------------------------------------------------------------------------------+
| THONG TIN CHI DINH                                                                                                 |
| Bac si chi dinh* [dropdown/search]   Khoa phong* [dropdown]   Chan doan ICD* [autocomplete]                     |
| Ghi chu chi dinh [............................................................]                                    |
+-------------------------------------------------------------------------------------------------------------------+
| DICH VU XET NGHIEM                                                                                                 |
| [Them tu danh muc] [Them tu goi XN] [Xoa tat ca]                                                                   |
|---------------------------------------------------------------------------------------------------------------      |
| Ma DV | Ten xet nghiem                  | So luong | Don gia | Thanh tien | Hanh dong                              |
| HH01  | Cong thuc mau                   |   [1]    |  40,000 |   40,000   | [Xoa]                                  |
| SH10  | Duong huyet                     |   [1]    |  30,000 |   30,000   | [Xoa]                                  |
| VS03  | Cay mau                         |   [1]    | 120,000 |  120,000   | [Xoa]                                  |
|---------------------------------------------------------------------------------------------------------------      |
| Tong dong: 3  | Tong so luong: 3                                            Tong tien: 190,000 VND                |
+-------------------------------------------------------------------------------------------------------------------+
| [Luu phieu chi dinh] [Luu va in phieu] [Huy]                                                                      |
+-------------------------------------------------------------------------------------------------------------------+
```

## 4) Hanh vi UI quan trong

### 4.1 Tim ma BN
- User nhap ma BN va bam `Tim`.
- Neu tim thay:
  - fill thong tin hanh chinh BN vao khu read-only.
  - mo khoa `Thong tin chi dinh` va `Dich vu xet nghiem`.
- Neu khong tim thay:
  - hien thong bao "Khong tim thay ma BN".
  - giu khoa phan chi dinh de tranh tao phieu sai BN.

### 4.2 Them dich vu
- Tu `Them tu danh muc`: mo popup danh muc XN co tim kiem theo ma/ten.
- Tu `Them tu goi XN`: chon 1 goi, tu dong them nhieu dong vao bang.
- Trung ma DV:
  - de xuat gop dong va cong don so luong.

### 4.3 Tinh tien
- `Thanh tien dong = so luong x don gia`.
- `Tong tien = tong thanh tien tat ca dong`.
- update real-time khi sua so luong/don gia.

### 4.4 Luu phieu
- Nut `Luu phieu chi dinh`:
  - validate tat ca truong bat buoc.
  - tao `xn_chidinh` + `xn_chidinh_ct` trong cung transaction.
- Ket qua thanh cong:
  - thong bao "Da tao phieu chi dinh".
  - hien ma phieu vua tao.
  - cho phep in hoac chuyen tiep buoc 3.

## 5) Rule validation de xoa mo ho
- Bat buoc co `ma BN` hop le (tim thay BN) truoc khi them dich vu.
- Bat buoc: Bac si chi dinh, Khoa phong, ICD.
- Danh sach chi dinh phai co it nhat 1 dong.
- Moi dong: so luong > 0, don gia >= 0.
- Neu doi tuong BHYT va co quy tac BHYT thi can check dieu kien tuyen/phan loai (neu ap dung).

## 6) Phac thao mobile UX (Android)

```text
Step 1: Tim BN
- Ma BN + Tim
- Hien card thong tin BN

Step 2: Thong tin chi dinh
- Bac si / Khoa phong / ICD

Step 3: Chon dich vu
- Danh muc hoac Goi
- Danh sach da chon (card list)

Step 4: Xac nhan
- Tong tien
- Luu phieu / Luu va in
```

Ghi chu mobile:
- Bang chi tiet chuyen thanh danh sach card de tranh vo layout.
- Nhom nut thao tac dat sticky o cuoi man hinh.
- Neu dung bang, cho phep scroll ngang rieng cho khu vuc chi tiet.

## 7) Mapping du lieu backend (de implement)

### Header (`xn_chidinh`)
- order_id (ma phieu chi dinh)
- patient_id / ma_bn
- doctor_id
- department_id
- icd_code
- note
- created_at

### Detail (`xn_chidinh_ct`)
- order_id (FK)
- service_code
- service_name
- quantity
- unit_price
- line_total

## 8) API de xay dung cho Buoc 2
- `getPatientByMaBn(maBn)`
- `loadDoctors()`
- `loadDepartments()`
- `searchIcd(keyword)`
- `loadTestCatalog()`
- `loadTestPackages()`
- `createTestOrder(input)`

## 9) Tieu chi hoan thanh (Definition of Done)
- Tao duoc 1 phieu chi dinh hop le cho BN ton tai.
- Luu duoc du lieu vao `xn_chidinh` va `xn_chidinh_ct`.
- Tong tien tinh dung theo tung dong va tong phieu.
- UI desktop + mobile de dung duoc khong vo bo cuc.
- Co thong bao loi ro rang cho cac truong hop validation.
