import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Header from './components/Header';

function App() {
  const { currentUser } = useAuth();

  return (
    <div className="app">
      {currentUser ? (
        <>
          <Header />
          <Dashboard />
        </>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
