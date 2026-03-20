import type {
	SampleHistoryItem,
	TestCatalogItem,
	TestCatalogNode,
	PatientAdministrativeFormValues,
} from "./types/patient-intake.types";

export const TEST_CATALOG: TestCatalogNode[] = [
	{
		id: "nhom_huyet_hoc",
		tenNhom: "Huyết học",
		children: [
			{ id: "XN_UCT01", maSo: "UCT01", tenXetNghiem: "Công thức máu", nhomId: "nhom_huyet_hoc" },
			{ id: "XN_UCT02", maSo: "UCT02", tenXetNghiem: "HbA1c", nhomId: "nhom_huyet_hoc" },
		],
	},
	{
		id: "nhom_sinh_hoa",
		tenNhom: "Sinh hóa",
		children: [
			{ id: "XN_SINH01", maSo: "SBI01", tenXetNghiem: "Glucose", nhomId: "nhom_sinh_hoa" },
			{ id: "XN_SINH02", maSo: "SBI02", tenXetNghiem: "Ure", nhomId: "nhom_sinh_hoa" },
		],
	},
	{
		id: "nhom_xet_nghiem_khac",
		tenNhom: "Khác",
		children: [
			{ id: "XN_KHAC01", maSo: "KHA01", tenXetNghiem: "Xét nghiệm tổng quát", nhomId: "nhom_xet_nghiem_khac" },
		],
	},
];

export interface ExistingPatientLookupResult extends PatientAdministrativeFormValues {
	sampleHistory: SampleHistoryItem[];
}

export function mockExistingPatientLookup(maBn: string): ExistingPatientLookupResult | undefined {
	const normalized = maBn.trim().toUpperCase();

	// Demo: treat specific pattern as "exists"
	if (!normalized) return undefined;

	if (normalized === "BN2603190001" || normalized === "BN001") {
		return {
			...{
				maBn: normalized,
				hoTen: "Nguyễn Văn A",
				ngaySinh: "1990-01-01",
				gioiTinh: "nam",
				soDienThoai: "0901234567",

				tinhTp: "TP. Hồ Chí Minh",
				quanHuyen: "Quận 7",
				phuongXa: "Phường Tân Thuận",
				soNha: "123",
				noiLamViec: "Công ty ABC",
				maTinhTp: "",
				maQuanHuyen: "",
				maPhuongXa: "",

				khoaPhong: "Khoa Nội",
				maKhoaPhong: "",
				doiTuong: "bhyt",
				loaiBenhNhan: "ngoaitru",

				soTheBHYT: "DN4010123456789",
				tuNgayBHYT: "2026-01-01",
				denNgayBHYT: "2026-12-31",
				noiDkkcb: "Bệnh viện Trung ương",
				maDkkcb: "",

				bacSiChiDinh: "BS. Nguyễn Văn B",
				maBacSiChiDinh: "",
				chanDoan: "Viêm họng cấp",

				soBienLai: "0",
				ngayLayMau: "2026-03-20T08:00",
				sttLayMau: "1",
			},
			sampleHistory: [
				{
					ngayGio: "2026-03-18 08:00",
					loaiMau: "Máu",
					kyThuatVien: "KTV1",
					tinhTrang: "Bình thường",
					ghiChu: "",
				},
			],
		};
	}

	return undefined;
}

export function flattenCatalogItems(nodes: TestCatalogNode[]): { all: TestCatalogItem[]; byId: Record<string, TestCatalogItem> } {
	const all = nodes.flatMap((n) => n.children);
	return { all, byId: Object.fromEntries(all.map((i) => [i.id, i])) };
}

