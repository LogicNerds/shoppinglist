/* Shared header behavior for the IDK site pages (not the app).
   Adds .nav-ready to the header, which switches on the dropdowns
   (Free Tools and Help Me Budget on desktop) and the hamburger panel
   (phones). Without this script every nav link simply shows inline.
   Also logs a GA event whenever someone clicks through to one of the
   offers (Budget Review, Workshop, Free Session). */
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;

  var toggle = header.querySelector('.nav-toggle');
  var groups = Array.prototype.slice.call(header.querySelectorAll('.nav-group'))
    .map(function (el) { return { el: el, btn: el.querySelector('.nav-group-btn') }; })
    .filter(function (g) { return g.btn; });
  if (!toggle || !groups.length) return;

  var phone = window.matchMedia('(max-width: 720px)');

  function setMenu(open) {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  function setGroup(g, open) {
    g.el.classList.toggle('open', open);
    g.btn.setAttribute('aria-expanded', String(open));
  }

  function closeGroups(except) {
    groups.forEach(function (g) { if (g !== except) setGroup(g, false); });
  }

  header.classList.add('nav-ready');
  setMenu(false);
  closeGroups(null);

  toggle.addEventListener('click', function () {
    setMenu(!header.classList.contains('menu-open'));
  });

  groups.forEach(function (g) {
    g.btn.addEventListener('click', function () {
      if (phone.matches) return; // every list is always open inside the phone menu
      var open = !g.el.classList.contains('open');
      closeGroups(g);
      setGroup(g, open);
    });
    // Desktop: tabbing out of a dropdown closes it
    g.el.addEventListener('focusout', function (e) {
      if (!phone.matches && !g.el.contains(e.relatedTarget)) setGroup(g, false);
    });
  });

  document.addEventListener('click', function (e) {
    groups.forEach(function (g) { if (!g.el.contains(e.target)) setGroup(g, false); });
    if (!header.contains(e.target)) setMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = groups.filter(function (g) { return g.el.classList.contains('open'); })[0];
    if (open) { setGroup(open, false); open.btn.focus(); }
    else if (header.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
  });

  function reset() { setMenu(false); closeGroups(null); }
  if (phone.addEventListener) phone.addEventListener('change', reset);
  else if (phone.addListener) phone.addListener(reset);
})();

/* Offer click tracking. Placement comes from the nearest data-placement
   attribute, so the reports show which handoffs actually move people. */
(function () {
  function offerFor(href) {
    if (!href) return '';
    if (/\/review\/?(\?|#|$)/.test(href)) return 'budget_review';
    if (/\/workshop\/?(\?|#|$)/.test(href) || /docs\.google\.com\/forms/.test(href)) return 'workshop';
    if (/\/free-session\/?(\?|#|$)/.test(href) || /calendar\.app\.google/.test(href)) return 'free_session';
    if (/\/mybudget\/?(\?|#|$)/.test(href)) return 'mybudget';
    return '';
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || typeof window.gtag !== 'function') return;
    var offer = offerFor(a.getAttribute('href'));
    if (!offer) return;
    var spot = a.closest('[data-placement]');
    var step = /calendar\.app\.google|docs\.google\.com\/forms/.test(a.href) ? 'signup' : 'page';
    window.gtag('event', 'offer_click', {
      offer: offer,
      step: step,
      placement: spot ? spot.getAttribute('data-placement') : 'other',
      transport_type: 'beacon'
    });
  });
})();
