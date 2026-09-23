/* ============================================================
   محول العملات - API Based
   ============================================================ */

(function () {

    'use strict';


    /* ============================================================
       عناصر الواجهة
       ============================================================ */

    var amountEl = document.getElementById('convAmount');
    var fromEl = document.getElementById('convFrom');
    var toEl = document.getElementById('convTo');
    var resultEl = document.getElementById('convResult');
    var swapBtn = document.getElementById('convSwap');

    var buyBtn = document.getElementById('convBuy');
    var sellBtn = document.getElementById('convSell');

    var transactionInfoEl =
        document.getElementById('converterTransactionInfo');

    var rateInfoEl =
        document.getElementById('converterRateInfo');

    var updateInfoEl =
        document.getElementById('converterUpdateInfo');


    if (!amountEl || !fromEl || !toEl || !resultEl) {

        console.warn('[Converter] Elements not found');

        return;
    }


    /* ============================================================
       أسماء العملات بالإنجليزية
       ============================================================ */

    var currencyEnglishNames = {

        USD: 'US Dollar',
        GBP: 'British Pound',
        CAD: 'Canadian Dollar',
        SEK: 'Swedish Krona',
        CHF: 'Swiss Franc',
        JPY: 'Japanese Yen',
        KWD: 'Kuwaiti Dinar',
        SAR: 'Saudi Riyal',
        AED: 'UAE Dirham',
        BHD: 'Bahraini Dinar',
        OMR: 'Omani Rial',
        QAR: 'Qatari Riyal',
        AUD: 'Australian Dollar',
        EUR: 'Euro',
        JOD: 'Jordanian Dinar',
        IQD: 'Iraqi Dinar',
        CNY: 'Chinese Yuan',
        TRY: 'Turkish Lira',
        LBP: 'Lebanese Pound',
        EGP: 'Egyptian Pound'
    };


    /* ============================================================
       اللغة الحالية
       ============================================================ */

    function getLanguage() {

        return (
            typeof EGX_LANG !== 'undefined' &&
            EGX_LANG.current === 'en'
        )
            ? 'en'
            : 'ar';
    }


    /* ============================================================
       نصوص الواجهة
       لا نعتمد هنا على data-i18n للمعلومات الجديدة
       ============================================================ */

    function updateTransactionLabels() {

        var lang = getLanguage();

        var typeTitle =
            document.querySelector('.converter__section-title');

        var buyText =
            buyBtn ? buyBtn.querySelector('[data-transaction-text]') : null;

        var sellText =
            sellBtn ? sellBtn.querySelector('[data-transaction-text]') : null;

        if (typeTitle) {

            typeTitle.textContent =
                lang === 'ar'
                    ? 'نوع العملية'
                    : 'Transaction Type';
        }

        if (buyText) {

            buyText.textContent =
                lang === 'ar'
                    ? 'شراء'
                    : 'Buy';
        }

        if (sellText) {

            sellText.textContent =
                lang === 'ar'
                    ? 'بيع'
                    : 'Sell';
        }
    }


    /* ============================================================
       تحديث حالة زر شراء / بيع
       ============================================================ */

    function setTransactionType(type) {

        if (!buyBtn || !sellBtn) {
            return;
        }

        buyBtn.classList.toggle(
            'is-active',
            type === 'buy'
        );

        sellBtn.classList.toggle(
            'is-active',
            type === 'sell'
        );
    }


    /* ============================================================
       بناء قائمة العملات من الـAPI
       ============================================================ */

    function buildCurrencies() {

        if (!window.EGX_PRICES) {

            console.warn(
                '[Converter] EGX_PRICES not ready'
            );

            return;
        }

        var lang = getLanguage();

        fromEl.innerHTML = '';
        toEl.innerHTML = '';


        /* --------------------------------------------------------
           EGP
           -------------------------------------------------------- */

        addCurrencyOption(
            fromEl,
            'EGP',
            lang === 'ar'
                ? 'الجنيه المصري'
                : 'Egyptian Pound'
        );

        addCurrencyOption(
            toEl,
            'EGP',
            lang === 'ar'
                ? 'الجنيه المصري'
                : 'Egyptian Pound'
        );


        /* --------------------------------------------------------
           العملات القادمة من API
           -------------------------------------------------------- */

        Object.keys(window.EGX_PRICES).forEach(function (code) {

            var price = window.EGX_PRICES[code];

            if (!price) {
                return;
            }

            var name =
                lang === 'ar'
                    ? price.name
                    : (currencyEnglishNames[code] || code);

            addCurrencyOption(
                fromEl,
                code,
                name
            );

            addCurrencyOption(
                toEl,
                code,
                name
            );
        });


        /* --------------------------------------------------------
           القيم الافتراضية
           -------------------------------------------------------- */

        fromEl.value = 'USD';
        toEl.value = 'EGP';


        updateTransactionLabels();

        calculate();
    }


    /* ============================================================
       إضافة Currency Option
       ============================================================ */

    function addCurrencyOption(
        selectEl,
        code,
        name
    ) {

        var exists =
            Array.from(selectEl.options).some(function (option) {

                return option.value === code;
            });


        if (exists) {
            return;
        }


        var option =
            document.createElement('option');

        option.value = code;

        option.textContent =
            code + ' - ' + name;

        selectEl.appendChild(option);
    }


    /* ============================================================
       الحصول على سعر العملة
       ============================================================ */

    function getPrice(code) {

        if (code === 'EGP') {

            return {
                buy: 1,
                sell: 1,
                updateDate: null
            };
        }


        if (
            !window.EGX_PRICES ||
            !window.EGX_PRICES[code]
        ) {

            return null;
        }


        return window.EGX_PRICES[code];
    }


    /* ============================================================
       تحديث معلومات العملية
       ============================================================ */

    function updateTransactionInfo(
        fromCode,
        toCode,
        fromPrice,
        toPrice
    ) {

        var lang = getLanguage();

        var transactionText = '';
        var usedRate = null;
        var updateDate = null;


        /* --------------------------------------------------------
           EGP → Foreign
           العميل يشتري العملة الأجنبية
           نستخدم SELL
           -------------------------------------------------------- */

        if (
            fromCode === 'EGP' &&
            toCode !== 'EGP'
        ) {

            transactionText =
                lang === 'ar'
                    ? 'أنت تشتري ' + toCode
                    : 'You are buying ' + toCode;

            usedRate = Number(toPrice.sell);

            updateDate = toPrice.updateDate;
        }


        /* --------------------------------------------------------
           Foreign → EGP
           العميل يبيع العملة الأجنبية
           نستخدم BUY
           -------------------------------------------------------- */

        else if (
            fromCode !== 'EGP' &&
            toCode === 'EGP'
        ) {

            transactionText =
                lang === 'ar'
                    ? 'أنت تبيع ' + fromCode
                    : 'You are selling ' + fromCode;

            usedRate = Number(fromPrice.buy);

            updateDate = fromPrice.updateDate;
        }


        /* --------------------------------------------------------
           Foreign → Foreign
           -------------------------------------------------------- */

        else if (
            fromCode !== 'EGP' &&
            toCode !== 'EGP'
        ) {

            transactionText =
                lang === 'ar'
                    ? 'تحويل بين العملات'
                    : 'Currency conversion';

            usedRate = Number(fromPrice.buy);

            updateDate =
                fromPrice.updateDate ||
                toPrice.updateDate;
        }


        /* --------------------------------------------------------
           Same Currency
           -------------------------------------------------------- */

        else {

            transactionText =
                lang === 'ar'
                    ? 'نفس العملة'
                    : 'Same currency';

            usedRate = 1;
        }


        /* --------------------------------------------------------
           نوع العملية
           -------------------------------------------------------- */

        if (transactionInfoEl) {

            transactionInfoEl.textContent =
                transactionText;
        }


        /* --------------------------------------------------------
           السعر المستخدم
           -------------------------------------------------------- */

        if (
            rateInfoEl &&
            !isNaN(usedRate)
        ) {

            rateInfoEl.textContent =
                lang === 'ar'
                    ? Number(usedRate).toLocaleString(
                        'ar-EG',
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )
                    : Number(usedRate).toLocaleString(
                        'en-US',
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    );
        }


        /* --------------------------------------------------------
           آخر تحديث
           -------------------------------------------------------- */

        if (updateInfoEl) {

            if (updateDate) {

                var date =
                    new Date(updateDate);


                if (!isNaN(date.getTime())) {

                    var formattedDate =
                        date.toLocaleString(
                            lang === 'ar'
                                ? 'ar-EG'
                                : 'en-US',
                            {
                                dateStyle: 'short',
                                timeStyle: 'short'
                            }
                        );


                    updateInfoEl.textContent =
                        formattedDate;

                } else {

                    updateInfoEl.textContent =
                        lang === 'ar'
                            ? 'غير متاح'
                            : 'Unavailable';
                }

            } else {

                updateInfoEl.textContent =
                    lang === 'ar'
                        ? 'غير متاح'
                        : 'Unavailable';
            }
        }
    }


    /* ============================================================
       تحديث زر شراء / بيع حسب اتجاه العملات
       ============================================================ */

    function updateTransactionButtons(
        fromCode,
        toCode
    ) {

        /*
           EGP → Foreign = شراء
           Foreign → EGP = بيع
        */

        if (
            fromCode === 'EGP' &&
            toCode !== 'EGP'
        ) {

            setTransactionType('buy');

        }

        else if (
            fromCode !== 'EGP' &&
            toCode === 'EGP'
        ) {

            setTransactionType('sell');

        }

        else {

            /*
               Foreign → Foreign
               لا يوجد شراء/بيع مباشر
               نخلي Buy غير محدد ونترك Sell غير محدد
            */

            if (buyBtn) {
                buyBtn.classList.remove('is-active');
            }

            if (sellBtn) {
                sellBtn.classList.remove('is-active');
            }
        }
    }


    /* ============================================================
       الحساب
       ============================================================ */

    function calculate() {

        var amount =
            parseFloat(amountEl.value);


        if (
            isNaN(amount) ||
            amount < 0
        ) {

            amount = 0;
        }


        var fromCode =
            fromEl.value;

        var toCode =
            toEl.value;


        var fromPrice =
            getPrice(fromCode);

        var toPrice =
            getPrice(toCode);


        if (
            !fromPrice ||
            !toPrice
        ) {

            resultEl.value = '—';

            console.warn(
                '[Converter] Missing price:',
                fromCode,
                toCode
            );

            return;
        }


        var result = 0;


        /* ========================================================
           نفس العملة
           ======================================================== */

        if (
            fromCode === toCode
        ) {

            result = amount;
        }


        /* ========================================================
           EGP → Foreign
           العميل يشتري العملة الأجنبية
           نستخدم SELL
           ======================================================== */

        else if (
            fromCode === 'EGP'
        ) {

            if (
                !toPrice.sell ||
                Number(toPrice.sell) <= 0
            ) {

                resultEl.value = '—';

                console.warn(
                    '[Converter] Invalid SELL price:',
                    toCode,
                    toPrice.sell
                );

                return;
            }


            result =
                amount /
                Number(toPrice.sell);
        }


        /* ========================================================
           Foreign → EGP
           العميل يبيع العملة الأجنبية
           نستخدم BUY
           ======================================================== */

        else if (
            toCode === 'EGP'
        ) {

            if (
                !fromPrice.buy ||
                Number(fromPrice.buy) <= 0
            ) {

                resultEl.value = '—';

                console.warn(
                    '[Converter] Invalid BUY price:',
                    fromCode,
                    fromPrice.buy
                );

                return;
            }


            result =
                amount *
                Number(fromPrice.buy);
        }


        /* ========================================================
           Foreign → Foreign
           Foreign → EGP → Foreign
           ======================================================== */

        else {

            if (
                !fromPrice.buy ||
                !toPrice.sell ||
                Number(fromPrice.buy) <= 0 ||
                Number(toPrice.sell) <= 0
            ) {

                resultEl.value = '—';

                return;
            }


            var egpAmount =
                amount *
                Number(fromPrice.buy);


            result =
                egpAmount /
                Number(toPrice.sell);
        }


        /* ========================================================
           تحديث Buy / Sell
           ======================================================== */

        updateTransactionButtons(
            fromCode,
            toCode
        );


        /* ========================================================
           تحديث معلومات العملية
           ======================================================== */

        updateTransactionInfo(
            fromCode,
            toCode,
            fromPrice,
            toPrice
        );


        /* ========================================================
           عرض النتيجة
           ======================================================== */

        var lang =
            getLanguage() === 'ar'
                ? 'ar-EG'
                : 'en-US';


        resultEl.value =
    result.toLocaleString(
        'en-US',       // ← إنجليزي دايمًا
        {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        }
    );


        console.log(
            '[Converter]',
            amount,
            fromCode,
            '→',
            toCode,
            '=',
            result
        );
    }


    /* ============================================================
       الأحداث
       ============================================================ */

    amountEl.addEventListener(
        'input',
        calculate
    );


    amountEl.addEventListener(
        'change',
        calculate
    );


    fromEl.addEventListener(
        'change',
        calculate
    );


    toEl.addEventListener(
        'change',
        calculate
    );


    /* ============================================================
       أزرار شراء / بيع
       ============================================================ */

    if (buyBtn) {

        buyBtn.addEventListener(
            'click',
            function () {

                /*
                   شراء = EGP → Foreign
                   لو العملة الحالية EGP في خانة FROM،
                   نخلي الاتجاه صحيح.
                */

                if (fromEl.value !== 'EGP') {

                    var foreignCode =
                        fromEl.value;

                    fromEl.value = 'EGP';

                    toEl.value = foreignCode;
                }

                calculate();
            }
        );
    }


    if (sellBtn) {

        sellBtn.addEventListener(
            'click',
            function () {

                /*
                   بيع = Foreign → EGP
                */

                if (toEl.value !== 'EGP') {

                    var foreignCode =
                        toEl.value;

                    fromEl.value = foreignCode;

                    toEl.value = 'EGP';
                }

                calculate();
            }
        );
    }


    /* ============================================================
       زر التبديل
       ============================================================ */

    if (swapBtn) {

        swapBtn.addEventListener(
            'click',
            function () {

                var temp =
                    fromEl.value;

                fromEl.value =
                    toEl.value;

                toEl.value =
                    temp;

                calculate();
            }
        );
    }


    /* ============================================================
       مراقبة تغيير اللغة
       ============================================================ */

    var lastLanguage =
        getLanguage();


    setInterval(
        function () {

            var currentLanguage =
                getLanguage();


            if (
                currentLanguage !== lastLanguage
            ) {

                lastLanguage =
                    currentLanguage;

                updateTransactionLabels();

                /*
                   إعادة بناء القوائم عشان أسماء العملات
                   تتغير للعربي / الإنجليزي.
                */

                buildCurrencies();
            }

        },
        500
    );


    /* ============================================================
       انتظار الـAPI
       ============================================================ */

    function initializeConverter() {

        if (
            window.EGX_PRICES &&
            Object.keys(window.EGX_PRICES).length > 0
        ) {

            buildCurrencies();

            console.log(
                '[Converter] Initialized with API currencies:',
                Object.keys(window.EGX_PRICES).length
            );

            return;
        }


        /*
           الـAPI ممكن يكون لسه بيحمّل
        */

        setTimeout(
            initializeConverter,
            300
        );
    }


    initializeConverter();

})();


