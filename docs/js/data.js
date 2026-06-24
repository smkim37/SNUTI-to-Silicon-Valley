window.App = window.App || {};
(function (A) {
  "use strict";

  var D = {
    loaded: false,
    people: [],
    meta: null,
    duplicates: {},
    overview: null,
    commonByDate: {},
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
      (ov.days || []).forEach(function (d) { D.commonByDate[d.date] = d.common || []; });
      D.people.forEach(function (p) { D.byId[p.id] = p; });
      D.loaded = true;
      return D;
    });
  };

  D.getPerson = function (id) { return D.byId[Number(id)]; };

  A.data = D;
})(window.App);
