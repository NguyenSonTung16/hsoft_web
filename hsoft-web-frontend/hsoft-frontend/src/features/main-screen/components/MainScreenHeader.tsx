import type { MainScreenContextDto } from "../services/mainScreenService";

interface MainScreenHeaderProps {
  context: MainScreenContextDto;
  onLogoutForContextChange: () => void;
  onRefresh: () => void;
  isNavOpen: boolean;
  onToggleNav: () => void;
}

export function MainScreenHeader({
  context,
  onLogoutForContextChange,
  onRefresh,
  isNavOpen,
  onToggleNav,
}: MainScreenHeaderProps) {
  const facilityDisplay = context.facilityName || context.facilityId;
  const labAreaDisplay = context.labAreaName || context.labAreaId;

  return (
    <header className="main-screen-header">
      <div className="main-screen-header-title-wrap">
        <button
          type="button"
          className={`main-screen-burger ${isNavOpen ? "is-open" : ""}`.trim()}
          aria-label="Mở menu điều hướng"
          aria-expanded={isNavOpen}
          onClick={onToggleNav}
        >
          <span />
          <span />
          <span />
        </button>

        <div>
          <h2>Điều phối quy trình xét nghiệm</h2>
          <p>
            Cơ sở: <strong>{facilityDisplay}</strong> | Khu XN: <strong>{labAreaDisplay}</strong> | Vai trò: <strong>{context.roleCode}</strong>
          </p>
        </div>
      </div>

      <div className="header-actions">
        <button type="button" onClick={onRefresh}>Làm mới</button>
        <button type="button" onClick={onLogoutForContextChange}>Đăng xuất</button>
      </div>
    </header>
  );
}
