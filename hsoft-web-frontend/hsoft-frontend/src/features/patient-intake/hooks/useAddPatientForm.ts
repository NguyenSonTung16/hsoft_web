import { useCallback, useMemo, useRef, useState } from "react";

import { patientIntakeService } from "../services/patientIntakeService";
import type {
	CreatePatientInput,
	CreatePatientResult,
	FieldErrors,
	OrderedTestItem,
	PendingTestItem,
	PatientAdministrativeFormValues,
	PatientIntakeFormState,
	PatientIntakeMode,
	PatientIntakeSubmitState,
} from "../types/patient-intake.types";

import { mockExistingPatientLookup } from "../mockdata";

interface UseAddPatientFormResult {
	form: PatientIntakeFormState;
	submitState: PatientIntakeSubmitState;
	mode: PatientIntakeMode;
	isViewMode: boolean;

	setField: <K extends keyof PatientAdministrativeFormValues>(
		field: K,
		value: PatientAdministrativeFormValues[K]
	) => void;

	setMode: (mode: PatientIntakeMode) => void;
	onNew: () => void;
	onEdit: () => void;
	onCancel: () => void;
	onFinish: () => Promise<CreatePatientResult | undefined>;

	// Task 3: tests modal/grid handlers
	modalOpen: boolean;
	openTestModal: () => void;
	closeTestModal: () => void;
	pendingTestsDraft: PendingTestItem[];
	setPendingTestsDraft: (next: PendingTestItem[]) => void;
	onChoosePendingTests: () => void;
	onAddPendingToGrid: () => void;
	onRemoveOrderedTest: (id: string) => void;
	selectedOrderedTestId?: string;
	setSelectedOrderedTestId: (id?: string) => void;

	setSoBarcode: (value: number) => void;

	// Task 7: patient old lookup (stub UI-first)
	onMaBnEnter: () => Promise<void>;
}

const REQUIRED_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const phoneRegex = /^(0|\+84)\d{9,10}$/;
const bhytCodeRegex = /^[A-Z0-9]{8,20}$/i;

function joinAddress(input: PatientAdministrativeFormValues): string {
	const parts = [input.soNha, input.phuongXa, input.quanHuyen, input.tinhTp].map((p) => p.trim()).filter(Boolean);
	return parts.join(", ");
}

function validate(input: PatientAdministrativeFormValues): FieldErrors<PatientAdministrativeFormValues> {
	const errors: FieldErrors<PatientAdministrativeFormValues> = {};

	// Task 1 base required
	if (!input.hoTen.trim()) errors.hoTen = "Họ tên là bắt buộc";
	if (!input.ngaySinh.trim()) errors.ngaySinh = "Ngày sinh là bắt buộc";
	if (!input.gioiTinh.trim()) errors.gioiTinh = "Giới tính là bắt buộc";
	if (!input.loaiBenhNhan.trim()) errors.loaiBenhNhan = "Loại bệnh nhân là bắt buộc";
	if (!input.doiTuong.trim()) errors.doiTuong = "Đối tượng là bắt buộc";

	// Task 2 required
	if (!input.khoaPhong.trim()) errors.khoaPhong = "Khoa/Phòng là bắt buộc";

	if (input.ngaySinh.trim() && !REQUIRED_DATE_REGEX.test(input.ngaySinh.trim())) {
		errors.ngaySinh = "Ngày sinh phải đúng định dạng YYYY-MM-DD";
	}

	if (input.soDienThoai.trim() && !phoneRegex.test(input.soDienThoai.trim())) {
		errors.soDienThoai = "Số điện thoại không đúng định dạng";
	}

	// Task 1 address split: chỉ validate cơ bản nếu người dùng nhập
	// (đặc tả không nêu bắt buộc cho toàn bộ thành phần địa chỉ).

	// Dependent: BHYT
	const doiTuongNorm = input.doiTuong.trim().toLowerCase();
	if (doiTuongNorm === "bhyt") {
		if (!input.soTheBHYT.trim()) errors.soTheBHYT = "Số thẻ BHYT là bắt buộc";
		if (!input.tuNgayBHYT.trim()) errors.tuNgayBHYT = "Từ ngày là bắt buộc";
		if (!input.denNgayBHYT.trim()) errors.denNgayBHYT = "Đến ngày là bắt buộc";
		if (!input.noiDkkcb.trim()) errors.noiDkkcb = "Nơi ĐKKCB là bắt buộc";

		if (input.soTheBHYT.trim() && !bhytCodeRegex.test(input.soTheBHYT.trim())) {
			errors.soTheBHYT = "Số thẻ BHYT không hợp lệ";
		}
		if (input.tuNgayBHYT.trim() && !REQUIRED_DATE_REGEX.test(input.tuNgayBHYT.trim())) {
			errors.tuNgayBHYT = "Từ ngày phải đúng YYYY-MM-DD";
		}
		if (input.denNgayBHYT.trim() && !REQUIRED_DATE_REGEX.test(input.denNgayBHYT.trim())) {
			errors.denNgayBHYT = "Đến ngày phải đúng YYYY-MM-DD";
		}
	}

	// Sampling fields basic validation
	if (input.ngayLayMau.trim()) {
		const raw = input.ngayLayMau.trim();
		// Support both `YYYY-MM-DD` and `YYYY-MM-DDTHH:mm` (datetime-local)
		const datePart = raw.includes("T") ? raw.split("T")[0] : raw;
		if (!REQUIRED_DATE_REGEX.test(datePart)) {
			errors.ngayLayMau = "Ngày lấy mẫu phải đúng YYYY-MM-DD";
		}
	}

	// Simple numeric checks
	if (input.sttLayMau.trim() && Number.isNaN(Number(input.sttLayMau.trim()))) {
		errors.sttLayMau = "STT lấy mẫu phải là số";
	}
	if (input.soBienLai.trim() && Number.isNaN(Number(input.soBienLai.trim()))) {
		// Keep optional but validate if filled
		errors.soBienLai = "Số biên lai phải là số";
	}

	return errors;
}

