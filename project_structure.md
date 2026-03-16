Phần mềm: Hệ thống Quản lý Xét nghiệm (Laboratory Information System) Nền tảng: Windows Desktop (frontend:react+ vite, backend: nodejs+ apollo server) Cơ sở dữ liệu: Oracle Database (phân vùng theo tháng MMYY) Thư viện truy cập dữ liệu: (AccessData.ts)
MỤC LỤC
1.	Tổng quan hệ thống
2.	Kiến trúc kỹ thuật
3.	Quy trình đăng nhập & phân quyền
4.	Quy trình nghiệp vụ chính
5.	Chi tiết từng module
6.	Tích hợp máy phân tích
7.	Hệ thống báo cáo
8.	Cấu trúc menu hệ thống
9.	Cơ sở dữ liệu
________________________________________
1. TỔNG QUAN HỆ THỐNG
1.1. Mục đích
Hệ thống LIS (Laboratory Information System) quản lý toàn bộ quy trình xét nghiệm y khoa từ tiếp nhận bệnh nhân, lấy mẫu, chạy máy phân tích, nhập/duyệt kết quả, in phiếu kết quả, đến thanh toán viện phí.
1.2. Quy mô
•	449 file mã nguồn typescript, ~403 form giao diện
•	Hỗ trợ đa cơ sở, đa khoa/phòng, đa máy xét nghiệm
•	Phân quyền chi tiết theo vai trò người dùng
•	Tích hợp 6+ loại máy phân tích tự động
•	Hỗ trợ 25+ loại phiếu xét nghiệm chuyên biệt
1.3. Các bên liên quan
Vai trò	Chức năng trong hệ thống
Nhân viên tiếp nhận	Đăng ký bệnh nhân, tạo chỉ định xét nghiệm
Kỹ thuật viên (KTV) lấy mẫu	Lấy mẫu bệnh phẩm, in mã vạch
Kỹ thuật viên xét nghiệm	Chạy máy, nhập kết quả, kiểm soát chất lượng
Bác sĩ xét nghiệm	Duyệt kết quả, ký số, in phiếu kết quả
Quản trị hệ thống	Quản lý người dùng, phân quyền, cấu hình
________________________________________
2. KIẾN TRÚC KỸ THUẬT
2.1. Sơ đồ kiến trúc tổng thể
 	┌──────────────────────────────────────────────────────────────────┐
│                    TẦNG GIAO DIỆN (WinForms)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │
│  │frmLogin  │ │frmLaymau │ │frmPhieu  │ │frmDuyetketqua    │    │
│  │frmMain   │ │frmChidinh│ │ketqua    │ │frmBaocao         │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘    │
├──────────────────────────────────────────────────────────────────┤
│                   TẦNG XỬ LÝ NGHIỆP VỤ                         │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────────────┐   │
│  │Print.ts      │ │HttpHelpers.ts│ │SignClient.ts           │   │
│  │PrintZPL.ts   │ │AWS4Signer.ts │ │(Chữ ký số PKI)        │   │
│  └──────────────┘ └──────────────┘ └────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│               TẦNG TRUY CẬP DỮ LIỆU                              │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ AccessData.ts                                            │    │
│  │ • get_data() / execute_data()                            │    │
│  │ • get_data_mmyy() - truy vấn theo tháng                  │    │
│  │ • getA15() / getBiolis() / getCA270() - đọc máy          │    │
│  │ • upd_xn_laymau() / upd_xn_ketqua() - lưu dữ liệu      │    │
│  │ • Upd_Ketqua_Xetnghiem_Duyet() - duyệt kết quả          │    │
│  └──────────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────────┤
│                    TẦNG CƠ SỞ DỮ LIỆU                           │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ Oracle Database                                          │    │
│  │ Schema gốc: hsoft                                        │    │
│  │ Schema tháng: hsoft0125, hsoft0225, hsoft0325...          │    │
│  │ Schema ảnh: imageMMYY                                    │    │
│  │ Stored Procedures: pkg_xetnghiem                         │    │
│  └──────────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────────┤
│                 MÁY PHÂN TÍCH (ANALYZER)                         │
│  ┌────┐ ┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌───────────┐    │
│  │A15 │ │Biolis  │ │CA270 │ │BS200 │ │DMSPRO│ │drAutotest │    │
│  │    │ │24i     │ │CA180 │ │      │ │      │ │           │    │
│  └────┘ └────────┘ └──────┘ └──────┘ └──────┘ └───────────┘    │
└──────────────────────────────────────────────────────────────────┘
2.2. Phân vùng dữ liệu theo tháng (MMYY)
Hệ thống sử dụng cơ chế phân vùng schema theo tháng để tối ưu hiệu năng:
•	Quy tắc đặt tên: {schema_gốc}{MMYY} → ví dụ: hsoft0325 = tháng 03/2025
•	Hàm chuyển đổi: mmyy("01/03/2025") → "0325"
•	Kiểm tra tồn tại: bMmyy("0325") → gọi stored procedure pkg_xetnghiem.bmmyy
•	Truy vấn liên tháng: get_data_mmyy(sql, "01/01/2025", "31/03/2025") → tự động gộp kết quả từ 3 schema
________________________________________
3. QUY TRÌNH ĐĂNG NHẬP & PHÂN QUYỀN
3.1. Luồng đăng nhập
Khởi động ứng dụng (Program.ts)
        │
        ▼
