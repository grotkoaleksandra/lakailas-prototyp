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
})();
