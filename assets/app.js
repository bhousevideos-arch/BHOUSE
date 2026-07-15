/* ============ AUTO-DESCUBRIMIENTO DE FOTOS POR NOMBRE DE ARCHIVO ============
   Subís una foto a img/ con el nombre y número correctos (ej. foto-9.jpg) y
   aparece sola en el sitio, sin tocar config.js ni ningún código.
   ⚠️ Esto SOLO funciona en el sitio ya publicado (GitHub Pages) — al abrir el
   archivo local con doble clic (file:///...) el navegador bloquea este chequeo,
   igual que pasa con los videos de YouTube (ver README).
*/
function fileExists(url) {
  return fetch(url, { method: 'HEAD' })
    .then(res => (res.ok ? url : null))
    .catch(() => null);
}
function discoverPhotos(prefix, folder, exts, max) {
  const checks = [];
  for (let i = 1; i <= max; i++) {
    let attempt = Promise.resolve(null);
    exts.forEach(ext => {
      attempt = attempt.then(found => found || fileExists(`${folder}/${prefix}${i}.${ext}`));
    });
    checks.push(attempt.then(url => (url ? { index: i, img: url } : null)));
  }
  return Promise.all(checks).then(results => results.filter(Boolean));
}

/* ============ LOADER ============ */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) setTimeout(() => loader.classList.add('hide'), 400);
});
// Safety net: force-hide the loader even if window 'load' never fires (e.g. a blocked CDN resource)
setTimeout(() => {
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('hide');
}, 2500);

/* ============ NAV SCROLL STATE ============ */
const nav = document.getElementById('siteNav');
const toTopBtn = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  if (nav) { if (window.scrollY > 40) nav.classList.add('glass'); else nav.classList.remove('glass'); }
  if (toTopBtn) {
    if (window.scrollY > 600) toTopBtn.classList.remove('opacity-0','pointer-events-none');
    else toTopBtn.classList.add('opacity-0','pointer-events-none');
  }
});
if (toTopBtn) toTopBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

/* ============ MOBILE MENU ============ */
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    menuBtn.setAttribute('aria-expanded', menuOpen);
    const l1 = document.getElementById('l1'), l2 = document.getElementById('l2'), l3 = document.getElementById('l3');
    if (menuOpen) {
      mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
      if (l1) l1.style.transform = 'translateY(6px) rotate(45deg)';
      if (l2) l2.style.opacity = '0';
      if (l3) l3.style.transform = 'translateY(-6px) rotate(-45deg)';
    } else {
      mobileMenu.style.maxHeight = '0px';
      if (l1) l1.style.transform = '';
      if (l2) l2.style.opacity = '1';
      if (l3) l3.style.transform = '';
    }
  });
  document.querySelectorAll('#mobileMenu a').forEach(a => a.addEventListener('click', () => menuBtn.click()));
}

/* ============ REVEAL ON SCROLL ============ */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, {threshold:0.15});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ============ COUNTERS ============ */
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target, target = +el.dataset.target;
      let cur = 0; const step = Math.max(1, Math.round(target/50));
      const t = setInterval(() => { cur += step; if (cur >= target) { cur = target; clearInterval(t); } el.textContent = cur; }, 25);
      counterIO.unobserve(el);
    }
  });
}, {threshold:0.5});
document.querySelectorAll('.counter').forEach(c => counterIO.observe(c));

/* ============ SERVICES (servicios.html) ============ */
const servicesGrid = document.getElementById('servicesGrid');
if (servicesGrid && typeof CONFIG !== 'undefined') {
  CONFIG.services.forEach(s => {
    const div = document.createElement('div');
    div.className = 'reveal card-hover bg-ink p-8 border border-transparent cursor-pointer group';
    div.innerHTML = `<div class="text-3xl mb-5">${s.icon}</div><h3 class="fx-serif text-xl uppercase mb-2">${s.title}</h3><p class="text-bone/50 text-sm leading-relaxed mb-4">${s.desc}</p><span class="font-mono text-[10px] uppercase tracking-widest text-bone/30 group-hover:text-bone/60 transition-colors">Armar pedido →</span>`;
    div.addEventListener('click', () => openServiceWizard(s));
    servicesGrid.appendChild(div);
  });
  setTimeout(() => document.querySelectorAll('#servicesGrid .reveal').forEach(el => io.observe(el)), 50);
}

/* ============ PARA EMPRESAS (para-empresas.html) ============ */
const businessMissionGrid = document.getElementById('businessMissionGrid');
if (businessMissionGrid && typeof CONFIG !== 'undefined' && CONFIG.businessMission) {
  CONFIG.businessMission.forEach(m => {
    const div = document.createElement('div');
    div.className = 'reveal bg-ink p-8';
    div.innerHTML = `<div class="text-3xl mb-5">${m.icon}</div><h3 class="fx-serif text-xl uppercase mb-2">${m.title}</h3><p class="text-bone/50 text-sm leading-relaxed">${m.desc}</p>`;
    businessMissionGrid.appendChild(div);
  });
  setTimeout(() => document.querySelectorAll('#businessMissionGrid .reveal').forEach(el => io.observe(el)), 50);
}

// Portafolio de negocios: auto-descubre img/foto-1.jpg, foto-2.jpg... (hasta 40) — no hace falta editar config.js
const businessPortfolioGrid = document.getElementById('businessPortfolioGrid');
if (businessPortfolioGrid) {
  discoverPhotos('foto-', 'img', ['jpg', 'jpeg'], 40).then(found => {
    if (!found.length) {
      businessPortfolioGrid.innerHTML = `<p class="col-span-full text-bone/40 text-sm font-mono">Todavía no hay fotos. Subí archivos a <code>img/</code> con el nombre <code>foto-1.jpg</code>, <code>foto-2.jpg</code>… y van a aparecer solas acá.</p>`;
      return;
    }
    found.forEach(f => {
      const item = { title: `Fotografía comercial — Negocio ${f.index}`, img: f.img, desc: '' };
      const div = document.createElement('div');
      div.className = 'reveal in polaroid cursor-pointer';
      div.style.setProperty('--tilt', (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2 + 1) + 'deg');
      div.innerHTML = `
        <div class="aspect-square overflow-hidden bg-[#141414] relative">
          <img src="${item.img}" loading="lazy" alt="${item.title}" class="w-full h-full object-cover">
        </div>
        <div class="polaroid-footer">
          <p class="polaroid-caption">${item.title}</p>
          <img src="img/firma.png" alt="B House Music" class="polaroid-signature" onerror="this.remove();">
        </div>`;
      div.addEventListener('click', () => openModal(item));
      businessPortfolioGrid.appendChild(div);
    });
  });
}


// Menú a la carta: agrupado por categoría, cada servicio con su propio botón "Cotizar"
const businessMenuWrap = document.getElementById('businessMenuWrap');
if (businessMenuWrap && typeof CONFIG !== 'undefined' && CONFIG.businessServices) {
  const groups = {};
  CONFIG.businessServices.forEach(s => {
    if (!groups[s.group]) groups[s.group] = [];
    groups[s.group].push(s);
  });
  Object.keys(groups).forEach(groupName => {
    const groupWrap = document.createElement('div');
    groupWrap.className = 'mb-10';
    groupWrap.innerHTML = `<p class="reveal in font-mono text-xs uppercase tracking-[0.25em] text-bone/50 mb-4 pb-2 border-b border-line">${groupName}</p>`;
    const rowsWrap = document.createElement('div');
    rowsWrap.className = 'divide-y divide-line';
    groups[groupName].forEach(s => {
      const row = document.createElement('div');
      row.className = 'reveal in flex items-center justify-between gap-4 py-5';
      row.innerHTML = `
        <div class="min-w-0">
          <h3 class="fx-serif text-lg uppercase leading-tight">${s.icon} ${s.title}</h3>
          <p class="text-bone/50 text-sm mt-0.5">${s.desc}</p>
        </div>
        <div class="flex items-center gap-4 shrink-0">
          <span class="font-mono text-sm text-bone/80">${s.price}</span>
          <button type="button" class="business-quote-btn rounded-full border border-bone/30 px-5 py-2 text-sm font-semibold hover:border-bone hover:bg-bone hover:text-ink transition-colors" data-service="${s.title}">Cotizar</button>
        </div>`;
      rowsWrap.appendChild(row);
    });
    groupWrap.appendChild(rowsWrap);
    businessMenuWrap.appendChild(groupWrap);
  });

  businessMenuWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.business-quote-btn');
    if (!btn) return;
    const texto = `Hola, quiero cotizar: ${btn.dataset.service}`;
    window.open(`https://wa.me/50670166631?text=${encodeURIComponent(texto)}`, '_blank');
  });
}

