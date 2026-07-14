const BCV_CACHE_KEY = 'bcv_rates_cache_v2';
const CACHE_DURATION = 15 * 60 * 1000;

const FALLBACK_RATES = {
  USD: { USD: 1, EUR: 0.92, USDT: 1, BS: 724 },
  EUR: { USD: 1.087, EUR: 1, USDT: 1.087, BS: 825.50 },
  USDT: { USD: 1, EUR: 0.92, USDT: 1, BS: 724 },
  BS: { USD: 1 / 724, EUR: 1 / 825.50, USDT: 1 / 724, BS: 1 }
};

const FALLBACK_META = {
  bcv: { USD: 724, EUR: 825.50 },
  paralelo: { USD: 823, EUR: 939.57 },
  lastUpdate: new Date().toISOString(),
  source: 'Datos de respaldo'
};

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', USDT: '₮', BS: 'Bs' };
const CURRENCY_NAMES = {
  USD: 'Dólar Americano',
  EUR: 'Euro',
  USDT: 'Tether (USDT)',
  BS: 'Bolívar Venezolano'
};

function getCachedData() {
  try {
    const cached = localStorage.getItem(BCV_CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (e) {}
  return null;
}

function setCachedData(rates, meta) {
  try {
    localStorage.setItem(BCV_CACHE_KEY, JSON.stringify({
      rates,
      meta,
      timestamp: Date.now()
    }));
  } catch (e) {}
}

export async function fetchBCVRates() {
  const cached = getCachedData();
  if (cached) return { rates: cached.rates, meta: cached.meta };

  let usdBcv = null;
  let usdParalelo = null;
  let eurBcv = null;
  let eurParalelo = null;
  let lastUpdate = null;

  try {
    const [dolaresRes, eurosRes] = await Promise.all([
      fetch('https://ve.dolarapi.com/v1/dolares'),
      fetch('https://ve.dolarapi.com/v1/euros')
    ]);

    if (dolaresRes.ok) {
      const dolares = await dolaresRes.json();
      for (const item of dolares) {
        if (item.fuente === 'oficial') {
          usdBcv = item.promedio;
          lastUpdate = item.fechaActualizacion;
        } else if (item.fuente === 'paralelo') {
          usdParalelo = item.promedio;
        }
      }
    }

    if (eurosRes.ok) {
      const euros = await eurosRes.json();
      for (const item of euros) {
        if (item.fuente === 'oficial') {
          eurBcv = item.promedio;
        } else if (item.fuente === 'paralelo') {
          eurParalelo = item.promedio;
        }
      }
    }
  } catch (e) {
    console.error('Error fetching rates:', e);
  }

  if (!usdBcv) usdBcv = FALLBACK_META.bcv.USD;
  if (!usdParalelo) usdParalelo = FALLBACK_META.paralelo.USD;
  if (!eurBcv) eurBcv = FALLBACK_META.bcv.EUR;
  if (!eurParalelo) eurParalelo = FALLBACK_META.paralelo.EUR;
  if (!lastUpdate) lastUpdate = new Date().toISOString();

  const usdToEur = eurBcv / usdBcv;
  const eurToUsd = usdBcv / eurBcv;

  const rates = {
    USD: { USD: 1, EUR: usdToEur, USDT: 1, BS: usdBcv },
    EUR: { USD: eurToUsd, EUR: 1, USDT: eurToUsd, BS: eurBcv },
    USDT: { USD: 1, EUR: usdToEur, USDT: 1, BS: usdBcv },
    BS: { USD: 1 / usdBcv, EUR: 1 / eurBcv, USDT: 1 / usdBcv, BS: 1 }
  };

  const meta = {
    bcv: { USD: usdBcv, EUR: eurBcv },
    paralelo: { USD: usdParalelo, EUR: eurParalelo },
    lastUpdate,
    source: 've.dolarapi.com'
  };

  setCachedData(rates, meta);
  return { rates, meta };
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
