import React from 'react';
import './SampleForm.css';
import type { SampleFormData } from '../types/sample-collection.types';

interface Option {
  value: string;
  label: string;
}

interface Props {
  form: SampleFormData;
  onChange: (field: keyof SampleFormData, value: any) => void;
  loaiMauOptions: Option[];
  kyThuatVienOptions: Option[];
  viTriOptions: Option[];
  diaDiemOptions: Option[];
  tinhTrangOptions: Option[];
  disabled?: boolean;
}

const SampleForm: React.FC<Props> = ({
  form, onChange,
  loaiMauOptions, kyThuatVienOptions, viTriOptions, diaDiemOptions, tinhTrangOptions, disabled
}) => {
  return (
    <div className="sample-form">
      <div className="sample-form-grid">
        <label>
          Ngày giờ lấy mẫu:
          <input
            type="date"
            value={form.ngayGioLayMau || ''}
            onChange={e => onChange('ngayGioLayMau', e.target.value)}
            disabled={disabled}
          />
        </label>
        <label>
          Loại mẫu thử:
          <select
            value={form.loaiMau}
            onChange={e => onChange('loaiMau', e.target.value)}
            disabled={disabled}
          >
            <option value="">--Chọn--</option>
            {loaiMauOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label>
          Kỹ thuật viên:
          <select
            value={form.kyThuatVien}
            onChange={e => onChange('kyThuatVien', e.target.value)}
            disabled={disabled}
          >
            <option value="">--Chọn--</option>
            {kyThuatVienOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label>
          Vị trí lấy mẫu:
          <select
            value={form.viTriLayMau}
            onChange={e => onChange('viTriLayMau', e.target.value)}
            disabled={disabled}
          >
            <option value="">--Chọn--</option>
            {viTriOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label>
          Địa điểm lấy mẫu:
          <select
            value={form.diaDiemLayMau}
            onChange={e => onChange('diaDiemLayMau', e.target.value)}
            disabled={disabled}
          >
            <option value="">--Chọn--</option>
            {diaDiemOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label>
          Tình trạng mẫu:
          <select
            value={form.tinhTrangMau}
            onChange={e => onChange('tinhTrangMau', e.target.value)}
            disabled={disabled}
          >
            <option value="">--Chọn--</option>
            {tinhTrangOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label className="sample-form-notes" style={{ gridColumn: 'span 2' }}>
          Ghi chú:
          <textarea
            value={form.ghiChu || ''}
            onChange={e => onChange('ghiChu', e.target.value)}
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
};

export default SampleForm;