const businessPackagesGrid = document.getElementById('businessPackagesGrid');
if (businessPackagesGrid && typeof CONFIG !== 'undefined' && CONFIG.businessPackages) {
  CONFIG.businessPackages.forEach(p => {
    const div = document.createElement('div');
    div.className = p.featured
      ? 'reveal in card-hover rounded-3xl border-2 border-bone p-8 flex flex-col relative'
      : 'reveal in card-hover rounded-3xl border border-bone/15 p-8 flex flex-col';
    div.innerHTML = `
      ${p.featured ? '<span class="absolute -top-3 left-8 bg-bone text-ink text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full">Más elegido</span>' : ''}
      <p class="font-mono text-xs uppercase tracking-widest text-bone/50 mb-2">${p.name}</p>
      <div class="fx-serif text-4xl mb-1">${p.price}</div>
      <p class="text-bone/50 text-sm mb-6">${p.desc}</p>
      <ul class="text-sm text-bone/70 space-y-2 mb-8 flex-1">${p.features.map(f => `<li>✓ ${f}</li>`).join('')}</ul>
      <button type="button" class="business-quote-btn rounded-full ${p.featured ? 'bg-bone text-ink hover:bg-white' : 'border border-bone/30 hover:border-bone'} px-6 py-3 text-sm font-semibold text-center transition-colors" data-service="Paquete ${p.name} (${p.price})">Elegir ${p.name}</button>`;
    businessPackagesGrid.appendChild(div);
  });
  businessPackagesGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.business-quote-btn');
    if (!btn) return;
    const texto = `Hola, quiero cotizar: ${btn.dataset.service}`;
    window.open(`https://wa.me/50670166631?text=${encodeURIComponent(texto)}`, '_blank');
  });
}


/* ============ SERVICE WIZARD (servicios.html) ============ */
const serviceWizardModal = document.getElementById('serviceWizardModal');
if (serviceWizardModal && typeof CONFIG !== 'undefined' && CONFIG.serviceFlows) {
  const wizardIcon = document.getElementById('wizardIcon');
  const wizardTitle = document.getElementById('wizardTitle');
  const wizardQuestions = document.getElementById('wizardQuestions');
  const wizardContinue = document.getElementById('wizardContinue');
  const wizardClose = document.getElementById('wizardClose');
  let currentFlow = null;
  let currentAnswers = {};

  function closeWizard() {
    serviceWizardModal.classList.add('hidden');
    serviceWizardModal.classList.remove('flex');
  }
  wizardClose.addEventListener('click', closeWizard);
  serviceWizardModal.addEventListener('click', (e) => { if (e.target === serviceWizardModal) closeWizard(); });

  function checkWizardComplete() {
    const done = currentFlow.questions.every((q, i) => currentAnswers[i] !== undefined);
    wizardContinue.disabled = !done;
  }

  window.openServiceWizard = function(service) {
    const flow = CONFIG.serviceFlows[service.title];
    if (!flow) {
      // Sin cuestionario configurado: manda directo a WhatsApp con el nombre del servicio
      window.open(`https://wa.me/50670166631?text=${encodeURIComponent('Hola, quiero cotizar: ' + service.title)}`, '_blank');
      return;
    }
    currentFlow = flow;
    currentFlow.serviceTitle = service.title;
    currentAnswers = {};
    wizardIcon.textContent = service.icon + '  ' + service.title;
    wizardTitle.textContent = 'Contanos qué necesitás';
    wizardQuestions.innerHTML = '';
    flow.questions.forEach((q, qi) => {
      const block = document.createElement('div');
      block.innerHTML = `<p class="text-sm font-medium mb-3">${q.label}</p>`;
      const optWrap = document.createElement('div');
      optWrap.className = 'flex flex-wrap gap-2';
      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wizard-opt-btn font-mono text-xs px-3.5 py-2 rounded-full border border-bone/20 text-bone/70 hover:border-bone/50 transition-colors text-left';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          optWrap.querySelectorAll('.wizard-opt-btn').forEach(b => b.classList.remove('bg-bone','text-ink','border-bone'));
          btn.classList.add('bg-bone','text-ink','border-bone');
          currentAnswers[qi] = opt;
          checkWizardComplete();
        });
        optWrap.appendChild(btn);
      });
      block.appendChild(optWrap);
      wizardQuestions.appendChild(block);
    });
    wizardContinue.disabled = true;
    serviceWizardModal.classList.remove('hidden');
    serviceWizardModal.classList.add('flex');
  };

  wizardContinue.addEventListener('click', () => {
    const summaryLines = currentFlow.questions.map((q, i) => `${q.label} ${currentAnswers[i]}`);
    const summaryText = summaryLines.join(' · ');
    if (currentFlow.goesToAgenda) {
      sessionStorage.setItem('bhServiceInfo', JSON.stringify({ service: currentFlow.serviceTitle, lines: summaryLines }));
      window.location.href = 'index.html?service=' + encodeURIComponent(currentFlow.serviceTitle) + '#agenda';
    } else {
      const msg = `Hola, quiero cotizar ${currentFlow.serviceTitle}:\n\n${summaryLines.join('\n')}`;
      window.open(`https://wa.me/50670166631?text=${encodeURIComponent(msg)}`, '_blank');
      closeWizard();
    }
  });
}