┌─────────────────────────┐
│ frmLogin.ts             │
│ • Nhập Username/Password│
│ • Chọn Cơ sở (coso)    │
│ • Chọn Khu XN (khuxn)  │
│ • Chọn Ngày làm việc   │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Xác thực                │
│ • f_get_xn_dlogin()     │     ──── Sai ───→ Thông báo lỗi
│ • Đồng bộ ngày hệ thống │
└─────────┬───────────────┘
          │ Đúng
          ▼
┌─────────────────────────┐
│ Thiết lập phiên         │
│ • s_userid (mã hóa)     │
│ • s_ngay10 (ngày DD/MM) │
│ • s_ngay16 (ngày+giờ)   │
│ • khuxn (khu xét nghiệm)│
│ • coso (cơ sở)          │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ frmMain.ts              │
│ • Tải menu hệ thống    │
│ • f_set_right() → Ẩn/   │
│   hiện menu theo quyền  │
│ • Giao diện MDI chính   │
└─────────────────────────┘
3.2. Hệ thống phân quyền
Mô hình phân quyền
┌─────────────────────┐        ┌─────────────────────┐
│ Nhóm người dùng     │        │ Người dùng          │
│ (xn_nhomdlogin)     │───1:N──│ (xn_dlogin)         │
└────────┬────────────┘        └────────┬────────────┘
         │                              │
         ▼                              ▼
