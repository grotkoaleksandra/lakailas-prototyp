/* PROTOTYP – skrypty naszych zmian (ładowane na każdej stronie kopii) */
(function () {
  // hero na stronie głównej: slajdy, kropki, strzałki
  var sl = document.getElementById('lil-slides');
  if (sl) {
    var dots = document.getElementById('lil-dots'), n = sl.children.length, timer;
    var cur = function () { return Math.round(sl.scrollLeft / sl.clientWidth); };
    var go = function (i) { sl.scrollTo({ left: ((i + n) % n) * sl.clientWidth, behavior: 'smooth' }); };
    for (var i = 0; i < n; i++) (function (i) {
      var b = document.createElement('button'); b.setAttribute('aria-label', 'Slajd ' + (i + 1));
      b.onclick = function () { go(i); restart(); }; dots.appendChild(b);
    })(i);
    var upd = function () { for (var k = 0; k < n; k++) dots.children[k].classList.toggle('on', k === cur()); };
    sl.addEventListener('scroll', upd); upd();
    document.querySelector('.lil-prev').onclick = function () { go(cur() - 1); restart(); };
    document.querySelector('.lil-next').onclick = function () { go(cur() + 1); restart(); };
    var restart = function () { clearInterval(timer); timer = setInterval(function () { go(cur() + 1); }, 7000); };
    restart();
  }
  // nagłówek: klasa po przewinięciu strony
  var hdr = document.getElementById('header');
  if (hdr) {
    var onS = function () { hdr.classList.toggle('lil-scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onS, { passive: true }); onS();
  }

  // blog na stronie głównej: wpisy przewijają się same
  var blog = document.querySelector('.lil-blog-head + .wp-block-blocksy-query .flexy-container');
  if (blog) {
    var hover = false;
    blog.addEventListener('mouseenter', function () { hover = true; });
    blog.addEventListener('mouseleave', function () { hover = false; });
    setInterval(function () { var n = blog.querySelector('.flexy-arrow-next'); if (n && !hover) n.click(); }, 4500);
  }

  // ===== SZABLON STRONY PRODUKTU =====
  var desc = document.getElementById('tab-description');
  if (document.body.classList.contains('single-product') && desc) {
    var LEAF = 'h1,h2,h3,h4,h5,h6,p,ul,ol,figure,blockquote,table,.wp-block-buttons,.wp-block-kadence-advancedbtn,.wp-block-image,.wp-block-embed,iframe,video';
    var leaves = [].filter.call(desc.querySelectorAll(LEAF), function (el) {
      var p = el.parentElement;
      while (p && p !== desc) { if (p.matches(LEAF)) return false; p = p.parentElement; }
      return (el.textContent.trim() !== '' || el.querySelector('img,iframe,video'));
    });
    var isH = function (el) { return /^H[1-6]$/.test(el.tagName); };
    var clean = function (t) { return t.replace(/\s+/g, ' ').trim(); };
    // poziom nagłówków sekcji: największy nagłówek, który występuje co najmniej 2 razy
    var count = {};
    leaves.forEach(function (el) { if (isH(el) && !/^opinie$/i.test(clean(el.textContent))) count[el.tagName] = (count[el.tagName] || 0) + 1; });
    var level = ['H2', 'H3', 'H4', 'H5'].filter(function (t) { return count[t] >= 2; })[0] || ['H2', 'H3', 'H4', 'H5'].filter(function (t) { return count[t]; })[0];
    var wrap = document.createElement('div'); wrap.className = 'lil-product-info';
    var intro = document.createElement('div'); intro.className = 'lil-intro';
    var acc = document.createElement('div'); acc.className = 'lil-acc';
    var cur = null;
    var section = function (title) {
      var d = document.createElement('details'), s = document.createElement('summary'), b = document.createElement('div');
      s.textContent = title; b.className = 'lil-acc-body'; d.appendChild(s); d.appendChild(b); acc.appendChild(d); return b;
    };
    leaves.forEach(function (el) {
      if (isH(el) && /^opinie$/i.test(clean(el.textContent))) { el.remove(); return; }
      if (isH(el) && el.tagName === level) { cur = section(clean(el.textContent).replace(/:$/, '')); el.remove(); return; }
      (cur || intro).appendChild(el);
    });
    // informacje dodatkowe jako ostatnia zakładka
    var add = document.getElementById('tab-additional_information');
    if (add && add.querySelector('table')) { section('Informacje dodatkowe').appendChild(add.querySelector('table')); }
    if (acc.firstChild) acc.firstChild.open = true;
    desc.innerHTML = ''; if (intro.childNodes.length) wrap.appendChild(intro); wrap.appendChild(acc); desc.appendChild(wrap);
    document.body.classList.add('lil-product');
  }
})();
