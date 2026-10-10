/* Shared header behavior for the IDK site pages (not the app).
   Adds .nav-ready to the header, which switches on the Free Tools
   dropdown (desktop) and the hamburger panel (phones). Without this
   script every nav link simply shows inline. */
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;

  var toggle = header.querySelector('.nav-toggle');
  var groupBtn = header.querySelector('.nav-group-btn');
  var group = groupBtn ? groupBtn.parentNode : null;
  if (!toggle || !group) return;

  var phone = window.matchMedia('(max-width: 720px)');

  function setMenu(open) {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  function setGroup(open) {
    group.classList.toggle('open', open);
    groupBtn.setAttribute('aria-expanded', String(open));
  }

  header.classList.add('nav-ready');
  setMenu(false);
  setGroup(false);

  toggle.addEventListener('click', function () {
    setMenu(!header.classList.contains('menu-open'));
  });

  groupBtn.addEventListener('click', function () {
    if (phone.matches) return; // the tools list is always open inside the phone menu
    setGroup(!group.classList.contains('open'));
  });

  // Desktop: tabbing out of the dropdown closes it
  group.addEventListener('focusout', function (e) {
    if (!phone.matches && !group.contains(e.relatedTarget)) setGroup(false);
  });

  document.addEventListener('click', function (e) {
    if (!group.contains(e.target)) setGroup(false);
    if (!header.contains(e.target)) setMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (group.classList.contains('open')) { setGroup(false); groupBtn.focus(); }
    else if (header.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
  });

  function reset() { setMenu(false); setGroup(false); }
  if (phone.addEventListener) phone.addEventListener('change', reset);
  else if (phone.addListener) phone.addListener(reset);
})();
