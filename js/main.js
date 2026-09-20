(function () {
  'use strict';
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- consent + analytics (post-consent only) ---------- */
  var KEY = 'df-consent', banner = document.getElementById('consent');
  function loadAnalytics() {
    var s = document.createElement('script');
    s.defer = true;
    s.setAttribute('data-domain', 'dominion-flights.example.com'); // REPLACE
    s.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(s);
  }
  function setConsent(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    if (banner) banner.hidden = true;
    if (v === 'accept') loadAnalytics();
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (banner && !saved) banner.hidden = false;
  if (saved === 'accept') loadAnalytics();
  var ca = document.getElementById('consent-accept'), cd = document.getElementById('consent-decline');
  if (ca) ca.addEventListener('click', function () { setConsent('accept'); });
  if (cd) cd.addEventListener('click', function () { setConsent('decline'); });

  /* ---------- Travelpayouts / Viator widget loader (only after consent) ---------- */
  // Paste your dashboard widget codes into the slots' data attributes, or inject
  // the official scripts here. Widgets load ONLY after consent (third-party cookies).
  function loadWidgets() {
    document.querySelectorAll('.widget-slot').forEach(function (slot) {
      // Example — official Travelpayouts white-label iframe:
      if (slot.dataset.travelpayouts === 'flights-whitelabel' && slot.dataset.marker.indexOf('YOUR_') !== 0) {
        var f = document.createElement('iframe');
        f.src = 'https://search.aviasales.com/?marker=' + encodeURIComponent(slot.dataset.marker) + '&origin_iata=' + (slot.dataset.origin || 'ACC');
        f.width = '100%'; f.height = '320'; f.setAttribute('title', 'Flight search');
        f.style.border = '0'; f.loading = 'lazy';
        slot.appendChild(f);
      }
      // Add hotel-map / viator / cars injectors the same way using the snippet
      // from your Travelpayouts dashboard → "Widgets" page.
    });
  }
  if (saved === 'accept') loadWidgets();
  document.addEventListener('df:consent-accept', loadWidgets);

  /* ---------- tabs (accessible) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function selectTab(tab) {
    tabs.forEach(function (tb) {
      var on = tb === tab;
      tb.classList.toggle('is-active', on);
      tb.setAttribute('aria-selected', String(on));
      tb.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(tb.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    tab.focus();
  }
  tabs.forEach(function (tb, i) {
    tb.addEventListener('click', function () { selectTab(tb); });
    tb.addEventListener('keydown', function (e) {
      var j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      if (j !== null) { e.preventDefault(); selectTab(tabs[j]); }
    });
  });

  /* ---------- FAQ ---------- */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      var panel = btn.nextElementSibling;
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.hidden = open;
    });
  });

  /* ---------- search forms: validation + routing ---------- */
  var hp = document.getElementById('website');
  var loadedAt = Date.now();
  function today0() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function dval(id) { return v(id) ? new Date(v(id) + 'T00:00:00') : null; }
  function iata(s) { var m = s.match(/\(([A-Za-z]{3})\)/); return m ? m[1].toLowerCase() : s.toLowerCase().replace(/\s+/g, ''); }
  function yyMM(d) { return d.getFullYear().toString().slice(2) + ('0' + (d.getMonth() + 1)).slice(-2); }
  function fail(form, msg) {
    var box = form.querySelector('.form-error');
    if (box) { box.textContent = msg; box.hidden = false; }
  }

  document.querySelectorAll('.js-search').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      var box = form.querySelector('.form-error'); if (box) box.hidden = true;
      if (hp && hp.value) { ev.preventDefault(); return; }                 // honeypot
      if (Date.now() - loadedAt < 2500) { ev.preventDefault(); fail(form, 'Please take a moment and try again.'); return; }
      var kind = form.dataset.kind;

      if (kind === 'flights') {
        if (!v('f-from') || !v('f-to') || !v('f-dep')) { ev.preventDefault(); fail(form, 'Fill in From, To and Departure.'); return; }
        var dep = dval('f-dep'), ret = dval('f-ret');
        if (dep < today0()) { ev.preventDefault(); fail(form, 'Departure can’t be in the past.'); return; }
        if (ret && ret < dep) { ev.preventDefault(); fail(form, 'Return can’t be before departure.'); return; }
        form.action = 'https://www.skyscanner.net/transport/flights/' +
          encodeURIComponent(iata(v('f-from'))) + '/' + encodeURIComponent(iata(v('f-to'))) +
          '/' + yyMM(dep) + '/' + (ret ? yyMM(ret) : yyMM(dep)) + '/';
      }
      if (kind === 'hotels') {
        if (!v('h-city') || !v('h-in') || !v('h-out')) { ev.preventDefault(); fail(form, 'Fill in destination and dates.'); return; }
        if (dval('h-in') < today0() || dval('h-out') <= dval('h-in')) { ev.preventDefault(); fail(form, 'Check-in must be today or later, check-out after check-in.'); return; }
        form.action = 'https://www.booking.com/searchresults.html?ss=' + encodeURIComponent(v('h-city')) +
          '&checkin=' + v('h-in') + '&checkout=' + v('h-out') + '&group_adults=' + encodeURIComponent(v('h-guests'));
      }
      if (kind === 'tours') {
        if (!v('t-dest')) { ev.preventDefault(); fail(form, 'Enter a destination.'); return; }
        var url = 'https://www.viator.com/searchResults/all?text=' + encodeURIComponent(v('t-dest'));
        if (v('t-date')) url += '&date=' + v('t-date');
        window.open(url, '_blank', 'noopener'); ev.preventDefault();
      }
      if (kind === 'cars') {
        if (!v('c-pick') || !v('c-from') || !v('c-to')) { ev.preventDefault(); fail(form, 'Fill in location and dates.'); return; }
        if (dval('c-from') < today0() || dval('c-to') <= dval('c-from')) { ev.preventDefault(); fail(form, 'Pick-up today or later, drop-off after pick-up.'); return; }
        window.open('https://www.booking.com/cars/index.html?aid=YOUR_BOOKING_AID&prefcity=' + encodeURIComponent(v('c-pick')), '_blank', 'noopener');
        ev.preventDefault();
      }
      if (kind === 'transfers') {
        if (!v('x-from') || !v('x-to') || !v('x-date')) { ev.preventDefault(); fail(form, 'Fill in pick-up, drop-off and date.'); return; }
        if (dval('x-date') < today0()) { ev.preventDefault(); fail(form, 'Date can’t be in the past.'); return; }
        var msg = 'Hello Dominion! Transfer quote please:\nPick-up: ' + v('x-from') +
          '\nDrop-off: ' + v('x-to') + '\nDate: ' + v('x-date') + '\nPassengers: ' + v('x-pax');
        window.open('https://wa.me/233509423514?text=' + encodeURIComponent(msg), '_blank', 'noopener');
        ev.preventDefault();
      }
    });
  });
})();
