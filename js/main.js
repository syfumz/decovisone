/* js/main.js
   Dipindahkan dari <script> inline.
   Dijalankan dengan <script src="js/main.js" defer></script>
*/

(() => {
  'use strict';

  /* ===== helper safe query ===== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ===== SPLASH ===== */
  const splash = $('#splash');
  const skipBtn = $('#skipSplash');

  let splashTimeout = null;
  if (splash && skipBtn) {
    // blok scrolling saat splash aktif
    document.body.style.overflow = 'hidden';

    const hideSplash = () => {
      splash.classList.add('hidden');
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
    };

    splashTimeout = setTimeout(hideSplash, 3000);
    skipBtn.addEventListener('click', () => { clearTimeout(splashTimeout); hideSplash(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !splash.classList.contains('hidden')) {
        clearTimeout(splashTimeout);
        hideSplash();
      }
    });
  }

  /* ===== NAV BURGER ===== */
  const burger = $('#burgerBtn');
  const navLinks = $('.nav-links');

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const isOpen = navLinks.style.display === 'flex';
      if (isOpen) {
        navLinks.style.display = 'none';
      } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'fixed';
        navLinks.style.top = '64px';
        navLinks.style.right = '16px';
        navLinks.style.background = 'rgba(29,60,106,0.98)';
        navLinks.style.padding = '12px';
        navLinks.style.borderRadius = '8px';
        navLinks.style.zIndex = '1300';
      }
    });

    $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
      if (window.innerWidth < 900) navLinks.style.display = 'none';
    }));
  }

  /* ===== REVEAL ON SCROLL ===== */
  try {
    const revealEls = $$('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
      }, { threshold: 0.18 });
      revealEls.forEach(el => revealObserver.observe(el));
    } else {
      // fallback: show all
      revealEls.forEach(el => el.classList.add('show'));
    }
