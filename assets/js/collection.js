/* 컬렉션: 검색 · 필터 · 정렬 · 상세 보기(모달) */
(function () {
  const $ = s => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  const state = {
    q: params.get('q') || '',
    era: params.get('era') || '',
    type: params.get('type') || '',
    sort: params.get('sort') || 'year'
  };

  const norm = s => String(s).toLowerCase().replace(/\s+/g, '');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const haystack = it => norm([it.title, it.desc, it.type, it.date, it.year, it.source, it.holder, it.role, ERAS[it.era].label, ...(it.tags || [])].join(' '));
  ITEMS.forEach(it => (it._h = haystack(it)));

  // 검색어 강조 (공백 무시 없이 원문 그대로 일치하는 부분만)
  const highlighter = q => {
    const t = q.trim();
    if (!t) return s => esc(s);
    const re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return s => esc(s).replace(re, '<mark>$1</mark>');
  };

  // 필터 버튼 생성
  const eraBox = $('#f-era'), typeBox = $('#f-type');
  const pill = (group, value, label) => `<button class="pill" data-group="${group}" data-value="${value}" aria-pressed="false">${label}<span class="n"></span></button>`;
  eraBox.insertAdjacentHTML('beforeend', pill('era', '', '전체') + Object.entries(ERAS).map(([k, v]) => pill('era', k, `${v.label} <small>${v.range}</small>`)).join(''));
  typeBox.insertAdjacentHTML('beforeend', pill('type', '', '전체') + TYPES.map(t => pill('type', t, t)).join(''));

  const input = $('#cq'), sortSel = $('#sort'), grid = $('#grid');
  input.value = state.q; sortSel.value = state.sort;
  $('#hq').value = state.q;

  let current = [];

  function matches(it, s, ignore) {
    if (s.q && !norm(s.q).split(/[,]/).every(w => it._h.includes(w))) return false;
    if (ignore !== 'era' && s.era && it.era !== s.era) return false;
    if (ignore !== 'type' && s.type && it.type !== s.type) return false;
    return true;
  }

  function render() {
    current = ITEMS.filter(it => matches(it, state));
    const by = {
      year: (a, b) => a.year - b.year || a.title.localeCompare(b.title, 'ko'),
      'year-desc': (a, b) => b.year - a.year || a.title.localeCompare(b.title, 'ko'),
      title: (a, b) => a.title.localeCompare(b.title, 'ko')
    }[state.sort];
    current.sort(by);

    const hl = highlighter(state.q);
    grid.innerHTML = current.map(it => cardHTML(it, hl)).join('');
    observeReveal(grid);
    $('#count').textContent = current.length;
    $('#empty').hidden = current.length > 0;
    $('#cform').classList.toggle('has', !!state.q);

    // 버튼 상태 + 건수
    document.querySelectorAll('.pill').forEach(b => {
      const g = b.dataset.group, v = b.dataset.value;
      b.setAttribute('aria-pressed', state[g] === v);
      const n = ITEMS.filter(it => matches(it, state, g) && (!v || it[g] === v)).length;
      b.querySelector('.n').textContent = n;
    });

    // URL 동기화 (공유 가능한 검색 결과)
    const p = new URLSearchParams();
    ['q', 'era', 'type'].forEach(k => state[k] && p.set(k, state[k]));
    if (state.sort !== 'year') p.set('sort', state.sort);
    history.replaceState(null, '', (p.toString() ? '?' + p : location.pathname) + location.hash);
  }

  document.querySelectorAll('.pill').forEach(b => b.addEventListener('click', () => {
    state[b.dataset.group] = b.dataset.value; render();
  }));
  let t;
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { state.q = input.value; render(); }, 160); });
  $('#cform').addEventListener('submit', e => { e.preventDefault(); state.q = input.value; render(); });
  $('.c-search .clear').addEventListener('click', () => { input.value = state.q = ''; render(); input.focus(); });
  sortSel.addEventListener('change', () => { state.sort = sortSel.value; render(); });

  // 헤더 검색창도 페이지 이동 없이 바로 반영
  document.querySelector('.h-search').addEventListener('submit', e => {
    e.preventDefault(); state.q = input.value = $('#hq').value; render();
    document.body.classList.remove('nav-open');
  });

  /* ---------- 상세 모달 ---------- */
  const modal = $('#modal');
  let openId = null, lastFocus = null;

  function tableHTML(t, cap) {
    return `<table class="data-table">${cap ? `<caption>${esc(cap)}</caption>` : ''}<thead><tr>${t.head.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${t.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }

  function openItem(id) {
    const it = ITEMS.find(x => x.id === id);
    if (!it) return;
    openId = id;
    const era = ERAS[it.era];
    $('#m-media').innerHTML = it.img
      ? `<img src="${it.img}" alt="${esc(it.title)}">`
      : it.table ? tableHTML(it.table) : `<div class="m-name">${esc(it.title.split(' ')[0])}</div>`;
    $('#m-kicker').textContent = `${it.type} · ${era.en} · ${era.range}`;
    $('#m-title').textContent = it.title;
    $('#m-desc').textContent = it.desc;
    const rows = [
      ['DATE', it.date], ['ERA', `${era.label} (${era.range})`], ['TYPE', it.type],
      it.role && ['ROLE', it.role], it.source && ['SOURCE', it.source], it.holder && ['HOLDER', it.holder],
      ['CITATION', `『수원시의원으로 살다』 Ⅱ, ${it.page}`], ['ID', it.id]
    ].filter(Boolean);
    $('#m-meta').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('');
    $('#m-tags').innerHTML = (it.tags || []).map(tg => `<a href="?q=${encodeURIComponent(tg)}" data-tag="${esc(tg)}">#${esc(tg)}</a>`).join('');
    if (!modal.classList.contains('open')) lastFocus = document.activeElement;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    history.replaceState(null, '', location.search + '#' + id);
    modal.querySelector('.m-close').focus();
  }
  function closeItem() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    openId = null;
    history.replaceState(null, '', location.pathname + location.search);
    lastFocus && lastFocus.focus();
  }
  function step(d) {
    const list = current.length ? current : ITEMS;
    const i = list.findIndex(x => x.id === openId);
    openItem(list[(i + d + list.length) % list.length].id);
  }

  grid.addEventListener('click', e => {
    const c = e.target.closest('.card'); if (!c) return;
    e.preventDefault(); openItem(c.dataset.id);
  });
  modal.addEventListener('click', e => { if (e.target === modal) closeItem(); });
  $('.m-close').onclick = closeItem;
  $('#m-prev').onclick = () => step(-1);
  $('#m-next').onclick = () => step(1);
  $('#m-tags').addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    e.preventDefault(); closeItem();
    state.q = input.value = a.dataset.tag; state.era = state.type = ''; render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeItem();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  render();
  const fromHash = () => { if (location.hash.length > 1) openItem(decodeURIComponent(location.hash.slice(1))); };
  addEventListener('hashchange', fromHash);
  fromHash();
})();
