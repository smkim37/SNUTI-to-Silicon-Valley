window.App = window.App || {};
(function (A) {
  "use strict";
  var U = A.util;

  function scoreMatch(p, q, chosungQuery) {
    var name = (p.name || "").replace(/\s/g, "").toLowerCase();
    var alias = (p.alias || "").replace(/\s/g, "").toLowerCase();
    var group = (p.groupLabel || "").replace(/\s/g, "").toLowerCase();
    var s = 0;

    if (name === q) s = Math.max(s, 100);
    else if (name.indexOf(q) === 0) s = Math.max(s, 82);
    else if (name.indexOf(q) > 0) s = Math.max(s, 62);

    if (chosungQuery) {
      var ch = U.toChosung(p.name);
      if (ch.indexOf(q) === 0) s = Math.max(s, 58);
      else if (ch.indexOf(q) > 0) s = Math.max(s, 42);
    }

    if (alias) {
      if (alias === q) s = Math.max(s, 72);
      else if (alias.indexOf(q) >= 0) s = Math.max(s, 48);
    }

    if (group && group.indexOf(q) >= 0) s = Math.max(s, 20);

    return s;
  }

  // 결과: [{type:'person', person} | {type:'group', name, ids}]
  function search(query) {
    var q = U.normalizeQuery(query);
    if (!q) return [];
    var chosungQuery = U.isChosungQuery(q);
    var people = A.data.people;
    var dups = A.data.duplicates;

    var scored = [];
    for (var i = 0; i < people.length; i++) {
      var sc = scoreMatch(people[i], q, chosungQuery);
      if (sc > 0) scored.push({ p: people[i], s: sc });
    }
    scored.sort(function (a, b) {
      return b.s - a.s || (a.p.id - b.p.id);
    });

    var out = [];
    var seenGroup = {};
    for (var j = 0; j < scored.length; j++) {
      var p = scored[j].p;
      if (p.isDuplicate) {
        if (!seenGroup[p.name]) {
          seenGroup[p.name] = true;
          out.push({ type: "group", name: p.name, ids: dups[p.name] || [p.id] });
        }
      } else {
        out.push({ type: "person", person: p });
      }
    }
    return out;
  }

  A.search = { search: search };
})(window.App);
