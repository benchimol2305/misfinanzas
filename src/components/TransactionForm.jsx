import { useState } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/helpers';

export default function TransactionForm({ onSubmit }) {
  const [type, setType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleSubmit(e) {
    e.preventDefault();
    if (!description || !amount || !category) return;

    onSubmit({
      type,
      description,
      amount: parseFloat(amount),
      category,
      date: new Date(date).toISOString(),
      currency,
      notes
    });

    setDescription('');
    setAmount('');
    setCategory('');
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
  }

  return (
    <form className="tx-form" onSubmit={handleSubmit}>
      <div className="tx-type-toggle">
        <button
          type="button"
          className={`tx-type-btn expense ${type === 'expense' ? 'active' : ''}`}
          onClick={() => { setType('expense'); setCategory(''); }}
        >
          Gasto
        </button>
        <button
          type="button"
          className={`tx-type-btn income ${type === 'income' ? 'active' : ''}`}
          onClick={() => { setType('income'); setCategory(''); }}
        >
          Ingreso
        </button>
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Almuerzo, Pago de luz..."
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Monto</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
          />
        </div>
        <div className="form-group">
          <label>Moneda</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">$ Dólar</option>
            <option value="EUR">€ Euro</option>
            <option value="USDT">₮ USDT</option>
            <option value="BS">Bs Bolívar</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Categoría</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Seleccionar...</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Notas (opcional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Detalles adicionales..."
        />
      </div>

      <button type="submit" className="btn-add">
        Registrar {type === 'expense' ? 'Gasto' : 'Ingreso'}
      </button>
    </form>
  );
}
