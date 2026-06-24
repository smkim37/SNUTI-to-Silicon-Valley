window.App = window.App || {};
(function (A) {
  "use strict";
  A.views = A.views || {};
  var U = A.util, esc = U.escapeHtml;

  var ROLE_LABEL = { student: "학생", professor: "교수", ta: "조교", company: "인솔진" };

  function busBadge(bus) {
    if (!bus) return '<span class="bus-free">개별/자유</span>';
    var m = bus.match(/\d+/);          // "3호차"→3, "7VAN"→7
    var n = m ? m[0] : "x";
    return '<span class="bus bus--' + n + '">🚌 ' + esc(bus) + "</span>";
  }

  function itemRow(it) {
    var note = it.note ? '<span class="note">' + esc(it.note) + "</span>" : "";
    return (
      '<div class="item">' +
        '<span class="slot">' + esc(it.slot) + "</span>" +
        '<span class="act">' + esc(it.activity) + note + "</span>" +
        busBadge(it.bus) +
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
    var label = A.data.dateLabel[d.date] || d.date;
    var memo = d.memo ? '<div class="memo">📌 <span>' + U.nl2br(d.memo) + "</span></div>" : "";
    var items = (d.items || []).map(itemRow).join("");
    var common = A.data.commonByDate[d.date] || [];
    var commonHtml = common.length
      ? '<div class="common-block"><div class="common-title">전체 공통 일정</div>' +
        common.map(commonRow).join("") + "</div>"
      : "";
    return (
      '<section class="day card">' +
        '<div class="day-head">' + esc(label) + "</div>" +
        memo +
        '<div class="items">' + items + "</div>" +
        commonHtml +
      "</section>"
    );
  }

  function notFound() {
    return (
      '<a class="back" href="#/">← 목록</a>' +
      '<div class="state"><img src="./assets/action03.png" alt="">' +
      '<div class="big">해당 정보를 찾을 수 없어요</div>' +
      "<div>링크가 올바른지 확인하거나 다시 검색해 주세요.</div></div>"
    );
  }

  A.views.person = function (root, id) {
    var p = A.data.getPerson(id);
    if (!p) { root.innerHTML = notFound(); return; }

    var chips = '<span class="chip chip-group">' + esc(p.groupLabel) + "</span>";
    if (ROLE_LABEL[p.role]) chips += '<span class="chip chip-role">' + ROLE_LABEL[p.role] + "</span>";
    var alias = p.alias ? '<div class="person-alias">' + esc(p.alias) + "</div>" : "";

    var days = (p.days || []).map(dayCard).join("");

    root.innerHTML =
      '<a class="back" href="#/">← 목록</a>' +
      '<section class="person-head card">' +
        '<img class="celebrate" src="./assets/action05.png" alt="">' +
        '<div class="person-name">' + esc(p.name) + "</div>" +
        alias +
        '<div class="chips">' + chips + "</div>" +
      "</section>" +
      '<div class="legend">🚌 배지는 <b>그 활동의 탑승 호차</b>예요. 활동마다 호차가 다를 수 있으니 꼭 확인하세요!</div>' +
      days +
      '<div class="foot-note">공통 저녁 세션 등 전체 일정은 <a href="#/overview">전체 일정 보기</a></div>';

    U.toast("🎉 찾았어요!");
  };
})(window.App);
