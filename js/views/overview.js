window.App = window.App || {};
(function (A) {
  "use strict";
  A.views = A.views || {};
  var esc = A.util.escapeHtml;

  function dayCard(d) {
    var blocks = (d.program || []).map(A.render.programBlock).join("");
    return (
      '<section class="card ov-day">' +
        '<div class="day-head">' + esc(d.label) + "</div>" +
        blocks +
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