/* ============ MODAL (shared by portfolio + youtube) ============ */
const modal = document.getElementById('portfolioModal');
const modalMediaWrap = document.getElementById('modalMediaWrap');
const modalTvFrame = document.getElementById('modalTvFrame');
const modalPhotoFrame = document.getElementById('modalPhotoFrame');
const modalPhotoWrap = document.getElementById('modalPhotoWrap');
function openModal(item) {
  if (!modal) return;
  const t = document.getElementById('modalTitle'); if (t) t.textContent = item.title;
  const d = document.getElementById('modalDesc'); if (d) d.textContent = item.desc || '';
  const isPhoto = !item.youtube;
  if (modalTvFrame) modalTvFrame.classList.toggle('hidden', isPhoto);
  if (modalPhotoFrame) modalPhotoFrame.classList.toggle('hidden', !isPhoto);
  if (isPhoto) {
    if (modalPhotoWrap) {
      modalPhotoWrap.innerHTML = `<img src="${item.img}" alt="${item.title}">`;
    }
    if (modalMediaWrap) modalMediaWrap.innerHTML = '';
  } else {
    if (modalMediaWrap) modalMediaWrap.innerHTML = `<iframe class="w-full h-full" src="https://www.youtube.com/embed/${item.youtube}?autoplay=1" title="${item.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
    if (modalPhotoWrap) modalPhotoWrap.innerHTML = '';
  }
  modal.classList.remove('hidden'); modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  if (!modal) return;
  modal.classList.add('hidden'); modal.classList.remove('flex');
  if (modalMediaWrap) modalMediaWrap.innerHTML = '';
  if (modalPhotoWrap) modalPhotoWrap.innerHTML = '';
  document.body.style.overflow = '';
}
if (modal) {
  const modalClose = document.getElementById('modalClose');
  if (modalClose) modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

/* ============ PORTFOLIO (portafolio.html) ============ */
const portfolioGrid = document.getElementById('portfolioGrid');
let shuffledExtraVideos = null;
let extraVideosShown = 15;

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function videoCardHTML(item) {
  const div = document.createElement('div');

  if (item.cat === 'photo' && !item.youtube) {
    div.className = 'reveal in polaroid cursor-pointer';
    div.style.setProperty('--tilt', (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2 + 1) + 'deg');
    div.innerHTML = `
      <div class="aspect-square overflow-hidden bg-[#141414] relative">
        <img src="${item.img}" loading="lazy" alt="${item.title}" class="w-full h-full object-cover" onerror="this.closest('.polaroid').classList.add('img-missing'); this.remove();">
        <div class="img-placeholder hidden absolute inset-0 items-center justify-center border border-dashed border-black/15 bg-[#e5e4e0] text-center px-4">
          <span class="font-mono text-[10px] uppercase tracking-widest text-black/40">Falta imagen<br>${item.img}</span>
        </div>
      </div>
      <div class="polaroid-footer">
        <p class="polaroid-caption">${item.title}</p>
        <img src="img/firma.png" alt="B House Music" class="polaroid-signature" onerror="this.remove();">
      </div>`;
    div.addEventListener('click', () => openModal(item));
    return div;
  }

  div.className = 'reveal in group relative aspect-video rounded-2xl overflow-hidden cursor-pointer';
  const mediaHTML = item.youtube
    ? `<img src="https://i.ytimg.com/vi/${item.youtube}/hqdefault.jpg" loading="lazy" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
       <div class="absolute inset-0 bg-ink/25 group-hover:bg-ink/40 transition-colors flex items-center justify-center">
         <span class="w-14 h-14 rounded-full bg-bone/90 flex items-center justify-center group-hover:scale-110 transition-transform">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 text-ink translate-x-0.5" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
         </span>
       </div>`
    : `<img src="${item.img}" loading="lazy" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onerror="this.closest('.group').classList.add('img-missing'); this.remove();">
       <div class="img-placeholder hidden absolute inset-0 items-center justify-center border border-dashed border-bone/15 bg-[#141414] text-center px-4">
         <span class="font-mono text-[10px] uppercase tracking-widest text-bone/30">Falta imagen<br>${item.img}</span>
       </div>`;
  div.innerHTML = `
    ${mediaHTML}
    <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 p-5">
      <p class="font-mono text-[10px] uppercase tracking-widest text-bone/60 mb-1">${item.cat || 'videos'}</p>
      <h3 class="fx-serif text-lg uppercase leading-tight">${item.title}</h3>
      ${item.artist ? `<p class="text-bone/40 text-xs mt-0.5">${item.artist}</p>` : ''}
    </div>`;
  div.addEventListener('click', () => openModal(item));
  return div;
}

function renderPortfolio(filter='videos') {
  portfolioGrid.innerHTML = '';
  CONFIG.portfolio.filter(p => p.cat===filter).forEach(p => {
    portfolioGrid.appendChild(videoCardHTML(p));
  });

  const loadMoreWrap = document.getElementById('loadMoreVideosWrap');
  if (filter !== 'videos') {
    if (loadMoreWrap) loadMoreWrap.classList.add('hidden');
    return;
  }

  // Videoclips: agrega el resto de CONFIG.youtube en orden aleatorio, paginado de 15 en 15
  if (!shuffledExtraVideos) {
    const usedIds = new Set(CONFIG.portfolio.filter(p => p.cat === 'videos' && p.youtube).map(p => p.youtube));
    const pool = (CONFIG.youtube || []).filter(v => !usedIds.has(v.id));
    shuffledExtraVideos = shuffleArray(pool);
  }
  shuffledExtraVideos.slice(0, extraVideosShown).forEach(v => {
    portfolioGrid.appendChild(videoCardHTML({ title: v.title, artist: v.artist, youtube: v.id, cat: 'videos' }));
  });
  if (loadMoreWrap) {
    loadMoreWrap.classList.toggle('hidden', extraVideosShown >= shuffledExtraVideos.length);
  }
}
if (portfolioGrid) {
  renderPortfolio();
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPortfolio(btn.dataset.filter);
    });
  });
  const loadMoreBtn = document.getElementById('loadMoreVideosBtn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      extraVideosShown += 15;
      renderPortfolio('videos');
    });
  }
}

// Auto-descubrimiento de fotos de música: subí una foto con el nombre correcto
// (ej. fotografia-3.jpg) y se agrega sola a la categoría correspondiente, sin
// tocar config.js. No reemplaza a los items ya curados manualmente, se suman.
if (portfolioGrid && typeof CONFIG !== 'undefined') {
  const musicAutoGroups = [
    {prefix:'fotografia-', cat:'photo',    label:'Fotografía'},
    {prefix:'retrato-',    cat:'bts',      label:'Retrato'},
    {prefix:'portafolio-', cat:'sessions', label:'Sesión'},
  ];
  Promise.all(musicAutoGroups.map(g =>
    discoverPhotos(g.prefix, 'img', ['jpg', 'jpeg'], 30).then(found =>
      found.map(f => ({ cat: g.cat, title: `${g.label} ${f.index}`, img: f.img }))
    )
  )).then(groupsResults => {
    let added = 0;
    groupsResults.forEach(items => {
      if (items.length) { CONFIG.portfolio = CONFIG.portfolio.concat(items); added += items.length; }
    });
    if (added) {
      const activeBtn = document.querySelector('.filter-btn.active');
      renderPortfolio(activeBtn ? activeBtn.dataset.filter : 'videos');
    }
  });
}

/* ============ FAQ (faq.html) ============ */
const faqList = document.getElementById('faqList');
if (faqList && typeof CONFIG !== 'undefined') {
  CONFIG.faq.forEach(([q,a]) => {
    const item = document.createElement('div');
    item.className = 'faq-item py-5';
    item.innerHTML = `
      <button class="flex items-center justify-between gap-4 group" aria-expanded="false">
        <span class="text-left font-medium text-base md:text-lg">${q}</span>
        <span class="shrink-0 w-8 h-8 rounded-full border border-bone/20 flex items-center justify-center text-lg transition-transform duration-300 group-[.open]:rotate-45">+</span>
      </button>
      <div class="accordion-content"><p class="text-bone/55 text-sm md:text-base leading-relaxed pt-4 pr-10">${a}</p></div>`;
    const btn = item.querySelector('button');
    const content = item.querySelector('.accordion-content');
    btn.addEventListener('click', () => {
      const isOpen = btn.parentElement.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => {
        if (o !== item) { o.classList.remove('open'); o.querySelector('.accordion-content').style.maxHeight = '0px'; o.querySelector('button').setAttribute('aria-expanded','false'); }
      });
      if (isOpen) { item.classList.remove('open'); content.style.maxHeight = '0px'; btn.setAttribute('aria-expanded','false'); }
      else { item.classList.add('open'); content.style.maxHeight = content.scrollHeight + 'px'; btn.setAttribute('aria-expanded','true'); }
    });
    faqList.appendChild(item);
  });
}

/* ============ TESTIMONIALS (contacto.html) ============ */
const testTrack = document.getElementById('testimonialTrack');
if (testTrack && typeof CONFIG !== 'undefined') {
  CONFIG.testimonials.forEach(t => {
    const div = document.createElement('div');
    div.className = 'reveal in snap-start shrink-0 w-[280px] md:w-[380px] glass rounded-3xl p-8 flex flex-col';
    div.innerHTML = `
      <div class="flex gap-1 text-sm mb-4" aria-hidden="true">★★★★★</div>
      <p class="text-bone/80 leading-relaxed mb-6 flex-1">"${t.quote}"</p>
      <div class="flex items-center gap-2 text-bone/40 text-xs font-mono uppercase tracking-widest">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/></svg>
        Reseña verificada en Google
      </div>`;
    testTrack.appendChild(div);
  });
  const testNext = document.getElementById('testNext');
  const testPrev = document.getElementById('testPrev');
  if (testNext) testNext.addEventListener('click', () => testTrack.scrollBy({left:340, behavior:'smooth'}));
  if (testPrev) testPrev.addEventListener('click', () => testTrack.scrollBy({left:-340, behavior:'smooth'}));
}

/* ============ INSTAGRAM GRID (contacto.html) ============ */
const igGrid = document.getElementById('igGrid');
if (igGrid && typeof CONFIG !== 'undefined') {
  CONFIG.instagramPosts.forEach(src => {
    const a = document.createElement('a');
    a.href = 'https://www.instagram.com/bhousemusiccr/'; a.target = '_blank'; a.rel = 'noopener';
    a.className = 'reveal in group relative aspect-square overflow-hidden';
    a.innerHTML = `
      <img src="${src}" loading="lazy" alt="Publicación de Instagram" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.closest('.group').classList.add('img-missing'); this.remove();">
      <div class="img-placeholder hidden absolute inset-0 items-center justify-center border border-dashed border-bone/15 bg-[#141414] text-center px-2">
        <span class="font-mono text-[9px] uppercase tracking-widest text-bone/30">${src}</span>
      </div>`;
    igGrid.appendChild(a);
  });
}

/* ============ CONTACT FORM (contacto.html) ============ */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      const err = field.parentElement.querySelector('.err');
      if (!field.value.trim()) { valid = false; err && err.classList.remove('hidden'); field.classList.add('border-red-400'); }
      else { err && err.classList.add('hidden'); field.classList.remove('border-red-400'); }
    });
    if (!valid) return;
    const data = new FormData(form);
    const msg = `Hola B House, mi nombre es ${data.get('name')}. WhatsApp: ${data.get('phone')}. Servicio: ${data.get('service')}. Proyecto: ${data.get('message')}`;
    const successEl = document.getElementById('formSuccess');
    if (successEl) successEl.classList.remove('hidden');
    window.open(`https://wa.me/50670166631?text=${encodeURIComponent(msg)}`, '_blank');
    form.reset();
  });
}

