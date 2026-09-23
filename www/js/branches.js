/* ============================================================
   صفحة الفروع — القائمة + الخريطة + الفلاتر
   ============================================================ */

(function () {
    'use strict';

    var DATA = [];
    var listEl = document.getElementById('branchList');
    var searchEl = document.getElementById('branchSearch');
    var govEl = document.getElementById('govFilter');
    var countEl = document.getElementById('branchCount');
    var mapLabel = document.getElementById('mapLabel');

    if (!listEl) return;

    var ar = (window.EGX && window.EGX.toArabic) || function (n) {
        return String(n);
    };

    var map = null;
    var markers = {};
    var active = null;

    // ---------- تهيئة صفحة الفروع ----------
    window.EGX_initBranchesPage = function () {
        DATA = window.BRANCHES || [];

        var totalCountEl = document.getElementById('branchesTotalCount');

       if (totalCountEl) {
    totalCountEl.textContent = DATA.length;   // رقم إنجليزي دائمًا
    document.getElementById('branchesTotalCount').textContent
}


        // بناء قائمة المحافظات
        govEl.innerHTML = '<option value="">' + EGX_LANG.get('branches.filter.all') + '</option>';

        var govs = {};

        DATA.forEach(function (b) {
            govs[b.gov] = (govs[b.gov] || 0) + 1;
        });

        Object.keys(govs)
            .sort(function (a, b) {
                return govs[b] - govs[a] || a.localeCompare(b, 'ar');
            })
            .forEach(function (g) {
                var o = document.createElement('option');
                o.value = g;
                o.textContent = g + ' (' + ar(govs[g]) + ')';
                govEl.appendChild(o);
            });

        // عرض الفروع
        render();

        // تحديث الخريطة لو موجودة
        if (map) {
            // حذف الماركرز القديمة
            Object.keys(markers).forEach(function (key) {
                map.removeLayer(markers[key]);
            });

            markers = {};
            createMarkers();

            if (DATA.length) {
                map.fitBounds(
                    DATA.map(function (b) {
                        return [b.lat, b.lng];
                    }),
                    {
                        padding: [40, 40],
                        maxZoom: 13
                    }
                );
            }

            map.invalidateSize();
        }

        console.log('[Branches] Page initialized with', DATA.length, 'branches');
    };

    // تعريف دالة التحديث للاستخدام من خارج الملف
    window.EGX_refreshBranches = function () {
        if (window.EGX_initBranchesPage) {
            window.EGX_initBranchesPage();
        }
    };

    // ---------- أيقونات ----------
    function svg(d) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            d +
            '</svg>';
    }

    var IC = {
        pin: svg(
            '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>' +
            '<circle cx="12" cy="10" r="3"/>'
        ),
        clock: svg(
            '<circle cx="12" cy="12" r="10"/>' +
            '<path d="M12 6v6l4 2"/>'
        ),
        phone: svg(
            '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>'
        ),
        map: svg(
            '<path d="m9 3-6 3v15l6-3 6 3 6-3V3l-6 3Z"/>' +
            '<path d="M9 3v15M15 6v15"/>'
        ),
        dir: svg(
            '<path d="m21.7 11.3-9-9a1 1 0 0 0-1.4 0l-9 9a1 1 0 0 0 0 1.4l9 9a1 1 0 0 0 1.4 0l9-9a1 1 0 0 0 0-1.4Z"/>' +
            '<path d="M9 14v-2a2 2 0 0 1 2-2h4"/>' +
            '<path d="m13.5 8.5 2 1.5-2 1.5"/>'
        ),
        none: svg(
            '<circle cx="11" cy="11" r="8"/>' +
            '<path d="m21 21-4.3-4.3"/>'
        )
    };

    // ---------- بطاقة الفرع ----------
    function card(b) {
        var tels = b.tel.map(function (t) {
            return '<a href="tel:+2' + t + '" dir="ltr">' + t + '</a>';
        }).join('<span style="opacity:.4"> · </span>');

        var gmaps = 'https://www.google.com/maps/dir/?api=1&destination=' +
            b.lat + ',' + b.lng;

        var imgUrl = EGX_CONFIG && EGX_CONFIG.BRANCH_IMAGE_BASE ?
            EGX_CONFIG.BRANCH_IMAGE_BASE + b.img :
            'https://egexchange.com/assets/branch-images/' + b.img;

        return '' +
            '<article class="branch" id="branch-' + b.n + '" data-n="' + b.n + '">' +
            '<div class="branch__media">' +
            '<img src="' + imgUrl + '" alt="' + b.name + '" loading="lazy" width="340" height="240">' +
            '<span class="branch__no">' + ar(String(b.n).padStart(2, '0')) + '</span>' +
            '</div>' +
            '<div class="branch__body">' +
            '<div class="branch__top">' +
            '<h3 class="branch__name">' + b.name + '</h3>' +
            '<span class="branch__gov">' + b.gov + '</span>' +
            '</div>' +
            '<div class="branch__rows">' +
            '<p class="branch__row">' + IC.pin + '<span>' + b.address + '</span></p>' +
            '<p class="branch__row">' + IC.clock + '<span>' +
            b.hours +
            '<br><span class="branch__fri">' + EGX_LANG.get('branches.friday') + ': ' + b.friday + '</span>' +
            '</span></p>' +
            '<p class="branch__row">' + IC.phone + '<span>' + tels + '</span></p>' +
            '</div>' +
            '<div class="branch__actions">' +
            '<button class="chip chip--solid" data-focus="' + b.n + '">' +
            IC.map + EGX_LANG.get('branches.show.map') +
            '</button>' +
            '<a class="chip" href="' + gmaps + '" target="_blank" rel="noopener">' +
            IC.dir + EGX_LANG.get('branches.directions') +
            '</a>' +
            '</div>' +
            '</div>' +
            '</article>';
    }

    // ---------- عرض الفروع ----------
    function render() {
        var q = (searchEl.value || '').trim();
        var g = govEl.value;

        var rows = DATA.filter(function (b) {
            if (g && b.gov !== g) return false;
            if (!q) return true;

            var hay = b.name + ' ' + b.address + ' ' + b.gov + ' ' + b.tel.join(' ');
            return hay.indexOf(q) !== -1;
        });

        // تحديث العدد
        var countText = rows.length ?
'<b>' + rows.length + '</b> ' +
            (rows.length === 1 ? EGX_LANG.get('branches.count.singular') : EGX_LANG.get('branches.count.plural')) :
            EGX_LANG.get('branches.no.results');

        countEl.innerHTML = countText;

        // عرض القائمة
        listEl.innerHTML = rows.length ?
            rows.map(card).join('') :
            '<div class="empty">' +
            IC.none +
            '<p>' + EGX_LANG.get('branches.no.results') + '</p>' +
            '</div>';

        // تحديث الماركرز على الخريطة
        if (map) {
            Object.keys(markers).forEach(function (k) {
                markers[k].setOpacity(
                    rows.some(function (b) {
                        return String(b.n) === k;
                    }) ? 1 : 0.25
                );
            });

            if (rows.length) {
                map.fitBounds(
                    rows.map(function (b) {
                        return [b.lat, b.lng];
                    }),
                    {
                        padding: [40, 40],
                        maxZoom: 13
                    }
                );
            }
        }

        // تحديث التسمية
        if (mapLabel) {
            mapLabel.textContent = g ? g : EGX_LANG.get('branches.filter.all');
        }
    }

    // ---------- إنشاء الماركرز ----------
    function createMarkers() {
        if (!map || !DATA.length) return;

        DATA.forEach(function (b) {
            var icon = L.divIcon({
                className: '',
                html: '<div class="marker-pin"><span>' + ar(b.n) + '</span></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -28]
            });

            var m = L.marker([b.lat, b.lng], { icon: icon }).addTo(map);

            m.bindPopup(
                '<div style="font-family:inherit;text-align:right;min-width:190px">' +
                '<strong style="display:block;color:#12173F;margin-bottom:4px">' +
                b.name +
                '</strong>' +
                '<span style="font-size:.82rem;color:#454A72;line-height:1.6">' +
                b.address +
                '</span>' +
                '</div>'
            );

            m.on('click', function () {
                focus(b.n, false);
            });

            markers[b.n] = m;
        });
    }

    // ---------- الخريطة ----------
    function initMap() {
        if (typeof L === 'undefined') {
            console.warn('[Branches] Leaflet not loaded');
            return;
        }

        map = L.map('map', {
            scrollWheelZoom: false,
            zoomControl: true
        }).setView(
            EGX_CONFIG && EGX_CONFIG.MAP_CENTER ? EGX_CONFIG.MAP_CENTER : [27.5, 31.2],
            EGX_CONFIG && EGX_CONFIG.MAP_ZOOM ? EGX_CONFIG.MAP_ZOOM : 6
        );

        L.tileLayer(
            EGX_CONFIG && EGX_CONFIG.MAP_TILE ?
            EGX_CONFIG.MAP_TILE :
            'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: EGX_CONFIG && EGX_CONFIG.MAP_ATTRIBUTION ?
                    EGX_CONFIG.MAP_ATTRIBUTION :
                    '&copy; OpenStreetMap &copy; CARTO',
                maxZoom: EGX_CONFIG && EGX_CONFIG.MAP_MAX_ZOOM ?
                    EGX_CONFIG.MAP_MAX_ZOOM :
                    19
            }
        ).addTo(map);

        // لو البيانات موجودة بالفعل
        if (DATA.length) {
            createMarkers();

            map.fitBounds(
                DATA.map(function (b) {
                    return [b.lat, b.lng];
                }),
                {
                    padding: [40, 40],
                    maxZoom: 13
                }
            );
        }

        window.EGX_map = map;
        console.log('[Branches] Map initialized');
    }

    // ---------- التركيز على فرع ----------
    function focus(n, scrollMap) {
        var b = DATA.filter(function (x) {
            return x.n === +n;
        })[0];

        if (!b) return;

        // إزالة التحديدات السابقة
        document.querySelectorAll('.branch.is-active').forEach(function (el) {
            el.classList.remove('is-active');
        });

        document.querySelectorAll('.marker-pin.is-active').forEach(function (el) {
            el.classList.remove('is-active');
        });

        var cardEl = document.getElementById('branch-' + n);
        if (cardEl) {
            cardEl.classList.add('is-active');
        }

        if (map && markers[n]) {
            var el = markers[n].getElement();
            if (el) {
                var pin = el.querySelector('.marker-pin');
                if (pin) {
                    pin.classList.add('is-active');
                }
            }

            map.flyTo([b.lat, b.lng], 15, { duration: 0.8 });
            markers[n].openPopup();
        }

        active = n;

        if (scrollMap !== false) {
            var panel = document.querySelector('.map-panel');
            if (panel && window.matchMedia('(max-width:1080px)').matches) {
                panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else if (cardEl) {
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // ---------- الأحداث ----------
    var searchTimer;

    searchEl.addEventListener('input', function () {
        clearTimeout(searchTimer);
        var delay = EGX_CONFIG && EGX_CONFIG.SEARCH_DELAY ? EGX_CONFIG.SEARCH_DELAY : 160;
        searchTimer = setTimeout(render, delay);
    });

    govEl.addEventListener('change', render);

    listEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-focus]');
        if (btn) {
            focus(btn.dataset.focus, true);
        }
    });

    // ---------- تهيئة الخريطة ----------
    window.EGX_initMap = function () {
        if (!map) {
            initMap();
        } else {
            map.invalidateSize();
        }
    };

    // ---------- إعادة التهيئة عند تغيير اللغة ----------
    // ---------- إعادة التهيئة عند تغيير اللغة ----------

if (EGX_LANG) {

    EGX_LANG.onLangChange = function () {

        // تحديث بيانات الفروع حسب اللغة الحالية
        if (window.EGX_applyBranchesLanguage) {
            window.EGX_applyBranchesLanguage();
            DATA = window.BRANCHES || [];
        }

        render();

        // إعادة بناء خيارات المحافظات
        govEl.innerHTML =
            '<option value="">' +
            EGX_LANG.get('branches.filter.all') +
            '</option>';

        var govs = {};

        DATA.forEach(function (b) {
            govs[b.gov] = (govs[b.gov] || 0) + 1;
        });

        Object.keys(govs)
            .sort(function (a, b) {
                return govs[b] - govs[a] ||
                    a.localeCompare(b, 'ar');
            })
            .forEach(function (g) {

                var o = document.createElement('option');

                o.value = g;

                o.textContent =
                    g + ' (' + ar(govs[g]) + ')';

                govEl.appendChild(o);
            });
    };
}

console.log('[Branches] Module loaded successfully ✅');




})();