function mapToCreatePatientInput(form: PatientAdministrativeFormValues): CreatePatientInput {
	return {
		maBn: form.maBn || undefined,
		hoTen: form.hoTen.trim(),
		ngaySinh: form.ngaySinh,
		gioiTinh: form.gioiTinh,
		diaChi: joinAddress(form) || undefined,
		soDienThoai: form.soDienThoai.trim() || undefined,
		soTheBHYT: form.doiTuong.trim().toLowerCase() === "bhyt" ? form.soTheBHYT.trim() : undefined,
		loaiBenhNhan: form.loaiBenhNhan,
		doiTuong: form.doiTuong,
	};
}

const initialValues: PatientAdministrativeFormValues = {
	maBn: "",
	hoTen: "",
	gioiTinh: "",
	ngaySinh: "",
	soDienThoai: "",
	tinhTp: "",
	quanHuyen: "",
	phuongXa: "",
	soNha: "",
	noiLamViec: "",
	maTinhTp: "",
	maQuanHuyen: "",
	maPhuongXa: "",

	khoaPhong: "",
	maKhoaPhong: "",
	doiTuong: "bhyt",
	loaiBenhNhan: "ngoaitru",

	soTheBHYT: "",
	tuNgayBHYT: "",
	denNgayBHYT: "",
	noiDkkcb: "",
	maDkkcb: "",

	bacSiChiDinh: "",
	maBacSiChiDinh: "",
	chanDoan: "",

	soBienLai: "",
	ngayLayMau: "",
	sttLayMau: "",
};

function makeInitialState(): PatientIntakeFormState {
	return {
		...initialValues,
		mode: "Add",
		errors: {},
		orderedTests: [],
		pendingTests: [],
		selectedOrderedTestId: undefined,
		soBarcode: 1,
		sampleHistory: [],
	};
}