/* ============ ARTISTA DEL MES (index.html) ============ */
const artistOfMonthMedia = document.getElementById('artistOfMonthMedia');
if (artistOfMonthMedia && typeof CONFIG !== 'undefined' && CONFIG.artistOfMonth) {
  const a = CONFIG.artistOfMonth;
  document.getElementById('artistOfMonthThumb').src = `https://i.ytimg.com/vi/${a.youtube}/hqdefault.jpg`;
  document.getElementById('artistOfMonthThumb').alt = a.name;
  document.getElementById('artistOfMonthName').textContent = a.name;
  document.getElementById('artistOfMonthTrack').textContent = `"${a.trackTitle}" — video oficial`;
  document.getElementById('artistOfMonthBlurb').textContent = a.blurb;
  artistOfMonthMedia.addEventListener('click', () => openModal({ title: `${a.name} — ${a.trackTitle}`, desc:'', youtube: a.youtube }));
}

/* ============ PREMIOS B HOUSE — puntaje redes + jueces (premios.html) ============ */
const premiosCategories = document.getElementById('premiosCategories');
if (premiosCategories && typeof CONFIG !== 'undefined' && CONFIG.premiosAwards) {
  const awards = CONFIG.premiosAwards;
  const socialWeightLabel = document.getElementById('socialWeightLabel');
  const judgeWeightLabel = document.getElementById('judgeWeightLabel');
  if (socialWeightLabel) socialWeightLabel.textContent = Math.round(awards.socialWeight * 100) + '%';
  if (judgeWeightLabel) judgeWeightLabel.textContent = Math.round(awards.judgeWeight * 100) + '%';

  function nomineeCardHTML(n, finalScore, maxScore) {
    const pct = maxScore > 0 ? Math.round((finalScore / maxScore) * 100) : 0;
    return `
      <div class="rounded-2xl border border-bone/10 p-4 md:p-5">
        <div class="flex gap-4 items-center">
          <div class="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 cursor-pointer nominee-thumb" data-yt="${n.youtube}" data-title="${n.artist} — ${n.trackTitle}">
            <img src="https://i.ytimg.com/vi/${n.youtube}/hqdefault.jpg" loading="lazy" alt="${n.artist}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-ink/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 text-white translate-x-0.5" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="fx-serif text-lg uppercase leading-tight truncate">${n.artist}</p>
            <p class="text-bone/50 text-xs truncate mb-2">"${n.trackTitle}"</p>
            <div class="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div class="h-full bg-amber-300 rounded-full transition-all duration-700" style="width:${pct}%"></div>
            </div>
          </div>
          <div class="text-right shrink-0">
            <p class="fx-serif text-2xl">${finalScore.toFixed(1)}</p>
            <p class="text-bone/30 text-[10px] font-mono uppercase">puntaje</p>
          </div>
        </div>
        <div class="flex justify-between mt-3 text-[10px] font-mono uppercase tracking-widest text-bone/30">
          <span>❤️ ${n.instagramLikes} likes</span>
          <span>⚖️ ${n.judgeScore}/100 jueces</span>
        </div>
        ${n.instagramPostUrl ? `<a href="${n.instagramPostUrl}" target="_blank" rel="noopener" class="mt-3 block text-center rounded-full border border-bone/20 hover:border-bone/50 py-2 text-xs font-mono uppercase tracking-widest transition-colors">Ver post en Instagram →</a>` : ''}
      </div>`;
  }

  function renderPremios() {
    premiosCategories.innerHTML = awards.categories.map(cat => {
      const maxLikes = Math.max(1, ...cat.nominees.map(n => n.instagramLikes));
      const scored = cat.nominees.map(n => {
        const socialPct = (n.instagramLikes / maxLikes) * 100;
        const finalScore = socialPct * awards.socialWeight + n.judgeScore * awards.judgeWeight;
        return { n, finalScore };
      });
      const maxScore = Math.max(1, ...scored.map(s => s.finalScore));
      const criteriaHTML = cat.judgeCriteria
        ? `<p class="text-bone/40 text-xs mt-2 mb-6 max-w-2xl">Los jueces evalúan: ${cat.judgeCriteria.join(' · ')}.</p>`
        : '';
      return `
        <div class="reveal in">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-1">
            <h2 class="fx-serif text-2xl md:text-3xl uppercase">${cat.name}</h2>
            <a href="https://wa.me/50670166631?text=${encodeURIComponent('Hola, quiero que mi proyecto entre a la categoría ' + cat.name + ' de los Premios B House')}" target="_blank" rel="noopener"
               class="shrink-0 rounded-full border border-bone/20 hover:border-bone/50 px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors inline-flex items-center gap-2 w-fit">
              ¿Falta tu proyecto? Avisame →
            </a>
          </div>
          ${cat.subtitle ? `<span class="inline-block font-mono text-xs uppercase tracking-widest bg-amber-300/10 text-amber-300 border border-amber-300/25 rounded-full px-3 py-1 mt-2">🎁 ${cat.subtitle}</span>` : ''}
          ${criteriaHTML}
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            ${scored.map(s => nomineeCardHTML(s.n, s.finalScore, maxScore)).join('')}
          </div>
        </div>`;
    }).join('');

    premiosCategories.querySelectorAll('.nominee-thumb').forEach(el => {
      el.addEventListener('click', () => openModal({ title: el.dataset.title, desc:'', youtube: el.dataset.yt }));
    });
  }

  renderPremios();
}

