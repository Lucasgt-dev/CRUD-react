import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import AppMenu from '../components/AppMenu';
import { request } from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({ users: 0, clients: 0, products: 0 });

  useEffect(() => {
    request('/dashboard').then(setStats).catch(console.error);
  }, []);

  return (
    <div className="page">
      <AppMenu />

      <div className="page-content">
        <section className="stats-hero">
          <h1>Dashboard</h1>
          <p>
            Visualize rapidamente os principais dados do sistema e acompanhe usuários,
            clientes e produtos em um único painel.
          </p>
          <div className="hero-meta">
            <span className="hero-pill">Resumo em tempo real</span>
            <span className="hero-pill">Navegação simples e objetiva</span>
          </div>
        </section>

        <div className="grid-cards">
          <div className="stat-card">
            <Card title="Usuários">
              <h2 className="stat-value">{stats.users}</h2>
            </Card>
          </div>

          <div className="stat-card">
            <Card title="Clientes">
              <h2 className="stat-value">{stats.clients}</h2>
            </Card>
          </div>

          <div className="stat-card">
            <Card title="Produtos">
              <h2 className="stat-value">{stats.products}</h2>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
