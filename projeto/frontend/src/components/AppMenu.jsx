import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { useAuth } from '../context/AuthContext';

function MenuContent({
  links,
  location,
  closeSidebar,
  logout,
  user,
  userRoleClass,
  userInitials,
  mobile = false
}) {
  return (
    <>
      {mobile && (
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
      )}

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
    </>
  );
}

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

      <aside className="app-sidebar app-sidebar-desktop">
        <MenuContent
          links={links}
          location={location}
          closeSidebar={closeSidebar}
          logout={logout}
          user={user}
          userRoleClass={userRoleClass}
          userInitials={userInitials}
        />
      </aside>

      <Sidebar
        visible={sidebarOpen}
        onHide={closeSidebar}
        showCloseIcon={false}
        dismissable
        blockScroll
        className="app-sidebar-mobile-panel"
        modal
        position="left"
      >
        <div className="app-sidebar app-sidebar-mobile">
          <MenuContent
            links={links}
            location={location}
            closeSidebar={closeSidebar}
            logout={logout}
            user={user}
            userRoleClass={userRoleClass}
            userInitials={userInitials}
            mobile
          />
        </div>
      </Sidebar>
    </div>
  );
}
