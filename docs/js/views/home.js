window.App = window.App || {};
(function (A) {
  "use strict";
  A.views = A.views || {};
  var U = A.util, esc = U.escapeHtml;

  function chip(text, cls) {
    return '<span class="chip ' + (cls || "") + '">' + esc(text) + "</span>";
  }

  function personCard(p) {
    var chips = chip(p.groupLabel, "chip-group");
    if (p.baseBus) chips += chip("기본 " + p.baseBus, "chip-base");
    var alias = p.alias ? '<div class="r-alias">' + esc(p.alias) + "</div>" : "";
    return (
      '<a class="card result" href="#/p/' + p.id + '">' +
        '<div class="r-main">' +
          '<div class="r-name">' + esc(p.name) + "</div>" +
          alias +
          '<div class="r-chips">' + chips + "</div>" +
        "</div>" +
        '<span class="chev">›</span>' +
      "</a>"
    );
  }

  function groupCard(name, ids) {
    return (
      '<a class="card result" href="#/g/' + encodeURIComponent(name) + '">' +
        '<div class="r-main">' +
          '<div class="r-name">' + esc(name) + "</div>" +
          '<div class="r-alias">동명이인 · 조를 선택하세요</div>' +
        "</div>" +
        '<span class="count">' + ids.length + "명</span>" +
      "</a>"
    );
  }

  function renderResults(box, results, q) {
    if (!q) {
      box.innerHTML =
        '<div class="state">' +
          '<div class="big">이름을 검색해 보세요</div>' +
          "<div>학생 · 교수 · 조교 · 인솔진 모두 검색할 수 있어요.<br>" +
          "초성(예: ㄱㄱㅅ)이나 일부 글자만 입력해도 됩니다.</div>" +
          '<div class="hint-actions"><a class="btn-line" href="#/overview">전체 일정 보기</a></div>' +
        "</div>";
      return;
    }
    if (!results.length) {
      box.innerHTML =
        '<div class="state">' +
          '<img src="./assets/action03.png" alt="">' +
          '<div class="big">검색 결과가 없어요</div>' +
          "<div>이름을 다시 확인해 주세요. 괄호·별칭 없이 한국어 이름으로 검색하면 돼요.</div>" +
        "</div>";
      return;
    }
    var html = results.map(function (r) {
      return r.type === "group" ? groupCard(r.name, r.ids) : personCard(r.person);
    }).join("");
    box.innerHTML = html;
  }

  A.views.home = function (root) {
    root.innerHTML =
      '<section class="hero">' +
        '<img class="hero-mascot" src="./assets/action04.png" alt="">' +
        '<h1 class="hero-title">내 일정 · 호차 찾기</h1>' +
        '<p class="hero-sub">이름을 검색하면 일자별 일정과 <b>활동별 탑승 호차</b>를 한눈에 볼 수 있어요.</p>' +
      "</section>" +
      '<div class="search-wrap">' +
        '<input id="q" class="search-input" type="search" inputmode="search" ' +
        'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
        'placeholder="이름 검색 (예: 김규서 · ㄱㄱㅅ)">' +
      "</div>" +
      '<div id="results" class="results"></div>';

    var input = root.querySelector("#q");
    var box = root.querySelector("#results");
    var timer = null;

    function run() {
      renderResults(box, A.search.search(input.value), U.normalizeQuery(input.value));
    }
    input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(run, 110);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var res = A.search.search(input.value);
        if (res.length === 1) {
          var r = res[0];
          location.hash = r.type === "group"
            ? "#/g/" + encodeURIComponent(r.name)
            : "#/p/" + r.person.id;
        }
      }
    });

    renderResults(box, [], "");
    // 모바일에서 자동 포커스는 키보드를 강제로 띄우므로 생략
    if (window.matchMedia && window.matchMedia("(min-width:560px)").matches) {
      input.focus();
    }
  };
})(window.App);
