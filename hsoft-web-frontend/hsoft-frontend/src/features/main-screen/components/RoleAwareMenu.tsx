interface RoleAwareMenuProps {
  roleCode: string;
}

const SIDEBAR_ITEMS = [
  "Đăng ký bệnh nhân",
  "Danh sách bệnh nhân",
  "Tra cứu hồ sơ",
  "Báo cáo tiếp nhận",
];

const DEFAULT_ACTIVE_ITEM = "Danh sách bệnh nhân";

export function RoleAwareMenu({ roleCode }: RoleAwareMenuProps) {
  return (
    <nav className="main-screen-panel menu-panel" aria-label="Side navbar">
      <h3>Điều hướng nhanh</h3>
      <ul>
        {SIDEBAR_ITEMS.map((item) => (
          <li key={item}>
            <button
              type="button"
              className={`menu-link ${item === DEFAULT_ACTIVE_ITEM ? "is-active" : ""}`.trim()}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
      <p className="menu-note">Role active: {roleCode}</p>
    </nav>
  );
}
