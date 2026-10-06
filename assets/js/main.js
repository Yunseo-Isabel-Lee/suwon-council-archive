/* 공통 동작: 모바일 메뉴, 히어로 슬라이드, 카드 렌더, 스크롤 표시 */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // 모바일 메뉴
  const menuBtn = $('.menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const hb = document.querySelector('.site-header').getBoundingClientRect().bottom;
      document.documentElement.style.setProperty('--menu-top', hb + 'px');
      const open = document.body.classList.toggle('nav-open');
      menuBtn.setAttribute('aria-expanded', open);
    });
  }

  // 푸터 연도
  $$('[data-this-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  // 스크롤 등장 효과
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 })
    : null;
  window.observeReveal = root => $$('.reveal', root || document).forEach(el => io ? io.observe(el) : el.classList.add('in'));
  observeReveal();

  // 히어로 슬라이드
  const slides = $$('.hero-slide');
  if (slides.length) {
    const cap = $('.hero-caption'), cur = $('.pager .cur'), bar = $('.pager .bar i');
    let i = 0, timer;
    const show = n => {
      slides[i].classList.remove('on');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('on');
      cap.innerHTML = `<b>${slides[i].dataset.year}</b>${slides[i].dataset.caption}`;
      cur.textContent = String(i + 1).padStart(2, '0');
      bar.classList.remove('run'); void bar.offsetWidth; bar.classList.add('run');
      clearTimeout(timer); timer = setTimeout(() => show(i + 1), 7000);
    };
    $('.pager .prev').onclick = () => show(i - 1);
    $('.pager .next').onclick = () => show(i + 1);
    show(0);
  }

  // 카드 마크업 (index · collection 공용)
  window.cardHTML = (it, hl = s => s) => {
    const era = ERAS[it.era];
    let media;
    if (it.img) {
      media = `<div class="ph"><img src="${it.img}" alt="" loading="lazy"><span class="badge">${it.type}</span><span class="yr">${(it.date.match(/^\d{4}/) || [it.date])[0]}</span></div>`;
    } else if (it.type === '인물') {
      media = `<div class="ph txt"><span class="kicker">PERSON · ${era.en}</span><div><div class="nm">${hl(it.title.split(' ')[0])}</div><div class="rl">${hl(it.role)}</div></div></div>`;
    } else {
      media = `<div class="ph txt table"><span class="kicker">TABLE · ${it.year}</span><div class="mini">${'<i></i>'.repeat(24)}</div></div>`;
    }
    return `<a class="card reveal" href="collection.html#${it.id}" data-id="${it.id}">${media}
      <h3>${hl(it.title)}</h3><p>${era.label} · ${it.date}</p></a>`;
  };

  // 메인 주요 자료
  const featured = $('#featured');
  if (featured && typeof ITEMS !== 'undefined') {
    featured.innerHTML = ITEMS.filter(it => it.featured).slice(0, 8).map(it => cardHTML(it)).join('');
    observeReveal(featured);
  }
})();