┌─────────────────────┐        ┌─────────────────────┐
│ Quyền nhóm          │        │ Quyền cá nhân       │
│ (xn_phanquyennhom)  │        │ (xn_phanquyen)      │
└─────────────────────┘        └─────────────────────┘
Chi tiết quyền (6 cấp độ)
Mỗi chức năng menu được gán quyền dạng chuỗi 6 ký tự "XXXXXX":
Vị trí	Ký hiệu	Ý nghĩa	Ví dụ
0	T	Thêm mới	“1” = được phép
1	X	Xóa	“1” = được phép
2	S	Sửa	“1” = được phép
3	V	Xem	“1” = được phép
4	I	In	“1” = được phép
5	E	Export	“1” = được phép
Ví dụ: "110100" = Được thêm, xóa, xem — không được sửa, in, export.
Ràng buộc bổ sung theo người dùng
Thuộc tính	Ý nghĩa
coso	Giới hạn cơ sở được truy cập
idkhu	Giới hạn khu/khoa phòng
id_bv_so	Sổ xét nghiệm mặc định
mayxn	Máy xét nghiệm được phép sử dụng
noilaymau	Nơi lấy mẫu được phân công
makp	Khoa phòng
duyetketqua	Quyền duyệt kết quả
suakq	Quyền sửa kết quả
huyduyet	Quyền hủy duyệt
xacnhanketqua	Quyền xác nhận kết quả
huycks	Quyền hủy chữ ký số
4. QUY TRÌNH NGHIỆP VỤ CHÍNH
4.1. Sơ đồ tổng thể
╔═══════════════════════════════════════════════════════════════════════╗
║                    QUY TRÌNH XÉT NGHIỆM TỔNG THỂ                    ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌───────────┐  ║
║  │ 1. TIẾP    │    │ 2. CHỈ     │    │ 3. LẤY    │    │ 4. NHẬN   │  ║
║  │ NHẬN       │───▶│ ĐỊNH       │───▶│ MẪU       │───▶│ MẪU       │  ║
║  │ BỆNH NHÂN │    │ XÉT NGHIỆM│    │ BỆNH PHẨM │    │           │  ║
║  └────────────┘    └────────────┘    └────────────┘    └─────┬─────┘  ║
║                                                              │        ║
║                                                              ▼        ║
║  ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌───────────┐  ║
║  │ 8. THANH   │    │ 7. IN      │    │ 6. DUYỆT  │    │ 5. PHÂN   │  ║
║  │ TOÁN       │◀───│ PHIẾU      │◀───│ KẾT QUẢ   │◀───│ TÍCH &    │  ║
║  │ VIỆN PHÍ   │    │ KẾT QUẢ    │    │            │    │ NHẬP KQ   │  ║
║  └────────────┘    └────────────┘    └────────────┘    └───────────┘  ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
4.2. Chi tiết từng bước
BƯỚC 1: Tiếp nhận bệnh nhân
•	Form: frmAddbenhnhan.ts
•	Dữ liệu nhập:
–	Mã bệnh nhân (Mã BN)
–	Họ tên, ngày sinh, giới tính
–	Địa chỉ, số điện thoại
–	Số thẻ BHYT
–	Loại bệnh nhân (ngoại trú/nội trú)
–	Đối tượng (BHYT/Dịch vụ/Miễn phí…)
•	Bảng TSDL: hanhchanh, btdbn
•	Kết quả: Tạo hồ sơ bệnh nhân với mã BN duy nhất
BƯỚC 2: Chỉ định xét nghiệm
•	Form: frmChidinh_n.ts, frmChidinhxetnghiem.ts
•	Dữ liệu nhập:
–	Mã BN → tự động lấy thông tin hành chính
–	Bác sĩ chỉ định
–	Khoa phòng chỉ định
–	Chẩn đoán (mã ICD)
–	Danh sách xét nghiệm cần làm (từ danh mục hoặc gói XN)
–	Số lượng, đơn giá
•	Bảng TSDL: xn_chidinh, xn_chidinh_ct
•	Kết quả: Phiếu chỉ định xét nghiệm
BƯỚC 3: Lấy mẫu bệnh phẩm
•	Form: frmLaymau.ts, frmPhieulaymau.ts
•	Quy trình:
1.	Nhập/quét mã BN → hiển thị thông tin bệnh nhân
2.	Chọn lần điều trị (f_Load_Landieutri())
3.	Xem lịch sử lấy mẫu (f_Load_Lanlaymau())
4.	Nhập thông tin lấy mẫu:
•	Ngày giờ lấy mẫu
•	Loại mẫu thử (máu, nước tiểu, dịch…)
•	Kỹ thuật viên lấy mẫu
•	Vị trí lấy mẫu
•	Địa điểm lấy mẫu
•	Tình trạng mẫu
•	Ghi chú
5.	Lưu phiếu (butLuu_Click)
6.	In mã vạch/nhãn ống mẫu
•	Bảng TSDL: xn_laymau, xn_phieu
•	Phương thức: upd_xn_laymau() → INSERT/UPDATE tùy theo tồn tại hay chưa
BƯỚC 4: Nhận mẫu
•	Form: Tích hợp trong luồng lấy mẫu
•	Quy trình:
1.	Quét mã vạch ống mẫu
2.	Xác nhận nhận mẫu
3.	Cập nhật tình trạng mẫu (xn_tinhtrang)
4.	Ghi nhận thời gian nhận
BƯỚC 5: Phân tích & nhập kết quả
•	Form: frmPhieuketqua.ts (2300+ dòng code — module phức tạp nhất)
•	Hai phương thức nhập:
 	a) Tự động từ máy phân tích:
