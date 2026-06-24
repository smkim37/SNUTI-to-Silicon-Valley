window.App = window.App || {};
(function (A) {
  "use strict";
  var esc = A.util.escapeHtml;

  // 전체 일정(program) 블록 렌더러 — overview 페이지와 개인 페이지가 공유한다.
  // block = {head, tag?, chips?[], items?[{title, note?, parts?[]}]}
  function chips(list) {
    return '<div class="opts">' +
      list.map(function (o) { return '<span class="opt">' + esc(o) + "</span>"; }).join("") +
      "</div>";
  }

  function programItem(it) {
    var note = it.note ? ' <span class="pg-note">' + esc(it.note) + "</span>" : "";
    var parts = (it.parts && it.parts.length)
      ? '<ul class="pg-parts">' +
          it.parts.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") +
        "</ul>"
      : "";
    return '<div class="pg-item"><span class="pg-title">' + esc(it.title) + "</span>" + note + parts + "</div>";
  }

  function programBlock(b) {
    var tag = b.tag ? ' <span class="pg-tag">' + esc(b.tag) + "</span>" : "";
    var body = "";
    if (b.chips && b.chips.length) body = chips(b.chips);
    else if (b.items && b.items.length) body = b.items.map(programItem).join("");
    return '<div class="pg-block"><div class="pg-head">' + esc(b.head) + tag + "</div>" + body + "</div>";
  }

  A.render = { programBlock: programBlock };
})(window.App);