// Targeted fallback for some Android/older WebViews: if the students section
    // still didn't get revealed after a short delay, force it visible so group
    // members are not hidden. This avoids disabling reveal animations globally.
    setTimeout(() => {
      try {
        const studentsSection = document.getElementById('students');
        if (studentsSection && !studentsSection.classList.contains('show')) {
          studentsSection.classList.add('show');
        }
      } catch (err) {
        // ignore
      }
    }, 700);
  } catch (err) {
    // don't break if anything goes wrong here
    // console.warn(err);
  }

  /* ===== LIGHTBOX ALBUM ===== */
  const galleryImgs = $$('.gallery-grid img');
  const lightbox = $('#lightbox');
  const lbImage = $('#lbImage');
  const lbCaption = $('#lbCaption');
  let currentIndex = 0;

  function openLightbox(index) {
  if (!galleryImgs.length || !lightbox || !lbImage || !lbCaption) return;

  currentIndex = index;
  const img = galleryImgs[index];

  lbImage.src = img.src;
  lbImage.alt = img.alt || `image ${index + 1}`;

  // 🔥 pakai data-caption
  lbCaption.textContent = img.dataset.caption || '';

  lightbox.classList.add('visible');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}


  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('visible');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }


  if (galleryImgs.length && lightbox && lbImage && lbCaption) {
    galleryImgs.forEach((img, idx) => img.addEventListener('click', () => openLightbox(idx)));

    const lbClose = $('#lbClose');

    lbClose && lbClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (ev) => { if (ev.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (ev) => {
      if (!lightbox.classList.contains('visible')) return;
      if (ev.key === 'Escape') closeLightbox();
    });

    // TOUCH SWIPE for lightbox (basic)
    let touchStartX = 0;
    let touchEndX = 0;
    const lbFrame = document.querySelector('.frame');
    if (lbFrame) {
      lbFrame.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
      lbFrame.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (Math.abs(touchEndX - touchStartX) > 40) {
          if (touchEndX < touchStartX) showNext(); else showPrev();
        }
      }, { passive: true });
    }
  }

  /* ===== AUDIO MINIMIZED (FAB) ===== */
  const audio = $('#bgAudio');
  const audioFab = $('#audioFab');
  const audioPanel = $('#audioPanel');
  const playBtn = $('#playBtn');
  const muteBtn = $('#muteBtn');
  const volRange = $('#volRange');
  const audioClose = $('#audioClose');

  if (audio) {
    audio.volume = parseFloat((volRange && volRange.value) || 0.12);

    // attempt autoplay (may be blocked)
    //setTimeout(() => { audio.play().catch(() => {}); }, 500);
    
    // Play setelah interaksi pertama
const enableAudioOnce = () => {
  audio.play().catch(()=>{});
  document.removeEventListener('click', enableAudioOnce);
};
document.addEventListener('click', enableAudioOnce, { once:true });
  }

  let panelTimeout = null;
  let fabHideTimeout = null;

  function showPanel() {
    if (!audioPanel || !audioFab) return;
    audioPanel.classList.add('show');
    audioPanel.setAttribute('aria-hidden', 'false');
    audioFab.classList.remove('hidden');
    clearTimeout(panelTimeout);
    panelTimeout = setTimeout(() => {
      audioPanel.classList.remove('show');
      audioPanel.setAttribute('aria-hidden', 'true');
      hideFabAfterDelay();
    }, 6000);
  }

  function hideFabAfterDelay() {
    if (!audioFab) return;
    clearTimeout(fabHideTimeout);
    fabHideTimeout = setTimeout(() => { audioFab.classList.add('hidden'); }, 4500);
  }

  if (audioFab && audioPanel) {
    audioFab.addEventListener('click', (e) => {
      if (audioPanel.classList.contains('show')) {
        audioPanel.classList.remove('show');
        audioPanel.setAttribute('aria-hidden', 'true');
        hideFabAfterDelay();
      } else {
        showPanel();
      }
    });
  }

  if (audioClose && audioPanel) {
    audioClose.addEventListener('click', () => {
      audioPanel.classList.remove('show');
      audioPanel.setAttribute('aria-hidden', 'true');
      hideFabAfterDelay();
    });
  }

  function setPlayIcon(isPlaying) {
    if (!playBtn) return;
    playBtn.innerHTML = isPlaying ? '<i class="fa fa-pause"></i>' : '<i class="fa fa-play"></i>';
  }

  function setMuteIcon(muted) {
    if (!muteBtn) return;
    muteBtn.innerHTML = muted ? '<i class="fa fa-volume-xmark"></i>' : '<i class="fa fa-volume-high"></i>';
  }

  if (playBtn && audio) {
    playBtn.addEventListener('click', async () => {
      if (audio.paused) {
        try { await audio.play(); setPlayIcon(true); } catch (e) { setPlayIcon(false); }
      } else {
        audio.pause();
        setPlayIcon(false);
      }
      showPanel();
    });
  }

  if (muteBtn && audio) {
    muteBtn.addEventListener('click', () => {
      audio.muted = !audio.muted;
      setMuteIcon(audio.muted);
      showPanel();
    });
  }

  if (volRange && audio) {
    volRange.addEventListener('input', (e) => {
      audio.volume = parseFloat(e.target.value);
      if (audio.volume === 0) {
        audio.muted = true;
        setMuteIcon(true);
      } else {
        audio.muted = false;
        setMuteIcon(false);
      }
      showPanel();
    });
  }

  if (audio) {
    audio.addEventListener('play', () => setPlayIcon(true));
    audio.addEventListener('pause', () => setPlayIcon(false));
    setMuteIcon(audio.muted);
  }

  // initially flash the fab so user notices it, then hide
  setTimeout(() => { audioFab && audioFab.classList.remove('hidden'); hideFabAfterDelay(); }, 800);

  // keep fab visible if user interacts
  function userInteracted() { audioFab && audioFab.classList.remove('hidden'); hideFabAfterDelay(); }
  ['mousemove', 'touchstart', 'keydown', 'scroll'].forEach(evt => document.addEventListener(evt, userInteracted, { passive: true }));
