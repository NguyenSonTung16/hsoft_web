import type { SampleHistoryItem } from "../types/patient-intake.types";

export function SampleHistoryPanel({ history }: { history: SampleHistoryItem[] }) {
	return (
		<div
			className="patient-intake-sample-history"
			style={{
				background: "#fff",
				borderRadius: 12,
				padding: 16,
				boxShadow: "0 1px 4px #0001",
				border: "1px solid #d9e2ef",
			}}
		>
			<b style={{ fontSize: "1rem" }}>CÁC LẦN LẤY MẪU</b>

			{history.length === 0 ? (
				<p style={{ marginTop: 8, color: "#49617f", fontSize: "0.95rem" }}>Chưa có lịch sử lấy mẫu.</p>
			) : (
				<table style={{ width: "100%", marginTop: 8, fontSize: 13, borderCollapse: "collapse" }}>
					<thead>
						<tr>
							<th style={{ textAlign: "left", padding: "8px 6px", color: "#153758", fontSize: 13 }}>Ngày giờ</th>
							<th style={{ textAlign: "left", padding: "8px 6px", color: "#153758", fontSize: 13 }}>Loại mẫu</th>
							<th style={{ textAlign: "left", padding: "8px 6px", color: "#153758", fontSize: 13 }}>Kỹ thuật viên</th>
							<th style={{ textAlign: "left", padding: "8px 6px", color: "#153758", fontSize: 13 }}>Tình trạng</th>
						</tr>
					</thead>
					<tbody>
						{history.map((item, idx) => (
							<tr key={idx}>
								<td style={{ padding: "8px 6px", fontSize: 13 }}>{item.ngayGio}</td>
								<td style={{ padding: "8px 6px", fontSize: 13 }}>{item.loaiMau}</td>
								<td style={{ padding: "8px 6px", fontSize: 13 }}>{item.kyThuatVien}</td>
								<td style={{ padding: "8px 6px", fontSize: 13 }}>{item.tinhTrang}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}

