import { Link, useLocation } from 'react-router';
import { Button } from 'primereact/button';
import { useAuth } from '../context/AuthContext';

export default function AppMenu() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const userInitials = (user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const userRoleClass = user?.role ? `role-${user.role}` : 'role-user';
  const links = [
    { to: '/', label: 'Dashboard' },
    ...(user?.role === 'super' || user?.role === 'user' ? [{ to: '/users', label: 'Usuários' }] : []),
    { to: '/clients', label: 'Clientes' },
    { to: '/products', label: 'Produtos' }
  ];

  return (
    <aside className="app-sidebar">
      <div className="brand-block">
        <div className="brand-mark">CR</div>
        <div className="brand-copy">
          <strong>CRUD React</strong>
          <span>Painel operacional</span>
        </div>
      </div>

      <div className="menu-links">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`menu-link ${location.pathname === link.to ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="menu-right">
        <div className="user-chip">
          <div className={`user-mark ${userRoleClass}`}>{userInitials}</div>
          <span>{user?.name} ({user?.role})</span>
        </div>
        <Button label="Sair" icon="pi pi-sign-out" severity="danger" onClick={logout} />
      </div>
    </aside>
  );
}
