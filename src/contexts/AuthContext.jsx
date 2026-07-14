import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const USERS_KEY = 'misfinanzas_users';
const SESSION_KEY = 'misfinanzas_session';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const user = JSON.parse(session);
        setCurrentUser(user);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  function register(email, password, displayName) {
    const users = getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('EMAIL_EXISTS');
    }

    const newUser = {
      uid: 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
      email: email.toLowerCase(),
      password: hashPassword(password),
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    const sessionUser = { uid: newUser.uid, email: newUser.email, displayName: newUser.displayName };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);
    return sessionUser;
  }

  function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (user.password !== hashPassword(password)) {
      throw new Error('WRONG_PASSWORD');
    }

    const sessionUser = { uid: user.uid, email: user.email, displayName: user.displayName };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);
    return sessionUser;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }

  const value = {
    currentUser,
    register,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