export function useAddPatientForm(sessionToken?: string): UseAddPatientFormResult {
	const [form, setForm] = useState<PatientIntakeFormState>(makeInitialState);
	const [submitState, setSubmitState] = useState<PatientIntakeSubmitState>({ status: "idle" });

	// View/Add/Edit state machine:
	const snapshotRef = useRef<PatientIntakeFormState | null>(null);
	const [mode, setMode] = useState<PatientIntakeMode>("Add");

	// Modal drafts: checkbox ticks inside modal
	const [modalOpen, setModalOpen] = useState(false);
	const [pendingTestsDraft, setPendingTestsDraft] = useState<PendingTestItem[]>([]);

	const isViewMode = mode === "View";

	const setSelectedOrderedTestId = useCallback((id?: string) => {
		setForm((prev) => ({ ...prev, selectedOrderedTestId: id }));
	}, []);

	const setField = useCallback(<K extends keyof PatientAdministrativeFormValues>(field: K, value: PatientAdministrativeFormValues[K]) => {
		setForm((prev) => {
			const nextValues: PatientAdministrativeFormValues = {
				...(prev as PatientAdministrativeFormValues),
				[field]: value,
			};

			const nextErrors = { ...prev.errors };
			// Clear error for this field early; validation runs on finish.
			nextErrors[field] = undefined;

			// Dependent: if doiTuong != BHYT, clear BHYT fields & errors to avoid stale validation errors.
			if (field === "doiTuong") {
				const doi = String(value).trim().toLowerCase();
				if (doi !== "bhyt") {
					nextValues.soTheBHYT = "";
					nextValues.tuNgayBHYT = "";
					nextValues.denNgayBHYT = "";
					nextValues.noiDkkcb = "";
					nextErrors.soTheBHYT = undefined;
					nextErrors.tuNgayBHYT = undefined;
					nextErrors.denNgayBHYT = undefined;
					nextErrors.noiDkkcb = undefined;
				}
			}

			return { ...prev, ...(nextValues as PatientIntakeFormState), errors: nextErrors };
		});
	}, []);

	const setModeWithSnapshot = useCallback(
		(nextMode: PatientIntakeMode) => {
			setMode(nextMode);
			setForm((prev) => ({ ...prev, mode: nextMode }));
		},
		[]
	);

	const onNew = useCallback(() => {
		snapshotRef.current = null;
		setPendingTestsDraft([]);
		setModalOpen(false);
		setForm(makeInitialState());
		setModeWithSnapshot("Add");
		setSubmitState({ status: "idle" });
	}, [setModeWithSnapshot]);

	const onEdit = useCallback(() => {
		// Enter Edit from View
		snapshotRef.current = form;
		setPendingTestsDraft([]);
		setModalOpen(false);
		setModeWithSnapshot("Edit");
		setSubmitState({ status: "idle" });
	}, [form, setModeWithSnapshot]);

	const onCancel = useCallback(() => {
		if (snapshotRef.current) {
			setForm(snapshotRef.current);
		} else {
			setForm(makeInitialState());
		}
		setPendingTestsDraft([]);
		setModalOpen(false);
		setModeWithSnapshot("View");
		setSubmitState({ status: "idle" });
	}, [setModeWithSnapshot]);

	const openTestModal = useCallback(() => {
		setPendingTestsDraft(form.pendingTests);
		setModalOpen(true);
	}, [form.pendingTests]);

	const closeTestModal = useCallback(() => {
		setModalOpen(false);
	}, []);

	const onChoosePendingTests = useCallback(() => {
		// Commit modal draft to form.pendingTests
		setForm((prev) => ({ ...prev, pendingTests: pendingTestsDraft }));
		setModalOpen(false);
	}, [pendingTestsDraft]);

	const onAddPendingToGrid = useCallback(() => {
		setForm((prev) => {
			// Avoid duplicates by id
			const existingIds = new Set(prev.orderedTests.map((t) => t.id));
			const nextOrdered: OrderedTestItem[] = [
				...prev.orderedTests,
				...prev.pendingTests.filter((p) => !existingIds.has(p.id)),
			];

			return {
				...prev,
				orderedTests: nextOrdered,
				pendingTests: [],
			};
		});
		// Keep pendingTestsDraft as-is; lần mở modal tiếp theo sẽ sync từ form.pendingTests.
	}, []);

	const onRemoveOrderedTest = useCallback((id: string) => {
		setForm((prev) => {
			const nextOrdered = prev.orderedTests.filter((t) => t.id !== id);
			const nextSelected = prev.selectedOrderedTestId === id ? undefined : prev.selectedOrderedTestId;
			return { ...prev, orderedTests: nextOrdered, selectedOrderedTestId: nextSelected };
		});
	}, []);

	const setSoBarcode = useCallback((value: number) => {
		const safe = Number.isFinite(value) ? value : 0;
		setForm((prev) => ({ ...prev, soBarcode: Math.max(0, Math.floor(safe)) }));
	}, []);

	const onMaBnEnter = useCallback(async () => {
		// UI-first: stub existing patient lookup, chỉ nhằm demo workflow.
		// Khi backend sẵn query lookup patient, hook sẽ gọi API thay cho mock.
		const maBn = form.maBn.trim();
		if (!maBn) {
			// Task 4: "Sinh mã BN": fallback generate when empty
			const now = new Date();
			const y = String(now.getFullYear()).slice(-2);
			const m = String(now.getMonth() + 1).padStart(2, "0");
			const d = String(now.getDate()).padStart(2, "0");
			const random5 = Math.floor(Math.random() * 90000 + 10000);
			const generated = `BN${y}${m}${d}${random5}`;
			setForm((prev) => ({ ...prev, maBn: generated, errors: {} }));
			return;
		}

		const lookup = mockExistingPatientLookup(maBn);
		if (!lookup) return;

		const next: Partial<PatientAdministrativeFormValues> = {
			hoTen: lookup.hoTen,
			ngaySinh: lookup.ngaySinh,
			gioiTinh: lookup.gioiTinh,
			soDienThoai: lookup.soDienThoai,

			tinhTp: lookup.tinhTp,
			quanHuyen: lookup.quanHuyen,
			phuongXa: lookup.phuongXa,
			soNha: lookup.soNha,
			noiLamViec: lookup.noiLamViec,
			maTinhTp: "",
			maQuanHuyen: "",
			maPhuongXa: "",

			doiTuong: lookup.doiTuong,
			loaiBenhNhan: lookup.loaiBenhNhan,

			soTheBHYT: lookup.soTheBHYT,
			tuNgayBHYT: lookup.tuNgayBHYT,
			denNgayBHYT: lookup.denNgayBHYT,
			noiDkkcb: lookup.noiDkkcb,
			maDkkcb: "",

			khoaPhong: lookup.khoaPhong,
			maKhoaPhong: "",
			bacSiChiDinh: lookup.bacSiChiDinh,
			maBacSiChiDinh: "",
			chanDoan: lookup.chanDoan,

			soBienLai: lookup.soBienLai,
			ngayLayMau: lookup.ngayLayMau,
			sttLayMau: lookup.sttLayMau,
		};

		setForm((prev) => ({
			...prev,
			...next,
			errors: {},
			mode: "Edit",
			sampleHistory: lookup.sampleHistory,
		}));
		setModeWithSnapshot("Edit");
	}, [form.maBn, setModeWithSnapshot]);

	const mappedCreateInput: CreatePatientInput = useMemo(
		() => mapToCreatePatientInput(form),
		[form]
	);

	const onFinish = useCallback(async () => {
		// Finish == Save & continue ordering/specimen flow
		const errors = validate(form);
		if (Object.keys(errors).length > 0) {
			setForm((prev) => ({ ...prev, errors }));
			setSubmitState({ status: "error", message: "Vui lòng kiểm tra dữ liệu bắt buộc." });
			return undefined;
		}

		if (!sessionToken) {
			setSubmitState({ status: "error", message: "Phiên đăng nhập không hợp lệ." });
			return undefined;
		}
		if (form.orderedTests.length === 0) {
			setSubmitState({ status: "error", message: "Vui lòng thêm ít nhất 1 xét nghiệm." });
			return undefined;
		}

		setSubmitState({ status: "loading" });
		try {
			const created = await patientIntakeService.createPatient(sessionToken, mappedCreateInput);
			setSubmitState({
				status: "success",
				message: `Tạo hồ sơ thành công. Mã BN: ${created.maBn}`,
				created,
			});

			// Keep form data (View will be restored from snapshotRef if needed).
			snapshotRef.current = null;
			setModeWithSnapshot("View");
			return created;
		} catch (error) {
			setSubmitState({
				status: "error",
				message: error instanceof Error ? error.message : "Không thể tạo hồ sơ bệnh nhân",
			});
			return undefined;
		}
	}, [form, mappedCreateInput, sessionToken, setModeWithSnapshot]);

	return {
		form,
		submitState,
		mode,
		isViewMode,
		setField,
		setMode: setModeWithSnapshot,

		onNew,
		onEdit,
		onCancel,
		onFinish,

		modalOpen,
		openTestModal,
		closeTestModal,
		pendingTestsDraft,
		setPendingTestsDraft,
		onChoosePendingTests,
		onAddPendingToGrid,
		onRemoveOrderedTest,
		selectedOrderedTestId: form.selectedOrderedTestId,
		setSelectedOrderedTestId,

		setSoBarcode,
		onMaBnEnter,
	};
}
