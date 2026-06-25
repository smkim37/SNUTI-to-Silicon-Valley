window.App = window.App || {};
(function (A) {
  "use strict";
  A.views = A.views || {};
  var U = A.util, esc = U.escapeHtml;
  var raf = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };

  function busBadge(bus) {
    if (!bus) return '<span class="bus-free">개별/자유</span>';
    var m = bus.match(/\d+/);          // "3호차"→3, "7VAN"→7
    var n = m ? m[0] : "x";
    return '<span class="bus bus--' + n + '">🚌 ' + esc(bus) + "</span>";
  }

  var MAGNIFIER =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2.2"/>' +
    '<line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

  function itemRow(it) {
    var note = it.note ? '<span class="note">' + esc(it.note) + "</span>" : "";
    var info = (A.places && A.places[it.activity])
      ? '<button type="button" class="info-btn" data-place="' + esc(it.activity) +
        '" aria-label="' + esc(it.activity) + ' 정보 보기">' + MAGNIFIER + "</button>"
      : "";
    return (
      '<div class="item">' +
        '<span class="slot">' + esc(it.slot) + "</span>" +
        '<span class="act">' + esc(it.activity) + info + note + "</span>" +
        busBadge(it.bus) +
      "</div>"
    );
  }

  // 활동(방문/이동) 레그의 탑승 호차가 2개 이상이면 실제 "차량(호차) 교체"가 있는 날 → 안내.
  // 식사(점심·석식)만의 호차 차이는 교체가 아니므로 제외. 수기 메모는 표시하지 않는다(파편/중복 방지).
  var MEAL_SLOTS = { "점심": 1, "석식": 1 };
  function busNoticeHtml(d) {
    var distinct = [];
    (d.items || []).forEach(function (it) {
      if (it.bus && !MEAL_SLOTS[it.slot] && distinct.indexOf(it.bus) < 0) distinct.push(it.bus);
    });
    if (distinct.length < 2) return "";
    return '<div class="memo memo-bus">🚌 <span>오늘은 활동마다 탑승 호차가 바뀌어요(<b>차량 교체</b>). ' +
      "각 활동의 <b>호차 표시를 꼭 확인</b>하세요.</span></div>";
  }

  function dayCard(d, today) {
    var label = A.data.dateLabel[d.date] || d.date;
    var isToday = d.date === today;
    var badge = isToday ? '<span class="today-badge">Today</span>' : "";
    var notice = busNoticeHtml(d);
    var items = (d.items || []).map(itemRow).join("");
    var program = A.data.programByDate[d.date] || [];
    var programHtml = (program.length && A.render)
      ? '<details class="day-program"><summary class="dp-toggle"><span class="dp-label">전체 일정<i class="dp-chev"></i></span></summary>' +
        program.map(A.render.programBlock).join("") + "</details>"
      : "";
    return (
      '<section class="day card' + (isToday ? " is-today" : "") + '">' +
        '<div class="day-head">' + esc(label) + badge + "</div>" +
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

    var today = U.todayMD();
    var days = (p.days || []).map(function (d) { return dayCard(d, today); }).join("");

    root.innerHTML =
      '<a class="back" href="#/">← 목록</a>' +
      '<section class="person-head card">' +
        '<img class="celebrate" src="./assets/action05.png" alt="">' +
        '<div class="person-name">' + esc(p.name) + "</div>" +
        '<div class="chips">' + chips + "</div>" +
      "</section>" +
      '<div class="legend">🚌 <b>그 활동의 탑승 호차</b>를 색 글자로 표시했어요. 활동마다 다를 수 있으니 꼭 확인하세요!</div>' +
      days +
      '<div class="foot-note">사전교육·항공편 등 프로그램 전체는 <a href="#/overview">전체 일정 보기</a></div>';

    // 행사 기간 중이면 오늘 일자 카드로 스크롤(라우터의 scrollTo(0,0) 다음 프레임에 실행).
    // 기간 밖이면 today 카드가 없어 그대로 상단부터 표시.
    var todayEl = root.querySelector(".day.is-today");
    if (todayEl) raf(function () { todayEl.scrollIntoView({ block: "start" }); });

    U.toast("🎉 찾았어요!");
  };
})(window.App);
