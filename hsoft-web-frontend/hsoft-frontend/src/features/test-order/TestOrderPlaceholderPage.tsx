import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function TestOrderPlaceholderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const maBn = useMemo(() => searchParams.get("maBn")?.trim() || "", [searchParams]);

  return (
    <section style={{ padding: "24px" }}>
      <h1>Chỉ định xét nghiệm</h1>
      <p>Màn hình Step 2 đang được triển khai.</p>
      <p>Mã bệnh nhân nhận từ hàng chờ: <strong>{maBn || "(không có)"}</strong></p>

      <button type="button" onClick={() => navigate("/main-screen")}>Quay lại dashboard</button>
    </section>
  );
}
