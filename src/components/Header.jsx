import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { currentUser, logout } = useAuth();

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario';

  return (
    <header className="header">
      <div className="header-logo">
        <svg viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="2"/>
          <text x="14" y="19" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor">$</text>
        </svg>
        MisFinanzas
      </div>

      <div className="header-user">
        <span>
          Hola, <span className="header-user-name">{displayName}</span>
        </span>
        <button className="btn-logout" onClick={logout}>
          Salir
        </button>
      </div>
    </header>
  );
}
