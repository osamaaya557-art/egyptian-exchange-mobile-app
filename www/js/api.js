/* ============================================================
   API — تحميل أسعار العملات + عرضها
   ============================================================ */

// ============================================================
// تحويل أكواد العملات من API إلى أكواد الموقع
// ============================================================
var currencyCodeMap = {
    "01": "USD", "02": "GBP", "04": "CAD", "11": "SEK",
    "14": "CHF", "15": "JPY", "17": "KWD", "18": "SAR",
    "19": "AED", "20": "BHD", "21": "OMR", "22": "QAR",
    "23": "AUD", "29": "EUR", "31": "JOD", "36": "IQD",
    "38": "CNY", "28": "TRY", "33": "LBP"
};

// ============================================================
// صور العملات (أعلام)
// ============================================================
var currencyFlags = {
    "01": "us.png", "02": "gb.png", "04": "ca.png", "11": "se.png",
    "14": "ch.png", "15": "jp.png", "17": "kw.png", "18": "sa.png",
    "19": "ae.png", "20": "bh.png", "21": "om.png", "22": "qa.png",
    "23": "au.png", "29": "eu.png", "31": "jo.png", "36": "iq.png",
    "38": "cn.png", "28": "tr.png", "33": "lb.png"
};




// ============================================================
// تحميل الفروع من الـAPI
// ============================================================

function formatBranchTime(time) {
    if (!time) return '';
    return String(time).substring(0, 5);
}

function formatWorkingHours(workingHours) {
    if (!Array.isArray(workingHours)) {
        return '';
    }

    // أيام العمل العادية: الأحد إلى الخميس + السبت
    var normalDays = workingHours.filter(function (day) {
        return day.dayOfWeek !== 5;
    });

    // نأخذ مواعيد أول يوم عادي مفتوح
    var normalDay = normalDays.find(function (day) {
        return !day.isClosed;
    });

    if (!normalDay) {
        return '';
    }

    if (!normalDay.openTime || !normalDay.closeTime) {
        return '';
    }

    return formatBranchTime(normalDay.openTime) +
        ' - ' +
        formatBranchTime(normalDay.closeTime);
}

function formatFridayHours(workingHours) {
    if (!Array.isArray(workingHours)) {
        return '';
    }

    var friday = workingHours.find(function (day) {
        return day.dayOfWeek === 5;
    });

    if (!friday) {
        return '';
    }

    if (friday.isClosed) {
        return (window.EGX_LANG && window.EGX_LANG.current === 'en')
            ? 'Closed'
            : 'مغلق';
    }

    return formatBranchTime(friday.openTime) +
        ' - ' +
        formatBranchTime(friday.closeTime);
}


// ============================================================
// تجهيز بيانات الفروع حسب اللغة الحالية
// ============================================================

function applyBranchesLanguage() {

    if (!Array.isArray(window.EGX_BRANCHES_RAW)) {
        return;
    }

    var currentLang =
        (window.EGX_LANG && window.EGX_LANG.current === 'en')
            ? 'en'
            : 'ar';

    window.BRANCHES = window.EGX_BRANCHES_RAW
        .filter(function (branch) {
            return branch.isActive !== false;
        })
        .map(function (branch) {

            return {

                // الرقم
                n: Number(branch.branchNumber),

                // البيانات الأصلية بالعربي والإنجليزي
                nameAr: branch.nameAr || '',
                nameEn: branch.nameEn || '',

                govAr: branch.governorateAr || '',
                govEn: branch.governorateEn || '',

                addressAr: branch.addressAr || '',
                addressEn: branch.addressEn || '',

                // البيانات المستخدمة حاليًا في branches.js
                name: currentLang === 'en'
                    ? (branch.nameEn || branch.nameAr || '')
                    : (branch.nameAr || branch.nameEn || ''),

                gov: currentLang === 'en'
                    ? (branch.governorateEn || branch.governorateAr || '')
                    : (branch.governorateAr || branch.governorateEn || ''),

                address: currentLang === 'en'
                    ? (branch.addressEn || branch.addressAr || '')
                    : (branch.addressAr || branch.addressEn || ''),

                // التليفونات
                tel: Array.isArray(branch.phones)
                    ? branch.phones
                    : [],

                // مواعيد العمل
                hours: formatWorkingHours(branch.workingHours),

                friday: formatFridayHours(branch.workingHours),

                // الخريطة
                lat: Number(branch.latitude),
                lng: Number(branch.longitude),

                // الصورة
                img: branch.imageUrl || '',

                // بيانات إضافية
                id: branch.id,
                isHeadOffice: branch.isHeadOffice,
                isActive: branch.isActive
            };
        });

    console.log(
        '[API] Branches language updated:',
        currentLang,
        '| Branches:',
        window.BRANCHES.length
    );
}


// ============================================================
// تحميل الفروع من الـAPI
// ============================================================

