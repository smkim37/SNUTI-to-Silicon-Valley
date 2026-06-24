window.App = window.App || {};
(function (A) {
  "use strict";

  function appEl() { return document.getElementById("app"); }

  function renderLoading() {
    appEl().innerHTML =
      '<div class="loading"><img src="./assets/action02.png" alt="">' +
      "<div>일정을 불러오는 중…</div></div>";
  }

  function renderError(err) {
    appEl().innerHTML =
      '<div class="state"><img src="./assets/action03.png" alt="">' +
      '<div class="big">일정을 불러오지 못했어요</div>' +
      "<div>잠시 후 새로고침해 주세요.<br><small>" +
      A.util.escapeHtml(err && err.message ? err.message : String(err)) +
      "</small></div></div>";
  }

  function parseHash() {
    var h = (location.hash || "").replace(/^#/, "");
    return h.split("/").filter(Boolean); // "#/p/12" -> ["p","12"]
  }

  function updateTitle(parts) {
    var base = "SNUTI to Silicon Valley";
    var t = base;
    if (parts[0] === "p") {
      var p = A.data.getPerson(parts[1]);
      if (p) t = p.name + " · " + base;
    } else if (parts[0] === "overview") {
      t = "전체 일정 · " + base;
    } else if (parts[0] === "g") {
      t = decodeURIComponent(parts[1] || "") + " · " + base;
    }
    document.title = t;
  }

  function dispatch() {
    var parts = parseHash();
    var root = appEl();
    var r0 = parts[0];
    if (!r0) A.views.home(root);
    else if (r0 === "p") A.views.person(root, parts[1]);
    else if (r0 === "g") A.views.disambig(root, decodeURIComponent(parts[1] || ""));
    else if (r0 === "overview") A.views.overview(root);
    else A.views.home(root);
    window.scrollTo(0, 0);
    updateTitle(parts);
  }

  var ready = false;
  function route() {
    if (!ready) {
      renderLoading();
      A.data.loadData().then(function () {
        ready = true;
        dispatch();
      }).catch(renderError);
      return;
    }
    dispatch();
  }

  window.addEventListener("hashchange", route);

  function init() { route(); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.App);
