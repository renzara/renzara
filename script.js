  // ========== PAGE LOADER ==========
  // Phase 1 only — outlines fade in
  window.addEventListener('load', () => {
    const loader = document.getElementById('pageLoader');
    if (!loader) return;

    const wordmark = loader.querySelector('.loader-wordmark');
    if (!wordmark) return;

    const minTime = 12000;
    let ready = false;
    const remaining = Math.max(0, minTime - performance.now());
    setTimeout(() => { ready = true; }, remaining);

    wordmark.addEventListener('animationiteration', () => {
      if (!ready) return;
      const iterFromStart = Math.round((performance.now() - 800) / 3000);
      if (iterFromStart % 2 === 0) {
        loader.classList.add('rushing');
        document.getElementById('hero')?.classList.add('hero-active');
        setTimeout(() => {
          loader.classList.add('done');
          document.querySelectorAll('.nav-logo, .nav-links, .nav-cta, .hamburger').forEach(el => {
            el.style.animation = 'heroUp 0.8s var(--ease) forwards';
          });
          setTimeout(() => loader.remove(), 500);
        }, 2500);
      }
    });
  });



  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const overlayLinks = document.querySelectorAll('.overlay-links a');
  const previewCards = document.querySelectorAll('.preview-card');

  function toggleMenu() {
    const isOpen = nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
    if (!isOpen) setActivePreview('default');
  }

  hamburger.addEventListener('click', toggleMenu);

  overlayLinks.forEach(link => {
    link.addEventListener('mouseenter', () => setActivePreview(link.dataset.preview));
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
      setActivePreview('default');
    });
  });

  document.querySelector('.overlay-left')?.addEventListener('mouseleave', () => {
    setActivePreview('default');
  });

  function setActivePreview(name) {
    previewCards.forEach(card => {
      card.classList.toggle('active', card.dataset.preview === name);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) toggleMenu();
  });

  const onScroll = () => {
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ========== HERO SCROLL ZOOM-OUT (desktop only) ==========
  (function () {
    const hero = document.getElementById('hero');
    const heroInner = hero ? hero.querySelector('.hero-inner') : null;
    if (!hero || !heroInner) return;

    const desktopQuery = window.matchMedia('(min-width: 821px)');
    let ticking = false;

    function applyZoom() {
      ticking = false;
      if (!desktopQuery.matches) {
        heroInner.style.transform = '';
        heroInner.style.opacity = '';
        return;
      }
      const heroHeight = hero.offsetHeight;
      const scrollY = window.scrollY;
      if (scrollY <= 0) {
        heroInner.style.transform = '';
        heroInner.style.opacity = '';
        return;
      }
      const progress = Math.min(scrollY / heroHeight, 1);
      const scale = 1 - progress * 0.15;
      const opacity = 1 - progress * 0.4;
      heroInner.style.transform = 'scale(' + scale + ')';
      heroInner.style.opacity = opacity;
    }

    function onHeroScroll() {
      if (!ticking) {
        requestAnimationFrame(applyZoom);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onHeroScroll, { passive: true });
    desktopQuery.addEventListener('change', applyZoom);
  })();

  // ========== HERO RE-REVEAL ON SCROLL BACK ==========
  (function () {
    const hero = document.getElementById('hero');
    if (!hero) return;
    let firstRevealDone = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!firstRevealDone) {
          if (hero.classList.contains('hero-active')) firstRevealDone = true;
          return;
        }
        if (entry.isIntersecting) {
          hero.classList.add('hero-active', 'hero-revisit');
        } else {
          hero.classList.remove('hero-active', 'hero-revisit');
        }
      });
    }, { threshold: 0.15 });

    observer.observe(hero);
  })();


  function updateLiveTime() {
    const el = document.getElementById('liveTime');
    if (!el) return;
    const now = new Date();
    const londonTime = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London',
      hour12: false
    }).format(now);
    el.textContent = londonTime + ' GMT';
  }
  updateLiveTime();
  setInterval(updateLiveTime, 30000);

  // ========== CONTACT FORM ==========
  // Pill selection (desktop) and select dropdown (mobile/tablet) both sync to hidden 'interest' field
  const letterPills = document.querySelectorAll('#letterPills .letter-pill');
  const letterSelect = document.getElementById('letterSelect');
  const interestField = document.getElementById('interestField');

  letterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      letterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      interestField.value = pill.dataset.value;
      if (letterSelect) letterSelect.value = pill.dataset.value;
    });
  });

  if (letterSelect) {
    letterSelect.addEventListener('change', () => {
      interestField.value = letterSelect.value;
      letterPills.forEach(p => {
        p.classList.toggle('active', p.dataset.value === letterSelect.value);
      });
    });
  }

  // Live "Open now" vs "Back tomorrow" status
  function updateContactStatus() {
    const el = document.getElementById('contactStatus');
    if (!el) return;
    const london = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' }));
    const day = london.getDay(); // 0 Sun, 1 Mon, ..., 6 Sat
    const hour = london.getHours();
    const isWeekday = day >= 1 && day <= 5;
    const isOpen = isWeekday && hour >= 9 && hour < 18;

    if (isOpen) {
      el.textContent = 'Open now';
      el.style.opacity = '1';
    } else {
      let nextOpen = 'Monday';
      if (isWeekday && hour < 9) nextOpen = 'today at 9:00';
      else if (day === 5 && hour >= 18) nextOpen = 'Monday at 9:00';
      else if (day === 6) nextOpen = 'Monday at 9:00';
      else if (day === 0) nextOpen = 'tomorrow at 9:00';
      else if (isWeekday && hour >= 18) nextOpen = 'tomorrow at 9:00';
      el.textContent = 'Back ' + nextOpen;
      el.style.opacity = '0.7';
    }
  }
  updateContactStatus();
  setInterval(updateContactStatus, 60000);

  // Form submission via Formspree (preserves old endpoint)
  async function handleLetterSubmit(e) {
    e.preventDefault();
    const form = document.getElementById('letterForm');
    const btn = document.getElementById('letterSubmitBtn');
    const success = document.getElementById('letterSuccess');
    const error = document.getElementById('letterError');

    success.classList.remove('show');
    error.classList.remove('show');

    // Require interest selection
    if (!interestField.value) {
      error.textContent = 'Please select what you\'re reaching out about.';
      error.classList.add('show');
      return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch('https://formsubmit.co/ajax/hello@renzaracreative.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });
      if (res.ok) {
        success.classList.add('show');
        form.reset();
        letterPills.forEach(p => p.classList.remove('active'));
        interestField.value = '';
        if (letterSelect) letterSelect.value = '';
      } else {
        error.classList.add('show');
      }
    } catch (err) {
      error.classList.add('show');
    }

    btn.innerHTML = originalText;
    btn.disabled = false;
  }

  // ========== BACK TO TOP ==========
  const backToTopBtn = document.getElementById('backToTop');
  const floatingTop = document.getElementById('floatingTop');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if (floatingTop) {
    floatingTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', () => {
      if (window.scrollY > window.innerHeight) floatingTop.classList.add('visible');
      else floatingTop.classList.remove('visible');
    }, { passive: true });
  }

  // ========== MODAL SYSTEM (services + talent) ==========
  const modalOverlay = document.getElementById('modalOverlay');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');

  function openModal(key) {
    const tmpl = document.getElementById('tmpl-' + key);
    if (!tmpl || !modalOverlay || !modalContent) return;
    modalContent.innerHTML = '';
    modalContent.appendChild(tmpl.content.cloneNode(true));
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    // Clear content after the transition finishes
    setTimeout(() => { if (modalContent) modalContent.innerHTML = ''; }, 400);
  }

  // Wire up all modal-trigger elements
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(trigger.dataset.modal);
    });
  });

  // Close button
  if (modalClose) modalClose.addEventListener('click', closeModal);

  // Close when clicking overlay (but not the modal itself)
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Modal CTAs inside the modal that should close the modal first (e.g., "Start a brief" → #contact)
  if (modalContent) {
    modalContent.addEventListener('click', (e) => {
      const cta = e.target.closest('[data-close-modal]');
      if (cta) {
        closeModal();
        // If it's an internal anchor like #contact, smoothly scroll after closing
        const href = cta.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          setTimeout(() => {
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          }, 200);
        }
      }
    });
  }

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });

  // ========== SCROLL REVEAL ==========
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  // ========== ABOUT SECTION WIPE ==========
  (function () {
    const about = document.getElementById('about');
    if (!about) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) about.classList.add('wipe-in');
        else about.classList.remove('wipe-in');
      });
    }, { threshold: 0.15 });
    observer.observe(about);
  })();

  // ========== FOOTER GARAGE DOOR ==========
  (function () {
    const footer = document.getElementById('siteFooter');
    if (!footer) return;
    const panels = footer.querySelectorAll('.garage-panel');
    if (!panels.length) return;
    let ticking = false;

    function updatePanels() {
      ticking = false;
      const rect = footer.getBoundingClientRect();
      const viewH = window.innerHeight;

      const entered = viewH - rect.top;
      const step = viewH * 0.12;

      panels.forEach((panel, i) => {
        const threshold = i * step;
        if (entered > threshold) panel.classList.add('open');
        else panel.classList.remove('open');
      });
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updatePanels);
        ticking = true;
      }
    }, { passive: true });
    updatePanels();
  })();

  // ========== TALENT CARDS SPREAD/GATHER ==========
  (function () {
    const talent = document.getElementById('talent');
    if (!talent) return;
    const cards = talent.querySelectorAll('.talent-card');
    if (cards.length < 2) return;
    let ticking = false;
    const maxOffset = 120;

    function applySpread() {
      ticking = false;
      const rect = talent.getBoundingClientRect();
      const viewH = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const viewCenter = viewH / 2;
      const dist = Math.abs(center - viewCenter);
      const maxDist = viewH / 2 + rect.height / 2;
      const progress = Math.min(dist / maxDist, 1);
      const offset = progress * maxOffset;

      cards[0].style.transform = 'translateX(' + (-offset) + 'px)';
      cards[1].style.transform = 'translateX(' + offset + 'px)';
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(applySpread);
        ticking = true;
      }
    }, { passive: true });
    applySpread();
  })();

  // ========== DOT MATRIX WAVE ==========
  document.querySelectorAll('.dot-matrix').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const dir = canvas.dataset.direction === 'left' ? -1 : 1;
    const gap = 18;
    const baseRadius = 1.5;
    let cols, rows, w, h;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width * devicePixelRatio;
      h = canvas.height = rect.height * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      cols = Math.floor(rect.width / gap);
      rows = Math.floor(rect.height / gap);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      const realW = w / devicePixelRatio;
      const realH = h / devicePixelRatio;
      const padX = (realW - (cols - 1) * gap) / 2;
      const padY = (realH - (rows - 1) * gap) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = padX + c * gap;
          const y = padY + r * gap;
          const wave = Math.sin((c / cols) * Math.PI * 2 + (t * 0.0008 * dir)) *
                       Math.cos((r / rows) * Math.PI + (t * 0.0006));
          const brightness = 0.15 + Math.abs(wave) * 0.55;
          const radius = baseRadius + Math.abs(wave) * 1.2;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(212, 240, 80, ' + brightness + ')';
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  });
