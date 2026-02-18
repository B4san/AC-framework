/**
 * AC Framework Landing Page - Scroll Animations
 */

(function() {
  'use strict';
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Make all elements visible immediately
    document.querySelectorAll('.scroll-reveal, .fade-in').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }
  
  // Intersection Observer for scroll reveal
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add delay if specified
        const delay = entry.target.style.getPropertyValue('--delay') || '0s';
        entry.target.style.transitionDelay = delay;
        
        // Trigger animation
        entry.target.classList.add('is-visible');
        
        // Unobserve after animation
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all scroll-reveal elements
  document.querySelectorAll('.scroll-reveal').forEach(el => {
    revealObserver.observe(el);
  });
  
  // Navigation scroll effect
  const nav = document.getElementById('nav');
  let lastScrollY = 0;
  let ticking = false;
  
  function updateNav() {
    const scrollY = window.scrollY;
    
    if (scrollY > 50) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
    
    lastScrollY = scrollY;
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        
        const navHeight = nav.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        const navLinks = document.getElementById('nav-links');
        const navToggle = document.getElementById('nav-toggle');
        if (navLinks && navLinks.classList.contains('is-open')) {
          navLinks.classList.remove('is-open');
          navToggle.classList.remove('is-active');
        }
      }
    });
  });
  
  // Parallax effect for hero background (subtle)
  const heroGradient = document.querySelector('.hero__gradient');
  
  if (heroGradient && !window.matchMedia('(pointer: coarse)').matches) {
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const rate = scrolled * 0.3;
          heroGradient.style.transform = `translateY(${rate}px)`;
        });
        ticking = true;
      }
    }, { passive: true });
  }
})();