if (window.innerWidth < 768) {
  ['touchstart','scroll'].forEach(evt =>
    document.addEventListener(evt, userInteracted, { passive:true })
  );
} else {
  document.addEventListener('mousemove', userInteracted);
}

  // hide panel when tapping outside
  document.addEventListener('click', (e) => {
    if (!audioPanel || !audioFab) return;
    if (!audioPanel.classList.contains('show')) return;
    const inside = audioPanel.contains(e.target) || audioFab.contains(e.target);
    if (!inside) {
      audioPanel.classList.remove('show');
      audioPanel.setAttribute('aria-hidden', 'true');
      hideFabAfterDelay();
    }
  });

  /* ===== Smooth scroll for nav links ===== */
  $$('.nav-links a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ===== GALLERY: smooth scroll + reveal via IntersectionObserver ===== */
  try {
    const galleryBtn = document.querySelector('.btn-gallery');
    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryBtn && galleryGrid) {
      // smooth scroll to gallery when button clicked
      galleryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        galleryGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });


      // reveal items when gallery section enters viewport using IntersectionObserver
      const items = Array.from(galleryGrid.querySelectorAll('.gallery-item'));
      const revealOnce = (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // stagger reveal based on index
            items.forEach((it, i) => {
              it.classList.remove('revealed');
              it.style.transitionDelay = `${i * 80}ms`;
              setTimeout(() => it.classList.add('revealed'), i * 80 + 50);
            });
            obs.unobserve(entry.target);
          }
        });
      };

      const obs = new IntersectionObserver(revealOnce, { root: null, threshold: 0.15 });
      obs.observe(galleryGrid);
    }
  } catch (e) {
    // non-critical
  }

  /* ===== EVENTS: modal interactivity ===== */
  const eventCards = $$('.event-card');
  const eventModal = $('#eventModal');
  const eventImg = $('#eventImg');
  const eventTitle = $('#eventTitle');
  const eventDate = $('#eventDate');
  const eventLocation = $('#eventLocation');
  const eventDesc = $('#eventDesc');
  const eventClose = $('#eventClose');


  function openEventCard(card) {
    if (!card || !eventModal) return;
    const title = card.dataset.title || '';
    const date = card.dataset.date || '';
    const img = card.dataset.img || card.querySelector('img')?.src || '';
    const desc = card.dataset.desc || '';
    const location = card.dataset.location || '';

    if (eventTitle) eventTitle.textContent = title;
    if (eventDate) eventDate.textContent = date;
    if (eventLocation) eventLocation.textContent = location;
    if (eventDesc) eventDesc.textContent = desc;
    if (eventImg) { eventImg.src = img; eventImg.alt = title || ''; }

    eventModal.classList.add('visible');
    eventModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

function openEventModal() {
  document.body.classList.add('modal-open');
}

function closeEventModal() {
  document.body.classList.remove('modal-open');
}

    // Add-to-calendar feature removed; keep modal open logic only.
  }

  function closeEventModal() {
    if (!eventModal) return;
    eventModal.classList.remove('visible');
    eventModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (eventCards.length) {
    eventCards.forEach(c => {
      c.addEventListener('click', () => openEventCard(c));
      c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openEventCard(c); });
    });
  }

  eventClose && eventClose.addEventListener('click', closeEventModal);
  eventModal && eventModal.addEventListener('click', (ev) => { if (ev.target === eventModal) closeEventModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && eventModal && eventModal.classList.contains('visible')) closeEventModal(); });

  /* ===== STUDENT CARD: modal preview ===== */
  const studentCardsAll = $$('.student');
  const studentModal = $('#studentModal');
  const studentImgEl = $('#studentImg');
  const studentNameEl = $('#studentName');
  const studentJabatanEl = $('#studentJabatan');
  const studentBioEl = $('#studentBio');
  const studentCloseBtn = $('#studentClose');

  function openStudentCard(card) {
    if (!card || !studentModal) return;
    const img = card.querySelector('img.photo');
    const name = card.querySelector('h3')?.textContent || '';
    const jabatan = card.querySelector('h5')?.textContent || '';
    const bio = card.querySelector('.quote')?.textContent || '';
    if (studentImgEl && img) { studentImgEl.src = img.src; studentImgEl.alt = img.alt || name; }
    if (studentNameEl) studentNameEl.textContent = name;
    if (studentJabatanEl) studentJabatanEl.textContent = jabatan;
    if (studentBioEl) studentBioEl.textContent = bio;
    // show modal and let CSS animate entrance
    studentModal.classList.remove('hiding');
    studentModal.classList.add('visible');
    studentModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeStudentModal() {
    if (!studentModal) return;
    // play hide animation then remove visibility
    studentModal.classList.add('hiding');
    setTimeout(() => {
      studentModal.classList.remove('visible');
      studentModal.classList.remove('hiding');
      studentModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }, 320);
  }

  if (studentCardsAll.length) {
    studentCardsAll.forEach(c => {
      c.addEventListener('click', () => openStudentCard(c));
      c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openStudentCard(c); });
    });
  }

  studentCloseBtn && studentCloseBtn.addEventListener('click', closeStudentModal);
  studentModal && studentModal.addEventListener('click', (ev) => { if (ev.target === studentModal) closeStudentModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && studentModal && studentModal.classList.contains('visible')) closeStudentModal(); });

  // Add an explicit "Lihat Profil" button into each student card (helps mobile discoverability)
  try {
    studentCardsAll.forEach(card => {
      const content = card.querySelector('.content');
      if (!content) return;
      // avoid adding twice
      if (content.querySelector('.btn-view')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-view';
      btn.textContent = 'Lihat Profil';
      btn.addEventListener('click', (ev) => { ev.stopPropagation(); openStudentCard(card); });
      // make keyboard users focus the button before the card
      btn.setAttribute('aria-label', `Lihat profil ${card.querySelector('h3')?.textContent || 'siswa'}`);
      content.appendChild(btn);
    });
  } catch (e) {
    // non-critical
    // console.warn('Could not inject profile buttons', e);
  }

  /* ===== GALLERY: keyboard open (Enter/Space) ===== */
  if (galleryImgs.length) {
    galleryImgs.forEach((img, idx) => {
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(idx); }
      });
    });
  }

  /* ===== SCROLL TO TOP ===== */
  const scrollTopBtn = $('#scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) scrollTopBtn.classList.add('show'); else scrollTopBtn.classList.remove('show');
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

//pagination
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".gallery-item");
  const buttons = document.querySelectorAll(".page-btn");

  const itemsPerPage = 6;

  function showPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    items.forEach((item, index) => {
    item.classList.toggle('active', index >= start && index < end);
    });

    buttons.forEach(btn => btn.classList.remove("active"));
    document
      .querySelector(`.page-btn[data-page="${page}"]`)
      .classList.add("active");
  }

  // klik pagination
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const page = parseInt(btn.dataset.page);
      showPage(page);
    });
  });

  // default page 1
  showPage(1);
});

//lbCaption
const galleryItems = document.querySelectorAll(".gallery-item");
const captionBox = document.getElementById("galleryCaption");

galleryItems.forEach(item => {
  item.addEventListener("click", () => {
    const caption = item.dataset.caption;
    captionBox.textContent = caption || "";
  });
});



  /* ===== debug helpers (expose) ===== */
  window.__TKJ = {
    openLightbox: (i) => openLightbox(i || 0),
    closeLightbox,
    showNext,
    showPrev,
    openEventCard
  };

})();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

