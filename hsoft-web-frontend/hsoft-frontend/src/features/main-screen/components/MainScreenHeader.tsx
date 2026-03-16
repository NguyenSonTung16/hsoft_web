import type { MainScreenContextDto } from "../services/mainScreenService";

interface MainScreenHeaderProps {
  context: MainScreenContextDto;
  onLogoutForContextChange: () => void;
  onRefresh: () => void;
}

export function MainScreenHeader({
  context,
  onLogoutForContextChange,
  onRefresh,
}: MainScreenHeaderProps) {
  return (
    <header className="main-screen-header">
      <div>
        <h2>Điều phối quy trình xét nghiệm</h2>
        <p>
          Co so: <strong>{context.facilityId}</strong> | Khu XN: <strong>{context.labAreaId}</strong> | Vai tro: <strong>{context.roleCode}</strong>
        </p>
      </div>

      <div className="header-actions">
        <button type="button" onClick={onRefresh}>Làm mới</button>
        <button type="button" onClick={onLogoutForContextChange}>Đăng xuất</button>
      </div>
    </header>
  );
}
