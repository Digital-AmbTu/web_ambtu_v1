/* AmbTu · interaccions bàsiques (sense dependències) */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var el = function (html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };

  /* ---------- Capçalera ---------- */
  var header = $('header');
  if (header) {
    var nav = $('nav[aria-label="Principal"]', header);
    if (nav) nav.classList.add('js-nav');
    var cta = $('a[href="contacte.html"]', header);
    var ctaWrap = cta && cta.closest('div[style*="nowrap"]');
    if (ctaWrap) ctaWrap.classList.add('js-cta');
    var right = ctaWrap ? ctaWrap.parentElement : null;

    /* Desplegable Què fem */
    var ddBtn = $('button[aria-label="Obre el submenú de Què fem"]', header);
    if (ddBtn) {
      var wrap = ddBtn.parentElement;
      var item = function (t, h, strong) { return '<a href="' + h + '" style="text-decoration:none;padding:12px 14px;border-radius:8px;font:' + (strong ? 800 : 600) + ' 15px/1.3 var(--font-core);background:transparent" onmouseover="this.style.background=\'#FEF884\'" onmouseout="this.style.background=\'transparent\'">' + t + '</a>'; };
      var panel = el('<div class="js-hidden" style="position:absolute;top:100%;left:-20px;padding-top:14px;z-index:30"><div style="background:var(--yellow-pale);border-radius:14px;padding:10px;width:260px;display:flex;flex-direction:column;gap:2px">' +
        item('Com t’acompanyem', 'que-fem.html#serveis') + item('Com treballem', 'que-fem.html#com') + item('Projectes propis', 'projectes-propis.html', true) + '</div></div>');
      wrap.appendChild(panel);
      var setDD = function (o) { panel.classList.toggle('js-hidden', !o); ddBtn.setAttribute('aria-expanded', o ? 'true' : 'false'); };
      wrap.addEventListener('mouseenter', function () { setDD(true); });
      wrap.addEventListener('mouseleave', function () { setDD(false); });
      ddBtn.addEventListener('click', function () { setDD(panel.classList.contains('js-hidden')); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDD(false); });
    }

    /* Menú mòbil */
    if (right) {
      var burger = el('<button type="button" class="js-burger" aria-expanded="false" aria-label="Menú" style="all:unset;cursor:pointer;align-items:center;gap:10px;padding:12px 16px;border-radius:8px;background:var(--grey-light);font:600 15px/1.2 var(--font-core)"><span>Menú</span></button>');
      right.appendChild(burger);
      var links = [['Qui som', 'qui-som.html'], ['Què fem', 'que-fem.html'], ['Projectes propis', 'projectes-propis.html'], ['Formació', 'formacio.html'], ['Novetats', 'novetats.html']];
      var mp = el('<div class="js-hidden" style="background:var(--yellow-pale);max-height:calc(100vh - 90px);overflow-y:auto"><div style="max-width:1440px;margin:0 auto;box-sizing:border-box;padding:16px clamp(16px,3.2vw,48px) 28px;display:flex;flex-direction:column;gap:2px">' +
        links.map(function (l) { return '<a href="' + l[1] + '" style="text-decoration:none;padding:14px 12px;border-radius:8px;font:700 18px/1.3 var(--font-core);background:transparent">' + l[0] + '</a>'; }).join('') +
        '<a href="contacte.html" style="margin-top:16px;display:flex;justify-content:center;text-decoration:none;padding:16px 24px;border-radius:8px;background:var(--yellow-signal);font:700 16px/1.1 var(--font-core)">Contacte</a></div></div>');
      header.appendChild(mp);
      burger.addEventListener('click', function () {
        var open = mp.classList.contains('js-hidden');
        mp.classList.toggle('js-hidden', !open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.firstChild.textContent = open ? 'Tanca' : 'Menú';
      });
    }
  }

  /* ---------- Equip (Qui som) ---------- */
  var cards = $$('button[aria-label^="Trajectòria de "]');
  if (cards.length && window.AMBTU_TEAM) {
    var grid = cards[0].closest('ul');
    var current = null, panelLi = null;
    cards.forEach(function (b, i) {
      b.classList.add('js-card');
      var hint = $('[role="img"] > div', b); if (hint) hint.classList.add('js-hint');
      b.addEventListener('click', function () { toggle(i); });
    });
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var toggle = function (i) {
      if (panelLi) { panelLi.remove(); panelLi = null; }
      cards.forEach(function (b, k) {
        b.setAttribute('aria-expanded', 'false');
        var img = $('[role="img"]', b); if (img) img.style.opacity = '1';
        var t = $('.js-hint span', b); if (t) t.textContent = 'Veure trajectòria';
      });
      if (current === i) { current = null; return; }
      current = i;
      var p = window.AMBTU_TEAM[i];
      cards.forEach(function (b, k) {
        var img = $('[role="img"]', b); if (img) img.style.opacity = k === i ? '1' : '0.45';
        if (k === i) { b.setAttribute('aria-expanded', 'true'); var t = $('.js-hint span', b); if (t) t.textContent = 'Tancar'; }
      });
      var cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
      var lis = $$(':scope > li', grid);
      var end = Math.min(lis.length, (Math.floor(i / cols) + 1) * cols) - 1;
      panelLi = el('<li style="grid-column:1/-1;background:var(--yellow-pale);border-radius:14px;padding:clamp(28px,4vw,56px);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:clamp(32px,5vw,80px);position:relative">' +
        '<div style="display:flex;flex-direction:column;gap:18px"><span style="font:800 12px/1.2 var(--font-core);letter-spacing:.15em;text-transform:uppercase;color:var(--grey-mid)">' + esc(p.role) + '</span>' +
        '<h3 style="margin:0;font:900 clamp(32px,3.4vw,48px)/.95 var(--font-core);letter-spacing:-.035em">' + esc(p.name) + '</h3>' +
        '<p style="margin:0;font:400 17px/1.6 var(--font-core);max-width:48ch">' + esc(p.bio) + '</p>' +
        '<a href="mailto:' + esc(p.email) + '" style="align-self:flex-start;font:600 15px/1.2 var(--font-core)">' + esc(p.email) + '</a></div>' +
        '<div style="display:flex;flex-direction:column;gap:20px"><span style="font:800 16px/1.3 var(--font-core)">Trajectòria</span><p style="margin:0;font:400 17px/1.65 var(--font-core);max-width:58ch">' + esc(p.exp) + '</p></div>' +
        '<button type="button" aria-label="Tancar" style="all:unset;cursor:pointer;position:absolute;top:16px;right:16px;width:44px;height:44px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:var(--white);font:700 20px/1 var(--font-core)">×</button></li>');
      lis[end].after(panelLi);
      $('button', panelLi).addEventListener('click', function () { toggle(i); });
    };
  }

  /* ---------- Novetats: categories i carregar més ---------- */
  var CAT = {"Nova guia de preguntes i respostes sobre Projectes Singulars 2026":"Convocatòries","El Laboratori Coyolxauhqui acompanya dones migrants i racialitzades en la construcció i consolidació dels seus projectes":"Projectes","Programa IKIGAI: acompanyament estratègic bonificat per a 35 projectes entre 2026 i 2027":"Projectes","Calendari de formacions de tardor: finançament, tresoreria i contractació pública":"Formació","Presentem la memòria d’activitat 2025":"Cooperativa","Oberta la convocatòria de subvencions per a projectes d’economia social 2026":"Convocatòries","Dues noves sòcies treballadores s’incorporen a la cooperativa":"Cooperativa","Materials de la formació sobre justificació de subvencions":"Formació","Tancament de la primera fase del programa IKIGAI":"Projectes"};
  var tabs = $$('[role="tablist"][aria-label="Categories"] [role="tab"]');
  var newsList = $$('ul').filter(function (u) { return /repeat\(3/.test(u.getAttribute('style') || ''); })[0];
  if (tabs.length && newsList) {
    var items = $$(':scope > li', newsList);
    items.forEach(function (li) {
      var t = Object.keys(CAT).filter(function (k) { return li.textContent.indexOf(k) > -1; })[0];
      li.dataset.cat = t ? CAT[t] : '';
    });
    var cat = 'Totes', limit = 6;
    var more = el('<div style="margin-top:56px;display:flex;justify-content:center"><button type="button" style="all:unset;cursor:pointer;padding:16px 28px;border-radius:8px;background:var(--grey-light);font:700 16px/1.1 var(--font-core)">Carrega’n més</button></div>');
    newsList.after(more);
    var render = function () {
      var shown = 0, total = 0;
      items.forEach(function (li) {
        var ok = cat === 'Totes' || li.dataset.cat === cat;
        if (ok) total++;
        var vis = ok && shown < limit; if (vis) shown++;
        li.style.display = vis ? '' : 'none';
      });
      more.style.display = total > limit ? '' : 'none';
      tabs.forEach(function (t) { var on = t.textContent.trim() === cat; t.style.background = on ? '#FCF31A' : '#EDEDED'; t.setAttribute('aria-selected', on ? 'true' : 'false'); });
    };
    tabs.forEach(function (t) { t.addEventListener('click', function () { cat = t.textContent.trim(); limit = 6; render(); }); });
    $('button', more).addEventListener('click', function () { limit += 6; render(); });
    render();
  }

  /* ---------- Formularis ---------- */
  var okEmail = function (v) { return /^\S+@\S+\.\S+$/.test(v || ''); };
  $$('button[aria-pressed]').forEach(function (b) {
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var box = $('span', b); if (box) { box.style.background = on ? '#FCF31A' : '#EDEDED'; box.textContent = on ? '✓' : ''; box.style.font = '800 14px/1 var(--font-core)'; }
    });
  });
  $$('form').forEach(function (f) {
    f.setAttribute('novalidate', '');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      $$('.js-err', f).forEach(function (x) { x.remove(); });
      var err = function (node, msg) { node.insertAdjacentHTML('afterend', '<span class="js-err" style="display:block;margin-top:6px;font:600 14px/1.4 var(--font-core)">' + msg + '</span>'); };
      var bad = false;
      var em = $('input[type="email"]', f);
      if (em && !okEmail(em.value)) { err(em, 'Cal indicar un correu electrònic vàlid'); em.style.background = '#FFFBBF'; bad = true; }
      var ta = $('textarea', f);
      if (ta && !ta.value.trim()) { err(ta, 'Cal escriure el missatge'); bad = true; }
      var pr = $('button[aria-pressed]', f);
      if (pr && pr.getAttribute('aria-pressed') !== 'true') { err(pr, 'Cal acceptar la política de privacitat'); bad = true; }
      if (bad) return;
      var msg = ta ? 'Missatge rebut. Et responem en 48 h a ' : 'Fet. Rebràs el butlletí a ';
      f.outerHTML = '<p style="margin:0;padding:20px 24px;border-radius:14px;background:var(--white);font:600 16px/1.5 var(--font-core);text-align:center">' + msg + (em ? em.value : '') + '.</p>';
    });
  });
})();
