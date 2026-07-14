import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function filterTransactionsByDate(transactions, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return transactions.filter(t => {
    const date = parseISO(t.date);
    return isWithinInterval(date, { start, end });
  });
}

export function getMonthTransactions(transactions, date = new Date()) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return filterTransactionsByDate(transactions, start, end);
}

export function getWeekTransactions(transactions, date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return filterTransactionsByDate(transactions, start, end);
}

export function getYearTransactions(transactions, date = new Date()) {
  const start = startOfYear(date);
  const end = endOfYear(date);
  return filterTransactionsByDate(transactions, start, end);
}

export function calculateTotals(transactions) {
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(t => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpenses += t.amount;
    }
  });

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses
  };
}

export function getExpensesByCategory(transactions) {
  const categories = {};

  transactions.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category || 'Sin categoría';
    categories[cat] = (categories[cat] || 0) + t.amount;
  });

  return Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .map(([name, amount]) => ({ name, amount }));
}

export function getDailyBalance(transactions) {
  const dailyData = {};

  transactions.forEach(t => {
    const day = t.date.split('T')[0];
    if (!dailyData[day]) {
      dailyData[day] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      dailyData[day].income += t.amount;
    } else {
      dailyData[day].expense += t.amount;
    }
  });

  return Object.entries(dailyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense
    }));
}

export function getMonthlyTrend(transactions) {
  const months = {};

  for (let i = 11; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const key = format(date, 'yyyy-MM');
    months[key] = { label: format(date, 'MMM yyyy', { locale: es }), income: 0, expense: 0 };
  }

  transactions.forEach(t => {
    const key = t.date.substring(0, 7);
    if (months[key]) {
      if (t.type === 'income') {
        months[key].income += t.amount;
      } else {
        months[key].expense += t.amount;
      }
    }
  });

  return Object.values(months);
}

export const EXPENSE_CATEGORIES = [
  'Alimentación', 'Transporte', 'Vivienda', 'Servicios',
  'Salud', 'Educación', 'Entretenimiento', 'Ropa',
  'Ahorro', 'Deudas', 'Otros Gastos'
];

export const INCOME_CATEGORIES = [
  'Salario', 'Freelance', 'Inversiones', 'Negocio',
  'Ventas', 'Regalos', 'Otros Ingresos'
];
