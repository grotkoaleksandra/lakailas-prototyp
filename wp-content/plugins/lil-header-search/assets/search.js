/* =============================================================
   Łąka i Las – Header Search  |  v1.3.0
   ============================================================= */
(function () {
    'use strict';

    var cfg        = window.LilSearch || {};
    var wrapper, btn, panel, overlay, input, clearBtn, closeBtn, resultsEl;
    var lastTrigger = null;   // button that opened the panel (for focus-return)
    var xhr   = null;
    var timer = null;
    var isOpen = false;

    /* ----------------------------------------------------------
       Boot
    ---------------------------------------------------------- */
    function init() {
        injectIntoHeader();
        wrapPanelContent();

        btn       = document.getElementById('lil-search-btn');   // primary ref
        panel     = document.getElementById('lil-search-panel');
        overlay   = document.getElementById('lil-search-overlay');
        input     = document.getElementById('lil-search-input');
        clearBtn  = document.querySelector('.lil-search-clear');
        closeBtn  = document.querySelector('.lil-search-panel-close');
        resultsEl = document.getElementById('lil-search-results');

        applyHeaderColor();

        if (!panel) return;

        // Event delegation — catches clicks on all injected clones too
        document.addEventListener('click', function (e) {
            var trigger = e.target.closest('.lil-search-btn');
            if (trigger) { lastTrigger = trigger; openSearch(); }
        });
        closeBtn.addEventListener('click', closeSearch);
        overlay.addEventListener('click', closeSearch);
        input.addEventListener('input', onInput);
        clearBtn.addEventListener('click', clearInput);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen) closeSearch();
        });
        panel.addEventListener('keydown', trapFocus);
        window.addEventListener('resize', updatePanelTop);
    }

    /* Inject trigger button before every .ct-header-cart (desktop + mobile rows) */
    function injectIntoHeader() {
        wrapper = document.getElementById('lil-search-wrapper');
        if (!wrapper) return;

        var carts = document.querySelectorAll('.ct-header-cart');

        if (!carts.length) {
            // fallback: append to header
            var hdr = document.querySelector('header, .site-header, [data-items="primary"]');
            if (hdr) { hdr.appendChild(wrapper); wrapper.hidden = false; }
            return;
        }

        carts.forEach(function (cart, i) {
            var el = (i === 0) ? wrapper : wrapper.cloneNode(true);
            el.id = i === 0 ? 'lil-search-wrapper' : 'lil-search-wrapper-' + i;
            el.hidden = false;
            cart.parentNode.insertBefore(el, cart);
        });
    }

    /* Kolor tła panelu ustawiony w CSS – funkcja zachowana jako stub */
    function applyHeaderColor() {}

    /* Wrap .lil-search-inner and #lil-search-results in a max-width div */
    function wrapPanelContent() {
        var p = document.getElementById('lil-search-panel');
        if (!p) return;
        var inner   = p.querySelector('.lil-search-inner');
        var results = p.querySelector('.lil-search-results');
        if (!inner || !results) return;

        var wrap = document.createElement('div');
        wrap.className = 'lil-search-panel-wrap';
        p.insertBefore(wrap, inner);
        wrap.appendChild(inner);
        wrap.appendChild(results);
    }

    /* Measure header bottom and pin panel there (desktop only) */
    function updatePanelTop() {
        if (!panel) return;
        if (window.innerWidth <= 768) {
            panel.style.top = '';   // CSS handles mobile
            return;
        }
        var hdr =
            document.querySelector('.site-header') ||
            document.querySelector('header') ||
            document.querySelector('#masthead') ||
            document.querySelector('[data-items="primary"]')?.closest('div, header');

        var offset = hdr ? hdr.getBoundingClientRect().bottom : 80;
        panel.style.top = Math.max(0, Math.round(offset)) + 'px';
    }

    /* ----------------------------------------------------------
       Open / Close
    ---------------------------------------------------------- */
    function openSearch() {
        if (isOpen) return;
        updatePanelTop();
        isOpen = true;
        panel.classList.add('is-open');
        overlay.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        setTimeout(function () { input.focus(); }, 60);
    }

    function closeSearch() {
        if (!isOpen) return;
        isOpen = false;
        panel.classList.remove('is-open');
        overlay.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (lastTrigger) lastTrigger.focus();
    }

    /* ----------------------------------------------------------
       Input
    ---------------------------------------------------------- */
    function clearInput() {
        input.value = '';
        clearBtn.hidden = true;
        resultsEl.innerHTML = '';
        if (xhr) { xhr.abort(); xhr = null; }
        input.focus();
    }

    function onInput() {
        var q = input.value.trim();
        clearBtn.hidden = (q.length === 0);
        clearTimeout(timer);
        if (q.length < 2) { resultsEl.innerHTML = ''; return; }
        timer = setTimeout(function () { doSearch(q); }, 320);
    }

    /* ----------------------------------------------------------
       AJAX
    ---------------------------------------------------------- */
    function doSearch(q) {
        if (xhr) xhr.abort();
        resultsEl.innerHTML =
            '<div class="lil-search-status">' +
            '<div class="lil-search-spinner"></div><br>Szukam…</div>';

        var fd = new FormData();
        fd.append('action', 'lil_search');
        fd.append('nonce',  cfg.nonce || '');
        fd.append('q',      q);

        xhr = new XMLHttpRequest();
        xhr.open('POST', cfg.ajaxurl || '/wp-admin/admin-ajax.php', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4 || xhr.status === 0) return;
            if (xhr.status !== 200) {
                resultsEl.innerHTML = '<div class="lil-search-status">Błąd połączenia.</div>';
                return;
            }
            try {
                var resp = JSON.parse(xhr.responseText);
                if (resp && resp.success) renderResults(resp.data.groups, resp.data.query);
                else resultsEl.innerHTML = '<div class="lil-search-status">Błąd serwera.</div>';
            } catch (e) {
                resultsEl.innerHTML = '<div class="lil-search-status">Błąd przetwarzania.</div>';
            }
        };
        xhr.send(fd);
    }

    /* ----------------------------------------------------------
       Render
    ---------------------------------------------------------- */
    function renderResults(groups, query) {
        if (!groups || !groups.length) {
            resultsEl.innerHTML =
                '<div class="lil-search-status">Brak wyników dla „' + esc(query) + '".</div>';
            return;
        }
        var html = '';
        groups.forEach(function (g) {
            html += '<div class="lil-srg">';
            html += '<div class="lil-srg-label">' + esc(g.label) + '</div>';
            html += '<div class="lil-srg-items">';
            g.items.forEach(function (item) { html += renderItem(item); });
            html += '</div></div>';
        });
        resultsEl.innerHTML = html;
    }

    function renderItem(item) {
        var thumb = item.thumbnail
            ? '<img class="lil-sri-thumb" src="' + esc(item.thumbnail) + '" alt="" loading="lazy" width="46" height="46">'
            : '<div class="lil-sri-thumb-ph" aria-hidden="true">' + placeholderSvg(item.type) + '</div>';

        var info = '<div class="lil-sri-info"><div class="lil-sri-title">' + esc(item.title) + '</div>';

        if (item.type === 'post' && item.excerpt)
            info += '<div class="lil-sri-sub">' + esc(item.excerpt) + '</div>';
        else if (item.type === 'category' && item.count)
            info += '<div class="lil-sri-sub">' + item.count + ' ' + plural(item.count) + '</div>';

        info += '</div>';

        var price = (item.type === 'product' && item.price)
            ? '<div class="lil-sri-price">' + item.price + '</div>'
            : '';

        return '<a class="lil-sri" href="' + esc(item.url) + '">' + thumb + info + price + '</a>';
    }

    function plural(n) {
        if (n === 1) return 'produkt';
        if (n >= 2 && n <= 4) return 'produkty';
        return 'produktów';
    }

    function placeholderSvg(type) {
        if (type === 'product')
            return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
        if (type === 'category')
            return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>';
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
    }

    /* ----------------------------------------------------------
       Focus trap
    ---------------------------------------------------------- */
    function trapFocus(e) {
        if (e.key !== 'Tab' || !isOpen) return;
        var focusable = panel.querySelectorAll(
            'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    /* ----------------------------------------------------------
       Utils
    ---------------------------------------------------------- */
    function esc(s) {
        return String(s)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    /* ----------------------------------------------------------
       Start
    ---------------------------------------------------------- */
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();
