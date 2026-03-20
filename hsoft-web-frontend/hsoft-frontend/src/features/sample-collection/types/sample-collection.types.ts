export interface PatientInfo {
  maBn: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  diaChi: string;
  soTheBHYT: string;
  loaiBn: string;
  doiTuong: string;
}

export interface SampleHistory {
  ngayGio: string;
  loaiMau: string;
  kyThuatVien: string;
  tinhTrang: string;
  ghiChu?: string;
}

export interface OrderItem {
  id: string;
  tenXetNghiem: string;
  soLuong: number;
  donGia: number;
  daLayMau: boolean;
}

export interface SampleFormData {
  ngayGioLayMau: string;
  loaiMau: string;
  kyThuatVien: string;
  viTriLayMau: string;
  diaDiemLayMau: string;
  tinhTrangMau: string;
  ghiChu?: string;
  orderIds: string[];
}
