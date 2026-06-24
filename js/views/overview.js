window.App = window.App || {};
(function (A) {
  "use strict";
  A.views = A.views || {};
  var esc = A.util.escapeHtml;

  function chips(list) {
    return '<div class="opts">' +
      list.map(function (o) { return '<span class="opt">' + esc(o) + "</span>"; }).join("") +
      "</div>";
  }

  function itemRow(it) {
    var note = it.note ? ' <span class="pg-note">' + esc(it.note) + "</span>" : "";
    var parts = (it.parts && it.parts.length)
      ? '<ul class="pg-parts">' +
          it.parts.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") +
        "</ul>"
      : "";
    return '<div class="pg-item"><span class="pg-title">' + esc(it.title) + "</span>" + note + parts + "</div>";
  }

  function block(b) {
    var tag = b.tag ? ' <span class="pg-tag">' + esc(b.tag) + "</span>" : "";
    var body = "";
    if (b.chips && b.chips.length) body = chips(b.chips);
    else if (b.items && b.items.length) body = b.items.map(itemRow).join("");
    return '<div class="pg-block"><div class="pg-head">' + esc(b.head) + tag + "</div>" + body + "</div>";
  }

  function dayCard(d) {
    var memos = (d.memos || []).map(function (m) {
      return '<div class="memo">📌 <span>' + A.util.nl2br(m) + "</span></div>";
    }).join("");
    var blocks = (d.program || []).map(block).join("");
    return (
      '<section class="card ov-day">' +
        '<div class="day-head">' + esc(d.label) + "</div>" +
        memos + blocks +
      "</section>"
    );
  }

  function preTraining(list) {
    if (!list || !list.length) return "";
    var rows = list.map(function (p) {
      return (
        '<div class="pt-row">' +
          '<span class="pt-date">' + esc(p.date) + " (" + esc(p.dow) + ")</span>" +
          '<span class="pt-n">' + esc(p.n) + "</span>" +
          '<span class="pt-theme">' + esc(p.theme) + "</span>" +
        "</div>"
      );
    }).join("");
    return (
      '<section class="card pt-card">' +
        '<div class="day-head">사전교육</div>' + rows +
      "</section>"
    );
  }

  A.views.overview = function (root) {
    var ov = A.data.overview;
    var note = (ov.meta && ov.meta.note) || "";
    var days = (ov.days || []).map(dayCard).join("");
    root.innerHTML =
      '<a class="back" href="#/">← 목록</a>' +
      '<section class="hero hero-sm">' +
        '<img class="hero-mascot sm" src="./assets/action01.png" alt="">' +
        '<h1 class="hero-title">전체 일정</h1>' +
        '<p class="hero-sub">' + esc(note) + "</p>" +
      "</section>" +
      preTraining(ov.preTraining) +
      days;
  };
})(window.App);
