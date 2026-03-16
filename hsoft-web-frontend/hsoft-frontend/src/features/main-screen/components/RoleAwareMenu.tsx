interface RoleAwareMenuProps {
  roleCode: string;
}

const ROLE_MENU: Record<string, string[]> = {
  reception_staff: ["Tiep nhan", "Chi dinh", "Queue"],
  sample_collection_technician: ["Lay mau", "Nhan mau", "Queue"],
  lab_technician: ["Phan tich", "Nhap ket qua", "Queue"],
  lab_doctor: ["Duyet ket qua", "In ket qua", "Queue"],
  system_admin: ["Quản trị", "Báo cáo", "Queue"],
};

export function RoleAwareMenu({ roleCode }: RoleAwareMenuProps) {
  const items = ROLE_MENU[roleCode] ?? ["Queue"];

  return (
    <nav className="main-screen-panel menu-panel" aria-label="Role menu">
      <h3>Menu theo quyền</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="menu-note">Role active: {roleCode}</p>
    </nav>
  );
}
