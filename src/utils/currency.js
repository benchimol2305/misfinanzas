const BCV_CACHE_KEY = 'bcv_rates_cache';
const CACHE_DURATION = 30 * 60 * 1000;

const FALLBACK_RATES = {
  USD: { USD: 1, EUR: 0.92, USDT: 1, BS: 36.50 },
  EUR: { USD: 1.087, EUR: 1, USDT: 1.087, BS: 39.67 },
  USDT: { USD: 1, EUR: 0.92, USDT: 1, BS: 36.50 },
  BS: { USD: 0.0274, EUR: 0.0252, USDT: 0.0274, BS: 1 }
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  USDT: '₮',
  BS: 'Bs'
};

const CURRENCY_NAMES = {
  USD: 'Dólar Americano',
  EUR: 'Euro',
  USDT: 'Tether (USDT)',
  BS: 'Bolívar Venezolano'
};

function getCachedRates() {
  try {
    const cached = localStorage.getItem(BCV_CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        return data.rates;
      }
    }
  } catch (e) {}
  return null;
}

function setCachedRates(rates) {
  try {
    localStorage.setItem(BCV_CACHE_KEY, JSON.stringify({
      rates,
      timestamp: Date.now()
    }));
  } catch (e) {}
}

function parseBCVRate(html) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const tables = doc.querySelectorAll('table.tabla');
    const rates = { USD: null, EUR: null };

    tables.forEach(table => {
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const label = cells[0]?.textContent?.trim().toLowerCase();
          const value = cells[1]?.textContent?.trim().replace(',', '.');
          const numValue = parseFloat(value);

          if (!isNaN(numValue) && numValue > 0) {
            if (label.includes('dólar') || label.includes('dollar') || label.includes('usd')) {
              rates.USD = numValue;
            } else if (label.includes('euro') || label.includes('eur')) {
              rates.EUR = numValue;
            }
          }
        }
      });
    });

    if (!rates.USD) {
      const allText = doc.body?.textContent || '';
      const usdMatch = allText.match(/Dólar[\s\S]*?(\d+[.,]\d+)/i) ||
                       allText.match(/USD[\s\S]*?(\d+[.,]\d+)/i);
      if (usdMatch) {
        rates.USD = parseFloat(usdMatch[1].replace(',', '.'));
      }
    }

    return rates;
  } catch (e) {
    return null;
  }
}

export async function fetchBCVRates() {
  const cached = getCachedRates();
  if (cached) return cached;

  const urls = [
    'https://pydolarve.org/api/v1/dollar',
    'https://ve.dolarapi.com/v1/dolares',
    'https://pydolarve.org/api/v1/dollar?currency=usd'
  ];

  try {
    const response = await fetch('https://pydolarve.org/api/v1/dollar');
    if (response.ok) {
      const data = await response.json();
      let usdRate = null;

      if (data.price) {
        usdRate = parseFloat(data.price);
      } else if (data.data && data.data.price) {
        usdRate = parseFloat(data.data.price);
      } else if (Array.isArray(data)) {
        const usd = data.find(d => d.name?.toLowerCase().includes('dólar') || d.name?.toLowerCase().includes('dollar'));
        if (usd) usdRate = parseFloat(usd.price || usd.promedio);
      }

      if (usdRate && usdRate > 0) {
        const eurRate = usdRate * 1.09;
        const rates = buildRateTable(usdRate, eurRate);
        setCachedRates(rates);
        return rates;
      }
    }
  } catch (e) {
    console.log('API primary failed, trying fallback...');
  }

  try {
    const response = await fetch('https://ve.dolarapi.com/v1/dolares');
    if (response.ok) {
      const data = await response.json();
      const official = Array.isArray(data) ? data.find(d => d.nombre?.includes('Oficial') || d.fuente?.includes('BCV')) : null;
      const usdRate = official ? parseFloat(official.promedio || official.precio) : null;

      if (usdRate && usdRate > 0) {
        const eurRate = usdRate * 1.09;
        const rates = buildRateTable(usdRate, eurRate);
        setCachedRates(rates);
        return rates;
      }
    }
  } catch (e) {
    console.log('API secondary failed, using fallback');
  }

  setCachedRates(FALLBACK_RATES);
  return FALLBACK_RATES;
}

function buildRateTable(usdToBS, eurToBS) {
  const eurToUSD = eurToBS / usdToBS;
  const usdtToBS = usdToBS;

  return {
    USD: {
      USD: 1,
      EUR: 1 / eurToUSD,
      USDT: 1,
      BS: usdToBS
    },
    EUR: {
      USD: eurToUSD,
      EUR: 1,
      USDT: eurToUSD,
      BS: eurToBS
    },
    USDT: {
      USD: 1,
      EUR: 1 / eurToUSD,
      USDT: 1,
      BS: usdtToBS
    },
    BS: {
      USD: 1 / usdToBS,
      EUR: 1 / eurToBS,
      USDT: 1 / usdtToBS,
      BS: 1
    }
  };
}

export function convert(amount, from, to, rates) {
  if (from === to) return amount;
  if (!rates || !rates[from] || !rates[from][to]) return 0;
  return amount * rates[from][to];
}

export function formatCurrency(amount, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  if (currency === 'BS') {
    return `${symbol} ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  }
  return `${symbol} ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function getCurrencySymbol(currency) {
  return CURRENCY_SYMBOLS[currency] || currency;
}

export function getCurrencyName(currency) {
  return CURRENCY_NAMES[currency] || currency;
}

export const CURRENCIES = ['USD', 'EUR', 'USDT', 'BS'];
