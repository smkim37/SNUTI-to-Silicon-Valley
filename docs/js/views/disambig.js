window.App = window.App || {};
(function (A) {
  "use strict";
  A.views = A.views || {};
  var esc = A.util.escapeHtml;

  function chooseCard(p) {
    var chips = '<span class="chip chip-group">' + esc(p.groupLabel) + "</span>";
    if (p.baseBus) chips += '<span class="chip chip-base">기본 ' + esc(p.baseBus) + "</span>";
    return (
      '<a class="card result" href="#/p/' + p.id + '">' +
        '<div class="r-main">' +
          '<div class="r-name">' + esc(p.name) + "</div>" +
          '<div class="r-chips">' + chips + "</div>" +
        "</div>" +
        '<span class="chev">›</span>' +
      "</a>"
    );
  }

  A.views.disambig = function (root, name) {
    var ids = A.data.duplicates[name];
    if (!ids || !ids.length) { location.hash = "#/"; return; }
    var cards = ids.map(function (id) {
      var p = A.data.getPerson(id);
      return p ? chooseCard(p) : "";
    }).join("");

    root.innerHTML =
      '<a class="back" href="#/">← 목록</a>' +
      '<div class="notice">' +
        '<img class="notice-mascot" src="./assets/action01.png" alt="">' +
        "<div><b>" + esc(name) + "</b> 님이 여러 명 있어요.<br>본인의 <b>조</b>를 선택하세요.</div>" +
      "</div>" +
      '<div class="results">' + cards + "</div>";
  };
})(window.App);
