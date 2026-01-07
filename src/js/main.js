/**
 * IMPAX Asset Management - Homepage JavaScript
 * Handles mobile carousel and interactions
 */

(function() {
  'use strict';

  // =============================================
  // MOBILE CAROUSEL
  // =============================================

  function initCarousel() {
    const grid = document.querySelector('.insights-grid');
    const carousel = document.querySelector('.insights-carousel');
    const carouselTrack = document.querySelector('.carousel-track');
    const dotsContainer = document.querySelector('.carousel-dots');
    const prevBtn = document.querySelector('.carousel-btn--prev');
    const nextBtn = document.querySelector('.carousel-btn--next');

    if (!grid || !carousel || !carouselTrack) return;

    // Clone cards from grid to carousel
    const cards = grid.querySelectorAll('.insight-card');
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      // Remove featured class styling for carousel uniformity
      clone.classList.remove('insight-card--featured');
      carouselTrack.appendChild(clone);
    });

    // Create dots
    const carouselCards = carouselTrack.querySelectorAll('.insight-card');
    carouselCards.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.addEventListener('click', () => scrollToCard(index));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    let currentIndex = 0;

    // Scroll to specific card
    function scrollToCard(index) {
      const card = carouselCards[index];
      if (!card) return;

      const trackRect = carouselTrack.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const scrollLeft = carouselTrack.scrollLeft + (cardRect.left - trackRect.left) - 24;

      carouselTrack.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }

    // Update active dot based on scroll position
    function updateActiveDot() {
      const scrollLeft = carouselTrack.scrollLeft;
      const cardWidth = carouselCards[0].offsetWidth + 16; // including gap
      const newIndex = Math.round(scrollLeft / cardWidth);

      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < carouselCards.length) {
        dots[currentIndex]?.classList.remove('active');
        dots[newIndex]?.classList.add('active');
        currentIndex = newIndex;
      }
    }

    // Navigation buttons
    prevBtn?.addEventListener('click', () => {
      const newIndex = Math.max(0, currentIndex - 1);
      scrollToCard(newIndex);
    });

    nextBtn?.addEventListener('click', () => {
      const newIndex = Math.min(carouselCards.length - 1, currentIndex + 1);
      scrollToCard(newIndex);
    });

    // Listen for scroll
    let scrollTimeout;
    carouselTrack.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveDot, 50);
    }, { passive: true });

    // Touch handling for momentum
    let startX;
    let scrollStart;

    carouselTrack.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX;
      scrollStart = carouselTrack.scrollLeft;
    }, { passive: true });
  }

  // =============================================
  // MOBILE MENU TOGGLE
  // =============================================

  function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('nav-links--open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // =============================================
  // MEGA MENU
  // =============================================

  function initMegaMenu() {
    const navItems = document.querySelectorAll('.nav-item.has-mega');
    const header = document.querySelector('.header');
    let closeTimeout;

    // Set mega menu top position based on header height
    function updateMegaMenuPosition() {
      const headerHeight = header?.offsetHeight || 100;
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }

    updateMegaMenuPosition();
    window.addEventListener('resize', updateMegaMenuPosition);

    navItems.forEach(item => {
      const button = item.querySelector('.nav-link');
      const megaMenu = item.querySelector('.mega-menu');

      // Open on hover
      item.addEventListener('mouseenter', () => {
        clearTimeout(closeTimeout);
        // Close other menus
        navItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            other.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
      });

      // Close on mouse leave with delay
      item.addEventListener('mouseleave', () => {
        closeTimeout = setTimeout(() => {
          item.classList.remove('active');
          button.setAttribute('aria-expanded', 'false');
        }, 150);
      });

      // Keep open when hovering mega menu
      megaMenu?.addEventListener('mouseenter', () => {
        clearTimeout(closeTimeout);
      });

      megaMenu?.addEventListener('mouseleave', () => {
        closeTimeout = setTimeout(() => {
          item.classList.remove('active');
          button.setAttribute('aria-expanded', 'false');
        }, 150);
      });

      // Toggle on click for touch devices
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = item.classList.toggle('active');
        button.setAttribute('aria-expanded', isOpen);

        // Close other menus
        if (isOpen) {
          navItems.forEach(other => {
            if (other !== item) {
              other.classList.remove('active');
              other.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
            }
          });
        }
      });
    });

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-item.has-mega')) {
        navItems.forEach(item => {
          item.classList.remove('active');
          item.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
        });
      }
    });

    // Close menus on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navItems.forEach(item => {
          item.classList.remove('active');
          item.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  // =============================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // =============================================

  function initScrollAnimations() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger the animation
          setTimeout(() => {
            entry.target.classList.add('animate-in');
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe insight cards
    document.querySelectorAll('.insight-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      observer.observe(card);
    });

    // Add styles for animation
    const style = document.createElement('style');
    style.textContent = `
      .insight-card.animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
        transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
    `;
    document.head.appendChild(style);
  }

  // =============================================
  // KEYBOARD NAVIGATION FOR CARDS
  // =============================================

  function initCardKeyboardNav() {
    const cards = document.querySelectorAll('.insight-card');

    cards.forEach(card => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'article');

      // Flip on Enter/Space for desktop
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();

          // Only flip on desktop
          if (window.innerWidth >= 1024) {
            const inner = card.querySelector('.card-inner');
            const isFlipped = inner.style.transform === 'rotateY(180deg)';
            inner.style.transform = isFlipped ? '' : 'rotateY(180deg)';
          } else {
            // On mobile/tablet, navigate to the link
            const link = card.querySelector('.card-cta');
            if (link) link.click();
          }
        }
      });
    });
  }

  // =============================================
  // HEADER SCROLL BEHAVIOR
  // =============================================

  function initHeaderScroll() {
    const header = document.querySelector('.header');
    const hero = document.querySelector('.hero');

    if (!header) return;

    function updateHeader() {
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;

      if (heroBottom <= 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader(); // Check initial state
  }

  // =============================================
  // HERO MOUSE PARALLAX
  // =============================================

  function initHeroParallax() {
    const hero = document.querySelector('.hero');
    const gradient = document.querySelector('.hero-gradient');
    const xGraphic = document.querySelector('.hero-x-graphic');

    if (!hero || !gradient) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationId;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate offset from center (-1 to 1)
      targetX = (e.clientX - rect.left - centerX) / centerX;
      targetY = (e.clientY - rect.top - centerY) / centerY;
    });

    hero.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    function animate() {
      // Smooth interpolation
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      // Apply subtle movement to gradient
      const gradientX = currentX * 20;
      const gradientY = currentY * 20;
      gradient.style.transform = `translate(${gradientX}px, ${gradientY}px)`;

      // Apply horizontal-only movement to X graphic (opposite direction for depth)
      if (xGraphic) {
        const xGraphicX = -currentX * 30;
        xGraphic.style.transform = `translateY(-50%) translateX(${xGraphicX}px)`;
      }

      animationId = requestAnimationFrame(animate);
    }

    animate();
  }

  // =============================================
  // EXPLORE SECTION SPLIT-SCREEN
  // =============================================

  function initExploreSection() {
    const navItems = document.querySelectorAll('.explore-nav-item');
    const panels = document.querySelectorAll('.explore-content-panel');

    if (!navItems.length || !panels.length) return;

    // Show panel
    function showPanel(targetId) {
      // Update nav items
      navItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-target') === targetId);
      });

      // Update panels
      panels.forEach(panel => {
        panel.classList.toggle('active', panel.getAttribute('data-panel') === targetId);
      });
    }

    // Nav item click handlers
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetId = item.getAttribute('data-target');
        showPanel(targetId);
      });

      // Also trigger on hover for desktop
      item.addEventListener('mouseenter', () => {
        if (window.innerWidth >= 1024) {
          const targetId = item.getAttribute('data-target');
          showPanel(targetId);
        }
      });
    });
  }

  // =============================================
  // CAPABILITIES TILES - MOUSE PARALLAX ON X
  // =============================================

  function initCapabilitiesParallax() {
    const tiles = document.querySelectorAll('.strategy-tile--fixed-income, .strategy-tile--equities, .strategy-tile--private');

    if (!tiles.length) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    tiles.forEach(tile => {
      const patternX = tile.querySelector('.pattern-x');
      if (!patternX) return;

      // Store base rotation from CSS
      const computedStyle = window.getComputedStyle(patternX);
      const matrix = computedStyle.transform;
      let baseRotation = 0;

      // Extract rotation from transform matrix if exists
      if (matrix && matrix !== 'none') {
        const values = matrix.split('(')[1]?.split(')')[0]?.split(',');
        if (values && values.length >= 2) {
          baseRotation = Math.round(Math.atan2(parseFloat(values[1]), parseFloat(values[0])) * (180 / Math.PI));
        }
      }

      let currentX = 0;
      let currentY = 0;
      let targetX = 0;
      let targetY = 0;
      let animationId = null;
      let isHovering = false;

      function animate() {
        if (!isHovering) {
          // Ease back to center
          targetX = 0;
          targetY = 0;
        }

        // Smooth interpolation
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        // Apply transform with base rotation preserved
        const moveX = currentX * 40;
        const moveY = currentY * 25;
        patternX.style.transform = `rotate(${baseRotation}deg) translate(${moveX}px, ${moveY}px)`;

        // Continue animating if still moving
        if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
          animationId = requestAnimationFrame(animate);
        } else {
          animationId = null;
        }
      }

      tile.addEventListener('mouseenter', () => {
        isHovering = true;
      });

      tile.addEventListener('mousemove', (e) => {
        const rect = tile.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate offset from center (-1 to 1)
        targetX = (e.clientX - rect.left - centerX) / centerX;
        targetY = (e.clientY - rect.top - centerY) / centerY;

        // Start animation if not running
        if (!animationId) {
          animationId = requestAnimationFrame(animate);
        }
      });

      tile.addEventListener('mouseleave', () => {
        isHovering = false;
        // Start animation to ease back
        if (!animationId) {
          animationId = requestAnimationFrame(animate);
        }
      });
    });
  }

  // =============================================
  // TIMELINE TAKEOVER
  // =============================================

  function initTimeline() {
    const timelineItems = document.querySelectorAll('.timeline__item');
    const takeover = document.querySelector('.timeline-takeover');
    const closeBtn = document.querySelector('.timeline-takeover__close');
    const prevBtn = document.querySelector('.timeline-takeover__prev');
    const nextBtn = document.querySelector('.timeline-takeover__next');
    const yearEl = document.querySelector('.timeline-takeover__year');
    const titleEl = document.querySelector('.timeline-takeover__title');
    const descEl = document.querySelector('.timeline-takeover__description');
    const imageEl = document.querySelector('.timeline-takeover__img');
    const currentEl = document.querySelector('.timeline-takeover__current');
    const totalEl = document.querySelector('.timeline-takeover__total');

    if (!timelineItems.length || !takeover) return;

    // Timeline data - Impax company history
    const timelineData = [
      {
        year: '1998',
        title: 'Impax Asset Management Founded',
        description: 'Impax was founded in London with a pioneering vision: to invest in companies that are well-positioned to benefit from the transition to a more sustainable global economy. From the start, we believed that environmental and resource efficiency would become increasingly important drivers of business success.',
        image: 'images/GettyImages-1286228815 1.png'
      },
      {
        year: '2001',
        title: 'Launch of First Investment Fund',
        description: 'We launched our first fund, establishing ourselves as one of the earliest specialist environmental investment managers. This marked our commitment to building expertise in sectors positioned to benefit from sustainability trends including renewable energy, water treatment, and waste management.',
        image: 'images/dan-meyers-w6X7XaolqA0-unsplash 1.png'
      },
      {
        year: '2008',
        title: 'Global Expansion Begins',
        description: 'Impax expanded internationally, opening offices in key financial centres to serve our growing global client base. We strengthened our investment team and research capabilities, establishing dedicated coverage across environmental markets worldwide.',
        image: 'images/GettyImages-1308942742 1.png'
      },
      {
        year: '2014',
        title: 'Listed on London Stock Exchange',
        description: 'Impax Asset Management Group PLC was admitted to trading on AIM, a market operated by the London Stock Exchange. This milestone enabled us to accelerate our growth strategy and expand our product range while maintaining our focus on sustainable investing.',
        image: 'images/mike-cox-genrYOrKFwo-unsplash 1.png'
      },
      {
        year: '2018',
        title: 'Merger with Pax World Funds',
        description: 'We completed a transformational merger with Pax World Funds, one of the oldest sustainable investment firms in the United States, founded in 1971. This combination created a global leader in sustainable investing with significantly enhanced scale and distribution capabilities.',
        image: 'images/thierry-lemaitre-DCTz3hPxj0g-unsplash 1.png'
      },
      {
        year: '2021',
        title: 'Assets Under Management Surpass £40 Billion',
        description: 'Our assets under management grew past £40 billion as investor demand for sustainable investment solutions accelerated. Our expanded product range now includes equity, fixed income, and multi-asset strategies across global, regional, and thematic mandates.',
        image: 'images/12858696-hd_1920_1080_60fps 1.png'
      },
      {
        year: '2024',
        title: 'Leading the Sustainable Investment Future',
        description: 'Today, Impax manages over £44 billion in assets and continues to lead in sustainable investing. We remain committed to our founding belief that well-managed companies exposed to the transition to a more sustainable economy will deliver superior long-term returns.',
        image: 'images/GettyImages-1286228815 1.png'
      }
    ];

    let currentIndex = 0;

    // Update the total count
    if (totalEl) {
      totalEl.textContent = timelineData.length;
    }

    // Update takeover content
    function updateContent(index) {
      const data = timelineData[index];
      if (!data) return;

      yearEl.textContent = data.year;
      titleEl.textContent = data.title;
      descEl.textContent = data.description;
      currentEl.textContent = index + 1;

      // Update image
      if (imageEl && data.image) {
        imageEl.src = data.image;
        imageEl.alt = data.title;
      }

      // Update button states
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === timelineData.length - 1;
    }

    // Open takeover
    function openTakeover(index) {
      currentIndex = index;
      updateContent(index);
      takeover.classList.add('active');
      takeover.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Focus close button for accessibility
      setTimeout(() => closeBtn.focus(), 100);
    }

    // Close takeover
    function closeTakeover() {
      takeover.classList.remove('active');
      takeover.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      // Return focus to the timeline item
      timelineItems[currentIndex]?.focus();
    }

    // Navigate to previous/next
    function goToPrev() {
      if (currentIndex > 0) {
        currentIndex--;
        updateContent(currentIndex);
      }
    }

    function goToNext() {
      if (currentIndex < timelineData.length - 1) {
        currentIndex++;
        updateContent(currentIndex);
      }
    }

    // Event listeners for timeline items
    timelineItems.forEach((item, index) => {
      item.addEventListener('click', () => openTakeover(index));

      // Keyboard support
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openTakeover(index);
        }
      });
    });

    // Close button
    closeBtn?.addEventListener('click', closeTakeover);

    // Navigation buttons
    prevBtn?.addEventListener('click', goToPrev);
    nextBtn?.addEventListener('click', goToNext);

    // Backdrop click to close
    takeover.addEventListener('click', (e) => {
      if (e.target === takeover || e.target.classList.contains('timeline-takeover__backdrop')) {
        closeTakeover();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!takeover.classList.contains('active')) return;

      switch (e.key) {
        case 'Escape':
          closeTakeover();
          break;
        case 'ArrowLeft':
          goToPrev();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    });
  }

  // =============================================
  // INITIALIZE
  // =============================================

  function init() {
    initCarousel();
    initMobileMenu();
    initMegaMenu();
    initScrollAnimations();
    initCardKeyboardNav();
    initHeaderScroll();
    initHeroParallax();
    initExploreSection();
    initCapabilitiesParallax();
    initTimeline();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
