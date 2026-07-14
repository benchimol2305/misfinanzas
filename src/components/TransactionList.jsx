import { useState } from 'react';
import { convert, formatCurrency } from '../utils/currency';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const CATEGORY_ICONS = {
  'Alimentación': '🍔',
  'Transporte': '🚗',
  'Vivienda': '🏠',
  'Servicios': '💡',
  'Salud': '🏥',
  'Educación': '📚',
  'Entretenimiento': '🎬',
  'Ropa': '👕',
  'Ahorro': '💰',
  'Deudas': '💳',
  'Otros Gastos': '📦',
  'Salario': '💼',
  'Freelance': '💻',
  'Inversiones': '📈',
  'Negocio': '🏪',
  'Ventas': '🏷️',
  'Regalos': '🎁',
  'Otros Ingresos': '💵'
};

export default function TransactionList({ transactions, onDelete, rates, currency }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter(t => {
    const matchesType = filter === 'all' ||
      (filter === 'income' && t.type === 'income') ||
      (filter === 'expense' && t.type === 'expense');
    const matchesSearch = !searchTerm ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (transactions.length === 0) {
    return (
      <div className="tx-empty">
        <div className="icon">📊</div>
        <p>No hay transacciones aún</p>
        <p style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--text-muted)' }}>
          Registra tu primer gasto o ingreso
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="tx-filters">
        <button
          className={`tx-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({transactions.length})
        </button>
        <button
          className={`tx-filter-btn ${filter === 'income' ? 'active' : ''}`}
          onClick={() => setFilter('income')}
        >
          Ingresos
        </button>
        <button
          className={`tx-filter-btn ${filter === 'expense' ? 'active' : ''}`}
          onClick={() => setFilter('expense')}
        >
          Gastos
        </button>
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            marginLeft: 'auto',
            padding: '6px 12px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            outline: 'none',
            width: '120px'
          }}
        />
      </div>

      <div className="tx-list">
        {sorted.length === 0 ? (
          <div className="tx-empty">
            <div className="icon">🔍</div>
            <p>No se encontraron transacciones</p>
          </div>
        ) : (
          sorted.map(tx => {
            const convertedAmount = rates
              ? convert(tx.amount, tx.currency, currency, rates)
              : tx.amount;

            return (
              <div key={tx.id} className="tx-item">
                <div className={`tx-icon ${tx.type}`}>
                  {CATEGORY_ICONS[tx.category] || (tx.type === 'income' ? '💵' : '💸')}
                </div>
                <div className="tx-details">
                  <div className="tx-desc">{tx.description}</div>
                  <div className="tx-meta">
                    {tx.category} · {format(parseISO(tx.date), "dd MMM yyyy", { locale: es })}
                    {tx.currency !== 'USD' && (
                      <span style={{ marginLeft: '4px', color: 'var(--text-muted)' }}>
                        ({tx.currency})
                      </span>
                    )}
                  </div>
                </div>
                <div className={`tx-amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(convertedAmount, currency)}
                </div>
                <button
                  className="tx-delete"
                  onClick={() => {
                    if (window.confirm('Eliminar esta transacción?')) {
                      onDelete(tx.id);
                    }
                  }}
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
