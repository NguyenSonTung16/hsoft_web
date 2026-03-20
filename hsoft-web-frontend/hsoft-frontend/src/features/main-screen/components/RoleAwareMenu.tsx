import { useLocation, useNavigate } from "react-router-dom";

interface RoleAwareMenuProps {
  onClose?: () => void;
}

const SIDEBAR_ITEMS = [
  { label: "Đăng ký bệnh nhân", path: "/patient-intake" },
  { label: "Danh sách bệnh nhân", path: "/main-screen?view=list" },
  { label: "Lấy mẫu bệnh phẩm", path: "/sample-collection" },
  { label: "Báo cáo tiếp nhận", path: "/main-screen?view=report" },
];

export function RoleAwareMenu({ onClose }: RoleAwareMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = `${location.pathname}${location.search}`;

  const isItemActive = (path: string, label: string) => {
    if (currentPath === path) return true;
    return label === "Danh sách bệnh nhân" && location.pathname === "/main-screen" && !location.search;
  };

  const handleItemClick = (path: string) => {
    navigate(path);
    onClose?.();
  };

  return (
    <nav className="main-screen-panel menu-panel" aria-label="Sidebar menu">
      <div className="menu-panel-header">
        <h3>Menu</h3>
        <button
          type="button"
          className="sidebar-close"
          onClick={() => onClose?.()}
          aria-label="Đóng sidebar"
        >
          ×
        </button>
      </div>

      <ul className="sidebar-menu">
        {SIDEBAR_ITEMS.map((item) => (
          <li
            key={item.label}
            className={`sidebar-menu-item ${isItemActive(item.path, item.label) ? "active" : ""}`.trim()}
          >
            <button
              type="button"
              className="sidebar-menu-button"
              onClick={() => handleItemClick(item.path)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
