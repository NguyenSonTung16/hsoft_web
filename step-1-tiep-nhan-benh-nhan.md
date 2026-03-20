MODULE: TIẾP NHẬN BỆNH NHÂN (PATIENT RECEPTION)
**Bối cảnh:** Đây là phân hệ chức năng "Tiếp nhận bệnh nhân" thuộc hệ thống Phần mềm Quản lý Xét nghiệm (LIS). Hãy đóng vai trò là một lập trình viên Fullstack / Frontend / Backend (tùy theo framework dự án đang dùng) để thiết kế giao diện và viết logic xử lý dựa trên các đặc tả chi tiết dưới đây.

---

## 1. Cấu trúc giao diện (UI Components)
Giao diện cần được chia thành các phân vùng chính sau:

*   **Vùng Thông tin hành chính (Administrative Info):** Bao gồm các input fields: Mã BN, Họ và tên, Giới tính, Năm sinh, Địa chỉ (Tỉnh/TP, Quận/Huyện, Phường/Xã), Số nhà, và Nơi làm việc.
*   **Vùng Thông tin lấy mẫu (Sampling Info):** Bao gồm các input fields: Khoa/Phòng, Đối tượng (BHYT, Viện phí, v.v.), Số thẻ BHYT, Từ (Valid from), Đến (Valid to), Nơi ĐKKCB, Bác sỹ chỉ định, Chẩn đoán, Số biên lai, Ngày, và Số thứ tự (STT) lấy mẫu.
*   **Vùng Danh sách xét nghiệm (Test Indications):**
    *   Hiển thị Grid/Table các xét nghiệm đã được chỉ định (Cột: STT, Mã số, Tên xét nghiệm).
    *   Phía trên danh sách cần có text/label đếm "Tổng xét nghiệm" và một input/spinner cho "Số barcode".
*   **Vùng Danh sách các lần lấy mẫu:** Hiển thị lịch sử hoặc các gói xét nghiệm của các lần lấy mẫu trước đó.
*   **Cửa sổ Modal/Form "Chọn xét nghiệm" (Mở ra khi chọn "Liệt kê"):**
    *   *Nửa trên:* Cây thư mục (Tree/List) phân loại xét nghiệm theo nhóm (Huyết học, Sinh hóa, Miễn dịch...) và danh sách chi tiết các xét nghiệm tương ứng kèm ô Checkbox để tick chọn.
    *   *Nửa dưới:* Bảng phụ chứa danh sách các xét nghiệm ĐÃ ĐƯỢC TICK CHỌN.
    *   *Footer:* Có dòng đếm "Tổng số" xét nghiệm đã chọn, cùng 2 nút: "Chọn" và "Bỏ qua".

## 2. Các chức năng hệ thống (Functions)
Cần cung cấp các thao tác thông qua các Button (Nút bấm) trên màn hình:

*   **Quản lý Form (CRUD):** Các nút Thêm mới (Mới), Lưu (Lưu), Sửa, Hủy, và Bỏ qua.
*   **Sinh mã tự động:** Lắng nghe sự kiện (event listener) tại ô `Mã BN`. Khi người dùng nhấn phím `Enter` tại trường này, gọi hàm tự động cấp mã bệnh nhân mới.
*   **Quản lý chỉ định xét nghiệm:**
    *   Nút `Liệt kê`: Mở Modal "Chọn xét nghiệm".
    *   Nút `Thêm`: Đưa các xét nghiệm đã chọn vào danh sách của bệnh nhân.
    *   Nút `Xóa`: Bỏ chỉ định xét nghiệm đang được select trong Grid.
*   **Tiện ích In ấn & Xem danh sách:** Các nút `In mã vạch`, `In DS lấy mẫu`, `DS chỉ định` (Mở popup xem danh sách bệnh nhân đã được chỉ định), và nút `Kết thúc` (Đóng form hiện tại).

## 3. Quản lý trạng thái Form (Form State)
Hệ thống cần quản lý trạng thái vô hiệu hóa (Disabled/Enabled) của các thành phần dựa theo hành vi:
*   **Trạng thái View (Bình thường):** Khóa (Disable) các trường nhập liệu. Khóa nút "Lưu", "Bỏ qua". Mở (Enable) nút "Mới", "Sửa", "Kết thúc".
*   **Trạng thái Add/Edit (Thêm mới/Sửa):** Mở khóa toàn bộ trường nhập liệu. Mở nút "Lưu", "Bỏ qua". Khóa nút "Mới", "Sửa".

## 4. Ràng buộc dữ liệu (Data Validation & Business Rules)
Viết logic validation trước khi gọi API Submit (Lưu):
*   Nếu là **bệnh nhân mới**, bắt buộc nhập các trường thông tin hành chính cơ bản (Mã BN, Họ tên, Giới tính, Năm sinh).
*   Trường **Khoa/Phòng** là trường bắt buộc (Required).
*   **Logic phụ thuộc (Dependent Validation):** Lắng nghe sự thay đổi của dropdown **Đối tượng**. Nếu Value = "BHYT", chuyển trường **Số thẻ BHYT** thành bắt buộc (Required).

## 5. Quy trình làm việc chính (Main Workflow - Bệnh nhân mới)
Viết luồng xử lý (event flows) theo các bước:
1. Nhấn nút "Mới" -> Chuyển form sang trạng thái Add.
2. Focus vào ô Mã BN -> Nhấn Enter -> Hệ thống cấp mã BN mới.
3. Nhập dữ liệu vào vùng Hành chính và vùng Thông tin lấy mẫu (Validate quy tắc BHYT ở bước này).
4. Nhấn "Liệt kê" -> Mở Modal Chọn xét nghiệm -> Check vào các ô vuông của xét nghiệm cần làm -> Nhấn "Chọn" (đóng modal) -> Nhấn "Thêm" để load vào Grid danh sách.
5. Nhập "STT" lấy mẫu.
6. Nhấn nút "Lưu" -> Validate dữ liệu -> Gọi API Lưu -> Trả form về trạng thái View.

## 6. Các luồng quy trình thay thế (Alternative Flows)
*   **Bệnh nhân cũ (Existing Patient):** Ở bước 2, thay vì Enter cấp mã mới, người dùng nhập Mã BN cũ -> Gọi API fetch dữ liệu -> Auto-fill vùng Thông tin hành chính -> Cho phép người dùng nhảy thẳng đến bước chọn xét nghiệm.
*   **Hủy chỉ định thao tác sai:** Người dùng chọn một row trên Grid danh sách xét nghiệm, nhấn "Xóa" để gỡ item đó khỏi state trước khi bấm "Lưu".
*   **Tiện ích sau khi Lưu:** Sau khi hàm Lưu (Save) thực thi thành công, tùy thuộc người dùng click, hệ thống trigger các function in ấn (gọi hàm xuất template In mã vạch hoặc In Danh sách lấy mẫu).

**Yêu cầu đầu ra đối với AI:**
Hãy phân tích đặc tả trên và tiến hành khởi tạo cấu trúc code (Bao gồm file giao diện