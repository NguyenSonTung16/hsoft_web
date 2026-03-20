/**
 * GraphQL contract for backend `createPatient`.
 * NOTE: Backend hiện chỉ hỗ trợ tập field hành chính tối thiểu,
 * nên UI form sẽ "map" các field mới sang các field backend đang có (ví dụ `diaChi`).
 */
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

export interface CreatePatientMutationData {
  createPatient: CreatePatientResult;
}

export type PatientIntakeMode = "View" | "Add" | "Edit";

export type GenderCode = "nam" | "nu" | "khac" | "";
export type PatientTypeCode = "ngoaitru" | "noitru" | "";
export type PatientCoverageCode = "bhyt" | "vienphi" | "mienphi" | "";

export interface PatientAdministrativeFormValues {
  maBn: string;
  hoTen: string;
  gioiTinh: GenderCode;
  ngaySinh: string;
  soDienThoai: string;

  // Task 1: address split into 4 fields + work place
	// Names
	tinhTp: string;
  quanHuyen: string;
  phuongXa: string;
  soNha: string;
  noiLamViec: string;
	// Codes (UI-only hiện tại; backend hiện lưu vào `diaChi` dạng text)
	maTinhTp: string;
	maQuanHuyen: string;
	maPhuongXa: string;

  // Task 2: sampling/ordering administrative
	// Names
	khoaPhong: string;
  doiTuong: PatientCoverageCode;
  loaiBenhNhan: PatientTypeCode;
	// Codes (UI-only)
	maKhoaPhong: string;

  // BHYT dependent fields
  soTheBHYT: string;
  tuNgayBHYT: string;
  denNgayBHYT: string;
	noiDkkcb: string;
	maDkkcb: string;

  // Referral/diagnosis
  bacSiChiDinh: string;
	maBacSiChiDinh: string;
  chanDoan: string;

  // Receipt + collection indexing
  soBienLai: string;
  ngayLayMau: string;
  sttLayMau: string;
}

export type FieldErrors<T> = {
  [K in keyof T]?: string;
};

export interface OrderedTestItem {
  id: string;
  maSo: string;
  tenXetNghiem: string;
}

export interface PendingTestItem {
  id: string;
  maSo: string;
  tenXetNghiem: string;
}

export interface SampleHistoryItem {
  ngayGio: string;
  loaiMau: string;
  kyThuatVien: string;
  tinhTrang: string;
  ghiChu?: string;
}

export interface PatientIntakeFormState extends PatientAdministrativeFormValues {
  mode: PatientIntakeMode;
  errors: FieldErrors<PatientAdministrativeFormValues>;

  // Task 3: tests grid + selection modal buffer
  orderedTests: OrderedTestItem[];
  pendingTests: PendingTestItem[];
  selectedOrderedTestId?: string;

  // Task 3: barcode input/spinner
  soBarcode: number;

  // Task 3: sample history panel
  sampleHistory: SampleHistoryItem[];
}

export interface PatientIntakeSubmitState {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  created?: CreatePatientResult;
}

export interface TestCatalogNode {
  id: string;
  tenNhom: string;
  children: TestCatalogItem[];
}

export interface TestCatalogItem {
  id: string;
  maSo: string;
  tenXetNghiem: string;
  nhomId: string;
}