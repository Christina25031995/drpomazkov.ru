/*
 * Shared booking-flow logic (date -> time -> topic -> Telegram handoff),
 * used by both the desktop panel (#booking) and the mobile sheet
 * (#mb-sheet). One state machine, two renderers in app.js — keeps the
 * flow identical instead of the old copy-pasted desktop/mobile logic.
 *
 * By design (see legal/privacy.html) this never collects name, phone,
 * or any contact info: it only helps the visitor choose a date, time
 * and topic, then hands off to Telegram where Filipp confirms in person.
 */
(function () {
  var MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  var WEEKDAYS = ['вс','пн','вт','ср','чт','пт','сб'];
  var TOPICS = ['Блефаропластика','Маммопластика','Абдоминопластика','Липосакция','Подтяжка лица','Пока не знаю — хочу обсудить'];
  var TG_LINK = 'https://t.me/PomazkovPhilipp';

  function formatDate(d) {
    return d.getDate() + ' ' + MONTHS[d.getMonth()];
  }

  function buildDays(count) {
    var av = window.POMAZKOV_AVAILABILITY || {};
    var out = [];
    var base = new Date();
    for (var i = 1; i <= count; i++) {
      var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      var key = d.toISOString().slice(0, 10);
      var slots = av[key] || [];
      out.push({ key: key, date: d, open: slots.length > 0, slots: slots });
    }
    return out;
  }

  function BookingFlow(daysCount) {
    this.daysCount = daysCount;
    this.state = { step: 'date', date: null, time: null, topic: null, copied: false };
    this.listeners = [];
  }

  BookingFlow.prototype.onChange = function (fn) { this.listeners.push(fn); };
  BookingFlow.prototype.emit = function () { this.listeners.forEach(function (fn) { fn(); }); };

  BookingFlow.prototype.days = function () { return buildDays(this.daysCount); };
  BookingFlow.prototype.currentDay = function () {
    var days = this.days();
    for (var i = 0; i < days.length; i++) if (days[i].key === this.state.date) return days[i];
    return null;
  };
  BookingFlow.prototype.topics = function () { return TOPICS; };
  BookingFlow.prototype.monthLabel = function () {
    var now = new Date();
    return MONTHS[now.getMonth()] + ' / ' + MONTHS[(now.getMonth() + 1) % 12];
  };
  BookingFlow.prototype.dateLabel = function () {
    var cur = this.currentDay();
    return cur ? formatDate(cur.date) : '';
  };
  BookingFlow.prototype.weekday = function (d) { return WEEKDAYS[d.getDay()]; };

  BookingFlow.prototype.pickDate = function (key) {
    var day = this.days().filter(function (d) { return d.key === key; })[0];
    if (!day || !day.open) return;
    this.state.date = key;
    this.state.time = null;
    this.state.step = 'time';
    this.emit();
  };
  BookingFlow.prototype.pickTime = function (time) {
    this.state.time = time;
    this.state.step = 'topic';
    this.emit();
  };
  BookingFlow.prototype.pickTopic = function (topic) {
    this.state.topic = topic;
    this.state.step = 'done';
    this.emit();
  };
  BookingFlow.prototype.back = function () {
    var order = ['date', 'time', 'topic', 'done'];
    var i = order.indexOf(this.state.step);
    if (i > 0) this.state.step = order[i - 1];
    this.emit();
  };
  BookingFlow.prototype.reset = function () {
    this.state = { step: 'date', date: null, time: null, topic: null, copied: false };
    this.emit();
  };

  BookingFlow.prototype.stepIndex = function () {
    return { date: 1, time: 2, topic: 3, done: 4 }[this.state.step];
  };
  BookingFlow.prototype.stepLabel = function () {
    return this.state.step === 'done' ? 'готово' : this.stepIndex() + ' / 3';
  };
  BookingFlow.prototype.progressPct = function () {
    return (this.state.step === 'done' ? 100 : Math.round(this.stepIndex() * 33.3)) + '%';
  };

  BookingFlow.prototype.telegramMessage = function () {
    var cur = this.currentDay();
    return 'Здравствуйте, Филипп.\nХочу записаться на консультацию.\n\nДата: ' +
      (cur ? formatDate(cur.date) : '') + '\nВремя: ' + (this.state.time || '') +
      '\nТема: ' + (this.state.topic || '');
  };
  BookingFlow.prototype.telegramLink = function () { return TG_LINK; };
  BookingFlow.prototype.copyMessage = function () {
    var msg = this.telegramMessage();
    if (navigator.clipboard) navigator.clipboard.writeText(msg).catch(function () {});
    this.state.copied = true;
    this.emit();
  };

  window.PomazkovBooking = { BookingFlow: BookingFlow, formatDate: formatDate };
})();