/* ============ MISC ============ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============ SMART FLOATING CTA (all pages) ============ */
const floatCta = document.getElementById('floatCta');
const floatCtaLabel = document.getElementById('floatCtaLabel');
if (floatCta && floatCtaLabel) {
  const defaultHref = floatCta.getAttribute('href'); // set correctly per-page in HTML
  const ctaStates = {
    default: { label:'Ver disponibilidad', href: defaultHref, external:false },
    faq:     { label:'¿Dudas? Escríbenos', href:'https://wa.me/50670166631?text=Hola%2C%20tengo%20una%20duda', external:true },
    contact: { label:'Escríbenos', href:'https://wa.me/50670166631', external:true },
  };
  function setFloatCta(state) {
    const s = ctaStates[state] || ctaStates.default;
    floatCtaLabel.textContent = s.label;
    floatCta.href = s.href;
    if (s.external) { floatCta.setAttribute('target','_blank'); floatCta.setAttribute('rel','noopener'); }
    else { floatCta.removeAttribute('target'); floatCta.removeAttribute('rel'); }
  }
  const ctaZones = ['faq','contacto'].map(id => document.getElementById(id)).filter(Boolean);
  const ctaIO = new IntersectionObserver((entries) => {
    const visible = entries.find(e => e.isIntersecting);
    if (visible) setFloatCta(visible.target.id === 'faq' ? 'faq' : 'contact');
    else setFloatCta('default');
  }, { threshold: 0.4 });
  ctaZones.forEach(z => ctaIO.observe(z));
  setFloatCta('default');
  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight * 0.6) {
      floatCta.classList.remove('opacity-0','pointer-events-none','translate-y-3');
    } else {
      floatCta.classList.add('opacity-0','pointer-events-none','translate-y-3');
    }
  });
}

/* ============ AUDIO PRICE CALCULATOR (precios.html) ============ */
const calcSlider = document.getElementById('calcSlider');
if (calcSlider) {
  const calcHours = document.getElementById('calcHours');
  const calcPrice = document.getElementById('calcPrice');
  const calcWhatsapp = document.getElementById('calcWhatsapp');
  const RATE_PER_HOUR = 15000;
  function updateCalc() {
    const hours = +calcSlider.value;
    const total = hours * RATE_PER_HOUR;
    calcHours.textContent = hours;
    calcPrice.textContent = '₡' + total.toLocaleString('es-CR');
  }
  calcSlider.addEventListener('input', updateCalc);
  if (calcWhatsapp) {
    calcWhatsapp.addEventListener('click', () => {
      window.location.href = `index.html?type=audio&hours=${calcSlider.value}#agenda`;
    });
  }
  updateCalc();
}

/* ============ VIDEO PRICE CALCULATOR (precios.html) ============ */
const vidPkgBtns = document.querySelectorAll('.vid-pkg-btn');
if (vidPkgBtns.length) {
  const vidExtraSlider = document.getElementById('vidExtraSlider');
  const vidExtraHoursEl = document.getElementById('vidExtraHours');
  const vidTotalPrice = document.getElementById('vidTotalPrice');
  const vidCalcCta = document.getElementById('vidCalcCta');
  let selectedVidPkg = { name:'Express', price:200 };

  function updateVidCalc() {
    const extra = +vidExtraSlider.value;
    vidExtraHoursEl.textContent = extra;
    const total = selectedVidPkg.price + extra * 200;
    vidTotalPrice.textContent = '$' + total.toLocaleString('en-US');
    vidCalcCta.textContent = `Agendar ${selectedVidPkg.name}${extra ? ' + ' + extra + 'h extra' : ''}`;
  }
  vidPkgBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      vidPkgBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedVidPkg = { name: btn.dataset.pkg, price: +btn.dataset.price };
      updateVidCalc();
    });
  });
  vidPkgBtns[0].classList.add('active');
  if (vidExtraSlider) { vidExtraSlider.addEventListener('input', updateVidCalc); updateVidCalc(); }
  if (vidCalcCta) {
    vidCalcCta.addEventListener('click', () => {
      window.location.href = `index.html?pkg=${encodeURIComponent(selectedVidPkg.name)}#agenda`;
    });
  }
}

