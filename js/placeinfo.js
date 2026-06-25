window.App = window.App || {};
(function (A) {
  "use strict";
  var esc = A.util.escapeHtml;
  var overlay = null;

  function ensure() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "pi-overlay";
    overlay.innerHTML =
      '<div class="pi-sheet" role="dialog" aria-modal="true" aria-labelledby="pi-title">' +
        '<div class="pi-grip"></div>' +
        '<button type="button" class="pi-close" aria-label="닫기">✕</button>' +
        '<div class="pi-type"></div>' +
        '<h2 class="pi-title" id="pi-title"></h2>' +
        '<p class="pi-intro"></p>' +
        '<div class="pi-video"></div>' +
      "</div>";
    document.body.appendChild(overlay);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || (e.target.closest && e.target.closest(".pi-close"))) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("show")) close();
    });
  }

  function videoHtml(p) {
    if (p.yt) {
      var src = "https://www.youtube-nocookie.com/embed/" + p.yt + "?rel=0";
      return '<div class="pi-frame"><iframe src="' + src + '" title="홍보 영상" ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
        'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe></div>';
    }
    var url = "https://www.youtube.com/results?search_query=" + encodeURIComponent(p.q || p.name || "");
    return '<a class="pi-yt-link" href="' + esc(url) + '" target="_blank" rel="noopener">' +
      '<span class="pi-yt-ico">▶</span> YouTube에서 홍보 영상 보기</a>';
  }

  function open(key) {
    var p = (A.places || {})[key];
    if (!p) return;
    ensure();
    overlay.querySelector(".pi-type").textContent = p.type === "school" ? "학교" : "기업";
    overlay.querySelector(".pi-title").textContent = p.name || key;
    overlay.querySelector(".pi-intro").textContent = p.intro || "";
    overlay.querySelector(".pi-video").innerHTML = videoHtml(p);
    document.body.classList.add("pi-lock");
    void overlay.offsetWidth;            // reflow → 트랜지션
    overlay.classList.add("show");
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove("show");
    overlay.querySelector(".pi-video").innerHTML = "";   // iframe 제거 → 재생 정지
    document.body.classList.remove("pi-lock");
  }

  // 위임 클릭 핸들러(한 번만 등록): 돋보기 버튼 → 모달
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".info-btn[data-place]") : null;
    if (!btn) return;
    e.preventDefault();
    open(btn.getAttribute("data-place"));
  });
})(window.App);
