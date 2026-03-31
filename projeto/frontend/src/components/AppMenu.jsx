import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Button } from 'primereact/button';
import { useAuth } from '../context/AuthContext';

export default function AppMenu() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth > 980) {
        setSidebarOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarOpen]);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-menu-shell">
      <Button
        type="button"
        icon="pi pi-bars"
        rounded
        aria-label="Abrir menu"
        className="app-sidebar-toggle"
        onClick={() => setSidebarOpen(true)}
      />

      <button
        type="button"
        className={`app-sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        aria-label="Fechar menu"
        onClick={closeSidebar}
      />

      <aside className={`app-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="app-sidebar-mobile-head">
          <span className="app-sidebar-mobile-kicker">Menu</span>
          <Button
            type="button"
            icon="pi pi-times"
            rounded
            text
            aria-label="Fechar menu"
            className="app-sidebar-close"
            onClick={closeSidebar}
          />
        </div>

        <div className="brand-block">
          <div className="brand-mark">AG</div>
          <div className="brand-copy">
            <strong>Atlas Gestão</strong>
            <span>Painel operacional</span>
          </div>
        </div>

        <div className="menu-links">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`menu-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={closeSidebar}
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
          <Button
            label="Sair"
            icon="pi pi-sign-out"
            severity="danger"
            onClick={() => {
              closeSidebar();
              logout();
            }}
          />
        </div>
      </aside>
    </div>
  );
}
