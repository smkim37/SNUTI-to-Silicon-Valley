window.App = window.App || {};
(function (A) {
  "use strict";
  A.views = A.views || {};
  var U = A.util, esc = U.escapeHtml;

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

  // 그 날 활동들의 탑승 호차가 2개 이상이면 "차량(호차) 교체"가 있는 날 → 안내.
  // 엑셀 메모칸이 일부만 채워져 있어, 실제 호차로 유도해 일관되게 표시한다.
  var BUS_CHANGE_MEMO = /^\s*호텔?\s*차량\s*교체\s*$/;  // 단순 "호텔 차량교체"는 표준 안내로 흡수
  function busNoticeHtml(d) {
    var distinct = [];
    (d.items || []).forEach(function (it) {
      if (it.bus && distinct.indexOf(it.bus) < 0) distinct.push(it.bus);
    });
    var hasChange = distinct.length >= 2;
    if (hasChange) {
      var extra = (d.memo && !BUS_CHANGE_MEMO.test(d.memo)) ? "<br>" + U.nl2br(d.memo) : "";
      return '<div class="memo memo-bus">🚌 <span>오늘은 활동마다 탑승 호차가 바뀌어요(<b>차량 교체</b>). ' +
        "각 활동의 <b>호차 배지를 꼭 확인</b>하세요." + extra + "</span></div>";
    }
    if (d.memo) return '<div class="memo">📌 <span>' + U.nl2br(d.memo) + "</span></div>";
    return "";
  }

  function dayCard(d) {
    var label = A.data.dateLabel[d.date] || d.date;
    var notice = busNoticeHtml(d);
    var items = (d.items || []).map(itemRow).join("");
    var program = A.data.programByDate[d.date] || [];
    var programHtml = (program.length && A.render)
      ? '<details class="day-program"><summary class="dp-toggle"><span class="dp-pill">전체 일정<i class="dp-chev"></i></span></summary>' +
        program.map(A.render.programBlock).join("") + "</details>"
      : "";
    return (
      '<section class="day card">' +
        '<div class="day-head">' + esc(label) + "</div>" +
        notice +
        '<div class="items">' + items + "</div>" +
        programHtml +
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
      '<div class="foot-note">사전교육·항공편 등 프로그램 전체는 <a href="#/overview">전체 일정 보기</a></div>';

    U.toast("🎉 찾았어요!");
  };
})(window.App);
