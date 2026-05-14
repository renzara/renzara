  // ========== PAGE LOADER ==========
  window.addEventListener('load', () => {
    const loader = document.querySelector('.page-loader');
    if (loader) {
      setTimeout(() => loader.classList.add('loaded'), 400);
      setTimeout(() => loader.remove(), 1000);
    }
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
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
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
