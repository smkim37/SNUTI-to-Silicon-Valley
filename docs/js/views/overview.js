window.App = window.App || {};
(function (A) {
  "use strict";
  A.views = A.views || {};
  var esc = A.util.escapeHtml;

  function slotBlock(s) {
    var opts = (s.options || []).map(function (o) {
      return '<span class="opt">' + esc(o) + "</span>";
    }).join("");
    return (
      '<div class="ov-slot">' +
        '<div class="s-label">' + esc(s.slot) + "</div>" +
        '<div class="opts">' + opts + "</div>" +
      "</div>"
    );
  }

  function commonRow(c) {
    var place = c.place ? ' <span class="cplace">@' + esc(c.place) + "</span>" : "";
    return (
      '<div class="common-item">' +
        '<span class="ctime">' + esc(c.time) + "</span>" +
        '<span class="ctitle">' + esc(c.title) + place + "</span>" +
      "</div>"
    );
  }

  function dayCard(d) {
    var memos = (d.memos || []).map(function (m) {
      return '<div class="memo">📌 <span>' + A.util.nl2br(m) + "</span></div>";
    }).join("");
    var slots = (d.slots || []).map(slotBlock).join("");
    var common = (d.common || []);
    var commonHtml = common.length
      ? '<div class="ov-section-title">전체 공통 일정</div>' +
        '<div class="ov-slot">' + common.map(commonRow).join("") + "</div>"
      : "";
    var optTitle = slots ? '<div class="ov-section-title">그날의 방문/식사 옵션 (조·호차별 상이)</div>' : "";
    return (
      '<section class="card ov-day">' +
        '<div class="day-head">' + esc(d.label) + "</div>" +
        memos +
        commonHtml +
        optTitle +
        slots +
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
      days;
  };
})(window.App);
