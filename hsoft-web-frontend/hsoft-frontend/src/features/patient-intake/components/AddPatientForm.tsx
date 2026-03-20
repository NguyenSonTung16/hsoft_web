import { useNavigate } from "react-router-dom";

import { TEST_CATALOG } from "../mockdata";
import { useAddPatientForm } from "../hooks/useAddPatientForm";
import "../styles/AddPatientForm.css";
import styles from "../styles/AddPatientForm.module.css";

import { AdministrativeAddressSection } from "./AdministrativeAddressSection";
import { SamplingInfoSection } from "./SamplingInfoSection";
import { TestOrderGrid } from "./TestOrderGrid";
import { TestSelectionModal } from "./TestSelectionModal";
import { SampleHistoryPanel } from "./SampleHistoryPanel";

interface AddPatientFormProps {
	sessionToken?: string;
}

export function AddPatientForm({ sessionToken }: AddPatientFormProps) {
	const navigate = useNavigate();
	const {
		form,
		submitState,
		isViewMode,
		setField,

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
		selectedOrderedTestId,
		setSelectedOrderedTestId,
		setSoBarcode,
		onMaBnEnter,
	} = useAddPatientForm(sessionToken);

	const isLoading = submitState.status === "loading";
	const inputsDisabled = isViewMode || isLoading;

	const handleSave = async () => {
		await onFinish();
	};

	const handleFinishFlow = () => {
		if (submitState.status !== "success" || !submitState.created?.maBn) return;
		navigate(`/test-order?maBn=${encodeURIComponent(submitState.created.maBn)}`, {
			state: { orderedTests: form.orderedTests },
		});
	};

	const handleDeleteSelectedTest = () => {
		if (!selectedOrderedTestId) return;
		onRemoveOrderedTest(selectedOrderedTestId);
	};

	const canAddPendingTests = form.pendingTests.length > 0;

	return (
		<section className={`patient-intake-page ${styles.page}`}>
			<header className={`patient-intake-header ${styles.header}`}>
				<h1>Đăng kí bệnh nhân</h1>
				<button type="button" className="patient-intake-back" onClick={() => navigate("/main-screen")}>
					Quay lai dashboard
				</button>
			</header>

			<form
				className={`patient-intake-form patient-intake-form-layout ${styles.form}`}
				onSubmit={(e) => {
					e.preventDefault();
					void handleSave();
				}}
			>
				<div className="patient-intake-layout">
					<div className={`patient-intake-grid ${styles.gridTwoCol}`}>
						<div className="patient-intake-left-column">
							{/* Panel trái: I. HÀNH CHÁNH */}
							<div className="patient-intake-panel">
								<h3 className="patient-intake-section-title">I. HÀNH CHÁNH</h3>
								<div className="patient-intake-top-row patient-intake-top-row-2">
									<label className="patient-intake-inline-field">
										<span>Mã BN</span>
										<input
											value={form.maBn}
											onChange={(e) => setField("maBn", e.target.value)}
											placeholder="VD: BN2603190001"
											disabled={inputsDisabled}
											onKeyDown={(e) => {
												if (e.key === "Enter") void onMaBnEnter();
											}}
										/>
									</label>

									<label className="patient-intake-inline-field">
										<span>Họ và tên *</span>
										<input
											value={form.hoTen}
											onChange={(e) => setField("hoTen", e.target.value)}
											placeholder="Nguyen Van A"
											disabled={inputsDisabled}
										/>
									</label>
								</div>

								<div className="patient-intake-top-row patient-intake-top-row-3">
									<label className="patient-intake-inline-field required">
										<span>Giới tính *</span>
										<select
											value={form.gioiTinh}
											onChange={(e) => setField("gioiTinh", e.target.value as any)}
											disabled={inputsDisabled}
										>
											<option value="">Chọn giới tính</option>
											<option value="nam">Nam</option>
											<option value="nu">Nữ</option>
											<option value="khac">Khác</option>
										</select>
									</label>

									<label className="patient-intake-inline-field required">
										<span>Ngày sinh *</span>
										<input
											type="date"
											value={form.ngaySinh}
											onChange={(e) => setField("ngaySinh", e.target.value)}
											disabled={inputsDisabled}
										/>
									</label>
								</div>

								<div className="patient-intake-top-row patient-intake-top-row-1">
									<label className="patient-intake-inline-field">
										<span>Số điện thoại</span>
										<input
											value={form.soDienThoai}
											onChange={(e) => setField("soDienThoai", e.target.value)}
											placeholder="090xxxxxxx"
											disabled={inputsDisabled}
										/>
									</label>
								</div>

								<AdministrativeAddressSection
									values={form}
									errors={form.errors}
									disabled={inputsDisabled}
									setField={setField}
								/>
							</div>

							{/* Panel trái dưới: Tổng xét nghiệm */}
							<div className="patient-intake-panel">
								<TestOrderGrid
									tests={form.orderedTests}
									soBarcode={form.soBarcode}
									onSoBarcodeChange={setSoBarcode}
									selectedTestId={selectedOrderedTestId}
									onSelectTestId={setSelectedOrderedTestId}
									onList={openTestModal}
									onAdd={onAddPendingToGrid}
									onDelete={handleDeleteSelectedTest}
									disableAdd={!canAddPendingTests}
									disableDelete={!selectedOrderedTestId}
									disabled={inputsDisabled}
								/>
							</div>
						</div>

						<div className="patient-intake-right-column">
							{/* Panel phải trên: II. THÔNG TIN LẤY MẪU */}
							<div className="patient-intake-panel">
								<SamplingInfoSection
									values={form}
									errors={form.errors}
									disabled={inputsDisabled}
									setField={setField}
								/>
							</div>

							{/* Panel phải dưới: lịch sử & gói */}
							<div className="patient-intake-panel">
								<div className="patient-intake-history-wrap">
									<SampleHistoryPanel history={form.sampleHistory} />
								</div>

								<div className="patient-intake-package-wrap">
									<div className="patient-intake-package-title">GÓI XÉT NGHIỆM</div>
									<div className="patient-intake-empty-listbox" />
								</div>
							</div>
						</div>
					</div>
					{/* 3) BOTTOM */}

					<div className="patient-intake-bottom">
						<div className={`patient-intake-action-bar patient-intake-actions ${styles.toolbar}`}>
							<button type="button" onClick={onNew} disabled={isLoading}>Mới</button>

							<button
								type="button"
								className="patient-intake-save-order"
								onClick={() => void handleSave()}
								disabled={isLoading || inputsDisabled}
							>
								{isLoading ? "Đang lưu..." : "Lưu"}
							</button>

							<button type="button" onClick={onEdit} disabled={isLoading || !isViewMode}>Sửa</button>
							<button type="button" onClick={onCancel} disabled={isLoading || isViewMode}>Hủy</button>

							<button
								type="button"
								className="patient-intake-btn-muted"
								onClick={() => {
									if (modalOpen) closeTestModal();
									else onCancel();
								}}
								disabled={isLoading}
							>
								Bỏ qua
							</button>

							<div className="patient-intake-action-divider" />

							<button type="button" disabled={isLoading || submitState.status !== "success"}>In mã vạch</button>
							<button type="button" disabled={isLoading || submitState.status !== "success"}>In DS lấy mẫu</button>
							<button type="button" disabled={isLoading || submitState.status !== "success"}>DS chỉ định</button>

							<button
								type="button"
								className="patient-intake-save-order"
								onClick={handleFinishFlow}
								disabled={isLoading || submitState.status !== "success"}
							>
								Kết thúc
							</button>
						</div>

						{submitState.message && (
							<p className={submitState.status === "error" ? "submit-message error" : "submit-message"}>
								{submitState.message}
							</p>
						)}
					</div>
				</div>

				<TestSelectionModal
					open={modalOpen}
					catalog={TEST_CATALOG}
					ticked={pendingTestsDraft}
					onChangeTicked={(next) => setPendingTestsDraft(next)}
					onChoose={onChoosePendingTests}
					onClose={closeTestModal}
					disabled={inputsDisabled}
				/>
			</form>
		</section>
	);
}