–	Nút butReaddata → gọi phương thức tương ứng với máy
–	Hệ thống tự động:
•	Kết nối DB máy (Oracle/SQL Server/Access)
•	Đọc kết quả thô
•	Ánh xạ mã thông số máy → mã xét nghiệm hệ thống
•	Tính toán tự động (BILI, LDL, GLO, A/G…)
•	So sánh với chỉ số bình thường (TSBT) theo giới tính/tuổi
•	Cập nhật kết quả vào xn_ketqua
 	b) Nhập thủ công:
–	Nhân viên nhập trực tiếp vào grid kết quả
–	Hỗ trợ viết tắt kết quả (xn_viettat)
–	Tự kiểm tra giá trị bất thường
•	Bảng TSDL: xn_ketqua, các bảng xn_phieu_* chuyên biệt
•	Phương thức:
–	Upd_Ketqua_Xetnghiem() — lưu kết quả toàn bộ (nhận xét, kết luận, đề nghị)
–	Upd_Ketqua_Xetnghiem_Auto() — lưu kết quả tự động từ máy
–	upd_xn_ketqua() — cập nhật từng dòng kết quả
–	upd_xn_ketqua_ksd() — lưu kết quả kháng sinh đồ
BƯỚC 6: Duyệt kết quả
•	Form: frmDuyetketqua.ts, frmxacnhanchukyso.ts
•	Quy trình:
1.	Hiển thị danh sách phiếu chờ duyệt
2.	Bác sĩ xem chi tiết kết quả từng xét nghiệm
3.	So sánh với chỉ số bình thường (TSBT)
4.	Đánh giá kết quả bất thường
5.	Gán số thứ tự phiếu (STT) — hỗ trợ tự động tăng theo ngày/tháng/địa điểm
6.	Kiểm tra trùng lặp STT (bKiemtrasttlaymau())
7.	Duyệt phiếu (butDuyet) hoặc hủy duyệt (butHuyduyet)
8.	Ký số điện tử (PKI) nếu cấu hình
•	Bảng TSDL: xn_phieu (cập nhật DADUYET, maktv_duyet, ngayduyet)
•	Phương thức: Upd_Ketqua_Xetnghiem_Duyet() — ghi nhận người duyệt, thời gian duyệt
BƯỚC 7: In phiếu kết quả
•	Form: frmPhieuketqua_Print.ts, frmReport.ts
•	Hỗ trợ đầu ra:
–	In giấy: Crystal Reports (Dataxml/*.rpt.xml)
–	PDF: iTextSharp, Aspose.PDF, Spire.Pdf
–	Mã vạch: ZPL cho máy in nhiệt (PrintZPL.ts)
–	LCD: Hiển thị trên màn hình LCD phòng chờ
–	Email: Gửi kết quả qua email
–	HL7: Truyền kết quả theo chuẩn HL7
–	XML: Xuất dữ liệu XML
•	Phương thức: get_Ketqua_Print() — lấy dữ liệu kết quả đã duyệt để in
BƯỚC 8: Thanh toán viện phí
•	Form: frmVienphi.ts, frmDongtien.ts
•	Quy trình:
1.	Tổng hợp dịch vụ xét nghiệm đã thực hiện
2.	Tính viện phí theo đối tượng (BHYT/Dịch vụ)
3.	Thu tiền / xác nhận thanh toán
4.	In biên lai
•	Bảng TSDL: xn_vienphi
________________________________________
5. CHI TIẾT TỪNG MODULE
5.1. Module Phiếu kết quả chuyên biệt
Hệ thống hỗ trợ 25+ loại phiếu xét nghiệm chuyên biệt:
STT	Loại phiếu	Form	Mô tả
1	Xét nghiệm thường	frmPhieuketqua	Sinh hóa, huyết học, miễn dịch
2	Vi sinh	frmPhieuketqua (tab)	Cấy vi khuẩn, nấm
3	Kháng sinh đồ	frmKetquaKSD	Kết quả nhạy cảm kháng sinh (Kirby-Bauer)
4	Cổ tử cung (PAP)	frmPhieuxetnghiem_All (CTC)	Tế bào học cổ tử cung
5	Tế bào	frmPhieuxetnghiem_All (TEBAO)	Xét nghiệm tế bào học
6	Tinh dịch đồ	xetnghiemtinhdich.ts	Phân tích tinh dịch
7	Sinh học phân tử	frmPhieuxetnghiem_All (SHPT)	TORCH, PCR
8	Dịch cơ thể	frmPhieuxetnghiem_All (TDD)	Dịch não tủy, dịch màng phổi
9	Đờm	frmPhieuxetnghiem_All (DOM)	Xét nghiệm đờm
10	Huyết - Tủy đồ	frmPhieuxetnghiem_All	Tế bào máu ngoại vi, tủy xương
11	Triple Test	frmPhieuxetnghiem_All	Sàng lọc trước sinh
12	Tiền sản giật	frmPhieuxetnghiem_All	Xét nghiệm tiền sản giật
13	XPERT MTB/RIF	frmPhieuxetnghiem_All	Chẩn đoán nhanh lao
14	Lao kháng thuốc	frmPhieuxetnghiem_All	Xét nghiệm kháng thuốc lao
15	Nuôi cấy lao	frmPhieuxetnghiem_All	Nuôi cấy vi khuẩn lao
16	HPV	frmTKHPV	Xét nghiệm Human Papillomavirus
17	HIV/HBsAg	frmTKHIV, frmTKHIV_HBsAg	Sàng lọc HIV, Viêm gan B
18	Đông máu	frmTKTieuban	Xét nghiệm đông cầm máu
19	Nhóm máu	frmsangiat	Định nhóm máu ABO, Rh
20	Đường huyết	frmDuonghuyet	Nghiệm pháp dung nạp glucose
21	IUI (lọc rửa tinh trùng)	frmPhieuxetnghiem_All	Hỗ trợ sinh sản
22	Giải phẫu bệnh - Mô	frmPhieuxetnghiem_All	Mô bệnh học
23	Giải phẫu bệnh - Tế bào	frmPhieuxetnghiem_All	Tế bào học
24	Cell Block	frmPhieuxetnghiem_All	Xét nghiệm Cell Block
25	Hòa hợp miễn dịch	frmPhieuxetnghiem_All	Truyền máu
5.2. Module In mã vạch
•	Form: frmInmavachlm.ts
•	Quy trình:
1.	Chọn loại mã vạch (từ dmxn_inmavach)
2.	Chọn khoảng số (Từ - Đến)
3.	Chọn ngày
4.	Kiểm tra trùng lặp (lịch sử in xn_inmavach)
5.	Tạo mã vạch (getBarcodeLimilabs())
6.	In qua Crystal Reports hoặc ZPL
5.3. Module Quản lý người dùng
•	Form: frmQuanlyuser.ts, frmNewuser.ts
•	Chức năng:
–	Tạo/sửa/xóa tài khoản người dùng
–	Gán người dùng vào nhóm
–	Phân quyền menu (TreeView checkboxes)
–	Phân quyền chi tiết 6 cấp (Thêm/Xóa/Sửa/Xem/In/Export)
–	Ràng buộc cơ sở, khu, sổ, máy
–	Sao chép quyền giữa người dùng (f_copy_phanquyen())
–	Mã hóa mật khẩu (tùy chọn bMahoamatkhau)
5.4. Module Khám sức khỏe
•	Menu: mnKSK
•	Form: frmDangkydoan.ts, frmChidinhKSK.ts
•	Chức năng:
–	Đăng ký đoàn khám sức khỏe
–	Chỉ định hàng loạt cho đoàn
–	Báo cáo kết quả đoàn
5.5. Module Máu (Ngân hàng máu)
•	Menu: mnumau
•	Chức năng:
–	Phát mẫu máu
–	Tiếp nhận hiến máu
–	Quản lý truyền máu
–	Kiểm tra hòa hợp
6. HỆ THỐNG BÁO CÁO
6.1. Các loại báo cáo
Nhóm	Báo cáo	Phương thức dữ liệu
Hoạt động	Hoạt động xét nghiệm theo ngày/tháng	f_get_danhsach_thuchien()
Thống kê BN	Thống kê XN theo bệnh nhân	get_data_bc()
Thống kê hàng ngày	Số ca XN hàng ngày	get_data_bc()
Khoa phòng	Thống kê theo khoa chỉ định	f_get_danhsach_chidinh()
Chỉ định	Thống kê chỉ định XN	f_get_danhsach_chidinh()
Doanh thu	Tổng hợp doanh thu	get_vienphi_ketqua()
Hóa chất	Sử dụng hóa chất/hóa chất	get_data_bc()
HIV/HBsAg	Thống kê sàng lọc	get_data_bc()
HPV	Thống kê HPV	get_data_bc()
Tổng hợp	Báo cáo tổng hợp đa tiêu chí	get_data_nam()
BHYT	Danh sách BHYT	get_data_mmyy()
6.2. Cơ chế báo cáo
•	Template: Crystal Reports (.rpt.xml) trong thư mục Dataxml/
•	Cây báo cáo: f_get_xn_treebaocao() → cấu trúc cha-con
•	Truy vấn liên tháng: Tự động gộp dữ liệu từ nhiều schema MMYY
•	Xuất ra: Màn hình / In giấy / PDF / Excel / LCD
________________________________________
7. CẤU TRÚC MENU HỆ THỐNG
Menu chính (frmMain.cs)
╔═══════════════════════════════════════════════════════════════════╗
║ 1.Cập nhật │ 2.KSK │ 3.Máu │ 4.LCD │ 5.Báo cáo │ 6.Tiện ích  ║
╚═══════════════════════════════════════════════════════════════════╝
1. Cập nhật (mnCapnhat) — Nhập liệu nghiệp vụ
├── 1.01 Tiếp nhận bệnh nhân
├── 1.02 Lấy mẫu bệnh phẩm
├── 1.03 Nhận mẫu
├── 1.04 Phiếu kết quả xét nghiệm          → frmPhieuketqua
├── 1.05 Phiếu kết quả vi sinh
├── 1.06 Phiếu kháng sinh đồ
├── 1.07 Phiếu XN cổ tử cung               → frmPhieuxetnghiem_All
├── 1.08 Phiếu XN tế bào                    → frmPhieuxetnghiem_All
├── 1.09 Phiếu XN tinh dịch đồ
├── 1.10 Phiếu XN sinh học phân tử          → frmPhieuxetnghiem_All
├── 1.11 Phiếu XN dịch
├── 1.12 Phiếu XN đờm
├── 1.13 Phiếu XN huyết trắng
├── 1.14 Phiếu XN tế bào (Mẫu 2)
├── 1.15 Phiếu XN Triple Test
├── 1.16 Phiếu XN huyết - tủy đồ
├── 1.17 Phiếu XN XPERT MTB/RIF
├── 1.18 Phiếu XN lao kháng thuốc
├── 1.19 Phiếu XN kháng sinh đồ lao
├── 1.20 Phiếu XN nuôi cấy VK lao
├── 1.21 Phiếu XN tiền sản giật
├── 1.22 Phiếu KQ lọc rửa tinh trùng (IUI)
├── 1.23 Phiếu tinh dịch đồ
└── 1.24 Phiếu giải phẫu bệnh - tế bào
    ├── Mô bệnh học
    ├── Tế bào học
    ├── Lạnh
    ├── Cell Block
    └── Cổ tử cung (PAP / Smear)
2. Khám sức khỏe (mnKSK)
├── 2.01 Đăng ký đoàn
└── 2.02 Chỉ định KSK
3. Máu (mnumau) — Ngân hàng máu
├── 3.01 Phát mẫu
├── 3.02 Hiến mẫu
└── 3.03 Truyền mẫu
4. LCD (mnuLCD) — Hiển thị LCD
├── 4.01 Xuất LCD
├── 4.02 Bàn XN LCD
└── 4.03 Theo dõi mẫu
5. Báo cáo (mnuBaocao) — Thống kê & Báo cáo
├── 5.01 Hoạt động xét nghiệm
├── 5.02 Thống kê XN theo BN
├── 5.03 Thống kê XN hàng ngày
├── 5.04 Thống kê khoa phòng
├── 5.05 Thống kê chỉ định
├── 5.06 Báo cáo phát mẫu
├── 5.07 Thống kê chuyên môn
├── 5.08 Thống kê KSĐ
├── 5.09 Thống kê AFP
├── 5.10 Báo cáo tổng hợp
├── 5.11 Thống kê kết quả
├── 5.12 Thống kê số ca
├── 5.13 Thống kê bệnh nhân
└── 5.14 Tổng hợp
    ├── Danh sách
    ├── Danh sách BHYT
    ├── Danh sách hẹn
    ├── Tổng hợp số ca
    ├── Tổng hợp doanh thu
    ├── Xét nghiệm gửi
    ├── Nội trú
    ├── TH số ca đối tượng
    ├── TH số ca xét nghiệm
    └── TH hóa chất sử dụng
6. Tiện ích (mnTienich) — Danh mục & Cấu hình
├── 6.01 Danh mục
│   ├── Số XN                               → frmXetnghiem_bv
│   ├── Xét nghiệm                          → frmXetnghiem
│   ├── Máy xét nghiệm                      → frmXetnghiem_bv
│   ├── Đơn vị đo                           → frmDonvido
│   ├── Đơn vị HL7                          → frmDonvido_hl7
│   ├── Vị trí                              → frmVitrung
│   ├── Kháng sinh                          → frmKhangsinh
│   ├── Khai báo khoa phòng LIS
│   └── Khai báo mã bác sỹ LIS
├── 6.02 Khai báo sử dụng
│   ├── Số xét nghiệm                       → frmXetnghiem_bv
│   ├── Bộ kháng sinh                       → frmVitrung_bv
│   ├── Hóa chất                            → frmHoachat_bv
│   ├── Địa điểm lấy mẫu                   → frmDiadiem
│   ├── Định mức hóa chất theo máy
│   ├── Đơn vị mẫu / Nhóm mẫu / Loại mẫu
│   ├── Đối tượng / Phương thức
│   ├── Địa điểm / Nơi gửi / Nơi lấy mẫu
│   ├── Gói xét nghiệm                     → frmGoixn
│   ├── Bệnh phẩm / Nhóm KP
│   ├── Vị trí Vitek / Kháng sinh Vitek
│   ├── Hóa chất (quản lý)
│   ├── Y lệnh
│   ├── Tìm bệnh nhân                      → frmTimbenhnhan
│   ├── In mã vạch                          → frmInmavachlm
│   └── In kết quả xét nghiệm
├── 6.03 Cấu hình hệ thống                  → frmConfig
└── 6.04 Tùy chọn                           → frmOption
7. Window (mnCuaso)
└── Quản lý cửa sổ MDI
8. Trợ giúp (mnHuongdan)
├── 8.01 Hướng dẫn sử dụng
└── 8.02 Về chương trình                    → frmAbout
________________________________________
8. CƠ SỞ DỮ LIỆU
8.1. Bảng danh mục (Master Data — Schema gốc hsoft)
Bảng	Mô tả
xn_bv_so	Sổ xét nghiệm (nhóm lớn)
xn_bv_ten	Tên xét nghiệm trong sổ
xn_bv_chitiet	Thông số chi tiết của XN
xn_mauthu	Loại mẫu thử (máu, nước tiểu…)
xn_vitri	Vị trí ống / ống mẫu
xn_diadiem	Địa điểm lấy mẫu
xn_donvi	Đơn vị đo lường
xn_may	Danh mục máy xét nghiệm
xn_thongsomay	Thông số ánh xạ máy ↔ hệ thống
xn_khangsinh	Danh mục kháng sinh
xn_tinhtrang	Tình trạng mẫu
xn_viettat	Viết tắt kết quả
xn_hoachat	Danh mục hóa chất
xn_goixn	Gói xét nghiệm
xn_dlogin	Tài khoản người dùng
xn_nhomdlogin	Nhóm người dùng
xn_phanquyen	Phân quyền cá nhân
xn_phanquyennhom	Phân quyền nhóm
xn_license	Thông tin bản quyền
xn_option	Tùy chọn hệ thống
xn_error	Nhật ký lỗi
xn_inmavach	Lịch sử in mã vạch
hanhchanh	Hành chính bệnh nhân
btdbn	Bệnh nhân (master)
dmphai	Danh mục giới tính
dmcomputer	Danh mục máy tính/phiên bản
thongso	Thông số hệ thống
8.2. Bảng giao dịch (Transactional — Schema phân vùng hsoftMMYY)
Bảng	Mô tả
xn_laymau	Phiếu lấy mẫu
xn_phieu	Phiếu xét nghiệm chính
xn_phieu_ct	Chi tiết phiếu XN
xn_ketqua	Kết quả xét nghiệm
xn_ketqua_ksd	Kết quả kháng sinh đồ
xn_ketqua_sua	Kết quả đã sửa (lưu vết)
xn_chidinh	Phiếu chỉ định
xn_chidinh_ct	Chi tiết chỉ định
xn_phieu_shpt	Phiếu sinh học phân tử
xn_phieu_tebao	Phiếu tế bào học
xn_phieu_tinhdich	Phiếu tinh dịch đồ
xn_phieu_hoahopmiendich	Phiếu hòa hợp miễn dịch
xn_phieu_donvtd	Phiếu đơn vị truyền
xn_phieu_ktv	Phân công kỹ thuật viên
xn_phieu_huyetdo	Phiếu huyết đồ
xn_phieu_tuydo	Phiếu tủy đồ
xn_phieu_xpert	Phiếu XPERT MTB/RIF
xn_phieu_lao_ksd	Phiếu lao KSĐ
xn_gram_vt	Kết quả nhuộm Gram
xn_so	Sổ xét nghiệm (giao dịch)
xn_vienphi	Viện phí xét nghiệm
imageMMYY	Hình ảnh kết quả (schema riêng)
8.3. Mô hình quan hệ chính
hanhchanh (Bệnh nhân)
    │
    ├──1:N──▶ xn_chidinh (Chỉ định XN)
    │             │
    │             └──1:N──▶ xn_chidinh_ct (Chi tiết chỉ định)
    │
    ├──1:N──▶ xn_laymau (Lấy mẫu)
    │             │
    │             ├── → xn_mauthu (Loại mẫu)
    │             ├── → xn_tinhtrang (Tình trạng)
    │             ├── → xn_diadiem (Địa điểm)
    │             └── → xn_vitri (Vị trí)
    │
    └──1:N──▶ xn_phieu (Phiếu XN)
                  │
                  ├──1:N──▶ xn_phieu_ct (Chi tiết phiếu)
                  │
                  ├──1:N──▶ xn_ketqua (Kết quả)
                  │             │
                  │             ├── → xn_bv_ten (Tên XN)
                  │             └── → xn_donvi (Đơn vị)
                  │
                  ├──1:N──▶ xn_ketqua_ksd (KQ kháng sinh đồ)
                  │             │
                  │             └── → xn_khangsinh (Kháng sinh)
                  │
                  ├──1:1──▶ xn_phieu_shpt (Sinh học PT)
                  ├──1:1──▶ xn_phieu_tebao (Tế bào)
                  ├──1:1──▶ xn_phieu_tinhdich (Tinh dịch)
                  └──1:1──▶ xn_vienphi (Viện phí)

xn_bv_so (Sổ XN)
    │
    └──1:N──▶ xn_bv_ten (Tên XN)
                  │
                  └──1:N──▶ xn_bv_chitiet (Thông số)
                                │
                                └── → xn_thongsomay (Ánh xạ máy)

xn_dlogin (Người dùng)
    │
    ├── → xn_nhomdlogin (Nhóm)
    └──1:N──▶ xn_phanquyen (Quyền)
________________________________________
PHỤ LỤC: THƯ VIỆN BÊN NGOÀI
Thư viện	Mục đích
Oracle.ManagedDataAccess	Kết nối Oracle Database
CrystalDecisions.*	Tạo báo cáo Crystal Reports
iTextSharp	Tạo/đọc PDF
Aspose.PDF	Xử lý PDF nâng cao
Spire.Pdf	Xử lý PDF
VGCA.PdfViewer	Xem PDF (ký số)
RestSharp	HTTP client (API)
AWSSDK.Core	Tích hợp AWS
Newtonsoft.Json	Xử lý JSON
DevComponents.DotNetBar2	UI components nâng cao
SkiaSharp	Xử lý hình ảnh
AForge	Xử lý hình ảnh
Microsoft.Office.Interop.Excel	Xuất Excel
Bnn.SignLib / SignClient	Chữ ký số PKI

