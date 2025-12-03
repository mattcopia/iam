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
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
      } else {
        header.style.boxShadow = 'none';
      }

      lastScroll = currentScroll;
    }, { passive: true });
  }

  // =============================================
  // INITIALIZE
  // =============================================

  function init() {
    initCarousel();
    initMobileMenu();
    initScrollAnimations();
    initCardKeyboardNav();
    initHeaderScroll();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
