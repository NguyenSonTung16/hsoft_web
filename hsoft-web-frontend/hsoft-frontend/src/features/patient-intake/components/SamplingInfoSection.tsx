import type { FieldErrors, PatientAdministrativeFormValues } from "../types/patient-intake.types";

import "../styles/SamplingInfoSection.css";

interface Props {
	values: PatientAdministrativeFormValues;
	errors: FieldErrors<PatientAdministrativeFormValues>;
	disabled: boolean;
	setField: <K extends keyof PatientAdministrativeFormValues>(
		field: K,
		value: PatientAdministrativeFormValues[K]
	) => void;
}

function FieldError({ message }: { message?: string }) {
	if (!message) return null;
	return <span className="patient-intake-field-error">{message}</span>;
}

export function SamplingInfoSection({ values, errors, disabled, setField }: Props) {
	const isBHYT = values.doiTuong.trim().toLowerCase() === "bhyt";

	return (
		<section className="patient-intake-section">
			<h3 className="patient-intake-section-title">II. THÔNG TIN LẤY MẪU</h3>

			<div className="patient-intake-sampling-rows">
				{/* Dòng 1: K/Phòng (mã + tên) */}
				<label className="patient-intake-inline-field required">
					<span>K/Phòng</span>
					<div className="patient-intake-code-name">
						<input
							value={values.maKhoaPhong}
							onChange={(e) => setField("maKhoaPhong", e.target.value)}
							disabled={disabled}
							placeholder="Mã"
						/>
						<input
							value={values.khoaPhong}
							onChange={(e) => setField("khoaPhong", e.target.value)}
							disabled={disabled}
							placeholder="Tên"
						/>
					</div>
					<FieldError message={errors.khoaPhong} />
				</label>

				{/* Dòng 2: Đối tượng | Số thẻ */}
				<div className="patient-intake-inline-split">
					<label className="patient-intake-inline-field required">
						<span>Đối tượng</span>
						<select
							value={values.doiTuong}
							onChange={(e) => setField("doiTuong", e.target.value as any)}
							disabled={disabled}
						>
							<option value="bhyt">BHYT</option>
							<option value="vienphi">Viện phí</option>
							<option value="mienphi">Miễn phí</option>
						</select>
						<FieldError message={errors.doiTuong} />
					</label>

					<label className="patient-intake-inline-field">
						<span>Số thẻ</span>
						<input
							value={values.soTheBHYT}
							onChange={(e) => setField("soTheBHYT", e.target.value)}
							disabled={disabled || !isBHYT}
						/>
						<FieldError message={errors.soTheBHYT} />
					</label>
				</div>

				{/* Dòng 3: Từ ngày | Đến ngày */}
				<div className="patient-intake-inline-split">
					<label className="patient-intake-inline-field">
						<span>Từ</span>
						<input
							type="date"
							value={values.tuNgayBHYT}
							onChange={(e) => setField("tuNgayBHYT", e.target.value)}
							disabled={disabled || !isBHYT}
						/>
						<FieldError message={errors.tuNgayBHYT} />
					</label>

					<label className="patient-intake-inline-field">
						<span>Đến</span>
						<input
							type="date"
							value={values.denNgayBHYT}
							onChange={(e) => setField("denNgayBHYT", e.target.value)}
							disabled={disabled || !isBHYT}
						/>
						<FieldError message={errors.denNgayBHYT} />
					</label>
				</div>

				{/* Dòng 4: ĐKKCB (mã + tên) */}
				<label className="patient-intake-inline-field">
					<span>ĐKKCB</span>
					<div className="patient-intake-code-name patient-intake-code-name-wide">
						<input
							value={values.maDkkcb}
							onChange={(e) => setField("maDkkcb", e.target.value)}
							disabled={disabled || !isBHYT}
							placeholder="Mã"
						/>
						<input
							value={values.noiDkkcb}
							onChange={(e) => setField("noiDkkcb", e.target.value)}
							disabled={disabled || !isBHYT}
							placeholder="Tên"
						/>
					</div>
					<FieldError message={errors.noiDkkcb} />
				</label>

				{/* Dòng 5: Bác sỹ chỉ định (mã + tên) */}
				<label className="patient-intake-inline-field">
					<span>Bác sỹ</span>
					<div className="patient-intake-code-name patient-intake-code-name-wide">
						<input
							value={values.maBacSiChiDinh}
							onChange={(e) => setField("maBacSiChiDinh", e.target.value)}
							disabled={disabled}
							placeholder="Mã"
						/>
						<input
							value={values.bacSiChiDinh}
							onChange={(e) => setField("bacSiChiDinh", e.target.value)}
							disabled={disabled}
							placeholder="Tên"
						/>
					</div>
					<FieldError message={errors.bacSiChiDinh} />
				</label>

				{/* Dòng 6: Chẩn đoán */}
				<label className="patient-intake-inline-field">
					<span>C.đoán</span>
					<input
						value={values.chanDoan}
						onChange={(e) => setField("chanDoan", e.target.value)}
						disabled={disabled}
						placeholder="Nhập chẩn đoán"
					/>
					<FieldError message={errors.chanDoan} />
				</label>

				{/* Dòng 7: Số biên lai | Ngày | STT */}
				<div className="patient-intake-inline-split patient-intake-inline-split-3">
					<label className="patient-intake-inline-field">
						<span>Biên lai</span>
						<input
							value={values.soBienLai}
							onChange={(e) => setField("soBienLai", e.target.value)}
							disabled={disabled}
						/>
						<FieldError message={errors.soBienLai} />
					</label>

					<label className="patient-intake-inline-field required">
						<span>Ngày</span>
						<input
							type="date"
							value={values.ngayLayMau}
							onChange={(e) => setField("ngayLayMau", e.target.value)}
							disabled={disabled}
						/>
						<FieldError message={errors.ngayLayMau} />
					</label>

					<label className="patient-intake-inline-field">
						<span>STT</span>
						<input
							type="number"
							value={values.sttLayMau}
							onChange={(e) => setField("sttLayMau", e.target.value)}
							disabled={disabled}
						/>
						<FieldError message={errors.sttLayMau} />
					</label>
				</div>
			</div>
		</section>
	);
}

