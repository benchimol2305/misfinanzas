import { useState, useEffect } from 'react';
import { convert, formatCurrency, CURRENCIES, getCurrencyName } from '../utils/currency';

export default function ConverterModal({ rates, onClose, currency, rateMeta }) {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BS');
  const [result, setResult] = useState(0);

  useEffect(() => {
    if (rates && amount) {
      const converted = convert(parseFloat(amount) || 0, fromCurrency, toCurrency, rates);
      setResult(converted);
    }
  }, [amount, fromCurrency, toCurrency, rates]);

  function swapCurrencies() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Convertidor de Monedas</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="converter-inputs">
            <div className="converter-row">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>{c} - {getCurrencyName(c)}</option>
                ))}
              </select>
            </div>

            <div className="converter-arrow">
              <button onClick={swapCurrencies} style={{
                background: 'transparent', color: 'var(--accent)', fontSize: '1.5rem',
                padding: '4px 12px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer'
              }} title="Intercambiar">
                ⇅
              </button>
            </div>

            <div className="converter-row">
              <input type="text" value={formatCurrency(result, toCurrency)} readOnly
                style={{ background: 'var(--bg-card)', color: 'var(--accent)', fontWeight: '700' }} />
              <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>{c} - {getCurrencyName(c)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick conversions */}
          {rates && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Conversiones Rápidas
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[10, 50, 100, 500, 1000, 5000].map(val => (
                  <div key={val} onClick={() => setAmount(val.toString())} style={{
                    padding: '10px', background: 'var(--bg-input)', borderRadius: '8px',
                    cursor: 'pointer', textAlign: 'center', border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {formatCurrency(val, fromCurrency)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '2px' }}>
                      = {formatCurrency(convert(val, fromCurrency, toCurrency, rates), toCurrency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BCV vs Paralelo */}
          {rateMeta && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                BCV vs Paralelo
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{
                  padding: '14px', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tasa Oficial BCV
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>USD/BS</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--accent)' }}>{formatCurrency(rateMeta.bcv.USD, 'BS')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>EUR/BS</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--accent)' }}>{formatCurrency(rateMeta.bcv.EUR, 'BS')}</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '14px', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Mercado Paralelo
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>USD/BS</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#feca57' }}>{formatCurrency(rateMeta.paralelo.USD, 'BS')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>EUR/BS</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#feca57' }}>{formatCurrency(rateMeta.paralelo.EUR, 'BS')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {rateMeta.lastUpdate && (
                <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                  Última actualización: {new Date(rateMeta.lastUpdate).toLocaleString('es-VE')} · Fuente: {rateMeta.source}
                </div>
              )}
            </div>
          )}

          {/* All rates table */}
          {rates && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Matriz de Conversiones (Tasa BCV)
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-secondary)' }}>De \ Para</th>
                      {CURRENCIES.map(c => (
                        <th key={c} style={{ padding: '8px', textAlign: 'right', color: 'var(--text-secondary)' }}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CURRENCIES.map(from => (
                      <tr key={from} style={{ borderBottom: '1px solid rgba(42,42,74,0.3)' }}>
                        <td style={{ padding: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>{from}</td>
                        {CURRENCIES.map(to => (
                          <td key={to} style={{
                            padding: '8px', textAlign: 'right',
                            color: from === to ? 'var(--text-muted)' : 'var(--text-primary)',
                            fontWeight: from === to ? 'normal' : '500'
                          }}>
                            {from === to ? '—' : rates[from][to].toFixed(4)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