/* ============ BOOKING FORM: SERVICE TYPE (audio vs video) ============ */
const bookingForm = document.getElementById('bookingForm');
const serviceTypeBtns = document.querySelectorAll('.service-type-btn');
if (bookingForm && serviceTypeBtns.length) {
  const formPkgBtns = document.querySelectorAll('.form-pkg-btn');
  const accInputs = document.querySelectorAll('.acc');
  const accCounterEl = document.getElementById('accCounter');
  const accWarnEl = document.getElementById('accWarn');
  const horaSelect = document.getElementById('horaSelect');
  const fechaInput = document.getElementById('fechaInput');
  const accContainer = document.getElementById('accContainer');
  const audioFields = document.getElementById('audioFields');
  const videoFields = document.getElementById('videoFields');
  const dateTimeFields = document.getElementById('dateTimeFields');
  const calendarNote = document.getElementById('calendarNote');
  const audioHoursSlider = document.getElementById('audioHoursSlider');
  const audioHoursLabel = document.getElementById('audioHoursLabel');
  const audioPriceEstimate = document.getElementById('audioPriceEstimate');

  let serviceType = null; // 'audio' | 'video'
  let selectedFormPkg = null;
  let selectedDateObj = null;
  let fp = null; // flatpickr instance

  const PKG_DURATION = { Express: 1, Artista: 3, Premium: 5 };
  const AUDIO_WINDOW = {
    weekday: { open: 16, close: 20 },  // Lun–Vie 4pm–8pm
    weekend: { open: 9, close: 17 },   // Sáb–Dom 9am–5pm
  };
  const AUDIO_RATE = 15000;

  /* ============ RESERVAS EN TIEMPO REAL (vía GitHub, ver config.js → bookingsRepo) ============ */
  const bookedData = { videoDates: new Set(), audioRanges: {} }; // audioRanges: {'YYYY-MM-DD': [{start,end}, ...]}

  function formatDateStr(d) {
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  async function fetchBookedSlots() {
    if (typeof CONFIG === 'undefined' || !CONFIG.bookingsRepo) return;
    const { repoOwner, repoName } = CONFIG.bookingsRepo;
    try {
      const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues?state=open&per_page=100`);
      if (!res.ok) return;
      const issues = await res.json();
      const re = /^RESERVA:\s*(\d{4}-\d{2}-\d{2})\s*\|\s*(audio|video)\s*\|\s*(.+)$/i;
      issues.forEach(issue => {
        const m = (issue.title || '').match(re);
        if (!m) return;
        const [, date, type] = m;
        const rangeText = m[3];
        if (type.toLowerCase() === 'video') {
          bookedData.videoDates.add(date);
        } else {
          const rm = rangeText.match(/(\d{1,2}):00\s*-\s*(\d{1,2}):00/);
          if (rm) {
            if (!bookedData.audioRanges[date]) bookedData.audioRanges[date] = [];
            bookedData.audioRanges[date].push({ start: +rm[1], end: +rm[2] });
          }
        }
      });
    } catch (e) { /* si falla, el calendario sigue funcionando sin bloqueo en vivo */ }
    applyCalendarDisable();
    if (selectedDateObj) populateHoraSelect();
  }

  function applyCalendarDisable() {
    if (!fp) return;
    if (serviceType === 'video') {
      fp.set('disable', [date => !(date.getDay() === 0 || date.getDay() === 6) || bookedData.videoDates.has(formatDateStr(date)) || !!bookedData.audioRanges[formatDateStr(date)]]);
    } else if (serviceType === 'audio') {
      fp.set('disable', [date => bookedData.videoDates.has(formatDateStr(date))]);
    }
  }

  function fillAudioHoraOptions(open, lastStart, duration, dateStr) {
    horaSelect.innerHTML = '';
    const ranges = bookedData.audioRanges[dateStr] || [];
    let any = false;
    for (let h = open; h <= lastStart; h++) {
      const end = h + duration;
      const overlaps = ranges.some(r => h < r.end && end > r.start);
      if (overlaps) continue;
      any = true;
      const label = (h < 10 ? '0' + h : h) + ':00';
      horaSelect.insertAdjacentHTML('beforeend', `<option value="${label}">${label}</option>`);
    }
    if (!any) horaSelect.innerHTML = '<option value="">Sin horas disponibles ese día — probá otra fecha</option>';
  }

  function fillHoraOptions(open, close) {
    horaSelect.innerHTML = '';
    if (open > close) {
      horaSelect.innerHTML = '<option value="">No disponible ese día</option>';
      return;
    }
    for (let h = open; h <= close; h++) {
      const label = (h < 10 ? '0' + h : h) + ':00';
      horaSelect.insertAdjacentHTML('beforeend', `<option value="${label}">${label}</option>`);
    }
  }

  function populateHoraSelect() {
    if (!selectedDateObj) { horaSelect.innerHTML = '<option value="">Elegí fecha primero</option>'; return; }
    if (serviceType === 'video') {
      const duration = PKG_DURATION[selectedFormPkg] || 1;
      const lastStart = Math.min(17, 22 - duration);
      fillHoraOptions(10, lastStart);
    } else if (serviceType === 'audio') {
      const isWeekend = selectedDateObj.getDay() === 0 || selectedDateObj.getDay() === 6;
      const win = isWeekend ? AUDIO_WINDOW.weekend : AUDIO_WINDOW.weekday;
      const duration = +audioHoursSlider.value;
      const lastStart = win.close - duration;
      fillAudioHoraOptions(win.open, lastStart, duration, formatDateStr(selectedDateObj));
    }
  }

  function enforceAccLimit(limit, pkgName) {
    const droneInput = Array.from(accInputs).find(c => c.value === 'Drone');
    if (droneInput && pkgName !== 'Premium') {
      droneInput.checked = false;
      droneInput.disabled = true;
      droneInput.closest('.acc-label').classList.add('acc-disabled');
    }
    const selected = Array.from(accInputs).filter(c => c.checked);
    const rem = limit >= 99 ? '∞' : Math.max(0, limit - selected.length);
    if (accCounterEl) accCounterEl.textContent = `Seleccionados: ${selected.length} · Restantes: ${rem}`;
    if (accWarnEl) accWarnEl.classList.add('hidden');
    accInputs.forEach(c => {
      if (c === droneInput && pkgName !== 'Premium') return; // stays locked
      const label = c.closest('.acc-label');
      if (!c.checked && selected.length >= limit) { c.disabled = true; label.classList.add('acc-disabled'); }
      else { c.disabled = false; label.classList.remove('acc-disabled'); }
    });
  }

  function selectFormPackage(pkgName) {
    const btn = Array.from(formPkgBtns).find(b => b.dataset.pkg === pkgName);
    if (!btn) return;
    formPkgBtns.forEach(b => b.classList.remove('bg-bone','text-ink'));
    btn.classList.add('bg-bone','text-ink');
    selectedFormPkg = pkgName;
    const limit = +btn.dataset.limit;
    accInputs.forEach(c => { c.checked = false; c.disabled = false; c.closest('.acc-label').classList.remove('acc-disabled'); });
    enforceAccLimit(limit, pkgName);
    populateHoraSelect();
  }
  formPkgBtns.forEach(btn => btn.addEventListener('click', () => selectFormPackage(btn.dataset.pkg)));
  if (accContainer) {
    accContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('acc') && selectedFormPkg) {
        const btn = Array.from(formPkgBtns).find(b => b.dataset.pkg === selectedFormPkg);
        enforceAccLimit(+btn.dataset.limit, selectedFormPkg);
      }
    });
  }

  function updateAudioEstimate() {
    const hours = +audioHoursSlider.value;
    audioHoursLabel.textContent = hours;
    audioPriceEstimate.textContent = '₡' + (hours * AUDIO_RATE).toLocaleString('es-CR');
    populateHoraSelect();
  }
  if (audioHoursSlider) audioHoursSlider.addEventListener('input', updateAudioEstimate);

  function selectServiceType(type) {
    serviceType = type;
    serviceTypeBtns.forEach(b => b.classList.remove('bg-bone','text-ink'));
    const activeBtn = Array.from(serviceTypeBtns).find(b => b.dataset.type === type);
    if (activeBtn) activeBtn.classList.add('bg-bone','text-ink');

    if (type === 'audio') {
      audioFields.classList.remove('hidden');
      videoFields.classList.add('hidden');
      selectedFormPkg = null;
      accInputs.forEach(c => { c.checked = false; c.disabled = true; c.closest('.acc-label').classList.add('acc-disabled'); });
      updateAudioEstimate();
      if (calendarNote) calendarNote.innerHTML = 'Grabación disponible lunes a viernes 4:00–8:00 p.m. y sábados/domingos 9:00 a.m.–5:00 p.m. Una fecha marcada aquí queda <strong class="text-bone/70">pendiente</strong> hasta que la confirmemos por WhatsApp.';
    } else if (type === 'video') {
      audioFields.classList.add('hidden');
      videoFields.classList.remove('hidden');
      if (calendarNote) calendarNote.innerHTML = 'Video disponible solo sábados y domingos, 10:00 a.m. – 6:00 p.m. Una fecha marcada aquí queda <strong class="text-bone/70">pendiente</strong> hasta que la confirmemos por WhatsApp.';
    }
    applyCalendarDisable();
    // Reset date/hour since availability rules changed
    selectedDateObj = null;
    fechaInput.value = '';
    if (fp) fp.clear();
    horaSelect.innerHTML = '<option value="">Elegí fecha primero</option>';
    dateTimeFields.classList.remove('opacity-40','pointer-events-none');
  }
  serviceTypeBtns.forEach(btn => btn.addEventListener('click', () => selectServiceType(btn.dataset.type)));

  if (document.getElementById('bookingCalendar') && typeof flatpickr !== 'undefined') {
    fp = flatpickr('#bookingCalendar', {
      inline: true,
      locale: 'es',
      minDate: 'today',
      onChange: (selectedDates) => {
        selectedDateObj = selectedDates[0];
        fechaInput.value = selectedDateObj.toLocaleDateString('es-CR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
        populateHoraSelect();
      }
    });
    fetchBookedSlots();
  }

  /* Preselect from another page: ?type=audio&hours=3  or  ?pkg=Express (implies video)  or  ?service=Videoclips */
  const params = new URLSearchParams(window.location.search);
  const urlType = params.get('type');
  const urlPkg = params.get('pkg');
  const urlHours = params.get('hours');
  const urlService = params.get('service');
  const VIDEO_SERVICES = ['Videoclips', 'Lyric videos', 'Visualizers', 'Fotografía'];
  if (urlPkg && ['Express','Artista','Premium'].includes(urlPkg)) {
    setTimeout(() => { selectServiceType('video'); selectFormPackage(urlPkg); }, 300);
  } else if (urlType === 'audio') {
    setTimeout(() => {
      selectServiceType('audio');
      if (urlHours && +urlHours >= 1 && +urlHours <= 8) { audioHoursSlider.value = urlHours; updateAudioEstimate(); }
    }, 300);
  } else if (urlService) {
    setTimeout(() => { selectServiceType(VIDEO_SERVICES.includes(urlService) ? 'video' : 'audio'); }, 300);
  }

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!serviceType) { alert('Elegí un tipo de servicio primero.'); return; }
    if (serviceType === 'video' && !selectedFormPkg) { alert('Elegí un paquete de video.'); return; }
    if (!fechaInput.value || !horaSelect.value) { alert('Elegí una fecha y hora disponibles.'); return; }
    const aceptoEl = document.getElementById('acepto');
    if (aceptoEl && !aceptoEl.checked) { alert('Debés aceptar los términos y condiciones.'); return; }
    const f = e.target;
    let msg;
    if (serviceType === 'audio') {
      const hours = +audioHoursSlider.value;
      const total = hours * AUDIO_RATE;
      msg = `Reserva B House Music - Grabación de audio

Nombre: ${f.nombre.value}
Contacto: ${f.contacto.value}
Horas: ${hours}h
Estimado: ₡${total.toLocaleString('es-CR')}
Fecha: ${fechaInput.value}
Hora: ${horaSelect.value}

Política: cambios hasta 48h antes; después no hay reembolso.`;
    } else {
      const accesorios = Array.from(accInputs).filter(c => c.checked).map(c => c.value).join(', ') || '—';
      msg = `Reserva B House Music - Video

Nombre: ${f.nombre.value}
Contacto: ${f.contacto.value}
Paquete: ${selectedFormPkg}
Accesorios: ${accesorios}
Fecha: ${fechaInput.value}
Hora: ${horaSelect.value}
Adelanto: 50% (SINPE 7016-6631)

Política: cambios hasta 48h antes; después no hay reembolso.`;
    }
    try {
      const serviceInfoRaw = sessionStorage.getItem('bhServiceInfo');
      if (serviceInfoRaw) {
        const info = JSON.parse(serviceInfoRaw);
        msg += `\n\nDetalles de ${info.service}:\n${info.lines.join('\n')}`;
        sessionStorage.removeItem('bhServiceInfo');
      }
    } catch (e) { /* si falla el parseo, seguimos sin los detalles extra */ }
    window.open(`https://wa.me/50670166631?text=${encodeURIComponent(msg)}`, '_blank');
  });
}


/* ============ MINI PLAYER (all pages) ============ */
const playerLauncher = document.getElementById('playerLauncher');
const playerBar = document.getElementById('playerBar');
if (playerLauncher && playerBar && typeof CONFIG !== 'undefined' && CONFIG.playerTracks && CONFIG.playerTracks.length) {
  const tracks = CONFIG.playerTracks.slice(0, 10);
  const playerThumb = document.getElementById('playerThumb');
  const playerTrackTitle = document.getElementById('playerTrackTitle');
  const playerTrackArtist = document.getElementById('playerTrackArtist');
  const playerToggle = document.getElementById('playerToggle');
  const playerIconPlay = document.getElementById('playerIconPlay');
  const playerIconPause = document.getElementById('playerIconPause');
  const playerPrev = document.getElementById('playerPrev');
  const playerNext = document.getElementById('playerNext');
  const playerClose = document.getElementById('playerClose');

  let ytPlayer = null;
  let ytReady = false;
  let currentIndex = parseInt(sessionStorage.getItem('bhPlayerIndex') || '0', 10);
  if (isNaN(currentIndex) || currentIndex < 0 || currentIndex >= tracks.length) currentIndex = 0;
  let wantsPlaying = sessionStorage.getItem('bhPlayerPlaying') === '1';
  let barOpen = sessionStorage.getItem('bhPlayerOpen') === '1';

  function renderTrackInfo() {
    const t = tracks[currentIndex];
    playerThumb.src = `https://i.ytimg.com/vi/${t.id}/hqdefault.jpg`;
    playerTrackTitle.textContent = t.title;
    playerTrackArtist.textContent = t.artist;
  }
  function setPlayingUI(isPlaying) {
    if (isPlaying) { playerIconPlay.classList.add('hidden'); playerIconPause.classList.remove('hidden'); }
    else { playerIconPlay.classList.remove('hidden'); playerIconPause.classList.add('hidden'); }
  }
  function showBar() {
    playerBar.classList.remove('hidden');
    playerBar.classList.add('flex');
    barOpen = true;
    sessionStorage.setItem('bhPlayerOpen', '1');
  }
  function hideBar() {
    playerBar.classList.add('hidden');
    playerBar.classList.remove('flex');
    barOpen = false;
    sessionStorage.setItem('bhPlayerOpen', '0');
    if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
    wantsPlaying = false;
    sessionStorage.setItem('bhPlayerPlaying', '0');
    setPlayingUI(false);
  }

  function loadTrack(index, autoplay) {
    currentIndex = ((index % tracks.length) + tracks.length) % tracks.length;
    sessionStorage.setItem('bhPlayerIndex', String(currentIndex));
    renderTrackInfo();
    if (ytReady && ytPlayer) {
      ytPlayer.loadVideoById(tracks[currentIndex].id);
      if (!autoplay) ytPlayer.pauseVideo();
    }
  }

  function initYT() {
    if (ytReady) return;
    ytPlayer = new YT.Player('ytHiddenPlayer', {
      height: '1', width: '1',
      videoId: tracks[currentIndex].id,
      playerVars: { autoplay: wantsPlaying ? 1 : 0, controls: 0, playsinline: 1 },
      events: {
        onReady: () => {
          ytReady = true;
          const savedTime = parseFloat(sessionStorage.getItem('bhPlayerTime') || '0');
          if (savedTime > 0) ytPlayer.seekTo(savedTime, true);
          if (wantsPlaying) { ytPlayer.playVideo(); } else { ytPlayer.pauseVideo(); }
        },
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.PLAYING) { wantsPlaying = true; sessionStorage.setItem('bhPlayerPlaying','1'); setPlayingUI(true); }
          else if (e.data === YT.PlayerState.PAUSED) { wantsPlaying = false; sessionStorage.setItem('bhPlayerPlaying','0'); setPlayingUI(false); }
          else if (e.data === YT.PlayerState.ENDED) { loadTrack(currentIndex + 1, true); }
        }
      }
    });
  }

  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) { initYT(); return; }
    if (document.getElementById('yt-iframe-api')) return; // already loading
    const tag = document.createElement('script');
    tag.id = 'yt-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = initYT;
  }

  renderTrackInfo();
  if (barOpen) showBar();

  playerLauncher.addEventListener('click', () => {
    if (playerBar.classList.contains('hidden')) {
      showBar();
      loadYouTubeAPI();
    } else {
      hideBar();
    }
  });
  playerClose.addEventListener('click', hideBar);
  playerToggle.addEventListener('click', () => {
    if (!ytReady) { loadYouTubeAPI(); wantsPlaying = true; sessionStorage.setItem('bhPlayerPlaying','1'); setPlayingUI(true); return; }
    if (wantsPlaying) ytPlayer.pauseVideo(); else ytPlayer.playVideo();
  });
  playerPrev.addEventListener('click', () => loadTrack(currentIndex - 1, wantsPlaying));
  playerNext.addEventListener('click', () => loadTrack(currentIndex + 1, wantsPlaying));

  // If it was open + playing on a previous page, reconnect automatically
  if (barOpen) loadYouTubeAPI();

  // Periodically persist playback position so the next page resumes close to where you left off
  setInterval(() => {
    if (ytReady && ytPlayer && ytPlayer.getCurrentTime) {
      sessionStorage.setItem('bhPlayerTime', String(ytPlayer.getCurrentTime()));
    }
  }, 1500);
}


