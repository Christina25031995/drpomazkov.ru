/* ============================================================
 * DEMO / PLACEHOLDER DATA — NOT A REAL SCHEDULE.
 * ============================================================
 * This entire file is auto-generated filler so the booking widget
 * has something to click through before launch. Every date/time it
 * produces is fake and rotates relative to today's date — it does
 * NOT reflect Filipp's actual availability and must be replaced
 * with real data before this site goes live. Nothing else in the
 * codebase needs to change when you do.
 *
 * Format: one entry per open date, "YYYY-MM-DD" -> array of "HH:MM"
 * time slots. A date with no entry (or an empty array) is shown as
 * closed. Remove a date entirely once it is in the past.
 *
 * Example of what REAL data looks like (replace the generator below
 * with a plain object exactly like this):
 *
 *   window.POMAZKOV_AVAILABILITY = {
 *     "2026-09-24": ["12:00", "13:30", "16:00"],
 *     "2026-09-25": ["11:00"]
 *   };
 * ============================================================ */
window.POMAZKOV_AVAILABILITY_IS_DEMO = true;

window.POMAZKOV_AVAILABILITY = (function () {
  var out = {};
  var base = new Date();
  for (var i = 1; i <= 21; i++) {
    var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    var wd = d.getDay();
    var open = wd !== 0 && wd !== 6 && (i % 3 !== 0);
    if (!open) continue;
    var key = d.toISOString().slice(0, 10);
    out[key] = ['11:00', '12:30', '15:00', '17:30'].filter(function (_, n) {
      return (i + n) % 5 !== 0;
    });
  }
  return out;
})();
