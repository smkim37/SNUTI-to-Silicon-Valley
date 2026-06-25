window.App = window.App || {};
(function (A) {
  "use strict";

  var CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ",
             "ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  var CHO_SET = {};
  CHO.forEach(function (c) { CHO_SET[c] = true; });

  // 문자열 -> 초성 문자열 (한글 음절만 초성으로, 공백 제거)
  function toChosung(str) {
    var out = "";
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      var code = ch.charCodeAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) {
        out += CHO[Math.floor((code - 0xac00) / 588)];
      } else if (CHO_SET[ch]) {
        out += ch;
      } else if (/\s/.test(ch)) {
        /* skip */
      } else {
        out += ch.toLowerCase();
      }
    }
    return out;
  }

  // 질의가 전부 초성 자모로 이루어졌는지
  function isChosungQuery(q) {
    if (!q) return false;
    for (var i = 0; i < q.length; i++) {
      if (!CHO_SET[q[i]]) return false;
    }
    return true;
  }

  function normalizeQuery(q) {
    return (q || "").trim().replace(/\s+/g, "").toLowerCase();
  }

  function escapeHtml(s) {
    return (s == null ? "" : String(s)).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var _toastTimer = null;
  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    // force reflow then show
    void t.offsetWidth;
    t.classList.add("show");
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }

  // 기기 로컬 날짜를 데이터 포맷("M.D", 예: "6.25")으로 — 일자 카드의 d.date와 비교용
  function todayMD() {
    var t = new Date();
    return (t.getMonth() + 1) + "." + t.getDate();
  }

  A.util = {
    toChosung: toChosung,
    isChosungQuery: isChosungQuery,
    normalizeQuery: normalizeQuery,
    escapeHtml: escapeHtml,
    toast: toast,
    todayMD: todayMD
  };
})(window.App);
