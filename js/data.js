window.App = window.App || {};
(function (A) {
  "use strict";

  var D = {
    loaded: false,
    people: [],
    meta: null,
    duplicates: {},
    overview: null,
    programByDate: {},
    dateLabel: {},
    byId: {}
  };

  function fetchJson(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " (" + r.status + ")");
      return r.json();
    });
  }

  D.loadData = function () {
    if (D.loaded) return Promise.resolve(D);
    return Promise.all([
      fetchJson("./data/people.json"),
      fetchJson("./data/overview.json")
    ]).then(function (res) {
      var pp = res[0], ov = res[1];
      D.people = pp.people || [];
      D.meta = pp.meta || {};
      D.duplicates = pp.duplicates || {};
      D.overview = ov;
      (D.meta.dates || []).forEach(function (d) { D.dateLabel[d.id] = d.label; });
      (ov.days || []).forEach(function (d) { D.programByDate[d.date] = d.program || []; });
      D.people.forEach(function (p) { D.byId[p.id] = p; });
      D.loaded = true;
      return D;
    });
  };

  D.getPerson = function (id) { return D.byId[Number(id)]; };

  // 조(클러스터) 목록: 학생 1~16조 → 교수님 → 조교 → 올바른. 1회 생성 후 캐시.
  var STAFF_ORDER = ["교수님", "조교", "올바른"];
  var STAFF_LABEL = { "교수님": "교수님", "조교": "운영조교", "올바른": "올바른네트웍스" };
  var STAFF_SHORT = { "교수님": "교수님", "조교": "운영조교", "올바른": "올바른" };

  D.getClusters = function () {
    if (D._clusters) return D._clusters;
    var map = {};
    D.people.forEach(function (p) {
      var k = String(p.group);
      (map[k] || (map[k] = [])).push(p);
    });
    var keys = Object.keys(map);
    var numeric = keys.filter(function (k) { return /^\d+$/.test(k); })
                      .sort(function (a, b) { return Number(a) - Number(b); });
    var staff = STAFF_ORDER.filter(function (k) { return map[k]; });
    var others = keys.filter(function (k) {
      return !/^\d+$/.test(k) && STAFF_ORDER.indexOf(k) < 0;
    });
    var ordered = numeric.concat(staff).concat(others);

    D._clusters = ordered.map(function (key) {
      var arr = map[key];
      var isNum = /^\d+$/.test(key);
      var members = arr.slice().sort(function (a, b) {
        return a.name.localeCompare(b.name, "ko");
      }).map(function (p) {
        return { id: p.id, name: p.name };
      });
      return {
        key: key,
        label: isNum ? (key + "조") : (STAFF_LABEL[key] || key),
        shortLabel: isNum ? (key + "조") : (STAFF_SHORT[key] || key),
        role: isNum ? "student" : (arr[0].role || "other"),
        count: members.length,
        members: members
      };
    });
    return D._clusters;
  };

  A.data = D;
})(window.App);
