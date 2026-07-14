import { useState, useEffect } from 'react';
import { formatCurrency, convert } from '../utils/currency';

const DEFAULT_GOALS = [
  { id: 1, name: 'Alimentación', limit: 500, color: '#ff6b6b' },
  { id: 2, name: 'Transporte', limit: 200, color: '#54a0ff' },
  { id: 3, name: 'Entretenimiento', limit: 150, color: '#feca57' },
  { id: 4, name: 'Servicios', limit: 100, color: '#5f27cd' },
  { id: 5, name: 'Ropa', limit: 100, color: '#f368e0' },
];

export default function BudgetGoals({ transactions, rates, currency, showToast }) {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('budget_goals');
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });
  const [editing, setEditing] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', limit: '' });

  useEffect(() => {
    localStorage.setItem('budget_goals', JSON.stringify(goals));
  }, [goals]);

  function addGoal() {
    if (!newGoal.name || !newGoal.limit) return;
    setGoals(prev => [...prev, {
      id: Date.now(),
      name: newGoal.name,
      limit: parseFloat(newGoal.limit),
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }]);
    setNewGoal({ name: '', limit: '' });
    showToast('Meta agregada');
  }

  function removeGoal(id) {
    setGoals(prev => prev.filter(g => g.id !== id));
    showToast('Meta eliminada', 'warning');
  }

  function getSpent(name) {
    return transactions
      .filter(t => t.type === 'expense' && t.category === name)
      .reduce((sum, t) => {
        const converted = rates ? convert(t.amount, t.currency, 'USD', rates) : t.amount;
        return sum + converted;
      }, 0);
  }

  return (
    <div>
      {goals.map(goal => {
        const spent = getSpent(goal.name);
        const convertedLimit = rates ? convert(goal.limit, 'USD', currency, rates) : goal.limit;
        const convertedSpent = rates ? convert(spent, 'USD', currency, rates) : spent;
        const percentage = goal.limit > 0 ? Math.min((spent / goal.limit) * 100, 100) : 0;
        const status = percentage >= 90 ? 'danger' : percentage >= 70 ? 'warning' : 'safe';

        return (
          <div key={goal.id} className="budget-item">
            <div className="budget-header">
              <div className="budget-name">
                {goal.name}
                <button
                  onClick={() => removeGoal(goal.id)}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    marginLeft: '8px',
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    opacity: 0.5,
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="budget-values">
                {formatCurrency(convertedSpent, currency)} / {formatCurrency(convertedLimit, currency)}
              </div>
            </div>
            <div className="budget-bar">
              <div
                className={`budget-bar-fill ${status}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {percentage.toFixed(0)}% utilizado · {formatCurrency(convertedLimit - convertedSpent, currency)} restante
            </div>
          </div>
        );
      })}

      {/* Add new goal */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border)'
      }}>
        <input
          type="text"
          value={newGoal.name}
          onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Categoría"
          style={{
            flex: 2,
            padding: '8px 12px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
        <input
          type="number"
          value={newGoal.limit}
          onChange={(e) => setNewGoal(prev => ({ ...prev, limit: e.target.value }))}
          placeholder="Límite ($)"
          min="0"
          style={{
            flex: 1,
            padding: '8px 12px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
        <button
          onClick={addGoal}
          style={{
            padding: '8px 16px',
            background: 'var(--accent)',
            color: 'var(--bg-primary)',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
