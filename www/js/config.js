/* ============================================================
   الإعدادات العامة (Config)
   ============================================================ */
var EGX_CONFIG = {

    // API

// API


// API
    API_URL: 'https://x.elmezlawyholding.com/api/Branches',
    PRICES_API_URL: 'https://x.elmezlawyholding.com/api/Prices',

    // الخريطة
    MAP_TILE: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    MAP_ATTRIBUTION: '&copy; OpenStreetMap &copy; CARTO',
    MAP_CENTER: [27.5, 31.2],
    MAP_ZOOM: 6,
    MAP_MAX_ZOOM: 19,

    // الصور
    BRANCH_IMAGE_BASE: 'https://egexchange.com/assets/branch-images/',

    // اللغة الافتراضية
    DEFAULT_LANG: 'ar',

    // إعدادات أخرى
    SEARCH_DELAY: 160,
    PRELOADER_TIMEOUT: 3500,

    // العملات المدعومة في المحول
    CURRENCIES: {
        EGP: 'الجنيه المصري',
        USD: 'الدولار الأمريكي',
        EUR: 'اليورو',
        GBP: 'الجنيه الإسترليني',
        SAR: 'الريال السعودي',
        AED: 'الدرهم الإماراتي',
        KWD: 'الدينار الكويتي'
    },

    // أسعار الصرف الاسترشادية (تتحديث من الـ API)
    EXCHANGE_RATES: {
        EGP: 1,
        USD: 48.5,
        EUR: 52.3,
        GBP: 61.7,
        SAR: 12.93,
        AED: 13.21,
        KWD: 157.4
    }
};

console.log('[Config] Loaded successfully ✅');