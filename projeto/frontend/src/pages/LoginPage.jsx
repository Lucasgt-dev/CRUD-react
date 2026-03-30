import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      const inactiveAccess = error.message?.toLowerCase().includes('desativado');
      toast.current?.show({
        severity: inactiveAccess ? 'warn' : 'error',
        summary: inactiveAccess ? 'Acesso bloqueado' : 'Falha no login',
        detail: error.message,
        life: 3000
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="center-screen">
      <Toast ref={toast} position="top-right" />
      <section className="login-card login-card-compact login-card-modern">
        <Card>
          <div className="login-brand login-brand-shell">
            <div className="brand-mark login-brand-mark">AG</div>
            <div className="brand-copy">
              <strong>Atlas Gestão</strong>
              <span>Painel operacional</span>
            </div>
          </div>

          <div className="login-head">
            <span className="login-kicker">Acesso seguro</span>
            <h1 className="login-title">Login do Sistema</h1>
            <p className="login-subtitle">
              Entre com suas credenciais para acessar o painel Atlas e acompanhar a operação em um só lugar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="form-col login-form">
            <label>E-mail</label>
            <InputText
              type="email"
              placeholder="exemplo@empresa.com"
              value={email}
              disabled={submitting}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
            />

            <label>Senha</label>
            <div className="password-field">
              <InputText
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={password}
                disabled={submitting}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                className="password-field-input"
              />
              <button
                type="button"
                className="password-toggle"
                disabled={submitting}
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <i className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'}`} />
              </button>
            </div>

            <Button
              type="submit"
              label={submitting ? 'Entrando...' : 'Entrar'}
              icon={submitting ? undefined : 'pi pi-sign-in'}
              loading={submitting}
              disabled={submitting}
              className="login-submit-button"
            />

            <div className="login-note">
              <span className="login-note-dot" />
              <span>Ambiente protegido para acesso interno da Atlas Gestão.</span>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}