/* ============ LEGAL MODAL (all pages) ============ */
const openLegalModal = document.getElementById('openLegalModal');
const legalModal = document.getElementById('legalModal');
if (openLegalModal && legalModal) {
  const legalModalClose = document.getElementById('legalModalClose');
  const legalTabs = document.querySelectorAll('.legal-tab-btn');
  const legalContents = { terminos: document.getElementById('legalTerminos'), privacidad: document.getElementById('legalPrivacidad') };
  openLegalModal.addEventListener('click', () => {
    legalModal.classList.remove('hidden'); legalModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  });
  function closeLegalModal() {
    legalModal.classList.add('hidden'); legalModal.classList.remove('flex');
    document.body.style.overflow = '';
  }
  if (legalModalClose) legalModalClose.addEventListener('click', closeLegalModal);
  legalModal.addEventListener('click', (e) => { if (e.target === legalModal) closeLegalModal(); });
  legalTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      legalTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Object.values(legalContents).forEach(c => c && c.classList.add('hidden'));
      const target = legalContents[btn.dataset.tab];
      if (target) target.classList.remove('hidden');
    });
  });
}

/* ============ CHATBOT (all pages) ============ */
const chatBubble = document.getElementById('chatBubble');
const chatPanel = document.getElementById('chatPanel');
if (chatBubble && chatPanel && typeof CONFIG !== 'undefined') {
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatQuickReplies = document.getElementById('chatQuickReplies');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const iconOpen = document.getElementById('chatIconOpen');
  const iconClose = document.getElementById('chatIconClose');
  const WA_BASE = 'https://wa.me/50670166631?text=';

  const CHAT_MENU = {
    'Grabación 🎙️': [
      '¿Cuánto cuesta una sesión de grabación?',
      '¿Hacen mezcla y masterización?',
      '¿Cuánto tiempo toma grabar una canción?',
      '¿Puedo usar mi propio beat?',
      '¿Hay sesiones entre semana?',
      '¿Cuántas revisiones de mezcla incluye?',
    ],
    'Video y fotografía 🎬': [
      '¿Pueden hacer mi videoclip?',
      '¿El drone está disponible en todos los paquetes?',
      '¿Qué cámara y lentes usan?',
      '¿Puedo contratar fotografía también?',
      '¿Puedo grabar los fines de semana?',
      '¿Cuánto cuesta una hora adicional en las sesiones de video?',
    ],
    'Reservas y pagos 💳': [
      '¿Se necesita depósito para reservar?',
      '¿Puedo pagar por SINPE Móvil?',
      '¿Puedo reprogramar mi cita?',
      '¿Puedo cancelar mi reserva?',
      '¿Qué pasa si llego tarde?',
      '¿Cobran extra por salir del GAM?',
    ],
    'Estudio 🏠': [
      '¿Puedo traer amigos a la sesión?',
      '¿Se puede fumar en el estudio?',
      '¿Hay parqueo disponible?',
      '¿Dónde está ubicado el estudio?',
      '¿Los menores de edad pueden grabar?',
      '¿Con qué géneros trabajan?',
    ],
  };
  let currentCategory = null;

  const STOPWORDS = new Set(['de','la','el','en','y','a','un','una','que','se','con','para','los','las','es','mi','tu','al','o','del','me','si','puedo','como','cómo','qué','cuál','cuánto','cuánta']);
  function tokenize(str) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[¿?¡!.,]/g,'').split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w));
  }
  function findBestAnswer(query) {
    const qTokens = tokenize(query);
    if (!qTokens.length) return null;
    let best = null, bestScore = 0;
    CONFIG.faq.forEach(([q,a]) => {
      const bank = tokenize(q + ' ' + a);
      let score = 0;
      qTokens.forEach(t => { if (bank.includes(t)) score++; });
      if (score > bestScore) { bestScore = score; best = a; }
    });
    return bestScore >= 1 ? best : null;
  }

  function addMessage(text, from='bot') {
    const row = document.createElement('div');
    row.className = from === 'bot' ? 'flex justify-start' : 'flex justify-end';
    const bubble = document.createElement('div');
    bubble.className = from === 'bot'
      ? 'max-w-[85%] bg-white/8 rounded-2xl rounded-tl-sm px-4 py-2.5 text-bone/90'
      : 'max-w-[85%] bg-bone text-ink rounded-2xl rounded-tr-sm px-4 py-2.5';
    bubble.textContent = text;
    row.appendChild(bubble);
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addWhatsappHandoff(query) {
    const row = document.createElement('div');
    row.className = 'flex justify-start';
    const a = document.createElement('a');
    a.href = WA_BASE + encodeURIComponent('Hola, tengo una pregunta: ' + query);
    a.target = '_blank'; a.rel = 'noopener';
    a.className = 'text-xs font-semibold underline decoration-bone/40 hover:decoration-bone text-bone/70';
    a.textContent = 'Escribir a B House Music por WhatsApp →';
    row.appendChild(a);
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function makeChip(label, onClick, variant='default') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = variant === 'back'
      ? 'font-mono text-[11px] uppercase tracking-widest px-3 py-2 rounded-full border border-bone/25 text-bone/60 hover:border-bone/50 transition-colors'
      : 'font-mono text-[11px] uppercase tracking-wide px-3.5 py-2 rounded-full border border-bone/20 text-bone/80 hover:border-bone/50 hover:text-bone transition-colors';
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function renderMenu() {
    chatQuickReplies.innerHTML = '';
    if (!currentCategory) {
      Object.keys(CHAT_MENU).forEach(cat => {
        chatQuickReplies.appendChild(makeChip(cat, () => selectCategory(cat)));
      });
    } else {
      chatQuickReplies.appendChild(makeChip('← Temas', () => { currentCategory = null; renderMenu(); }, 'back'));
      CHAT_MENU[currentCategory].forEach(q => {
        chatQuickReplies.appendChild(makeChip(q.replace(/¿|\?/g,''), () => handleUserQuery(q)));
      });
    }
  }

  function selectCategory(cat) {
    currentCategory = cat;
    const cleanCat = cat.replace(/\s*[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,'').trim();
    addMessage(cleanCat, 'user');
    setTimeout(() => {
      addMessage(`Estas son las preguntas más comunes sobre ${cleanCat.toLowerCase()}. Tocá una, o escribí la tuya abajo.`, 'bot');
      renderMenu();
    }, 250);
  }

  function handleUserQuery(query) {
    addMessage(query, 'user');
    const answer = findBestAnswer(query);
    setTimeout(() => {
      if (answer) {
        addMessage(answer, 'bot');
      } else {
        addMessage('No tengo esa respuesta a la mano, pero el equipo de B House Music te puede ayudar directamente 🙌', 'bot');
        addWhatsappHandoff(query);
      }
      renderMenu();
    }, 350);
  }

  let chatStarted = false;
  function openChat() {
    chatPanel.classList.remove('hidden');
    chatPanel.classList.add('flex');
    chatBubble.setAttribute('aria-label','Cerrar chat');
    if (iconOpen) iconOpen.classList.add('hidden');
    if (iconClose) iconClose.classList.remove('hidden');
    if (!chatStarted) {
      chatStarted = true;
      addMessage('¡Hola! 👋 Soy el asistente de B House Music. Elegí un tema o escribí tu pregunta.');
      renderMenu();
    }
    chatInput.focus();
  }
  function closeChat() {
    chatPanel.classList.add('hidden');
    chatPanel.classList.remove('flex');
    chatBubble.setAttribute('aria-label','Abrir chat de ayuda');
    if (iconOpen) iconOpen.classList.remove('hidden');
    if (iconClose) iconClose.classList.add('hidden');
  }
  chatBubble.addEventListener('click', () => {
    chatPanel.classList.contains('hidden') ? openChat() : closeChat();
  });
  if (chatCloseBtn) chatCloseBtn.addEventListener('click', closeChat);
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatInput.value.trim();
      if (!val) return;
      handleUserQuery(val);
      chatInput.value = '';
    });
  }
}
