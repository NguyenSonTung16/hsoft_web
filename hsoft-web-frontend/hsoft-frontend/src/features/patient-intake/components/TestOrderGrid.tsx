import { useMemo, useState } from "react";

import type { OrderedTestItem } from "../types/patient-intake.types";
import "../styles/TestOrderGrid.css";

interface Props {
	tests: OrderedTestItem[];
	soBarcode: number;
	onSoBarcodeChange: (value: number) => void;

	selectedTestId?: string;
	onSelectTestId: (id?: string) => void;

	// Task 4 (footer actions)
	onList: () => void;
	onAdd: () => void;
	onDelete: () => void;
	disableAdd: boolean;
	disableDelete: boolean;

	disabled: boolean;
}

export function TestOrderGrid({
	tests,
	soBarcode,
	onSoBarcodeChange,
	selectedTestId,
	onSelectTestId,
	onList,
	onAdd,
	onDelete,
	disableAdd,
	disableDelete,
	disabled,
}: Props) {
	const [query, setQuery] = useState("");

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return tests;
		return tests.filter((t) => t.tenXetNghiem.toLowerCase().includes(q) || t.maSo.toLowerCase().includes(q));
	}, [tests, query]);

	return (
		<section className="patient-intake-section">
			<header className="patient-intake-tests-header">
				<span>
					Tổng xét nghiệm: <b>{tests.length}</b>
				</span>

				<label className="barcode-input">
					Số barcode:
					<input
						type="number"
						min={0}
						step={1}
						value={Number.isFinite(soBarcode) ? soBarcode : 0}
						onChange={(e) => onSoBarcodeChange(Number(e.target.value))}
						disabled={disabled}
					/>
				</label>
			</header>

			<div className="patient-intake-table-wrap">
				<table className="patient-intake-table">
					<thead>
						<tr>
							<th style={{ width: 50 }} />
							<th style={{ width: 80 }}>STT</th>
							<th style={{ width: 140 }}>Mã số</th>
							<th>Xét nghiệm</th>
						</tr>
					</thead>
					<tbody>
						{filtered.length === 0 ? (
							<tr>
								<td colSpan={4} className="empty-row">
									Chưa có xét nghiệm phù hợp.
								</td>
							</tr>
						) : (
							filtered.map((t, idx) => {
								const isSelected = selectedTestId === t.id;

								return (
									<tr key={t.id} className={isSelected ? "row-selected" : ""}>
										<td>
											<input
												type="checkbox"
												checked={isSelected}
												disabled={disabled}
												onChange={(e) => onSelectTestId(e.target.checked ? t.id : undefined)}
											/>
										</td>
										<td>{idx + 1}</td>
										<td>{t.maSo}</td>
										<td>{t.tenXetNghiem}</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>

			<footer className="patient-intake-tests-footer">
				<input
					className="patient-intake-tests-search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Tìm: Xét nghiệm"
					disabled={disabled}
				/>

				<div className="patient-intake-tests-actions">
					<button type="button" onClick={onList} disabled={disabled}>
						Liệt kê
					</button>
					<button type="button" onClick={onAdd} disabled={disabled || disableAdd}>
						Thêm
					</button>
					<button type="button" onClick={onDelete} disabled={disabled || disableDelete}>
						Xóa
					</button>
				</div>
			</footer>
		</section>
	);
}

