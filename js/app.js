/* =====================================================
   听音拼句 · 句乐部式逐词打字引擎
   句子拆成词槽 → 逐词输入 → 空格确认 → 字母级即时校验
   打错红字提示 / 抖动 / 3次错误自动揭晓 / 连击评级
===================================================== */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const els = {
    voiceSelect: $("voiceSelect"), rateSelect: $("rateSelect"),
    statTotal: $("statTotal"), statAccuracy: $("statAccuracy"),
    statStreak: $("statStreak"), statBest: $("statBest"), resetStats: $("resetStats"),
    modeTabs: document.querySelectorAll(".mode-tab"),
    btnPlay: $("btnPlay"), btnSlow: $("btnSlow"),
    playerTitle: $("playerTitle"), playerSub: $("playerSub"), playCount: $("playCount"),
    comboNum: $("comboNum"), comboRating: $("comboRating"),
    slotsBoard: $("slotsBoard"), slots: $("slots"), zhHint: $("zhHint"),
    result: $("result"), resBadge: $("resBadge"), resDetail: $("resDetail"),
    resWords: $("resWords"), resZh: $("resZh"), btnRetry: $("btnRetry"), btnNext: $("btnNext"),
    btnHint: $("btnHint"), btnReveal: $("btnReveal"), btnReview: $("btnReview"),
    sentenceSettings: $("sentenceSettings"), wordSettings: $("wordSettings"),
    levelChips: $("levelChips"), categoryChips: $("categoryChips"), orderChips: $("orderChips"),
    lenChips: $("lenChips"), wordBankInfo: $("wordBankInfo"),
    toggleWordTTS: $("toggleWordTTS"), toggleAutoNext: $("toggleAutoNext"),
    pgDone: $("pgDone"), pgIndex: $("pgIndex"), pgMastered: $("pgMastered"),
    pgTotal: $("pgTotal"), masteredFill: $("masteredFill"),
  };

  /* ---------- 存储 ---------- */
  function load(k, def) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  const stats = load("ls_stats", { total: 0, correct: 0, streak: 0, best: 0 });
  const mastered = new Set(load("ls_mastered", []));
  const opts = Object.assign({ wordTTS: true, autoNext: false }, load("ls_opts", {}));

  /* ---------- 状态 ---------- */
  const state = {
    mode: "sentence", level: "all", cat: "all", order: "random", wordLen: "all",
    pool: [], seqPos: 0, words: [],
    item: null, slotsData: [], cur: 0, finished: true,
    combo: 0, maxCombo: 0, startTime: 0, playTimes: 0,
    sessionDone: 0,
  };

  /* ================= TTS ================= */
  const synth = window.speechSynthesis;
  let voices = [];
  function refreshVoices() {
    voices = (synth.getVoices() || []).filter((v) => /^en(-|_)?/i.test(v.lang));
    const cur = els.voiceSelect.value;
    els.voiceSelect.innerHTML = '<option value="">默认英文发音</option>' +
      voices.map((v, i) => `<option value="${i}">${v.name} (${v.lang})</option>`).join("");
    if (cur) els.voiceSelect.value = cur;
  }
  if (synth) { refreshVoices(); synth.onvoiceschanged = refreshVoices; }

  function speak(text, rateOverride) {
    if (!synth) { toast("当前浏览器不支持语音合成，请使用 Chrome / Edge"); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = rateOverride || parseFloat(els.rateSelect.value) || 1;
    const vi = parseInt(els.voiceSelect.value, 10);
    if (!isNaN(vi) && voices[vi]) u.voice = voices[vi];
    u.onstart = () => els.btnPlay.classList.add("speaking");
    u.onend = u.onerror = () => els.btnPlay.classList.remove("speaking");
    synth.speak(u);
  }
  function playItem(slow) {
    if (!state.item) return;
    state.playTimes++;
    els.playCount.textContent = `播放 ${state.playTimes} 次`;
    speak(state.item.text, slow ? 0.55 : undefined);
  }

  /* ================= 归一化 ================= */
  const normWord = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* ================= 出题 ================= */
  function buildPool() {
    if (state.mode === "sentence") {
      state.pool = SENTENCE_LIB.filter((s) =>
        (state.level === "all" || s.level === +state.level) &&
        (state.cat === "all" || s.cat === state.cat));
      state.seqPos = 0;
    } else {
      state.pool = state.words
        .filter((w) => {
          const len = normWord(w).length;
          if (state.wordLen === "short") return len <= 5;
          if (state.wordLen === "mid") return len >= 6 && len <= 9;
          if (state.wordLen === "long") return len >= 10;
          return true;
        })
        .map((w) => ({ text: w, zh: "", level: 0, cat: "单词" }));
    }
    els.pgTotal.textContent = state.pool.length;
    renderProgress();
  }

  function next() {
    if (!state.pool.length) { toast("当前筛选条件下没有题目，请在右侧调整设置"); return; }
    let item;
    if (state.order === "seq" && state.mode === "sentence") {
      item = state.pool[state.seqPos % state.pool.length]; state.seqPos++;
    } else {
      item = state.pool[Math.floor(Math.random() * state.pool.length)];
    }
    state.item = item;
    state.playTimes = 0;
    startItem();
  }

  function startItem() {
    const words = state.item.text.trim().split(/\s+/).map(normWord).filter((w) => w.length > 0);
    state.slotsData = words.map((t) => ({
      target: t, typed: [], mistakes: false, attempts: 0, revealed: false, done: false, ok: false,
    }));
    state.cur = 0;
    state.finished = false;
    state.combo = 0; state.maxCombo = 0; state.startTime = 0;
    els.result.classList.add("hidden");
    els.zhHint.classList.add("hidden");
    els.playCount.textContent = "播放 0 次";
    renderSlots();
    updateCombo();
    updateSub();
    els.pgIndex.textContent = state.sessionDone + 1;
    setTimeout(() => playItem(), 300);
  }

  /* ================= 词槽渲染 ================= */
  function renderSlots() {
    els.slotsBoard.classList.remove("finished-ok", "finished-bad");
    els.slotsBoard.classList.add("active");
    els.slots.innerHTML = state.slotsData.map((w, i) =>
      `<div class="slot" data-i="${i}">${w.target.split("").map(() => `<span class="sl">_</span>`).join("")}<span class="slot-mark"></span></div>`
    ).join("");
    markActive();
  }

  function slotEl(i) { return els.slots.querySelector(`.slot[data-i="${i}"]`); }

  function markActive() {
    els.slots.querySelectorAll(".slot").forEach((el) => el.classList.remove("active"));
    const el = slotEl(state.cur);
    if (el && !state.finished) el.classList.add("active");
  }

  function updateSlot(i) {
    const w = state.slotsData[i], el = slotEl(i);
    if (!el) return;
    el.querySelectorAll(".sl").forEach((span, j) => {
      span.className = "sl";
      if (j < w.typed.length) {
        span.textContent = w.typed[j];
        if (w.typed[j] !== w.target[j]) span.classList.add("bad");
        else span.classList.add("typed");
      } else if (w.revealed) {
        span.textContent = w.target[j];
      } else {
        span.textContent = "_";
      }
    });
  }

  function updateSub() {
    const total = state.slotsData.length;
    els.playerSub.textContent = state.finished
      ? "按 Enter 或点击「下一句」继续"
      : `第 ${state.cur + 1} / ${total} 词 · 打完按【空格】确认`;
    els.playerTitle.textContent = state.mode === "sentence"
      ? "🔊 听句子发音，逐词拼出来"
      : "🔊 听单词发音，拼出来";
  }

  /* ================= 打字引擎 ================= */
  function currentWord() { return state.slotsData[state.cur]; }

  function typeChar(ch) {
    if (state.finished) return;
    const w = currentWord(); if (!w) return;
    if (w.typed.length >= w.target.length) return;           // 打满了，等空格确认
    w.typed.push(ch);
    if (ch !== w.target[w.typed.length - 1]) w.mistakes = true; // 立即发现错误
    if (!state.startTime) state.startTime = Date.now();
    updateSlot(state.cur);
  }

  function delChar() {
    if (state.finished) return;
    const w = currentWord(); if (!w) return;
    w.typed.pop();
    updateSlot(state.cur);
  }

  function commitWord() {
    if (state.finished) return;
    const w = currentWord(); if (!w || w.typed.length === 0) return;
    const i = state.cur, el = slotEl(i);
    const allCorrect = w.typed.length === w.target.length &&
      w.typed.every((c, j) => c === w.target[j]);

    if (allCorrect) {
      w.done = true; w.ok = true;
      el.classList.remove("active"); el.classList.add("done-ok");
      el.querySelector(".slot-mark").textContent = "✓";
      // 连击：零失误才累计
      if (!w.mistakes && w.attempts === 0) {
        state.combo++; state.maxCombo = Math.max(state.maxCombo, state.combo);
        flashRating(state.combo >= 5 ? `🔥 ${state.combo} 连击!` : "Perfect!");
      } else {
        state.combo = 0;
      }
      updateCombo(true);
      if (opts.wordTTS) speak(w.target, 0.95);
      advance();
    } else {
      w.attempts++;
      w.typed = [];
      state.combo = 0; updateCombo();
      el.classList.add("shake");
      setTimeout(() => { el.classList.remove("shake"); updateSlot(i); }, 400);
      if (w.attempts >= 3) revealWord();
    }
  }

  function revealWord() {
    if (state.finished) return;
    const w = currentWord(); if (!w) return;
    const i = state.cur, el = slotEl(i);
    w.done = true; w.revealed = true; w.ok = false; w.mistakes = true;
    w.typed = w.target.split("");
    el.classList.remove("active"); el.classList.add("revealed", "done-bad");
    el.querySelector(".slot-mark").textContent = "✗";
    updateSlot(i);
    speak(w.target, 0.8);
    advance();
  }

  function advance() {
    if (state.cur >= state.slotsData.length - 1) { finishSentence(); return; }
    state.cur++;
    markActive(); updateSub();
  }

  /* ================= 完成 ================= */
  function finishSentence() {
    state.finished = true;
    markActive();
    els.slotsBoard.classList.remove("active");
    const total = state.slotsData.length;
    const perfect = state.slotsData.filter((w) => w.ok && !w.mistakes && w.attempts === 0).length;
    const revealedN = state.slotsData.filter((w) => w.revealed).length;
    const allCorrect = revealedN === 0;
    const secs = state.startTime ? Math.max(1, Math.round((Date.now() - state.startTime) / 1000)) : 0;

    const pct = Math.round((perfect / total) * 100);
    let badge, cls;
    if (pct === 100) { badge = "Perfect! 🎉"; cls = "ok"; }
    else if (pct >= 80) { badge = "Great! 👍"; cls = "mid"; }
    else if (pct >= 60) { badge = "Good 🙂"; cls = "mid"; }
    else { badge = "再接再厉 💪"; cls = "bad"; }

    els.result.classList.remove("hidden", "ok", "mid", "bad");
    els.result.classList.add(cls);
    els.resBadge.textContent = badge;
    els.resDetail.textContent = `${perfect}/${total} 词零失误 · 通过率 ${allCorrect ? "100%" : "未全对"} · 用时 ${secs}s · 最高连击 ${state.maxCombo}`;
    els.resWords.innerHTML = state.slotsData.map((w, i) => {
      const raw = state.item.text.trim().split(/\s+/).filter((x) => normWord(x).length)[i];
      const c = w.revealed ? "revealed" : (w.ok && !w.mistakes && w.attempts === 0) ? "perfect" : "fixed";
      return `<span class="res-word ${c}" style="animation-delay:${i * 0.06}s">${esc(raw || w.target)}</span>`;
    }).join("");
    els.resZh.textContent = state.item.zh ? `译文：${state.item.zh}` : "";
    els.slotsBoard.classList.add(allCorrect ? "finished-ok" : "finished-bad");
    updateSub();

    // 统计
    stats.total++;
    if (allCorrect) { stats.correct++; stats.streak++; stats.best = Math.max(stats.best, stats.streak); }
    else stats.streak = 0;
    if (pct === 100) { mastered.add(state.item.text); save("ls_mastered", [...mastered]); }
    save("ls_stats", stats);
    state.sessionDone++;
    renderStats(); renderProgress();

    setTimeout(() => speak(state.item.text, 0.9), 500);
    if (opts.autoNext) setTimeout(() => { if (state.finished) next(); }, 4000);
  }

  /* ================= 连击 UI ================= */
  function updateCombo(bump) {
    els.comboNum.textContent = `×${state.combo}`;
    els.comboNum.classList.toggle("hot", state.combo >= 5);
    if (bump) {
      els.comboNum.classList.remove("bump");
      void els.comboNum.offsetWidth;
      els.comboNum.classList.add("bump");
    }
  }
  let ratingTimer;
  function flashRating(text) {
    els.comboRating.textContent = text;
    els.comboRating.classList.remove("hidden");
    els.comboRating.style.animation = "none";
    void els.comboRating.offsetWidth;
    els.comboRating.style.animation = "";
    clearTimeout(ratingTimer);
    ratingTimer = setTimeout(() => els.comboRating.classList.add("hidden"), 1100);
  }

  /* ================= 渲染统计 ================= */
  function renderStats() {
    els.statTotal.textContent = stats.total;
    els.statAccuracy.textContent = stats.total ? Math.round((stats.correct / stats.total) * 100) + "%" : "--";
    els.statStreak.textContent = stats.streak;
    els.statBest.textContent = stats.best;
  }
  function renderProgress() {
    els.pgDone.textContent = state.sessionDone;
    const total = state.pool.length || 1;
    const m = [...mastered].filter((t) => state.pool.some((p) => p.text === t)).length;
    els.pgMastered.textContent = m;
    els.masteredFill.style.width = Math.round((m / total) * 100) + "%";
  }

  let toastTimer;
  function toast(msg, dur) {
    document.querySelectorAll(".toast").forEach((t) => t.remove());
    const el = document.createElement("div");
    el.className = "toast"; el.textContent = msg;
    document.body.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), dur || 2000);
  }

  /* ================= 提示 / 跳过 ================= */
  function showHint() {
    if (!state.item || state.finished) return;
    const w = currentWord();
    if (state.item.zh && els.zhHint.classList.contains("hidden")) {
      els.zhHint.textContent = `🇨🇳 ${state.item.zh}`;
      els.zhHint.classList.remove("hidden");
    }
    if (w) toast(`💡 第 ${state.cur + 1} 词共 ${w.target.length} 个字母，开头是 "${w.target[0].toUpperCase()}"`, 2600);
  }

  /* ================= 键盘 ================= */
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "select" || tag === "input") return;

    if (e.key === "Tab") { e.preventDefault(); playItem(); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      if (state.finished) next();
      return;
    }
    if (state.finished) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === " ") { e.preventDefault(); commitWord(); return; }
    if (e.key === "Backspace") { e.preventDefault(); delChar(); return; }
    if (/^[a-zA-Z0-9]$/.test(e.key)) { e.preventDefault(); typeChar(e.key.toLowerCase()); }
  });

  /* ================= 单词库加载 ================= */
  fetch("data/words.txt")
    .then((r) => r.text())
    .then((t) => {
      state.words = t.split(/\r?\n/).map((w) => w.trim()).filter((w) => /^[a-zA-Z]{2,}$/.test(w));
      els.wordBankInfo.textContent = `已加载 ${state.words.length} 个单词（本地 3500 词库）`;
    })
    .catch(() => { els.wordBankInfo.textContent = "词库加载失败，单词模式不可用"; });

  /* ================= 事件绑定 ================= */
  els.btnPlay.addEventListener("click", () => playItem());
  els.btnSlow.addEventListener("click", () => playItem(true));
  els.btnReview.addEventListener("click", () => { if (state.item) speak(state.item.text, 0.85); });
  els.btnNext.addEventListener("click", next);
  els.btnRetry.addEventListener("click", () => { if (state.item) { stats.streak = 0; save("ls_stats", stats); renderStats(); startItem(); } });
  els.btnReveal.addEventListener("click", revealWord);
  els.btnHint.addEventListener("click", showHint);

  els.modeTabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      els.modeTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      state.mode = tab.dataset.mode;
      els.sentenceSettings.classList.toggle("hidden", state.mode !== "sentence");
      els.wordSettings.classList.toggle("hidden", state.mode !== "word");
      buildPool(); next();
    }));

  function bindChips(container, key, after) {
    container.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip"); if (!chip) return;
      container.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      state[key] = chip.dataset[Object.keys(chip.dataset)[0]];
      if (after) after();
    });
  }
  bindChips(els.levelChips, "level", () => { buildPool(); next(); });
  bindChips(els.orderChips, "order", () => { buildPool(); next(); });
  bindChips(els.lenChips, "wordLen", () => { buildPool(); next(); });
  bindChips(els.categoryChips, "cat", () => { buildPool(); next(); });

  const cats = [...new Set(SENTENCE_LIB.map((s) => s.cat))];
  els.categoryChips.innerHTML =
    '<button class="chip active" data-cat="all">全部</button>' +
    cats.map((c) => `<button class="chip" data-cat="${c}">${c}</button>`).join("");

  // 选项开关
  function syncOptChips() {
    els.toggleWordTTS.classList.toggle("active", opts.wordTTS);
    els.toggleAutoNext.classList.toggle("active", opts.autoNext);
  }
  els.toggleWordTTS.addEventListener("click", () => { opts.wordTTS = !opts.wordTTS; save("ls_opts", opts); syncOptChips(); });
  els.toggleAutoNext.addEventListener("click", () => { opts.autoNext = !opts.autoNext; save("ls_opts", opts); syncOptChips(); });
  syncOptChips();

  els.resetStats.addEventListener("click", () => {
    if (!confirm("确定清空所有练习统计与掌握记录吗？")) return;
    Object.assign(stats, { total: 0, correct: 0, streak: 0, best: 0 });
    mastered.clear();
    save("ls_stats", stats); save("ls_mastered", []);
    renderStats(); renderProgress(); toast("统计已重置");
  });

  /* ================= 启动 ================= */
  renderStats();
  buildPool();
  next();
})();
