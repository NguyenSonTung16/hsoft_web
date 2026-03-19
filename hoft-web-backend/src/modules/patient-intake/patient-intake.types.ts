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

/**
 * Dữ liệu sau khi service đã normalize + đảm bảo có maBn.
 * Đây là input repository dùng để insert transaction.
 */
export interface CreatePatientRepositoryInput {
  maBn: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  diaChi?: string;
  soDienThoai?: string;
  soTheBHYT?: string;
  loaiBenhNhan: string;
  doiTuong: string;
  createdAt: string;
}

/**
 * Contract repository để service gọi.
 */
export interface CreatePatientRepositoryPort {
  createPatientTransaction(input: CreatePatientRepositoryInput): Promise<CreatePatientResult>;
}

/**
 * Args mutation cho resolver (GraphQL).
 */
export interface CreatePatientMutationArgs {
  input: CreatePatientInput;
}