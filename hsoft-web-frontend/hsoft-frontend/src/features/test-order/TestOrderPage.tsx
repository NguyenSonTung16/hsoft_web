import "./TestOrderPage.css";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";


interface PatientInfo {
  maBn: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  soDienThoai?: string;
  soTheBHYT?: string;
  doiTuong?: string;
  diaChi?: string;
}

interface TestOrderInfo {
  doctorId: string;
  departmentId: string;
  icdCode: string;
  note: string;
}

interface TestServiceRow {
  serviceCode: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
}

export function TestOrderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const maBn = searchParams.get("maBn") || "";


  // State for patient info
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  // State for test order info
  const [orderInfo, setOrderInfo] = useState<TestOrderInfo>({
    doctorId: "",
    departmentId: "",
    icdCode: "",
    note: "",
  });

  // State for test services
  const [services, setServices] = useState<TestServiceRow[]>([]);

  // TODO: Replace with real API call
  useEffect(() => {
    if (!maBn) return;
    setLoading(true);
    setTimeout(() => {
      // Fake data for demo
      setPatient({
        maBn,
        hoTen: "Nguyen Van A",
        ngaySinh: "1990-01-01",
        gioiTinh: "Nam",
        soDienThoai: "090xxxxxxx",
        soTheBHYT: "DN4010123456789",
        doiTuong: "BHYT",
        diaChi: "123 Đường A, Quận B, TP.C"
      });
      setLoading(false);
    }, 500);
  }, [maBn]);

  // Demo: fake doctor/department/icd options
  const doctorOptions = [
    { id: "doc1", name: "BS. Nguyễn Văn B" },
    { id: "doc2", name: "BS. Trần Thị C" },
  ];
  const departmentOptions = [
    { id: "dep1", name: "Khoa Nội" },
    { id: "dep2", name: "Khoa Xét nghiệm" },
  ];
  const icdOptions = [
    { code: "A00", name: "Tả" },
    { code: "B01", name: "Thủy đậu" },
  ];

  // Demo: add/remove service rows
  const addService = () => {
    setServices((prev) => [
      ...prev,
      { serviceCode: "", serviceName: "", quantity: 1, unitPrice: 0 }
    ]);
  };
  const removeService = (idx: number) => {
    setServices((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateService = (idx: number, field: keyof TestServiceRow, value: any) => {
    setServices((prev) => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const totalRows = services.length;
  const totalQuantity = services.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
  const totalAmount = services.reduce((sum, s) => sum + (Number(s.quantity) * Number(s.unitPrice) || 0), 0);

  return (
    <section className="test-order-page">
      <header className="test-order-header">
        <h1>CHỈ ĐỊNH XÉT NGHIỆM</h1>
        <button type="button" className="test-order-back" onClick={() => navigate("/main-screen")}>Về trang chủ</button>
      </header>

      <form className="test-order-form">
        {/* Patient Info */}
        <fieldset className="test-order-patient-info" disabled>
          <legend>THÔNG TIN HÀNH CHÍNH BN</legend>
          {loading ? <p>Đang tải thông tin bệnh nhân...</p> : error ? <p className="error">{error}</p> : patient && (
            <div className="patient-info-grid">
              <div><b>Mã BN:</b> {patient.maBn}</div>
              <div><b>Họ tên:</b> {patient.hoTen}</div>
              <div><b>Ngày sinh:</b> {patient.ngaySinh}</div>
              <div><b>Giới tính:</b> {patient.gioiTinh}</div>
              <div><b>SĐT:</b> {patient.soDienThoai}</div>
              <div><b>BHYT:</b> {patient.soTheBHYT}</div>
              <div><b>Đối tượng:</b> {patient.doiTuong}</div>
              <div><b>Địa chỉ:</b> {patient.diaChi}</div>
            </div>
          )}
        </fieldset>

        {/* Thông tin chỉ định */}
        <fieldset className="test-order-info">
          <legend>THÔNG TIN CHỈ ĐỊNH</legend>
          <div className="test-order-info-grid">
            <label>
              Bác sĩ chỉ định*
              <select
                value={orderInfo.doctorId}
                onChange={e => setOrderInfo(o => ({ ...o, doctorId: e.target.value }))}
                required
              >
                <option value="">Chọn bác sĩ</option>
                {doctorOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </label>
            <label>
              Khoa phòng*
              <select
                value={orderInfo.departmentId}
                onChange={e => setOrderInfo(o => ({ ...o, departmentId: e.target.value }))}
                required
              >
                <option value="">Chọn khoa phòng</option>
                {departmentOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </label>
            <label>
              Chẩn đoán ICD*
              <input
                list="icd-list"
                value={orderInfo.icdCode}
                onChange={e => setOrderInfo(o => ({ ...o, icdCode: e.target.value }))}
                required
                placeholder="Nhập mã hoặc tên ICD"
              />
              <datalist id="icd-list">
                {icdOptions.map(opt => (
                  <option key={opt.code} value={opt.code}>{opt.name}</option>
                ))}
              </datalist>
            </label>
            <label className="test-order-note">
              Ghi chú chỉ định
              <textarea
                rows={2}
                value={orderInfo.note}
                onChange={e => setOrderInfo(o => ({ ...o, note: e.target.value }))}
                placeholder="Ghi chú thêm (nếu có)"
              />
            </label>
          </div>
        </fieldset>

        {/* Dịch vụ xét nghiệm */}
        <fieldset className="test-order-services">
          <legend>DỊCH VỤ XÉT NGHIỆM</legend>
          <div className="test-order-service-actions">
            <button type="button" onClick={addService}>Thêm dòng dịch vụ</button>
            {/* TODO: Thêm từ danh mục, từ gói, xóa tất cả */}
          </div>
          <div className="test-order-service-table-wrap">
            <table className="test-order-service-table">
              <thead>
                <tr>
                  <th>Mã DV</th>
                  <th>Tên xét nghiệm</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {services.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        value={row.serviceCode}
                        onChange={e => updateService(idx, "serviceCode", e.target.value)}
                        placeholder="Mã DV"
                      />
                    </td>
                    <td>
                      <input
                        value={row.serviceName}
                        onChange={e => updateService(idx, "serviceName", e.target.value)}
                        placeholder="Tên xét nghiệm"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={e => updateService(idx, "quantity", Number(e.target.value))}
                        style={{ width: 60 }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        value={row.unitPrice}
                        onChange={e => updateService(idx, "unitPrice", Number(e.target.value))}
                        style={{ width: 90 }}
                      />
                    </td>
                    <td>{(Number(row.quantity) * Number(row.unitPrice)).toLocaleString()}</td>
                    <td>
                      <button type="button" onClick={() => removeService(idx)}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="test-order-service-summary">
            <span>Tổng dòng: {totalRows}</span>
            <span>Tổng số lượng: {totalQuantity}</span>
            <span style={{ marginLeft: 16 }}>Tổng tiền: <b>{totalAmount.toLocaleString()} VND</b></span>
          </div>
        </fieldset>

        {/* TODO: Nút lưu phiếu, lưu & in, hủy */}
      </form>
    </section>
  );
}