async function loadBranchesFromAPI() {

    try {

        var response = await fetch(EGX_CONFIG.API_URL, {
            method: 'GET',
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error('HTTP Error: ' + response.status);
        }

        var branches = await response.json();

        console.log(
            '[API] Branches loaded:',
            branches.length
        );

        // نحتفظ بالـAPI الخام باللغتين
        window.EGX_BRANCHES_RAW = branches;

        // تجهيز اللغة الحالية
        applyBranchesLanguage();

        console.log(
            '[API] BRANCHES ready:',
            window.BRANCHES.length,
            'branches'
        );

        // تحديث صفحة الفروع
        if (window.EGX_refreshBranches) {
            window.EGX_refreshBranches();
        }

        return window.BRANCHES;

    } catch (error) {

        console.error(
            '[API] Failed to load branches:',
            error
        );

        window.EGX_BRANCHES_RAW = [];
        window.BRANCHES = [];

        return [];
    }
}


// ============================================================
// تحميل الأسعار من الـ API
// ============================================================
async function loadPricesFromAPI() {
    try {
        var response = await fetch(EGX_CONFIG.PRICES_API_URL, {
            method: 'GET',
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error('HTTP Error: ' + response.status);
        }

        var prices = await response.json();

        console.log('[API] Prices loaded:', prices.length, 'currencies');

        // تجهيز البيانات
        window.EGX_PRICES = {};

        prices.forEach(function (price) {
            var code = currencyCodeMap[price.currencyCode];

            if (!code) {
                console.warn('[API] Unknown currency code:', price.currencyCode);
                return;
            }

            window.EGX_PRICES[code] = {
                buy: Number(price.buyPrice),
                sell: Number(price.sellPrice),
                name: price.currencyName,
                apiCode: price.currencyCode,
                updateDate: price.updateDate
            };
        });

        console.log('[API] EGX_PRICES ready:', Object.keys(window.EGX_PRICES).length);

        // رسم بطاقات الأسعار
        updateRateCards();

        return prices;

    } catch (error) {
        console.error('[API] Failed to load prices:', error);
        return [];
    }
}

// ============================================================
// رسم بطاقات الأسعار
// ============================================================
function updateRateCards() {

    var container = document.getElementById('rateCardsContainer');

    if (!container) {
        console.warn('[Rates] rateCardsContainer not found');
        return;
    }

    if (!window.EGX_PRICES) {
        console.warn('[Rates] EGX_PRICES not ready');
        return;
    }

    var lang = (
        typeof EGX_LANG !== 'undefined' &&
        EGX_LANG.current === 'en'
    ) ? 'en' : 'ar';

    // تنظيف القائمة
    container.innerHTML = '';

    // إنشاء صف لكل عملة
    Object.keys(window.EGX_PRICES).forEach(function (code) {

        var price = window.EGX_PRICES[code];
        if (!price) return;

        // اسم العملة حسب اللغة
        var currencyName = (typeof window.EGX_getCurrencyName === 'function')
            ? window.EGX_getCurrencyName(price.apiCode, price.name)
            : (lang === 'en' ? code : price.name);

        // علم العملة
        var flagFile = currencyFlags[price.apiCode];
        var flagHTML = flagFile
            ? '<img src="assets/Flags/' + flagFile + '" alt="' + code + '" class="currency-flag-img">'
            : '<span class="currency-flag-fallback">' + code + '</span>';

        // إنشاء الصف
        var row = document.createElement('div');
        row.className = 'rate-row';
        row.setAttribute('data-currency-code', code);

        row.innerHTML =
            '<span class="rate-row__cur">' +
                '<span class="rate-row__flag">' + flagHTML + '</span>' +
                '<span class="rate-row__name">' + currencyName + '</span>' +
            '</span>' +

            '<span class="rate-row__val">' +
                Number(price.buy).toFixed(2) +
                '<small>' + (lang === 'ar' ? 'شراء' : 'Buy') + '</small>' +
            '</span>' +

            '<span class="rate-row__val">' +
                Number(price.sell).toFixed(2) +
                '<small>' + (lang === 'ar' ? 'بيع' : 'Sell') + '</small>' +
            '</span>';

        container.appendChild(row);
    });

    console.log('[Rates] Rendered:', Object.keys(window.EGX_PRICES).length, 'currencies in', lang);
}

// ============================================================
// ✅ الدالة المهمة: تحديث أسماء العملات عند تبديل اللغة
// ============================================================
function updateRateCardsLanguage() {

    console.log('[Rates] updateRateCardsLanguage called');

    if (!window.EGX_PRICES) {
        console.warn('[Rates] EGX_PRICES not ready');
        return;
    }

    var lang = (
        typeof EGX_LANG !== 'undefined' &&
        EGX_LANG.current === 'en'
    ) ? 'en' : 'ar';

    var updatedCount = 0;

    // لكل صف في بطاقة الأسعار
    document.querySelectorAll('.rate-row').forEach(function (row) {

        var code = row.getAttribute('data-currency-code');
        if (!code || !window.EGX_PRICES[code]) return;

        var price = window.EGX_PRICES[code];

        // ✅ تحديث الاسم
        var nameEl = row.querySelector('.rate-row__name');
        if (nameEl) {
            var newName = (typeof window.EGX_getCurrencyName === 'function')
                ? window.EGX_getCurrencyName(price.apiCode, price.name)
                : (lang === 'en' ? code : price.name);

            nameEl.textContent = newName;
            updatedCount++;
        }

        // ✅ تحديث كلمة "شراء/بيع"
        var vals = row.querySelectorAll('.rate-row__val small');
        if (vals[0]) vals[0].textContent = lang === 'ar' ? 'شراء' : 'Buy';
        if (vals[1]) vals[1].textContent = lang === 'ar' ? 'بيع' : 'Sell';
    });

    console.log('[Rates] Language updated to:', lang, '| Rows updated:', updatedCount);
}

// ============================================================
// تصدير الدوال
// ============================================================
window.loadPricesFromAPI = loadPricesFromAPI;
window.loadBranchesFromAPI = loadBranchesFromAPI;
window.EGX_applyBranchesLanguage = applyBranchesLanguage;
window.updateRateCards = updateRateCards;
window.updateRateCardsLanguage = updateRateCardsLanguage;
// ============================================================
// تشغيل تحميل الأسعار عند فتح الصفحة
// ============================================================


// ============================================================
// تشغيل تحميل الأسعار والفروع عند فتح الصفحة
// ============================================================

function initAPI() {
    loadPricesFromAPI();
    loadBranchesFromAPI();
}

if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', initAPI);

} else {

    initAPI();

}