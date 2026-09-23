/* ============================================================
   السلوك العام للموقع (Preloader, Scroll, Drawer, Reveal, Count-up)
   ============================================================ */

(function () {
    'use strict';

    // ---------- PRELOADER ---------
    var preloader = document.getElementById('preloader');

    function hidePreloader() {
        document.documentElement.classList.remove('is-loading');

        if (preloader) {
            preloader.classList.add('is-hidden');
            setTimeout(function () {
                if (preloader.parentNode) {
                    preloader.remove();
                }
            }, 600);
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(hidePreloader, 400);
    } else {
        window.addEventListener('load', function () {
            setTimeout(hidePreloader, 400);
        });
    }

    // Safety net: never block the site for more than configured timeout
    var timeout = EGX_CONFIG && EGX_CONFIG.PRELOADER_TIMEOUT ? EGX_CONFIG.PRELOADER_TIMEOUT : 3500;
    setTimeout(hidePreloader, timeout);


    // ---------- HEADER SHADOW ON SCROLL ----------
    var header = document.getElementById('siteHeader');
    var toTop = document.getElementById('toTop');

    function onScroll() {
        var y = window.scrollY || 0;

        if (header) {
            header.classList.toggle('is-stuck', y > 8);
        }

        if (toTop) {
            toTop.classList.toggle('is-on', y > 520);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Back to top button
    if (toTop) {
        toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // ---------- MOBILE DRAWER ----------
    var drawer = document.getElementById('drawer');
    var toggle = document.getElementById('navToggle');

    function setDrawer(open) {
        if (!drawer) return;

        drawer.classList.toggle('is-open', open);
        document.body.style.overflow = open ? 'hidden' : '';

        if (toggle) {
            toggle.setAttribute('aria-expanded', String(open));
        }
    }

    if (toggle) {
        toggle.addEventListener('click', function () {
            setDrawer(!drawer.classList.contains('is-open'));
        });
    }

    if (drawer) {
        drawer.addEventListener('click', function (e) {
            // إغلاق عند الضغط على الزر أو الخلفية أو أي رابط
            if (e.target.closest('[data-close]') || e.target.closest('a')) {
                setDrawer(false);
            }
        });
    }

    // إغلاق بالـ Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            setDrawer(false);
        }
    });


    // ---------- REVEAL ON SCROLL ----------
    var items = document.querySelectorAll('.reveal');

    if (items.length && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add('is-in');
                    io.unobserve(en.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px'
        });

        items.forEach(function (el, i) {
            el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
            io.observe(el);
        });
    } else {
        // Fallback للمتصفحات القديمة
        items.forEach(function (el) {
            el.classList.add('is-in');
        });
    }


    // ---------- COUNT-UP ----------
    var AR = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

    function toArabic(n) {
        return String(n).replace(/[0-9]/g, function (d) {
            return AR[+d];
        });
    }

    // تعريف دالة الترقيم العربي على الـ window
    window.EGX = window.EGX || {};
    window.EGX.toArabic = toArabic;

    var counters = document.querySelectorAll('[data-count]');

    if (counters.length && 'IntersectionObserver' in window) {
        var co = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;

                var el = en.target;
                var target = parseInt(el.dataset.count, 10);
                var suffix = el.dataset.suffix || '';
                var start = performance.now();
                var dur = 1100;

                (function tick(now) {
                    var p = Math.min((now - start) / dur, 1);
                    var eased = 1 - Math.pow(1 - p, 3);
                    el.textContent = toArabic(Math.round(target * eased)) + suffix;

                    if (p < 1) {
                        requestAnimationFrame(tick);
                    }
                })(start);

                co.unobserve(el);
            });
        }, {
            threshold: 0.5
        });

        counters.forEach(function (el) {
            co.observe(el);
        });
    } else {
        // Fallback: عرض الأرقام مباشرة
        counters.forEach(function (el) {
            var target = parseInt(el.dataset.count, 10);
            var suffix = el.dataset.suffix || '';
            el.textContent = toArabic(target) + suffix;
        });
    }

    console.log('[Main] Initialized successfully ✅');
})();