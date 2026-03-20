import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientInfoCard from './components/PatientInfoCard';
import TreatmentSelect from './components/TreatmentSelect';
import SampleHistoryPanel from './components/SampleHistoryPanel';
import SampleForm from './components/SampleForm';
import BarcodePrintDialog from './components/BarcodePrintDialog';
import type { PatientInfo, SampleFormData } from './types/sample-collection.types';
import { mockTreatments, mockSampleHistory } from './mockdata';
import './styles/SampleCollectionPage.css';

const mockPatient: PatientInfo = {
  maBn: 'BN001', hoTen: 'Nguyễn Văn A', ngaySinh: '1980-01-01', gioiTinh: 'Nam', diaChi: 'Hà Nội', soTheBHYT: '123456789', loaiBn: 'Nội trú', doiTuong: 'BHYT'
};
const loaiMauOptions = [ { value: 'mau', label: 'Máu' }, { value: 'nuoc_tieu', label: 'Nước tiểu' } ];
const kyThuatVienOptions = [ { value: 'ktv1', label: 'KTV1' }, { value: 'ktv2', label: 'KTV2' } ];
const viTriOptions = [ { value: 'tay_trai', label: 'Tay trái' }, { value: 'tay_phai', label: 'Tay phải' } ];
const diaDiemOptions = [ { value: 'phong_1', label: 'Phòng 1' }, { value: 'phong_2', label: 'Phòng 2' } ];
const tinhTrangOptions = [ { value: 'binh_thuong', label: 'Bình thường' }, { value: 'dong', label: 'Đông' } ];

const initialForm: SampleFormData = {
  ngayGioLayMau: '',
  loaiMau: '',
  kyThuatVien: '',
  viTriLayMau: '',
  diaDiemLayMau: '',
  tinhTrangMau: '',
  ghiChu: '',
  orderIds: []
};

const SampleCollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [treatments, setTreatments] = useState(mockTreatments);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState(mockTreatments[0]?.id || '');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [form, setForm] = useState<SampleFormData>(initialForm);
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto focus search input on mount and when patient is cleared
  useEffect(() => { searchInputRef.current?.focus(); }, []);
  useEffect(() => { if (!patient) searchInputRef.current?.focus(); }, [patient]);
  useEffect(() => {
    if (!search) {
      setPatient(null);
      setSelectedOrderIds([]);
      setForm(initialForm);
      setError(null);
    }
  }, [search]);

  // Mock search handler (replace with f_Load_Landieutri, f_Load_Lanlaymau)
  const handleSearch = () => {
    if (!search.trim()) {
      setError('Vui lòng nhập mã BN, tên hoặc SĐT.');
      return;
    }
    // TODO: Call API f_Load_Landieutri, f_Load_Lanlaymau
    setTreatments(mockTreatments);
    setSelectedTreatmentId(mockTreatments[0]?.id || '');
    if (search.trim() === 'BN001') {
      setPatient(mockPatient);
      setSelectedOrderIds([]);
      setForm({ ...initialForm, ngayGioLayMau: new Date().toISOString().slice(0,16) });
      setError(null);
    } else {
      setError('Không tìm thấy bệnh nhân.');
      setPatient(null);
      setSelectedOrderIds([]);
      setForm(initialForm);
    }
  };

  // Form field change
  const handleFormChange = (field: keyof SampleFormData, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  // Save handler (butLuu_Click, upd_xn_laymau)
  const handleSave = () => {
    // Validate required fields
    if (!form.ngayGioLayMau || !form.loaiMau || !form.kyThuatVien || !form.viTriLayMau || !form.diaDiemLayMau || !form.tinhTrangMau || selectedOrderIds.length === 0) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc và chọn ít nhất một xét nghiệm.');
      return;
    }
    // TODO: Call API butLuu_Click, upd_xn_laymau
    setBarcodeDialogOpen(true);
    setError(null);
  };

  // Print handler
  const handlePrint = () => {
    setBarcodeDialogOpen(false);
    // TODO: Call print API
  };

  // Keyboard/UX: Enter to search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="sample-collection-page">
      <button
        className="back-circle-btn"
        onClick={() => navigate('/main-screen')}
        aria-label="Quay lại"
      >
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="22" r="22" fill="#2563eb"/>
          <path d="M27 14L17 22L27 30" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <h2 style={{marginLeft: 48}}>Lấy mẫu bệnh phẩm</h2>
      <div className="search-section">
        <input
          type="text"
          placeholder="Nhập mã BN, tên hoặc SĐT"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          ref={searchInputRef}
          autoFocus
        />
        <button onClick={handleSearch}>Tìm kiếm</button>
      </div>
      {error && <div style={{color:'#e11d48',marginBottom:8}}>{error}</div>}
      {search && (
        <>
          <div className="info-history-row">
            <div className="info-col">
              <PatientInfoCard patient={patient} />
              <TreatmentSelect
                treatments={treatments}
                selectedId={selectedTreatmentId}
                onSelect={setSelectedTreatmentId}
              />
            </div>
            <div className="history-col">
              <SampleHistoryPanel history={mockSampleHistory} />
            </div>
          </div>
          <h3 className="sample-section-title">Thông tin mẫu</h3>
          <div className="sample-form-row">
            <SampleForm
              form={form}
              onChange={handleFormChange}
              loaiMauOptions={loaiMauOptions}
              kyThuatVienOptions={kyThuatVienOptions}
              viTriOptions={viTriOptions}
              diaDiemOptions={diaDiemOptions}
              tinhTrangOptions={tinhTrangOptions}
            />
          </div>
          <div className="action-row">
            <button onClick={handleSave}>Lưu phiếu</button>
            <button onClick={() => setBarcodeDialogOpen(true)} disabled={selectedOrderIds.length === 0}>In mã vạch</button>
          </div>
          <BarcodePrintDialog
            open={barcodeDialogOpen}
            onClose={() => setBarcodeDialogOpen(false)}
            onPrint={handlePrint}
            maBn={patient ? patient.maBn : ''}
            soLuong={selectedOrderIds.length}
          />
        </>
      )}
    </div>
  );
};

export default SampleCollectionPage;
