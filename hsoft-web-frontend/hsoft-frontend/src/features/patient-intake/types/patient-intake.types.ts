export interface CreatePatientInput {
  maBn?: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  diaChi?: string;
  soDienThoai?: string;
  soTheBHYT?: string;
  loaiBenhNhan: string;
  doiTuong: string;
}

export interface CreatePatientResult {
  patientId: string;
  maBn: string;
  createdAt: string;
}

export interface CreatePatientMutation {
  input: CreatePatientInput;
}