import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        login(email, password);
      } else {
        if (!name.trim()) {
          setError('Ingresa tu nombre.');
          setLoading(false);
          return;
        }
        register(email, password, name);
      }
    } catch (err) {
      const messages = {
        'USER_NOT_FOUND': 'No existe una cuenta con este correo.',
        'WRONG_PASSWORD': 'Contraseña incorrecta.',
        'EMAIL_EXISTS': 'Este correo ya está registrado.',
      };
      setError(messages[err.message] || 'Error al autenticar. Intenta de nuevo.');
    }

    setLoading(false);
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <h1>MisFinanzas</h1>
          <p>Controla tu dinero, alcanza tus metas</p>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Iniciar Sesión
          </button>
          <button
            className={`login-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Registrarse
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={4}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Tus datos se almacenan localmente en tu navegador.<br/>
          Usa el botón Exportar para hacer respaldo.
        </div>
      </div>
    </div>
  );
}
