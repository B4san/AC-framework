/**
 * AC Framework Landing Page - Main JavaScript
 */

(function() {
  'use strict';
  
  // Mobile Navigation Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      this.classList.toggle('is-active');
      navLinks.classList.toggle('is-open');
      
      // Update aria-expanded
      const isExpanded = navLinks.classList.contains('is-open');
      this.setAttribute('aria-expanded', isExpanded);
    });
  }
  
  // Workflow Step Animation
  const workflowSteps = document.querySelectorAll('.workflow-step');
  
  if (workflowSteps.length > 0) {
    let currentStep = 0;
    const stepInterval = 3000; // 3 seconds per step
    
    function highlightStep(index) {
      workflowSteps.forEach((step, i) => {
        step.classList.toggle('is-active', i === index);
      });
    }
    
    function nextStep() {
      currentStep = (currentStep + 1) % workflowSteps.length;
      highlightStep(currentStep);
    }
    
    // Start the cycle when workflow section is visible
    const workflowSection = document.getElementById('workflow');
    let animationStarted = false;
    let stepTimer = null;
    
    const workflowObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animationStarted) {
          animationStarted = true;
          highlightStep(0);
          stepTimer = setInterval(nextStep, stepInterval);
        } else if (!entry.isIntersecting && animationStarted) {
          // Pause when not visible (optional - keeps running for simplicity)
        }
      });
    }, { threshold: 0.3 });
    
    if (workflowSection) {
      workflowObserver.observe(workflowSection);
    }
    
    // Pause on hover
    workflowSteps.forEach(step => {
      step.addEventListener('mouseenter', () => {
        if (stepTimer) {
          clearInterval(stepTimer);
          // Highlight hovered step
          workflowSteps.forEach(s => s.classList.remove('is-active'));
          step.classList.add('is-active');
        }
      });
      
      step.addEventListener('mouseleave', () => {
        // Resume from current position
        stepTimer = setInterval(nextStep, stepInterval);
      });
    });
  }
  
  // Feature cards stagger animation on scroll
  const featureCards = document.querySelectorAll('.feature-card');
  
  if (featureCards.length > 0) {
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger delay based on index
          const delay = index * 100;
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, delay);
          
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    featureCards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      cardObserver.observe(card);
    });
  }
  
  // Keyboard navigation enhancement
  document.addEventListener('keydown', (e) => {
    // Escape to close mobile menu
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('is-open')) {
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });
  
  // Performance: Pause animations when tab is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.body.classList.add('is-paused');
    } else {
      document.body.classList.remove('is-paused');
    }
  });
  
  // Console greeting
  console.log(
    '%c⚡ AC Framework',
    'color: #22c55e; font-size: 24px; font-weight: bold;'
  );
  console.log(
    '%cOne config. All your AI assistants.',
    'color: #a1a1aa; font-size: 14px;'
  );
  console.log(
    '%cTry it: npm install -g ac-framework',
    'color: #22c55e; font-size: 12px; font-family: monospace;'
  );
})();
