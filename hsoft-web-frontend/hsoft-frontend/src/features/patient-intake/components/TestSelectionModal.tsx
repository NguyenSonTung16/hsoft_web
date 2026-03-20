import type { PendingTestItem, TestCatalogItem, TestCatalogNode } from "../types/patient-intake.types";
import { flattenCatalogItems } from "../mockdata";

import "../styles/TestSelectionModal.css";

interface Props {
	open: boolean;
	catalog: TestCatalogNode[];
	ticked: PendingTestItem[];
	onChangeTicked: (next: PendingTestItem[]) => void;
	onChoose: () => void;
	onClose: () => void;
	disabled?: boolean;
}

function toPending(item: TestCatalogItem): PendingTestItem {
	return { id: item.id, maSo: item.maSo, tenXetNghiem: item.tenXetNghiem };
}

export function TestSelectionModal({
	open,
	catalog,
	ticked,
	onChangeTicked,
	onChoose,
	onClose,
	disabled,
}: Props) {
	if (!open) return null;

	const { byId } = flattenCatalogItems(catalog);
	const tickedIds = new Set(ticked.map((t) => t.id));

	const toggleItem = (item: TestCatalogItem, checked: boolean) => {
		const next = checked ? [...ticked, toPending(item)] : ticked.filter((t) => t.id !== item.id);
		// De-dup safety
		const unique = Array.from(new Map(next.map((n) => [n.id, n])).values());
		onChangeTicked(unique);
	};

	return (
		<div className="patient-intake-modal-overlay" role="dialog" aria-modal="true" aria-label="Chọn xét nghiệm">
			<div className="patient-intake-modal">
				<header className="patient-intake-modal-header">
					<h3>Chọn xét nghiệm</h3>
					<button type="button" className="patient-intake-modal-close" onClick={onClose} disabled={disabled}>
						×
					</button>
				</header>

				<div className="patient-intake-modal-body">
					<div className="patient-intake-modal-left">
						{catalog.map((node) => (
							<div className="patient-intake-modal-group" key={node.id}>
								<div className="patient-intake-modal-group-title">{node.tenNhom}</div>
								<div className="patient-intake-modal-group-items">
									{node.children.map((item) => {
										const isChecked = tickedIds.has(item.id);
										return (
											<label key={item.id} className="patient-intake-modal-checkbox">
												<input
													type="checkbox"
													checked={isChecked}
													disabled={disabled}
													onChange={(e) => toggleItem(item, e.target.checked)}
												/>
												<span>
													{item.maSo} - {item.tenXetNghiem}
												</span>
											</label>
										);
									})}
								</div>
							</div>
						))}
					</div>

					<div className="patient-intake-modal-right">
						<div className="patient-intake-modal-ticked-summary">
							<span>Tổng số: <b>{ticked.length}</b></span>
						</div>

						<div className="patient-intake-modal-ticked-table-wrap">
							<table className="patient-intake-modal-ticked-table">
								<thead>
									<tr>
										<th style={{ width: 120 }}>Mã số</th>
										<th>Tên xét nghiệm</th>
									</tr>
								</thead>
								<tbody>
									{ticked.length === 0 ? (
										<tr>
											<td colSpan={2} className="empty-row">
												Chưa tick xét nghiệm nào.
											</td>
										</tr>
									) : (
										ticked.map((t) => (
											<tr key={t.id}>
												<td>{t.maSo}</td>
												<td>{byId[t.id]?.tenXetNghiem || t.tenXetNghiem}</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<footer className="patient-intake-modal-footer">
					<button type="button" className="patient-intake-btn-secondary" onClick={onClose} disabled={disabled}>
						Bỏ qua
					</button>
					<button type="button" className="patient-intake-btn-primary" onClick={onChoose} disabled={disabled}>
						Chọn
					</button>
				</footer>
			</div>
		</div>
	);
}

