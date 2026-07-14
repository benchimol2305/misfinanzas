import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import Charts from './Charts';
import ConverterModal from './ConverterModal';
import BudgetGoals from './BudgetGoals';
import { fetchBCVRates, convert, formatCurrency, CURRENCIES } from '../utils/currency';
import { calculateTotals, getMonthTransactions } from '../utils/helpers';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState(null);
  const [showConverter, setShowConverter] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = `finanzas_${currentUser.uid}`;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (e) {
        setTransactions([]);
      }
    }
    setLoading(false);
  }, [currentUser.uid]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, loading, currentUser.uid]);

  useEffect(() => {
    fetchBCVRates().then(setRates);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  function addTransaction(tx) {
    const newTx = {
      ...tx,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
    showToast(tx.type === 'income' ? 'Ingreso registrado' : 'Gasto registrado');
  }

  function deleteTransaction(id) {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('Transacción eliminada', 'warning');
  }

  function clearAllData() {
    setTransactions([]);
    showToast('Todos los datos han sido eliminados', 'error');
  }

  function exportData() {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzas_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Datos exportados correctamente');
  }

  function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          setTransactions(prev => [...data, ...prev]);
          showToast(`${data.length} transacciones importadas`);
        }
      } catch (err) {
        showToast('Error al importar archivo', 'error');
      }
    };
    reader.readAsText(file);
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const monthTransactions = getMonthTransactions(transactions);
  const monthTotals = calculateTotals(monthTransactions);
  const allTotals = calculateTotals(transactions);

  const convertedBalance = rates ? convert(allTotals.balance, 'USD', currency, rates) : 0;
  const convertedMonthIncome = rates ? convert(monthTotals.totalIncome, 'USD', currency, rates) : 0;
  const convertedMonthExpense = rates ? convert(monthTotals.totalExpenses, 'USD', currency, rates) : 0;

  return (
    <div className="dashboard">
      {/* Currency Selector */}
      <div className="currency-selector">
        <span>Moneda:</span>
        {CURRENCIES.map(c => (
          <button
            key={c}
            className={`currency-btn ${currency === c ? 'active' : ''}`}
            onClick={() => setCurrency(c)}
          >
            {c === 'USD' ? '$ USD' : c === 'EUR' ? '€ EUR' : c === 'USDT' ? '₮ USDT' : 'Bs BS'}
          </button>
        ))}
        <button
          className="currency-btn"
          onClick={() => setShowConverter(true)}
          style={{ marginLeft: 'auto', borderColor: 'var(--accent)', color: 'var(--accent)' }}
        >
          Convertir
        </button>
      </div>

      {/* Exchange Rate Banner */}
      {rates && (
        <div className="exchange-rate-banner">
          <div className="rate-info">
            <div className="rate-icon">🇻🇪</div>
            <div>
              <div className="rate-label">Tasa BCV Hoy</div>
              <div className="rate-value">1 USD = {formatCurrency(rates.USD.BS, 'BS')}</div>
            </div>
          </div>
          <div className="rate-rates">
            <div className="rate-item">
              <div className="rate-item-label">EUR/BS</div>
              <div className="rate-item-value">{formatCurrency(rates.EUR.BS, 'BS')}</div>
            </div>
            <div className="rate-item">
              <div className="rate-item-label">USD/EUR</div>
              <div className="rate-item-value">{rates.USD.EUR.toFixed(4)}</div>
            </div>
            <div className="rate-item">
              <div className="rate-item-label">USDT/BS</div>
              <div className="rate-item-value">{formatCurrency(rates.USDT.BS, 'BS')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card balance">
          <div className="label">Balance Total</div>
          <div className="value">{formatCurrency(convertedBalance, currency)}</div>
          <div className="subtext">En todas las transacciones</div>
        </div>
        <div className="stat-card income">
          <div className="label">Ingresos del Mes</div>
          <div className="value">{formatCurrency(convertedMonthIncome, currency)}</div>
          <div className="subtext">{monthTransactions.filter(t => t.type === 'income').length} transacciones</div>
        </div>
        <div className="stat-card expense">
          <div className="label">Gastos del Mes</div>
          <div className="value">{formatCurrency(convertedMonthExpense, currency)}</div>
          <div className="subtext">{monthTransactions.filter(t => t.type === 'expense').length} transacciones</div>
        </div>
        <div className="stat-card savings">
          <div className="label">Tasa de Ahorro</div>
          <div className="value">
            {monthTotals.totalIncome > 0
              ? ((1 - monthTotals.totalExpenses / monthTotals.totalIncome) * 100).toFixed(1) + '%'
              : '0%'
            }
          </div>
          <div className="subtext">Ingresos menos gastos / Ingresos</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Column */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3>Nueva Transacción</h3>
            </div>
            <div className="card-body">
              <TransactionForm onSubmit={addTransaction} rates={rates} />
            </div>
          </div>

          <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-header">
              <h3>Metas de Presupuesto</h3>
            </div>
            <div className="card-body">
              <BudgetGoals
                transactions={monthTransactions}
                rates={rates}
                currency={currency}
                showToast={showToast}
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3>Últimas Transacciones</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-logout" onClick={exportData} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                  Exportar
                </button>
                <label className="btn-logout" style={{ fontSize: '0.75rem', padding: '4px 10px', cursor: 'pointer' }}>
                  Importar
                  <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
                </label>
                {transactions.length > 0 && (
                  <button
                    className="btn-logout"
                    onClick={() => {
                      if (window.confirm('¿Eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
                        clearAllData();
                      }
                    }}
                    style={{ fontSize: '0.75rem', padding: '4px 10px', color: 'var(--danger)' }}
                  >
                    Limpiar Todo
                  </button>
                )}
              </div>
            </div>
            <TransactionList
              transactions={transactions}
              onDelete={deleteTransaction}
              rates={rates}
              currency={currency}
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <Charts
        transactions={transactions}
        rates={rates}
        currency={currency}
      />

      {/* Converter Modal */}
      {showConverter && (
        <ConverterModal
          rates={rates}
          onClose={() => setShowConverter(false)}
          currency={currency}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>{toast.message}</div>
        </div>
      )}
    </div>
  );
}
