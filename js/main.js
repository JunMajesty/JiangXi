
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  
  var staticMode = /[?&]static=1/.test(window.location.search);
  if (staticMode) root.classList.add("is-static");
  try {
    if (staticMode) window.__JX_static = true;
  } catch (e) {  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  
  var bar = $(".scroll-progress");
  var toTop = $(".to-top");
  var nav = $(".nav");
  var percent = $("[data-progress-text]");

  
  $$("[data-split]").forEach(function (el) {
    var text = el.getAttribute("data-split") || el.textContent;
    var frag = document.createDocumentFragment();
    Array.prototype.forEach.call(text, function (c, i) {
      var span = document.createElement("span");
      span.className = "ch";
      span.style.setProperty("--i", i);
      span.textContent = c === " " ? "\u00a0" : c;
      frag.appendChild(span);
    });
    el.textContent = "";
    el.appendChild(frag);
    el.classList.add("splt");
  });

  
  var revealables = $$("[data-reveal], .splt");
  if (!("IntersectionObserver" in window) || reduce) {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-target")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = (el.getAttribute("data-decimals") | 0);
    var dur = reduce ? 0 : 1500;
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var p = dur ? Math.min((ts - start) / dur, 1) : 1;
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(decimals);
      el.innerHTML = val + (suffix ? "<small>" + suffix + "</small>" : "");
      if (p < 1) raf(frame);
    }
    raf(frame);
  }

  var counters = $$("[data-target]");
  if (!("IntersectionObserver" in window) || reduce) {
    counters.forEach(countUp);
  } else {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countUp(e.target);
        cio.unobserve(e.target);
      });
    }, { threshold: 0.45 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  
  var sections = $$("[data-chapter]");
  var rulerItems = $$(".ruler__item");
  if (sections.length && rulerItems.length && "IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.getAttribute("data-chapter");
        rulerItems.forEach(function (it) {
          it.classList.toggle("is-active", it.getAttribute("data-jump") === id);
        });
      });
    }, { rootMargin: "-46% 0px -46% 0px", threshold: 0 });
    sections.forEach(function (s) { sio.observe(s); });
  }

  
  var parallaxItems = $$("[data-parallax]");
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    var h = root.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(y / h, 1) : 0;

    if (bar) bar.style.transform = "scaleX(" + p + ")";
    if (percent) percent.textContent = String(Math.round(p * 100)).padStart(3, "0");
    if (nav) nav.classList.toggle("is-stuck", y > 40);
    if (toTop) toTop.classList.toggle("is-show", y > 520);

    if (!reduce) {
      parallaxItems.forEach(function (el) {
        var box = el.getBoundingClientRect();
        var mid = box.top + box.height / 2 - window.innerHeight / 2;
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.12;
        el.style.transform = "translate3d(0," + (-mid * speed).toFixed(2) + "px,0)";
      });
    }
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    raf(onScroll);
  }, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  
  var yParam = /[?&]y=(\d+)/.exec(window.location.search);
  if (yParam) {
    var yTarget = parseInt(yParam[1], 10);
    root.classList.add("is-static");
    var jump = function () {
      window.scrollTo(0, yTarget);
      onScroll();
    };
    requestAnimationFrame(function () { requestAnimationFrame(jump); });
    window.addEventListener("load", jump);
  }
  if (/[?&]fullpage=1/.test(window.location.search)) {
    root.classList.add("is-static", "is-fullpage");
  }

  
  var toggle = $(".nav__toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$(".drawer a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  
  var deck = $(".opener__deck");
  if (deck) {
    var cards = $$(".opener__card", deck);
    var tabs = $$(".opener__tabs button", deck);
    var cur = 0;
    var timer = null;

    function show(i) {
      cur = (i + cards.length) % cards.length;
      cards.forEach(function (c, k) { c.classList.toggle("is-on", k === cur); });
      tabs.forEach(function (t, k) {
        t.classList.toggle("is-on", k === cur);
        t.setAttribute("aria-selected", k === cur ? "true" : "false");
      });
      if (window.__JX_setOpenerCaption) window.__JX_setOpenerCaption(cur);
    }
    function auto() {
      if (reduce) return;
      stop();
      
      timer = setInterval(function () { show(cur + 1); }, 1000);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { show(k); auto(); });
      t.addEventListener("mouseenter", function () { show(k); });
    });
    deck.addEventListener("mouseenter", stop);
    deck.addEventListener("mouseleave", auto);
    show(0);
    auto();
  }

  
  var ink = $(".ink-spot");
  var opener = $(".opener");
  if (ink && opener && !reduce && window.matchMedia("(hover: hover)").matches) {
    var mx = 0, my = 0, cx = 0, cy = 0, live = false;
    opener.addEventListener("mousemove", function (e) {
      var box = opener.getBoundingClientRect();
      mx = e.clientX - box.left;
      my = e.clientY - box.top;
      if (!live) { cx = mx; cy = my; live = true; loop(); }
    });
    function loop() {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      ink.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px) translate(-50%,-50%)";
      if (Math.abs(mx - cx) > 0.4 || Math.abs(my - cy) > 0.4) raf(loop);
      else live = false;
    }
  }

  
  var sealMark = $(".seal-play__mark");
  if (sealMark) {
    var sealWords = $$(".seal-play__words button");
    var sealTitle = $(".seal-play__title");
    var sealDesc = $(".seal-play__desc");
    sealWords.forEach(function (b) {
      b.addEventListener("click", function () {
        sealWords.forEach(function (x) { x.classList.remove("is-on"); });
        b.classList.add("is-on");
        var text = b.getAttribute("data-mark") || b.textContent;
        sealMark.textContent = text;
        
        sealMark.className = sealMark.className.replace(/\s*seal--txt\d/g, "");
        var n = Math.max(2, Math.min(4, text.length));
        sealMark.classList.add("seal--txt" + n);
        if (sealTitle) sealTitle.textContent = text + " · 赣鄱印记";
        if (sealDesc) sealDesc.textContent = b.getAttribute("data-desc") || "";
        sealMark.classList.remove("is-stamped");
        void sealMark.offsetWidth;
        sealMark.classList.add("is-stamped");
      });
    });
  }

  
  var reasonCards = $$("[data-reason]");
  var big = $("#reasonBig");
  var now = $("#reasonNow");
  var nowDesc = $("#reasonDesc");
  if (reasonCards.length && big && now) {
    var reasonTick = false;
    function reasonUpdate() {
      var focus = window.innerHeight * 0.42;
      var best = null;
      var bestD = Infinity;
      reasonCards.forEach(function (card) {
        var box = card.getBoundingClientRect();
        var d = Math.abs((box.top + box.height / 2) - focus);
        if (d < bestD) { bestD = d; best = card; }
      });
      if (!best) { reasonTick = false; return; }
      var no = best.getAttribute("data-reason");
      if (big.textContent !== no) big.textContent = no;
      var t = best.getAttribute("data-title");
      if (now.textContent !== t) {
        now.textContent = t;
        nowDesc.textContent = best.getAttribute("data-desc");
      }
      reasonCards.forEach(function (c) {
        c.classList.toggle("is-current", c === best);
      });
      reasonTick = false;
    }
    window.addEventListener("scroll", function () {
      if (reasonTick) return;
      reasonTick = true;
      raf(reasonUpdate);
    }, { passive: true });
    reasonUpdate();
  }

  
  $$("img").forEach(function (img) {
    img.addEventListener("error", function () {
      img.style.opacity = "0";
      var holder = img.parentElement;
      if (holder) holder.style.background = "linear-gradient(150deg,#1d3a31,#2f5d7c)";
    });
  });

  
  var form = $("#msgForm");
  var tip = $("#formTip");
  var wall = $("#msgWall");
  var wallCount = $("#wallCount");
  var KEY = "jx_scroll_messages_v1";

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 24))); } catch (e) {  }
  }

  function render() {
    if (!wall) return;
    var list = load();
    if (wallCount) wallCount.textContent = String(list.length).padStart(2, "0") + " 则";
    if (!list.length) {
      wall.innerHTML = '<div class="note note--empty">长卷初展，还没有人留下笔墨。写下你与江西的一句话，它会盖上一枚朱印。</div>';
      return;
    }
    wall.innerHTML = list.slice(0, 8).map(function (m, i) {
      var stamp = String((m.name || "客").slice(0, 1));
      return '<article class="note" style="animation-delay:' + (i * 60) + 'ms">' +
        '<span class="seal note__mark" aria-hidden="true">' + escapeHtml(stamp) + "</span>" +
        '<h4 class="note__name">' + escapeHtml(m.name) + "</h4>" +
        '<p class="note__text">' + escapeHtml(m.text) + "</p>" +
        "</article>";
    }).join("");
  }

  if (form) {
    var fName = $("#name");
    var fEmail = $("#email");
    var fMsg = $("#msgText");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = fName.value.trim();
      var email = fEmail.value.trim();
      var text = fMsg.value.trim();
      if (!name || !text) {
        tip.textContent = "请先写下昵称与想说的话。";
        tip.classList.remove("is-ok");
        return;
      }
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        tip.textContent = "邮箱格式似乎不太对。";
        tip.classList.remove("is-ok");
        return;
      }
      var list = load();
      list.unshift({ name: name, email: email, text: text, at: Date.now() });
      save(list);
      form.reset();
      tip.textContent = "已收下你的留言，朱印已盖。";
      tip.classList.add("is-ok");
      render();
    });
    render();
  }

  
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - 78;
      window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });
})();
