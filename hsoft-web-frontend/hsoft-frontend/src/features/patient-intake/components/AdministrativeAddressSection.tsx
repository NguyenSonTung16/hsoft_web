import type { PatientAdministrativeFormValues, FieldErrors } from "../types/patient-intake.types";

import "../styles/AdministrativeAddressSection.css";

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

export function AdministrativeAddressSection({ values, errors, disabled, setField }: Props) {
	return (
		<section className="patient-intake-section">
			<h3 className="patient-intake-section-title">Địa chỉ nhà & Nơi làm việc</h3>

			<div className="patient-intake-address-rows">
				{/* Row 1 */}
				<div className="address-row cols-30-70">
					<label className="patient-intake-inline-field">
						<span>T/Q/PXã</span>
						<select
							value={values.phuongXa}
							onChange={(e) => setField("phuongXa", e.target.value)}
							disabled={disabled}
						>
							<option value="">Không xác định</option>
							{values.phuongXa ? <option value={values.phuongXa}>{values.phuongXa}</option> : null}
						</select>
						<FieldError message={errors.phuongXa} />
					</label>

					<label className="patient-intake-inline-field">
						Tỉnh/TP
						<div className="patient-intake-name-only">
							<input
								className="name-short"
								value={values.tinhTp}
								onChange={(e) => setField("tinhTp", e.target.value)}
								disabled={disabled}
								placeholder="Tên tỉnh / thành"
							/>
						</div>
						<FieldError message={errors.tinhTp} />
					</label>
				</div>

				{/* Row 2 */}
				<div className="address-row cols-50-50">
					<label className="patient-intake-inline-field">
						Quận/Huyện
						<div className="patient-intake-name-only">
							<input
								className="name-short"
								value={values.quanHuyen}
								onChange={(e) => setField("quanHuyen", e.target.value)}
								disabled={disabled}
								placeholder="Tên quận / huyện"
							/>
						</div>
						<FieldError message={errors.quanHuyen} />
					</label>

					<label className="patient-intake-inline-field">
						Phường/Xã
						<div className="patient-intake-name-only">
							<input
								className="name-short"
								value={values.phuongXa}
								onChange={(e) => setField("phuongXa", e.target.value)}
								disabled={disabled}
								placeholder="Tên phường / xã"
							/>
						</div>
						<FieldError message={errors.phuongXa} />
					</label>
				</div>

				{/* Row 3 */}
				<div className="address-row cols-35-65">
					<label className="patient-intake-inline-field house-number">
						<span>Số nhà</span>
						<div className="patient-intake-name-only">
							<input
								value={values.soNha}
								onChange={(e) => setField("soNha", e.target.value)}
								disabled={disabled}
								placeholder="Số nhà"
							/>
						</div>
						<FieldError message={errors.soNha} />
					</label>

					<label className="patient-intake-workplace">
						Nơi làm việc
						<input
							value={values.noiLamViec}
							onChange={(e) => setField("noiLamViec", e.target.value)}
							disabled={disabled}
							placeholder="VD: Công ty ABC"
						/>
						<FieldError message={errors.noiLamViec} />
					</label>
				</div>
			</div>
		</section>
	);
}

