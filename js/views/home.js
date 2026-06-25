window.App = window.App || {};
(function (A) {
  "use strict";
  A.views = A.views || {};
  var U = A.util, esc = U.escapeHtml;
  var raf = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };

  var lastOpenKey = null; // 세션 내 마지막으로 펼친 조 기억

  function chip(text, cls) {
    return '<span class="chip ' + (cls || "") + '">' + esc(text) + "</span>";
  }

  function personCard(p) {
    var chips = chip(p.groupLabel, "chip-group");
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

  function renderResults(box, results) {
    if (!results.length) {
      box.innerHTML =
        '<div class="state">' +
          '<img src="./assets/action03.png" alt="">' +
          '<div class="big">검색 결과가 없어요</div>' +
          "<div>이름을 다시 확인해 주세요. 괄호·별칭 없이 한국어 이름으로 검색하면 돼요.</div>" +
        "</div>";
      return;
    }
    box.innerHTML = results.map(function (r) {
      return r.type === "group" ? groupCard(r.name, r.ids) : personCard(r.person);
    }).join("");
  }

  /* ---------- 조별 둘러보기 ---------- */
  function clusterButton(c) {
    return (
      '<button type="button" class="cluster-btn' + (c.role !== "student" ? " staff" : "") +
        '" data-key="' + esc(c.key) + '">' +
        '<span class="cl-name">' + esc(c.shortLabel) + "</span>" +
        '<span class="cl-count">' + c.count + "명</span>" +
      "</button>"
    );
  }

  function memberPanel(c) {
    var btns = c.members.map(function (m) {
      return (
        '<a class="member-btn" href="#/p/' + m.id + '">' +
          '<span class="m-name">' + esc(m.name) + "</span>" +
          '<span class="m-go">›</span>' +
        "</a>"
      );
    }).join("");
    return (
      '<div class="member-panel enter">' +
        '<div class="member-head">' + esc(c.label) +
          ' <span class="member-count">' + c.count + "명</span></div>" +
        '<div class="member-grid">' + btns + "</div>" +
      "</div>"
    );
  }

  function buildBrowse() {
    var clusters = A.data.getClusters();
    var students = clusters.filter(function (c) { return c.role === "student"; });
    var staff = clusters.filter(function (c) { return c.role !== "student"; });
    var grid = students.map(clusterButton).join("");
    if (staff.length) {
      grid += '<div class="cluster-sep">운영진</div>' + staff.map(clusterButton).join("");
    }
    return (
      '<section id="browse" class="browse">' +
        '<div class="browse-head">조별로 찾기' +
          '<span class="browse-sub">조를 누르면 이름이 펼쳐져요</span></div>' +
        '<div class="cluster-grid">' + grid + "</div>" +
        '<div id="cluster-panel"></div>' +
      "</section>"
    );
  }

  function clusterByKey(key) {
    var cs = A.data.getClusters();
    for (var i = 0; i < cs.length; i++) if (cs[i].key === key) return cs[i];
    return null;
  }

  function setActive(root, key) {
    var btns = root.querySelectorAll(".cluster-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle("active", btns[i].getAttribute("data-key") === key);
    }
  }

  function openCluster(root, key, doScroll) {
    var panel = root.querySelector("#cluster-panel");
    if (lastOpenKey === key) { // 같은 조 다시 누르면 닫기
      lastOpenKey = null;
      panel.innerHTML = "";
      setActive(root, null);
      return;
    }
    lastOpenKey = key;
    setActive(root, key);
    var c = clusterByKey(key);
    panel.innerHTML = c ? memberPanel(c) : "";
    var mp = panel.querySelector(".member-panel");
    if (mp) {
      raf(function () { raf(function () { mp.classList.remove("enter"); }); });
      if (doScroll && mp.scrollIntoView) {
        mp.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }

  function showBrowse(root, hasQuery) {
    var browse = root.querySelector("#browse");
    var results = root.querySelector("#results");
    if (hasQuery) {
      if (browse) browse.style.display = "none";
      if (results) results.style.display = "";
    } else {
      if (browse) browse.style.display = "";
      if (results) { results.style.display = "none"; results.innerHTML = ""; }
    }
  }

  A.views.home = function (root) {
    root.innerHTML =
      '<section class="hero hero-compact">' +
        '<div class="hero-fly"><img class="hero-mascot" src="./assets/action04.png" alt=""></div>' +
        '<h1 class="hero-title">내 일정 · 호차 찾기</h1>' +
        '<p class="hero-sub">이름을 검색하거나 <b>조를 눌러</b> 본인을 찾아보세요.</p>' +
      "</section>" +
      '<div class="search-wrap">' +
        '<input id="q" class="search-input" type="search" inputmode="search" ' +
        'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
        'placeholder="이름 검색 (예: 김첨융 · ㄱㅊㅇ)">' +
      "</div>" +
      '<div id="results" class="results"></div>' +
      buildBrowse();

    var input = root.querySelector("#q");
    var box = root.querySelector("#results");
    var grid = root.querySelector(".cluster-grid");
    var timer = null;

    function run() {
      var q = U.normalizeQuery(input.value);
      if (!q) { showBrowse(root, false); return; }
      showBrowse(root, true);
      renderResults(box, A.search.search(input.value));
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
    if (grid) {
      grid.addEventListener("click", function (e) {
        var btn = e.target.closest ? e.target.closest(".cluster-btn") : null;
        if (!btn) return;
        openCluster(root, btn.getAttribute("data-key"), true);
      });
    }

    showBrowse(root, false);
    if (lastOpenKey) { // 개인 페이지에서 돌아오면 마지막 조 복원
      var restore = lastOpenKey;
      lastOpenKey = null;
      openCluster(root, restore, false);
    }
    if (window.matchMedia && window.matchMedia("(min-width:560px)").matches) {
      input.focus();
    }
  };

  // 테스트용 내부 노출(무해)
  A.views._browse = { buildBrowse: buildBrowse, memberPanel: memberPanel };
})(window.App);
