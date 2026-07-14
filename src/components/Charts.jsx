import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { getExpensesByCategory, getMonthlyTrend, getDailyBalance } from '../utils/helpers';
import { convert, formatCurrency } from '../utils/currency';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const COLORS = [
  '#00d4aa', '#ff6b6b', '#feca57', '#54a0ff', '#5f27cd',
  '#01a3a4', '#f368e0', '#ff9f43', '#6ab04c', '#eb4d4b',
  '#7ed6df'
];

export default function Charts({ transactions, rates, currency }) {
  const expensesByCategory = useMemo(() => {
    const data = getExpensesByCategory(transactions);
    return {
      labels: data.map(d => d.name),
      amounts: data.map(d => rates ? convert(d.amount, 'USD', currency, rates) : d.amount)
    };
  }, [transactions, rates, currency]);

  const monthlyTrend = useMemo(() => {
    const data = getMonthlyTrend(transactions);
    return {
      labels: data.map(d => d.label),
      income: data.map(d => rates ? convert(d.income, 'USD', currency, rates) : d.income),
      expense: data.map(d => rates ? convert(d.expense, 'USD', currency, rates) : d.expense)
    };
  }, [transactions, rates, currency]);

  const dailyBalance = useMemo(() => {
    const data = getDailyBalance(transactions).slice(-14);
    return {
      labels: data.map(d => {
        const parts = d.date.split('-');
        return `${parts[2]}/${parts[1]}`;
      }),
      balance: data.map(d => rates ? convert(d.balance, 'USD', currency, rates) : d.balance),
      income: data.map(d => rates ? convert(d.income, 'USD', currency, rates) : d.income),
      expense: data.map(d => rates ? convert(d.expense, 'USD', currency, rates) : d.expense)
    };
  }, [transactions, rates, currency]);

  const hasExpenses = expensesByCategory.labels.length > 0;
  const hasData = transactions.length > 0;

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#8892b0', font: { size: 11 } }
      }
    },
    scales: {
      x: {
        ticks: { color: '#5a6380', font: { size: 10 } },
        grid: { color: 'rgba(42, 42, 74, 0.3)' }
      },
      y: {
        ticks: { color: '#5a6380', font: { size: 10 } },
        grid: { color: 'rgba(42, 42, 74, 0.3)' }
      }
    }
  };

  return (
    <div className="charts-grid">
      {/* Pie Chart - Gastos por categoría */}
      <div className="card">
        <div className="card-header">
          <h3>Gastos por Categoría</h3>
        </div>
        <div className="card-body">
          <div className="chart-container">
            {hasExpenses ? (
              <Doughnut
                data={{
                  labels: expensesByCategory.labels,
                  datasets: [{
                    data: expensesByCategory.amounts,
                    backgroundColor: COLORS.slice(0, expensesByCategory.labels.length),
                    borderWidth: 0,
                    hoverOffset: 8
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '65%',
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        color: '#8892b0',
                        font: { size: 11 },
                        padding: 12,
                        usePointStyle: true,
                        pointStyleWidth: 8
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw, currency)}`
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="tx-empty">
                <div className="icon">🥧</div>
                <p>Sin datos de gastos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bar Chart - Tendencia mensual */}
      <div className="card">
        <div className="card-header">
          <h3>Tendencia Mensual</h3>
        </div>
        <div className="card-body">
          <div className="chart-container">
            {hasData ? (
              <Bar
                data={{
                  labels: monthlyTrend.labels,
                  datasets: [
                    {
                      label: 'Ingresos',
                      data: monthlyTrend.income,
                      backgroundColor: 'rgba(0, 212, 170, 0.7)',
                      borderRadius: 4
                    },
                    {
                      label: 'Gastos',
                      data: monthlyTrend.expense,
                      backgroundColor: 'rgba(255, 107, 107, 0.7)',
                      borderRadius: 4
                    }
                  ]
                }}
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw, currency)}`
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="tx-empty">
                <div className="icon">📊</div>
                <p>Sin datos disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Chart - Balance diario */}
      <div className="card" style={{ gridColumn: hasExpenses ? 'span 2' : 'span 2' }}>
        <div className="card-header">
          <h3>Balance Diario (Últimos 14 días)</h3>
        </div>
        <div className="card-body">
          <div className="chart-container" style={{ height: '220px' }}>
            {dailyBalance.labels.length > 0 ? (
              <Line
                data={{
                  labels: dailyBalance.labels,
                  datasets: [
                    {
                      label: 'Balance',
                      data: dailyBalance.balance,
                      borderColor: '#00d4aa',
                      backgroundColor: 'rgba(0, 212, 170, 0.1)',
                      fill: true,
                      tension: 0.4,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                      borderWidth: 2
                    }
                  ]
                }}
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ` Balance: ${formatCurrency(ctx.raw, currency)}`
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="tx-empty">
                <div className="icon">📈</div>
                <p>Agrega transacciones para ver tu balance</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
