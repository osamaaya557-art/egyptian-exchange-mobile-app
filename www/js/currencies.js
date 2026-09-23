/* ============================================================
   CURRENCIES — ترجمة أسماء العملات عربي/إنجليزي
   ============================================================ */

window.EGX_CURRENCIES = {
    '01': { ar: 'دولار أمريكي',   en: 'US Dollar',         flag: '🇺🇸', symbol: 'USD' },
    '02': { ar: 'جنيه إسترليني',  en: 'British Pound',     flag: '🇬🇧', symbol: 'GBP' },
    '04': { ar: 'دولار كندي',     en: 'Canadian Dollar',   flag: '🇨🇦', symbol: 'CAD' },
    '14': { ar: 'فرنك سويسري',    en: 'Swiss Franc',       flag: '🇨🇭', symbol: 'CHF' },
    '15': { ar: 'ين ياباني',      en: 'Japanese Yen',      flag: '🇯🇵', symbol: 'JPY' },
    '17': { ar: 'دينار كويتي',    en: 'Kuwaiti Dinar',     flag: '🇰🇼', symbol: 'KWD' },
    '18': { ar: 'ريال سعودي',     en: 'Saudi Riyal',       flag: '🇸🇦', symbol: 'SAR' },
    '19': { ar: 'درهم إماراتي',   en: 'UAE Dirham',        flag: '🇦🇪', symbol: 'AED' },
    '20': { ar: 'دينار بحريني',   en: 'Bahraini Dinar',    flag: '🇧🇭', symbol: 'BHD' },
    '21': { ar: 'ريال عماني',     en: 'Omani Rial',        flag: '🇴🇲', symbol: 'OMR' },
    '22': { ar: 'ريال قطري',      en: 'Qatari Riyal',      flag: '🇶🇦', symbol: 'QAR' },
    '23': { ar: 'دولار أسترالي',  en: 'Australian Dollar', flag: '🇦🇺', symbol: 'AUD' },
    '29': { ar: 'يورو',           en: 'Euro',              flag: '🇪🇺', symbol: 'EUR' },
    '31': { ar: 'دينار أردني',    en: 'Jordanian Dinar',   flag: '🇯🇴', symbol: 'JOD' }
};

// دالة جلب اسم العملة حسب اللغة
window.EGX_getCurrencyName = function(code, fallbackName) {
    var cur = window.EGX_CURRENCIES[code];
    if (!cur) return fallbackName || code;

    var lang = (window.EGX_LANG && window.EGX_LANG.current) || 'ar';
    return lang === 'en' ? cur.en : cur.ar;
};

// دالة جلب علم العملة
window.EGX_getCurrencyFlag = function(code, fallbackFlag) {
    var cur = window.EGX_CURRENCIES[code];
    return (cur && cur.flag) || fallbackFlag || '🏳️';
};

// دالة جلب رمز العملة (USD, EGP, ...)
window.EGX_getCurrencySymbol = function(code) {
    var cur = window.EGX_CURRENCIES[code];
    return (cur && cur.symbol) || code;
};