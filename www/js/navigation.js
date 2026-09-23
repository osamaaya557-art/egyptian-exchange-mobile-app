/* ============================================================
   التنقل بين الصفحات (Navigation / Routing)
   ============================================================ */

(function () {
    'use strict';

    var pages = [].slice.call(document.querySelectorAll('.page'));

    // ---------- عرض الصفحة المطلوبة ----------
    function showPage(slug) {
        var found = false;

        pages.forEach(function (p) {
            var on = p.dataset.page === slug;
            p.classList.toggle('is-on', on);
            if (on) found = true;
        });

        // لو الصفحة مش موجودة، نروح للرئيسية
        if (!found) {
            pages[0].classList.add('is-on');
            slug = pages[0].dataset.page;
        }

        // تحديث الـ Navigation links (Header + Drawer)
        document.querySelectorAll('[data-nav]').forEach(function (a) {
            a.classList.toggle('is-active', a.dataset.nav === slug);
        });

        // قفل الـ Drawer
        var d = document.getElementById('drawer');
        if (d) {
            d.classList.remove('is-open');
            document.body.style.overflow = '';
        }

        // تشغيل الـ Reveal animations
        document.querySelectorAll('.reveal').forEach(function (e) {
            e.classList.add('is-in');
        });

        // Scroll لأعلى الصفحة
        window.scrollTo({ top: 0, behavior: 'auto' });

        // لو الصفحة هي الفروع، نشغل الخريطة
        if (slug === 'branches' && window.EGX_initMap) {
            setTimeout(function () {
                window.EGX_initMap();
                if (window.EGX_map) {
                    window.EGX_map.invalidateSize();
                }
            }, 60);
        }

        // تطبيق الترجمات بعد تغيير الصفحة
        if (window.EGX_LANG) {
            setTimeout(function () {
                EGX_LANG.applyTranslations();
            }, 50);
        }
    }

    // ---------- استخراج الـ slug من الـ URL ----------
    function getSlugFromHash() {
        var hash = location.hash || '';
        // إزالة #/ أو #
        var clean = hash.replace(/^#\/?/, '');
        // خد الجزء الأول قبل -- أو ?
        return clean.split('--')[0].split('?')[0] || 'home';
    }

    // ---------- معالج تغيير الـ hash ----------
    function handleHashChange() {
        showPage(getSlugFromHash());
    }

    // ---------- تهيئة الـ Navigation ----------
    function initNavigation() {
        // مستمع لتغيير الـ URL
        window.addEventListener('hashchange', handleHashChange);

        // تشغيل الصفحة الحالية
        handleHashChange();

        // ✅ اعتراض كل الروابط الداخلية (مش بس اللي فيها data-nav)
        document.addEventListener('click', function (e) {
            var link = e.target.closest('a[href^="#/"]');
            if (!link) return;

            var href = link.getAttribute('href');
            if (!href) return;

            // لو الرابط ده هو نفسه الـ hash الحالي، متعملش حاجة
            if (location.hash === href) {
                e.preventDefault();
                // اقفل الـ drawer لو مفتوح
                var d = document.getElementById('drawer');
                if (d) {
                    d.classList.remove('is-open');
                    document.body.style.overflow = '';
                }
                return;
            }

            // خلي المتصفح يتعامل مع الـ hash طبيعي
            // (مش محتاجين preventDefault هنا عشان hashchange يشتغل)
        });

        console.log('[Navigation] Initialized successfully ✅');
    }

    // ---------- تشغيل ----------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }

    // ---------- تعريف المتغيرات العامة ----------
    window.EGX = window.EGX || {};
    window.EGX.navigate = showPage;
    window.EGX.getSlug = getSlugFromHash;

})();


/* ============================================================
   معالج نموذج الاتصال
   ============================================================ */

document.addEventListener('submit', function (e) {
    if (e.target.id === 'contactForm') {
        e.preventDefault();
        var msg = EGX_LANG ? EGX_LANG.get('contact.form.preview') : 'هذه معاينة للتصميم — النموذج يحتاج الربط بنقطة النهاية لديكم بعد النشر.';
        alert(msg);
    }
});