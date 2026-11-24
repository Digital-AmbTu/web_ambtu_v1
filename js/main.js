/* AmbTu · interaccions de la web (sense dependències) */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fromTpl = function (id) {
    var t = document.getElementById(id);
    if (!t) return null;
    return t.content.firstElementChild ? t.content.firstElementChild.cloneNode(true) : null;
  };
  var ss = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Graelles que s'adapten al mòbil ---------- */
  $$('[style*="grid-template-columns: repeat(4"]').forEach(function (el) { if ($('button[aria-label^="Trajectòria de "]', el)) el.classList.add('team-grid'); });
  $$('[style*="grid-template-columns: repeat(3"]').forEach(function (el) { el.classList.add('news-grid'); });
  $$('[style*="grid-template-columns: repeat(2"]').forEach(function (el) { if (el.tagName !== 'UL') el.classList.add('stat-grid'); });

  /* ---------- Capçalera ---------- */
  var header = $('header');
  if (header) {
    var nav = $('nav[aria-label="Principal"]', header);
    if (nav) nav.classList.add('js-nav');
    var cta = $('a[href="contacte.html"]', header);
    var ctaWrap = cta && cta.closest('div[style*="nowrap"]');
    if (ctaWrap) ctaWrap.classList.add('js-cta');
    var right = ctaWrap ? ctaWrap.parentElement : null;

    /* Desplegable «Què fem» */
    var ddBtn = $('button[aria-label="Obre el submenú de Què fem"]', header);
    var panel = fromTpl('tpl-dropdown');
    if (ddBtn && panel) {
      var wrap = ddBtn.parentElement;
      panel.classList.add('js-hidden');
      wrap.appendChild(panel);
      var setDD = function (o) { panel.classList.toggle('js-hidden', !o); ddBtn.setAttribute('aria-expanded', o ? 'true' : 'false'); };
      wrap.addEventListener('mouseenter', function () { setDD(true); });
      wrap.addEventListener('mouseleave', function () { setDD(false); });
      ddBtn.addEventListener('click', function () { setDD(panel.classList.contains('js-hidden')); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDD(false); });
    }

    /* Menú mòbil */
    var burger = fromTpl('tpl-burger');
    var mp = fromTpl('tpl-mobile');
    if (right && burger && mp) {
      burger.classList.add('js-burger');
      right.appendChild(burger);
      mp.classList.add('js-hidden');
      header.appendChild(mp);
      var label = null;
      for (var i = 0; i < burger.childNodes.length; i++) {
        var nd = burger.childNodes[i];
        if (nd.nodeType === 3 && nd.textContent.trim()) { label = nd; break; }
        if (nd.nodeType === 1 && nd.tagName === 'SPAN' && !nd.getAttribute('role') && nd.textContent.trim()) { label = nd; break; }
      }
      var icon = $('[role="img"]', burger);
      var setIcon = function (n) { if (!icon) return; var u = 'url(assets/icons/' + n + '.svg)'; icon.style.webkitMaskImage = u; icon.style.maskImage = u; icon.setAttribute('aria-label', n); };
      burger.addEventListener('click', function () {
        var open = mp.classList.contains('js-hidden');
        mp.classList.toggle('js-hidden', !open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (label) label.textContent = open ? 'Tanca' : 'Menú';
        setIcon(open ? 'x' : 'menu');
      });
      $$('a', mp).forEach(function (a) { a.addEventListener('click', function () { mp.classList.add('js-hidden'); if (label) label.textContent = 'Menú'; setIcon('menu'); }); });
    }
  }

  /* ---------- Equip (Qui som) ---------- */
  var cards = $$('button[aria-label^="Trajectòria de "]');
  var panelTpl = document.getElementById('tpl-panel');
  if (cards.length && window.AMBTU_TEAM && panelTpl) {
    var grid = cards[0].closest('ul');
    var current = null, panelLi = null;
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    cards.forEach(function (b, i) {
      b.classList.add('js-card');
      var hint = $('[role="img"] > div', b); if (hint) hint.classList.add('js-hint');
      b.addEventListener('click', function () { toggle(i); });
    });
    var toggle = function (i) {
      if (panelLi) { panelLi.remove(); panelLi = null; }
      cards.forEach(function (b) {
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
      var htmlStr = panelTpl.innerHTML
        .replace(/\{\{role\}\}/g, esc(p.role)).replace(/\{\{name\}\}/g, esc(p.name))
        .replace(/\{\{bio\}\}/g, esc(p.bio)).replace(/\{\{exp\}\}/g, esc(p.exp)).replace(/\{\{email\}\}/g, esc(p.email));
      var t = document.createElement('template'); t.innerHTML = htmlStr.trim(); panelLi = t.content.firstElementChild;
      var cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
      var lis = $$(':scope > li', grid);
      var end = Math.min(lis.length, (Math.floor(i / cols) + 1) * cols) - 1;
      lis[end].after(panelLi);
      var close = $('button[aria-label="Tancar"]', panelLi);
      if (close) close.addEventListener('click', function () { toggle(i); });
    };
  }

  /* ---------- Novetats: categories i «Carrega'n més» ---------- */
  var tabs = $$('[role="tablist"][aria-label="Categories"] [role="tab"]');
  var newsList = $$('ul').filter(function (u) { return /repeat\(3/.test(u.getAttribute('style') || ''); })[0];
  if (tabs.length && newsList && window.AMBTU_NEWS_CATS) {
    var CAT = window.AMBTU_NEWS_CATS;
    var items = $$(':scope > li', newsList);
    items.forEach(function (li) {
      var t = Object.keys(CAT).filter(function (k) { return li.textContent.indexOf(k) > -1; })[0];
      li.dataset.cat = t ? CAT[t] : '';
    });
    var cat = 'Totes', limit = 6;
    var more = document.createElement('div');
    more.style.cssText = 'margin-top:56px;display:flex;justify-content:center';
    more.innerHTML = '<button type="button" style="all:unset;cursor:pointer;padding:16px 28px;border-radius:8px;background:var(--grey-light);font:700 18px/1.1 var(--font-core)">Carrega’n més</button>';
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

  /* ---------- Formularis (butlletí i contacte) ---------- */
  var okEmail = function (v) { return /^\S+@\S+\.\S+$/.test(v || ''); };
  $$('button[aria-pressed]').forEach(function (b) {
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var box = $('span', b); if (box) { box.style.background = on ? '#FCF31A' : '#EDEDED'; box.textContent = on ? '✓' : ''; box.style.font = '800 14px/1 var(--font-core)'; box.style.display = 'flex'; box.style.alignItems = 'center'; box.style.justifyContent = 'center'; }
    });
  });
  var wireForm = function (f) {
    f.setAttribute('novalidate', '');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      $$('.js-err', f).forEach(function (x) { x.remove(); });
      var err = function (node, msg) { node.insertAdjacentHTML('afterend', '<span class="js-err" role="alert" style="display:block;margin-top:6px;font:600 16px/1.4 var(--font-core);color:#A3161A">' + msg + '</span>'); };
      var bad = false;
      var em = $('input[type="email"]', f);
      if (em && !okEmail(em.value)) { err(em, 'Cal indicar un correu electrònic vàlid'); bad = true; }
      var ta = $('textarea', f);
      if (ta && !ta.value.trim()) { err(ta, 'Cal escriure el missatge'); bad = true; }
      var pr = $('button[aria-pressed]', f);
      if (pr && pr.getAttribute('aria-pressed') !== 'true') { err(pr, 'Cal acceptar la política de privacitat'); bad = true; }
      if (bad) return;
      var msg = ta ? 'Missatge rebut. Et responem en 48 h a ' : 'Fet. Rebràs el butlletí a ';
      var p = document.createElement('p');
      p.style.cssText = 'margin:0;padding:20px 24px;border-radius:14px;background:var(--white);font:600 18px/1.5 var(--font-core);text-align:center';
      p.textContent = msg + (em ? em.value : '') + '.';
      f.replaceWith(p);
    });
  };
  $$('form').forEach(wireForm);

  /* ---------- Pop-up del butlletí (Inici) ---------- */
  var popTpl = document.getElementById('tpl-popup');
  if (popTpl && ss.get('ambtu-butlleti-popup') !== 'vist') {
    setTimeout(function () {
      ss.set('ambtu-butlleti-popup', 'vist');
      var pop = fromTpl('tpl-popup');
      document.body.appendChild(pop);
      var closePop = function () { pop.remove(); };
      $$('button', pop).forEach(function (b) { if (b.type !== 'submit') b.addEventListener('click', closePop); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePop(); });
      var f = $('form', pop);
      if (f) {
        f.setAttribute('novalidate', '');
        var errBox = null;
        f.addEventListener('submit', function (e) {
          e.preventDefault();
          var em = $('input[type="email"]', f);
          if (errBox) { errBox.remove(); errBox = null; }
          if (!okEmail(em.value)) {
            errBox = document.createElement('span'); errBox.setAttribute('role', 'alert');
            errBox.style.cssText = 'font:600 16px/1.4 var(--font-core);color:#A3161A';
            errBox.textContent = 'Cal indicar un correu electrònic vàlid';
            f.appendChild(errBox); return;
          }
          var box = f.parentElement;
          var h2 = $('h2', box);
          $$(':scope > *', box).forEach(function (n) { if (n !== h2) n.remove(); });
          if (h2) h2.textContent = 'Gràcies per subscriure’t!';
          var p = document.createElement('p');
          p.style.cssText = 'margin:0;font:400 18px/1.5 var(--font-core)';
          p.innerHTML = 'Rebràs el butlletí i el proper calendari de subvencions a <strong></strong>.';
          $('strong', p).textContent = em.value;
          box.appendChild(p);
        });
      }
    }, 2400);
  }

  /* ---------- Xatbot ESSbot (Inici) ---------- */
  var launcher = $('button[aria-label="Obre el xat amb l’ESSbot"]');
  if (launcher && window.AMBTU_CHAT) {
    var D = window.AMBTU_CHAT;
    var chat = fromTpl('tpl-chat');
    var closeBtn = fromTpl('tpl-chatbtn');
    chat.classList.add('js-hidden'); closeBtn.classList.add('js-hidden');
    document.body.appendChild(chat); document.body.appendChild(closeBtn);
    var msgsBox = $('[aria-live="polite"]', chat);
    var bubbleTpl = $$(':scope > div', msgsBox).filter(function (d) { return /white-space: pre-line/.test(d.getAttribute('style') || ''); })[0].cloneNode(true);
    var input = $('#xat-missatge', chat);
    var form = $('form', chat);
    var chipBtn = $$('button', chat).filter(function (b) { return /border-radius: 999px/.test(b.getAttribute('style') || '') && b.type === 'button'; })[0];
    var chipsBox = chipBtn ? chipBtn.parentElement : null;
    var chipTpl = chipBtn ? chipBtn.cloneNode(true) : null;
    var state = { stage: 'q1', msgs: [], typing: false, imp: 0 };
    var draw = function () {
      msgsBox.innerHTML = '';
      if (state.typing) {
        var t = document.createElement('div');
        t.style.cssText = 'align-self:flex-start;padding:12px 16px;border-radius:16px 16px 16px 4px;background:#FFFFFF;font:700 18px/1 var(--font-core);letter-spacing:0.2em;color:#555555';
        t.textContent = '···'; msgsBox.appendChild(t);
      }
      state.msgs.slice().reverse().forEach(function (m) {
        var b = bubbleTpl.cloneNode(true);
        b.textContent = m.text;
        if (m.from === 'user') { b.style.alignSelf = 'flex-end'; b.style.background = '#FCF31A'; b.style.borderRadius = '16px 16px 4px 16px'; }
        msgsBox.appendChild(b);
      });
      if (chipsBox) {
        chipsBox.innerHTML = '';
        var list = state.typing ? [] : (D.CHIPS[state.stage] || []);
        chipsBox.style.display = list.length ? '' : 'none';
        list.forEach(function (l) {
          var c = chipTpl.cloneNode(true); c.textContent = l;
          c.addEventListener('click', function () { if (!state.typing) answer(l); });
          chipsBox.appendChild(c);
        });
      }
      if (input) input.placeholder = D.PLACEHOLDER[state.stage] || '';
    };
    var say = function (userText, replies, next) {
      if (userText) state.msgs.push({ from: 'user', text: userText });
      state.stage = next; if (input) input.value = '';
      var q = replies.slice();
      var step = function () {
        if (!q.length) { state.typing = false; draw(); return; }
        state.typing = true; draw();
        setTimeout(function () { state.msgs.push({ from: 'bot', text: q.shift() }); step(); }, 900);
      };
      step();
    };
    var answer = function (t) {
      var E = D.ESS, st = state.stage;
      if (st === 'q1') return say(t, E.q2, 'q2');
      if (st === 'q2') return say(t, E.q3, 'q3');
      if (st === 'q3') return say(t, E.proposta, 'menu');
      if (st === 'fi') { state.msgs = []; return say(t, E.intro, 'q1'); }
      var k = t.toLowerCase();
      if (k.indexOf('acabar') > -1 || k === 'adeu' || k === 'adéu') return say(t, E.fi, 'fi');
      if (k.indexOf('guia') > -1) return say(t, E.guia, 'menu');
      if (k.indexOf('import') > -1 || k.indexOf('diner') > -1) { state.imp++; return say(t, state.imp % 2 ? E.imports : E.importsNo, 'menu'); }
      if (k.indexOf('objectiu') > -1) return say(t, E.objectius, 'menu');
      if (k.indexOf('requisit') > -1) return say(t, E.requisits, 'menu');
      if (k.indexOf('document') > -1) return say(t, E.documentacio, 'menu');
      return say(t, E.altres, 'menu');
    };
    state.msgs = D.ESS.intro.map(function (t) { return { from: 'bot', text: t }; });
    draw();
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); var t = (input.value || '').trim(); if (!t || state.typing) return; answer(t); });
    var setChat = function (open) {
      chat.classList.toggle('js-hidden', !open);
      closeBtn.classList.toggle('js-hidden', !open);
      launcher.classList.toggle('js-hidden', open);
      if (open && input) input.focus();
    };
    launcher.addEventListener('click', function () { setChat(true); });
    closeBtn.addEventListener('click', function () { setChat(false); });
    var x = $('button[aria-label="Tanca el xat"]', chat); if (x) x.addEventListener('click', function () { setChat(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setChat(false); });
  }
})();
