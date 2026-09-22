(function () {
  'use strict';

  var isMobile = function () { return window.innerWidth <= 900; };

  /* ================= Hero video autoplay (with retry) ================ */
  (function heroVideo() {
    var v = document.querySelector('.hero-video');
    if (!v) return;
    var start = function () {
      v.muted = true;
      v.playsInline = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    };
    start();
    var retry = setInterval(start, 800);
    var onTouch = function () { start(); };
    document.addEventListener('pointerdown', onTouch, { once: true });
    setTimeout(function () { clearInterval(retry); }, 6000);

    // Mobile hero edit: skip the bare-face close-up (approved surgical-only cut).
    var CUT_IN = 2.9, CUT_OUT = 7.4;
    var guard = function () {
      if (!isMobile()) return;
      if (v.currentTime >= CUT_IN && v.currentTime < CUT_OUT) v.currentTime = CUT_OUT;
    };
    v.addEventListener('timeupdate', guard);
  })();

  /* ================= Russian orphan/widow fix (all viewports) ========= */
  // Runs everywhere, not just mobile -- dynamically-set text (Results,
  // Explains) needs the same protection against a short preposition or
  // a dash being orphaned at a line break.
  (function orphanFix() {
    var shortWord = /(^|[\s(«"])([а-яёa-z]{1,3}|не|как|или|для|что|это)\s+/gi;
    var dash = /\s*—\s*/g;
    var run = function () {
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      var nodes = [];
      var n;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(function (node) {
        var p = node.parentElement;
        if (!p || p.closest('script,style')) return;
        var v = node.nodeValue;
        if (!v || (v.indexOf(' ') === -1 && v.indexOf('—') === -1)) return;
        var next = v
          .replace(shortWord, function (m, a, w) { return a + w + ' '; })
          .replace(dash, ' — ');
        if (next !== v) node.nodeValue = next;
      });
    };
    setTimeout(run, 900);
    setInterval(run, 2500);
  })();

  /* ================= Block 02 — desktop scrollytelling =============== */
  (function directions() {
    var stage = document.getElementById('b2-stage');
    var section = document.getElementById('directions');
    if (!stage || !section) return;
    var SCALES = [1.46, 1.05, 1.04, 1, 1];
    var PAR = [20, 22, 16, 0, 18];
    var photos = ['b2-p1', 'b2-p2', 'b2-p3', null, 'b2-p6'].map(function (id) {
      return id ? document.getElementById(id) : null;
    });
    var types = ['b2-t1', 'b2-t2', 'b2-t3', 'b2-t4', 'b2-t6'].map(function (id) {
      return document.getElementById(id);
    });
    var warmEl = document.getElementById('b2-warm');
    var scrimEl = document.getElementById('b2-scrim');
    var fadeTopEl = document.getElementById('b2-fade-top');
    var fadeBottomEl = document.getElementById('b2-fade-bottom');
    var headingQ = document.getElementById('b2-heading-q');
    var heading = document.getElementById('b2-heading');
    var progressEl = document.getElementById('b2-progress');
    var stepsWrap = document.getElementById('b2-steps');
    var stepBtns = [0, 1, 2, 3, 4].map(function (i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = '0' + (i + 1);
      b.addEventListener('click', function () { goTo(i); });
      stepsWrap.appendChild(b);
      return b;
    });
    var lastActiveStep = -1; // motion hook only — read by motion/requests.js

    function goTo(i) {
      var range = section.offsetHeight - window.innerHeight;
      var top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + ((i + 1) / 5.6) * range, behavior: 'smooth' });
    }

    function tick() {
      var range = section.offsetHeight - window.innerHeight;
      var r = section.getBoundingClientRect();
      var p = range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;
      var x = p * 5.6 - 0.6;

      var active = Math.min(4, Math.max(0, Math.floor(x)));
      if (active !== lastActiveStep) {
        lastActiveStep = active;
        document.dispatchEvent(new CustomEvent('pmz:request-step', { detail: { index: active } }));
      }
      var t = Math.min(1, Math.max(0, x - active));
      var f = Math.min(1, Math.max(0, (t - 0.78) / 0.22));
      var w = [0, 0, 0, 0, 0];
      w[active] = 1 - f;
      if (active < 4) w[active + 1] = f;
      var intro = Math.min(1, Math.max(0, 1 - (x + 0.6) / 0.5));
      var warm = w[2];
      var lerp = function (a, b, k) { return Math.round(a + (b - a) * k); };
      var ink = 'rgb(' + lerp(244, 33, warm) + ',' + lerp(244, 31, warm) + ',' + lerp(243, 27, warm) + ')';
      var tr = function (i) {
        var ti = i === active ? t : (i < active ? 1 : 0);
        return 'translateY(' + ((ti - 0.5) * PAR[i]).toFixed(1) + 'px) scale(' + SCALES[i] + ')';
      };
      var ty = ((0.5 - t) * 16).toFixed(1);

      warmEl.style.opacity = warm;
      scrimEl.style.opacity = warm;
      fadeTopEl.style.opacity = warm;
      fadeBottomEl.style.opacity = warm;
      [0, 1, 2, 4].forEach(function (i) {
        var el = photos[i];
        if (!el) return;
        el.style.opacity = w[i];
        var img = el.querySelector('img');
        if (img) img.style.transform = tr(i);
      });

      types.forEach(function (el, i) {
        if (!el) return;
        el.style.opacity = w[i];
        el.style.transform = i === 4 ? 'translateY(calc(-50% + ' + ty + 'px))' : 'translateY(' + ty + 'px)';
      });

      heading.style.color = ink;
      headingQ.style.opacity = intro;
      progressEl.style.background = ink;
      progressEl.style.width = (Math.min(100, Math.max(0, ((x + 0.6) / 5.6) * 100))).toFixed(1) + '%';

      var shown = w[active] >= 0.5 ? active : Math.min(4, active + 1);
      stepBtns.forEach(function (b, i) {
        b.style.color = i === shown ? ink : (warm > 0.5 ? 'rgba(33,31,27,0.5)' : 'rgba(244,244,243,0.4)');
      });
    }

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  })();

  /* ================= Mobile Ваш запрос rail (active dot sync) ========= */
  (function mobileRequestRail() {
    var rail = document.getElementById('mq-rail');
    var barsWrap = document.getElementById('mq-bars');
    if (!rail || !barsWrap) return;
    var count = rail.children.length;
    var bars = [];
    for (var i = 0; i < count; i++) {
      var bar = document.createElement('i');
      if (i === 0) bar.className = 'active';
      barsWrap.appendChild(bar);
      bars.push(bar);
    }
    rail.addEventListener('scroll', function () {
      var n = Math.round(rail.scrollLeft / rail.clientWidth);
      bars.forEach(function (b, i) { b.classList.toggle('active', i === n); });
    });
  })();

  /* ================= Block 03 — before / after ======================== */
  (function beforeAfter() {
    var rail = document.getElementById('ba-rail');
    var layer = document.getElementById('ba-layer');
    var stage = document.getElementById('ba-stage');
    var afterClip = document.getElementById('ba-after-clip');
    var divider = document.getElementById('ba-divider');
    if (!rail || !stage) return;

    var CASES = [
      { proc: 'Блефаропластика', title: 'Верхняя блефаропластика', task: 'Тяжёлое верхнее веко, взгляд читается уставшим.', did: 'Иссечение избытка кожи верхнего века, разрез в естественной складке.', result: 'Взгляд открытый, форма глаза сохранена.', term: '3 месяца', expert: '<span style="white-space:normal;">«Развести избыток кожи, опущение брови и птоз — главная задача консультации.</span> <span>От этого зависит весь план.»</span>' },
      { proc: 'Маммопластика', title: 'Коррекция тубулярной формы груди', task: 'Асимметрия объёма и тубулярная форма.', did: 'Импланты разного объёма + симметризация ареол.', result: 'Симметрия и естественная форма.', term: '6 месяцев', expert: '<span>«Если анатомия и объём собственных тканей позволяют,</span> <span>форму груди можно скорректировать без импланта.»</span>' },
      { proc: 'Абдоминопластика', title: 'Абдоминопластика после родов', task: 'Диастаз и избыток кожи после беременности.', did: 'Абдоминопластика с ушиванием диастаза.', result: 'Восстановленный контур живота.', term: '4 месяца', expert: '«Липосакция не заменяет абдоминопластику, если проблема связана с избытком кожи или диастазом.»' },
      { proc: 'Липосакция', title: 'Коррекция контуров тела', task: 'Локальные отложения, не уходящие при весе в норме.', did: 'Липосакция фланков и нижней зоны живота.', result: 'Ровный контур без потери объёма.', term: '3 месяца', expert: '<span>«Липосакция корректирует локальные объёмы,</span> <span style="white-space:normal;">но не является способом похудения и не подтягивает дряблую кожу.»</span>' },
      { proc: 'Подтяжка лица', title: 'Подтяжка лица', task: 'Опущение тканей средней зоны лица.', did: 'Подтяжка с сохранением индивидуальных черт.', result: 'Свежесть без эффекта «нового лица».', term: '6 месяцев', expert: '<span>«Лицо стареет неравномерно:</span> <span style="white-space:normal;">верхняя, средняя и нижняя треть требуют разных хирургических решений.»</span>' }
    ];

    var pick = 0, div = 50;

    rail.setAttribute('role', 'tablist');
    var railBtns = CASES.map(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = c.proc;
      b.setAttribute('role', 'tab');
      b.addEventListener('click', function () { pick = i; render(); });
      rail.appendChild(b);
      return b;
    });

    function setDivider(clientX) {
      var r = stage.getBoundingClientRect();
      var v = ((clientX - r.left) / r.width) * 100;
      div = Math.max(2, Math.min(98, v));
      afterClip.style.clipPath = 'inset(0 0 0 ' + div + '%)';
      divider.style.left = div + '%';
    }
    stage.addEventListener('pointerdown', function (e) {
      setDivider(e.clientX);
      var move = function (ev) { setDivider(ev.clientX); };
      var up = function () {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });

    function render() {
      railBtns.forEach(function (b, i) { b.classList.toggle('active', i === pick); });
      var c = CASES[pick];
      document.getElementById('ba-title').textContent = c.title;
      document.getElementById('ba-term').textContent = c.term;
      document.getElementById('ba-task').textContent = c.task;
      document.getElementById('ba-did').textContent = c.did;
      document.getElementById('ba-result').textContent = c.result;
      var expertEl = document.getElementById('ba-expert');
      if (c.expert) { expertEl.innerHTML = c.expert; expertEl.hidden = false; }
      else { expertEl.hidden = true; }
      afterClip.style.clipPath = 'inset(0 0 0 ' + div + '%)';
      divider.style.left = div + '%';
      document.dispatchEvent(new CustomEvent('pmz:results-step', { detail: { index: pick } }));
    }
    render();
  })();

  /* ================= Block 09 — Филипп объясняет accordion =========== */
  (function explains() {
    var list = document.getElementById('ex-list');
    if (!list) return;
    var ITEMS = [
      { num: '01', title: 'Тяжёлое верхнее веко — не всегда блефаропластика', text: '<span>Одинаковая картина может быть следствием избытка кожи, опущения брови или птоза.</span><span>Развести эти три состояния — главная задача консультации.</span>' },
      { num: '02', title: 'Когда грудь можно поднять без импланта', text: 'Если анатомия и объём собственных тканей позволяют, верхний полюс удаётся наполнить без импланта.' },
      { num: '03', title: 'Почему мини-абдоминопластика подходит не всем', text: 'Если избыток кожи есть выше пупка, мини-вариант оставит его на месте. Объём операции выбирается по расположению тканей, а не по желанию сделать меньший разрез.' },
      { num: '04', title: 'Почему я не делаю липосакцию множества зон за один раз', text: 'С каждой дополнительной зоной растёт нагрузка на организм. Если объём вмешательства становится избыточным, работу безопаснее разделить на этапы.' },
      { num: '05', title: 'Почему deep plane не должен давать эффект натянутого лица', text: 'При deep plane кожа и SMAS перемещаются единым блоком, а основное натяжение приходится на глубокие структуры, а не на кожу.' }
    ];
    var i = 0;
    var nums = [], titles = [];
    ITEMS.forEach(function (item, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ex-item';
      btn.setAttribute('role', 'tab');
      var num = document.createElement('span');
      num.className = 'ex-num';
      num.textContent = item.num;
      var title = document.createElement('span');
      title.className = 'ex-item-title';
      title.textContent = item.title;
      btn.appendChild(num);
      btn.appendChild(title);
      btn.addEventListener('click', function () { i = idx; render(); });
      list.appendChild(btn);
      nums.push(num);
      titles.push(title);
    });
    function render() {
      nums.forEach(function (n, idx) { n.classList.toggle('active', idx === i); });
      titles.forEach(function (t, idx) { t.classList.toggle('active', idx === i); });
      document.getElementById('ex-num').textContent = ITEMS[i].num;
      document.getElementById('ex-title').textContent = ITEMS[i].title;
      document.getElementById('ex-text').innerHTML = ITEMS[i].text;
      document.dispatchEvent(new CustomEvent('pmz:explains-step', { detail: { index: i } }));
    }
    render();
  })();

  /* ================= Mobile Путь пациента pager ======================= */
  (function mobileJourney() {
    var barsWrap = document.getElementById('mj-bars');
    if (!barsWrap) return;
    var STEPS = [
      ['Консультация', 'Разбираем запрос и анатомию, обсуждаем возможные варианты и ограничения. Здесь же индивидуальные вопросы, которые влияют на решение.'],
      ['Решение', 'Выбираем путь вместе: что меняем, что сохраняем и где меньшее вмешательство честнее.'],
      ['Подготовка', 'После консультации я выдаю персональный список анализов. Срок годности результатов — 10 дней.'],
      ['Операция', 'План, согласованный на консультации, выполняется без импровизаций по объёму.'],
      ['Первые дни', 'Связь с хирургом и командой остаётся: на вопросы отвечают, а не откладывают до следующего приёма.'],
      ['Восстановление', 'Возвращение к обычной жизни идёт у всех по-своему, темп обсуждается на контрольных встречах.'],
      ['Контроль результата', 'Окончательную форму оценивают не сразу, когда ткани окончательно сядут.']
    ];
    var i = 0;
    var bars = STEPS.map(function (_, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      var bar = document.createElement('i');
      btn.appendChild(bar);
      btn.addEventListener('click', function () { i = idx; render(); });
      barsWrap.appendChild(btn);
      return bar;
    });
    document.getElementById('mj-prev').addEventListener('click', function () { i = Math.max(0, i - 1); render(); });
    document.getElementById('mj-next').addEventListener('click', function () { i = Math.min(STEPS.length - 1, i + 1); render(); });
    function render() {
      bars.forEach(function (b, idx) { b.classList.toggle('done', idx <= i); });
      document.getElementById('mj-index').textContent = String(i + 1).padStart(2, '0') + ' / 07';
      document.getElementById('mj-title').textContent = STEPS[i][0];
      document.getElementById('mj-text').textContent = STEPS[i][1];
      document.dispatchEvent(new CustomEvent('pmz:journey-step', { detail: { index: i, total: STEPS.length } }));
    }
    render();
  })();

  /* ================= Cookie consent + gated analytics ================= */
  var Cookie = (function () {
    var KEY = 'pmz-cookie';
    var banner = document.getElementById('cookie-banner');

    function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
    function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

    function loadAnalyticsIfConsented() {
      if (get() !== 'analytics') return;
      // Real analytics snippet goes here (e.g. Yandex Metrica), gated
      // behind explicit consent. No tracker is installed by default —
      // see README-DEPLOY.md for how to add one.
      if (typeof window.pomazkovLoadAnalytics === 'function') window.pomazkovLoadAnalytics();
    }

    function refresh() {
      var v = get();
      banner.hidden = !!v;
      if (v === 'analytics') loadAnalyticsIfConsented();
    }

    document.getElementById('cookie-necessary').addEventListener('click', function () { set('necessary'); refresh(); });
    document.getElementById('cookie-all').addEventListener('click', function () { set('analytics'); refresh(); });
    var openSettings = function () { set(''); try { localStorage.removeItem(KEY); } catch (e) {} refresh(); };
    document.getElementById('ct-cookie-settings').addEventListener('click', openSettings);

    refresh();
    return { openSettings: openSettings };
  })();

  /* ================= Booking: desktop panel + mobile sheet ============ */
  var Booking = window.PomazkovBooking;

  function renderDaysGrid(container, flow, dayClass) {
    container.innerHTML = '';
    flow.days().forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = dayClass + (flow.state.date === d.key ? ' selected' : '') + (!d.open ? ' closed' : '');
      b.disabled = !d.open;
      b.innerHTML = '<span>' + d.date.getDate() + '</span><span>' + flow.weekday(d.date) + '</span>';
      b.addEventListener('click', function () { flow.pickDate(d.key); });
      container.appendChild(b);
    });
  }
  function renderSlots(container, flow, slotClass) {
    container.innerHTML = '';
    var cur = flow.currentDay();
    (cur ? cur.slots : []).forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = slotClass + (flow.state.time === t ? ' selected' : '');
      b.textContent = t;
      b.addEventListener('click', function () { flow.pickTime(t); });
      container.appendChild(b);
    });
  }
  function renderTopics(container, flow, topicClass) {
    container.innerHTML = '';
    flow.topics().forEach(function (name) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = topicClass + (flow.state.topic === name ? ' selected' : '');
      b.innerHTML = '<span>' + name + '</span><span>' + (flow.state.topic === name ? '●' : '') + '</span>';
      b.addEventListener('click', function () { flow.pickTopic(name); });
      container.appendChild(b);
    });
  }

  // ---- Desktop panel ----
  (function desktopBooking() {
    var content = document.getElementById('bk-content');
    var actions = document.getElementById('bk-actions');
    if (!content) return;
    var flow = new Booking.BookingFlow(21);
    window.PMZ_BOOKING_DESKTOP = flow; // motion hook only — read by motion/booking.js

    function render() {
      document.getElementById('bk-step-label').textContent = flow.stepLabel();
      document.getElementById('bk-progress-fill').style.width = flow.progressPct();
      content.innerHTML = '';
      actions.innerHTML = '';

      if (flow.state.step === 'date') {
        content.innerHTML =
          '<div class="bk-step"><div class="bk-step-title">Выберите дату</div>' +
          '<div class="bk-step-sub">' + flow.monthLabel() + '</div>' +
          '<div class="bk-days" id="bk-days"></div>' +
          '<div class="bk-hint">Светлые даты, свободные приёмы.</div></div>';
        renderDaysGrid(document.getElementById('bk-days'), flow, 'bk-day');
      } else if (flow.state.step === 'time') {
        content.innerHTML =
          '<div class="bk-step"><div class="bk-step-title">Выберите время</div>' +
          '<div class="bk-step-sub">' + flow.dateLabel() + '</div>' +
          '<div class="bk-slots" id="bk-slots"></div></div>';
        renderSlots(document.getElementById('bk-slots'), flow, 'bk-slot');
      } else if (flow.state.step === 'topic') {
        content.innerHTML =
          '<div class="bk-step"><div class="bk-step-title">Что хотите обсудить?</div>' +
          '<div class="bk-topics" id="bk-topics"></div></div>';
        renderTopics(document.getElementById('bk-topics'), flow, 'bk-topic');
      } else if (flow.state.step === 'done') {
        content.innerHTML =
          '<div class="bk-step"><div class="bk-done-title">Вы выбрали время</div>' +
          '<div class="bk-summary">' +
          '<div class="bk-summary-row"><span>Запрос</span><span>' + flow.state.topic + '</span></div>' +
          '<div class="bk-summary-row"><span>Дата</span><span>' + flow.dateLabel() + '</span></div>' +
          '<div class="bk-summary-row"><span>Время</span><span>' + flow.state.time + '</span></div></div>' +
          '<p class="bk-done-note">Подтвердите запись в Telegram</p>' +
          '<a href="' + flow.telegramLink() + '" target="_blank" rel="noopener" class="bk-tg-btn" id="bk-tg-btn">Продолжить в Telegram ↗</a>' +
          (flow.state.copied ? '<div class="bk-copied-hint">Данные записи скопированы. Отправьте сообщение Филиппу в Telegram.</div>' : '') +
          '</div>';
        document.getElementById('bk-tg-btn').addEventListener('click', function () { flow.copyMessage(); });
      }

      if (flow.state.step !== 'date') {
        var back = document.createElement('button');
        back.type = 'button';
        back.className = 'bk-back';
        back.textContent = '← Назад';
        back.addEventListener('click', function () { flow.back(); });
        actions.appendChild(back);
      }
    }
    flow.onChange(render);
    render();
  })();

  /* ================= Mobile router: nav / subnav / sheet / hash ====== */
  (function mobileShell() {
    var shell = document.querySelector('.mb-shell');
    if (!shell) return;

    var VIEW_HASH = { home: '#/', results: '#/results', case: '#/works', approach: '#/approach' };
    var HASH_VIEW = { '': 'home', '#/': 'home', '#/results': 'results', '#/works': 'case', '#/approach': 'approach' };
    var NAV = [
      { key: 'home', name: 'Главная' },
      { key: 'results', name: 'Результаты' },
      { key: 'case', name: 'Работы' },
      { key: 'approach', name: 'Подход' },
      { key: 'booking', name: 'Запись' }
    ];
    var SUBS = [
      { key: 'doctor', name: 'О враче' },
      { key: 'journey', name: 'Путь пациента' },
      { key: 'explains', name: 'Объясняет' }
    ];

    var state = { view: 'home', sub: 'doctor', sheetOpen: false, tab: 'booking', past: false };

    var navEl = document.getElementById('mb-nav');
    var subnavEl = document.getElementById('mb-subnav');
    var sheetEl = document.getElementById('mb-sheet');
    var tabsEl = document.getElementById('mb-tabs');
    var tabContentEl = document.getElementById('mb-tab-content');

    var navBtns = NAV.map(function (n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = n.name;
      b.addEventListener('click', function () {
        if (n.key === 'booking') { openSheet('booking'); return; }
        navigateTo(n.key);
      });
      navEl.appendChild(b);
      return b;
    });
    var subBtns = SUBS.map(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = s.name;
      b.addEventListener('click', function () { state.sub = s.key; render(); toTop(); });
      subnavEl.appendChild(b);
      return b;
    });
    var tabBtns = [{ key: 'booking', name: 'Запись' }, { key: 'price', name: 'Стоимость' }, { key: 'contacts', name: 'Контакты' }].map(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = t.name;
      b.addEventListener('click', function () { state.tab = t.key; render(); });
      tabsEl.appendChild(b);
      return b;
    });

    function syncBody() {
      if (isMobile()) {
        document.body.dataset.mview = state.view;
        document.body.dataset.msub = state.sub;
      } else {
        delete document.body.dataset.mview;
        delete document.body.dataset.msub;
      }
    }
    function toTop() {
      if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
      window.scrollTo(0, 0);
    }
    function pushHash(hash) {
      if (location.hash === hash || (location.hash === '' && hash === '#/')) return;
      location.hash = hash;
    }

    // Route-transition lock: swallow a second tap that lands mid-way
    // through the ~0.4s view-change animation, without ever blocking
    // the UI visibly or for long.
    var navLocked = false;
    function withNavLock(fn) {
      return function () {
        if (navLocked) return;
        navLocked = true;
        setTimeout(function () { navLocked = false; }, 420);
        fn.apply(null, arguments);
      };
    }

    var navigateTo = withNavLock(function (view) {
      state.view = view;
      state.sheetOpen = false;
      pushHash(VIEW_HASH[view] || '#/');
      render();
      toTop();
    });
    var openSheet = withNavLock(function (tab) {
      state.sheetOpen = true;
      state.tab = tab || 'booking';
      pushHash('#/booking');
      render();
    });
    var closeSheet = withNavLock(function () {
      state.sheetOpen = false;
      pushHash(VIEW_HASH[state.view] || '#/');
      render();
    });
    document.getElementById('mb-sheet-close').addEventListener('click', closeSheet);

    window.addEventListener('hashchange', function () {
      var h = location.hash || '#/';
      if (h === '#/booking') {
        state.sheetOpen = true;
      } else {
        state.sheetOpen = false;
        state.view = HASH_VIEW[h] || 'home';
      }
      render();
    });

    window.addEventListener('resize', function () { syncBody(); });
    window.addEventListener('scroll', function () {
      var top = Math.max(document.scrollingElement ? document.scrollingElement.scrollTop : 0, window.scrollY || 0);
      var past = top > window.innerHeight * 0.6;
      if (past !== state.past) { state.past = past; render(); }
    }, { passive: true });

    // A global anchor-intercept: on mobile, in-page "#results"-style
    // anchors route into the app shell instead of scrolling to a
    // hidden desktop section.
    var ANCHOR_ROUTE = { results: 'results', directions: 'home', cases: 'case', approach: 'approach' };
    document.addEventListener('click', function (e) {
      if (!isMobile()) return;
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var key = a.getAttribute('href').slice(1);
      if (key === 'booking') { e.preventDefault(); openSheet('booking'); return; }
      if (ANCHOR_ROUTE[key]) { e.preventDefault(); navigateTo(ANCHOR_ROUTE[key]); }
    });

    // ---- booking flow bound to the sheet ----
    var mobileFlow = new Booking.BookingFlow(16);
    window.PMZ_BOOKING_MOBILE = mobileFlow; // motion hook only — read by motion/booking.js
    function renderBookingTab() {
      var f = mobileFlow;
      var html = '<div class="mb-bk-progress"><div class="mb-bk-progress-track"><div class="mb-bk-progress-fill" style="width:' + f.progressPct() + '"></div></div>' +
        '<div class="mb-bk-progress-label">' + f.stepLabel() + '</div></div>';

      if (f.state.step === 'date') {
        html += '<div style="margin-top:26px;"><div class="mb-step-title">Выберите дату</div><div class="mb-step-sub">' + f.monthLabel() + '</div><div class="mb-days" id="mb-days"></div></div>';
      } else if (f.state.step === 'time') {
        html += '<div style="margin-top:26px;"><div class="mb-step-title">Выберите время</div><div class="mb-step-sub">' + f.dateLabel() + '</div><div class="mb-slots" id="mb-slots"></div></div>';
      } else if (f.state.step === 'topic') {
        html += '<div style="margin-top:26px;"><div class="mb-step-title">Что хотите обсудить?</div><div class="mb-topics" id="mb-topics"></div></div>';
      } else if (f.state.step === 'done') {
        html += '<div style="margin-top:32px;"><div class="mb-done-title">Вы выбрали время</div>' +
          '<div class="mb-summary">' +
          '<div class="mb-summary-row"><span>Запрос</span><span>' + f.state.topic + '</span></div>' +
          '<div class="mb-summary-row"><span>Дата</span><span>' + f.dateLabel() + '</span></div>' +
          '<div class="mb-summary-row"><span>Время</span><span>' + f.state.time + '</span></div></div>' +
          '<p class="bk-done-note">Подтвердите запись в Telegram</p>' +
          '<a href="' + f.telegramLink() + '" target="_blank" rel="noopener" class="mb-tg-btn" id="mb-tg-btn">Продолжить в Telegram ↗</a>' +
          (f.state.copied ? '<div class="bk-copied-hint">Данные записи скопированы. Отправьте сообщение Филиппу в Telegram.</div>' : '') +
          '<button type="button" class="mb-close-btn" id="mb-close-btn">Закрыть</button></div>';
      }
      if (f.state.step !== 'date') html += '<button type="button" class="mb-back" id="mb-back">← Назад</button>';

      tabContentEl.innerHTML = html;
      if (f.state.step === 'date') renderDaysGrid(document.getElementById('mb-days'), f, 'mb-day');
      if (f.state.step === 'time') renderSlots(document.getElementById('mb-slots'), f, 'mb-slot');
      if (f.state.step === 'topic') renderTopics(document.getElementById('mb-topics'), f, 'mb-topic');
      var tg = document.getElementById('mb-tg-btn');
      if (tg) tg.addEventListener('click', function () { f.copyMessage(); });
      var closeBtn = document.getElementById('mb-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', closeSheet);
      var backBtn = document.getElementById('mb-back');
      if (backBtn) backBtn.addEventListener('click', function () { f.back(); });
    }
    mobileFlow.onChange(renderBookingTab);

    function renderPriceTab() {
      var rows = ['Блефаропластика', 'Маммопластика', 'Абдоминопластика', 'Липосакция', 'Подтяжка лица'];
      tabContentEl.innerHTML = '<div style="margin-top:26px;">' +
        '<div class="mb-step-title" style="font-weight:700; text-transform:uppercase; font-size:26px; line-height:1.06;">Стоимость зависит от объёма вмешательства</div>' +
        '<p class="mb-step-sub" style="font-size:14.5px; line-height:1.6;">Точную сумму Филипп называет на консультации, после осмотра.</p>' +
        '<div class="mb-price-rows">' + rows.map(function (n) { return '<div class="mb-price-row"><span>' + n + '</span><span>по консультации</span></div>'; }).join('') +
        '</div></div>';
    }
    function renderContactsTab() {
      tabContentEl.innerHTML =
        '<div style="margin-top:26px;">' +
        '<div class="mb-done-title" style="font-size:22px;">Филипп Помазков</div>' +
        '<div class="mb-step-sub">Пластический хирург</div>' +
        '<div class="mb-contact-links">' +
        '<a href="https://t.me/PomazkovPhilipp" target="_blank" rel="noopener">Telegram · @PomazkovPhilipp</a>' +
        '<a href="https://www.instagram.com/dr.pomazkoff/" target="_blank" rel="noopener">Instagram · @dr.pomazkoff</a></div>' +
        '<div class="ct-label" style="margin-top:22px;">Приём в клинике</div>' +
        '<div class="ct-clinic" style="color:rgba(27,26,24,0.8);">' +
        '<div>ООО «Клиника ОстМедКонсалт»</div><div>Санкт-Петербург, ул. Шпалерная, д. 36, лит. А</div><div>Лицензия Л041-01148-78/00349385, <br>выдана Комитетом по здравоохранению Санкт-Петербурга</div></div>' +
        '<div class="mb-legal-links">' +
        '<a href="legal/privacy.html">Политика обработки персональных данных</a>' +
        '<a href="legal/cookie-policy.html">Политика cookie</a>' +
        '<a href="legal/cookie-policy.html#clinic">Сведения о клинике</a>' +
        '<a href="https://ostmed.ru/price/" target="_blank" rel="noopener">Прайс-лист клиники ↗</a>' +
        '<button type="button" id="mb-cookie-settings">Настройки cookie</button></div>' +
        '<p class="mb-step-sub" style="margin-top:22px; font-size:12.5px; line-height:1.6;">Имеются противопоказания. Необходима консультация специалиста. Информация на сайте носит информационный характер и не является публичной офертой.</p>' +
        '<p class="mb-step-sub" style="margin-top:8px; font-size:12.5px; line-height:1.6;">Часть визуальных материалов на сайте создана с применением технологий искусственного интеллекта и используется в иллюстративных целях. AI-материалы не являются изображением результатов медицинских вмешательств.</p>' +
        '<p class="mb-step-sub" style="margin-top:14px; font-size:12.5px;">© Pomazkov · <a href="https://tinadigital.ru/" target="_blank" rel="noopener">By TinaDigital</a></p>' +
        '</div>';
      document.getElementById('mb-cookie-settings').addEventListener('click', Cookie.openSettings);
    }

    function render() {
      syncBody();
      navBtns.forEach(function (b, i) {
        var active = NAV[i].key === state.view || (NAV[i].key === 'booking' && state.sheetOpen);
        b.classList.toggle('active', active);
      });
      var showSubnav = state.view === 'approach' && !state.sheetOpen;
      subnavEl.hidden = !showSubnav;
      subBtns.forEach(function (b, i) { b.classList.toggle('active', SUBS[i].key === state.sub); });

      var navHidden = state.view === 'home' && !state.past && !state.sheetOpen;
      navEl.style.opacity = navHidden ? '0' : '1';
      navEl.style.pointerEvents = navHidden ? 'none' : 'auto';

      sheetEl.hidden = !state.sheetOpen;
      if (state.sheetOpen) {
        tabBtns.forEach(function (b, i) { b.classList.toggle('active', ['booking', 'price', 'contacts'][i] === state.tab); });
        if (state.tab === 'booking') renderBookingTab();
        else if (state.tab === 'price') renderPriceTab();
        else renderContactsTab();
      }
      document.dispatchEvent(new CustomEvent('pmz:view-change', {
        detail: { view: state.view, sub: state.sub, sheetOpen: state.sheetOpen, navHidden: navHidden, showSubnav: showSubnav }
      }));
    }

    syncBody();
    var initHash = location.hash || '#/';
    if (initHash === '#/booking') state.sheetOpen = true;
    else state.view = HASH_VIEW[initHash] || 'home';
    render();
  })();

  /* Smooth in-page scroll for desktop anchor navigation. */
  document.documentElement.style.scrollBehavior = 'smooth';
})();
