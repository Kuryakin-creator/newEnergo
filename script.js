const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const progressBar = document.querySelector('[data-scroll-progress]');
const siteScrollbar = document.querySelector('.site-scrollbar');
const scrollThumb = document.querySelector('[data-scroll-thumb]');
let isScrollbarDragging = false;
const hero = document.querySelector('.hero');
const about = document.querySelector('#about');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const horizontalNumbers = document.querySelector('.horizontal-numbers');
const horizontalNumbersTrack = document.querySelector('[data-horizontal-numbers-track]');
const horizontalNumberCards = document.querySelectorAll('.horizontal-numbers .number-card');
const horizontalNumberPanels = [...document.querySelectorAll('.horizontal-numbers__panel')];
const horizontalNumbersSwipeNav = document.querySelector('[data-numbers-swipe-nav]');
const horizontalNumbersSwipeButtons = [...(horizontalNumbersSwipeNav?.querySelectorAll('button') || [])];
const heroTransitionImage = document.querySelector('.hero-transition-image');
const aboutStory = document.querySelector('[data-about-story]');
const mission = document.querySelector('#mission');
const scrollDriftTargets = [
  ['#about', '.manifesto-title-line:nth-child(1)', 60, -40, 1.15],
  ['#about', '.manifesto-title-line:nth-child(2)', 50, -33, 1.15],
  ['#about', '.manifesto-title-line:nth-child(3)', 43, -28, 1.15],
  ['#about', '.manifesto-copy', 20, -14],
  ['#about', '.manifesto-principles', 14, -10],
  ['#mission', '.mission-heading .scroll-heading-line:nth-child(1)', 22, -14, 1.15],
  ['#mission', '.mission-heading .scroll-heading-line:nth-child(2)', 22, -14, 1.15],
  ['#mission', '.mission-heading .scroll-heading-line:nth-child(3)', 22, -14, 1.15],
  ['#mission', '.mission-heading .scroll-heading-line:nth-child(4)', 22, -14, 1.15],
  ['#mission', '#mission .mission-heading .kicker', 24, -18],
  ['#mission', '.mission-image', 30, -24],
  ['#mission', '.mission-text', 19, -14],
  ['.horizontal-numbers', '#numbers-title .scroll-heading-line:nth-child(1)', 58, -37, .7],
  ['.horizontal-numbers', '#numbers-title .scroll-heading-line:nth-child(2)', 47, -30, .7],
  ['.partners', '.partners-title .scroll-heading-line:nth-child(1)', 58, -36, .49],
  ['.partners', '.partners-title .scroll-heading-line:nth-child(2)', 47, -29, .49],
  ['.partners', '.partners-title .kicker', 17, -11],
  ['#contacts', '#contacts .scroll-heading-line:nth-child(1)', 24, -16, 1.15],
  ['#contacts', '#contacts .scroll-heading-line:nth-child(2)', 24, -16, 1.15],
  ['#contacts', '#contacts .scroll-heading-line:nth-child(3)', 24, -16, 1.15],
  ['#contacts', '#contacts .contact-title .kicker', 14, -9]
].map(([sectionSelector, targetSelector, from, to, driftFactor = 1]) => ({
  section: document.querySelector(sectionSelector),
  target: document.querySelector(targetSelector),
  from,
  to,
  driftFactor
}));
const architecturalSections = [
  { selector: '#services', mode: 'carry', start: .28, span: .44 },
  { selector: '.partners', mode: 'close', start: .12, span: .72 }
].map(({ selector, ...config }) => ({
  element: document.querySelector(selector),
  depth: 0,
  ...config
}));
const parallaxTargets = document.querySelectorAll('[data-parallax]');
let previousScroll = window.scrollY;
let headerDirectionAnchor = previousScroll;
let anchorNavigationUntil = 0;
let ticking = false;
const getHeroRestingScroll = () => hero
  ? hero.offsetTop + Math.max(hero.offsetHeight - window.innerHeight, 0)
  : 0;
const startsAfterHeroTransition = aboutStory && window.scrollY >= getHeroRestingScroll() - 2;
const heroTransition = {
  state: startsAfterHeroTransition ? 'about' : 'hero',
  progress: startsAfterHeroTransition ? 1 : 0,
  frame: null,
  scrollBoost: 0
};
const heroTransitionDuration = 1250;
const heroTransitionScrollRange = 600;
const heroWheelThreshold = 6;
const scrollLerp = .14;
const wheelMultiplier = 1;
const smoothScroll = {
  current: window.scrollY,
  target: window.scrollY,
  frame: null
};

if (horizontalNumbersTrack && horizontalNumbersSwipeButtons.length) {
  let numbersSwipeFrame = 0;

  const updateNumbersSwipeNav = () => {
    numbersSwipeFrame = 0;
    const panelWidth = Math.max(horizontalNumbersTrack.clientWidth, 1);
    const activeIndex = Math.min(Math.round(horizontalNumbersTrack.scrollLeft / panelWidth), horizontalNumberPanels.length - 1);
    horizontalNumbersSwipeButtons.forEach((button, index) => {
      button.setAttribute('aria-current', String(index === activeIndex));
    });
  };

  horizontalNumbersTrack.addEventListener('scroll', () => {
    if (numbersSwipeFrame) return;
    numbersSwipeFrame = requestAnimationFrame(updateNumbersSwipeNav);
  }, { passive: true });

  horizontalNumbersSwipeButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      if (window.innerWidth >= 768) return;
      horizontalNumbersTrack.scrollTo({
        left: horizontalNumbersTrack.clientWidth * index,
        behavior: reducedMotionQuery.matches ? 'auto' : 'smooth'
      });
    });
  });

  window.addEventListener('resize', updateNumbersSwipeNav, { passive: true });
  updateNumbersSwipeNav();
}

function cancelSmoothScroll() {
  if (smoothScroll.frame) cancelAnimationFrame(smoothScroll.frame);
  smoothScroll.frame = null;
  smoothScroll.current = window.scrollY;
  smoothScroll.target = window.scrollY;
}

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(value) {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
}

function animateSmoothScroll() {
  const distance = smoothScroll.target - smoothScroll.current;
  smoothScroll.current += distance * scrollLerp;

  if (Math.abs(distance) < .5) {
    smoothScroll.current = smoothScroll.target;
    smoothScroll.frame = null;
  } else {
    smoothScroll.frame = requestAnimationFrame(animateSmoothScroll);
  }

  window.scrollTo({ top: smoothScroll.current, left: 0, behavior: 'instant' });
}

function handleSmoothWheel(event) {
  if (event.defaultPrevented || reducedMotionQuery.matches || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  if (document.body.classList.contains('menu-open') || event.target instanceof Element && event.target.closest('dialog[open]')) return;

  event.preventDefault();
  const deltaFactor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

  if (!smoothScroll.frame) smoothScroll.current = smoothScroll.target = window.scrollY;
  smoothScroll.target = clamp(smoothScroll.target + event.deltaY * deltaFactor * wheelMultiplier, 0, maxScroll);
  if (!smoothScroll.frame) smoothScroll.frame = requestAnimationFrame(animateSmoothScroll);
}

function updateHeroTransition(currentScroll = window.scrollY) {
  if (!hero || !heroTransitionImage) return;

  const rect = hero.getBoundingClientRect();
  const useExtendedHero = window.innerWidth >= 1200 && !reducedMotionQuery.matches;
  const scrollDistance = useExtendedHero
    ? Math.max(hero.offsetHeight - window.innerHeight, 1)
    : Math.max(hero.offsetHeight, 1);
  const usesTriggeredTransition = window.innerWidth >= 1200;
  const heroProgress = usesTriggeredTransition
    ? heroTransition.progress
    : clamp(-rect.top / scrollDistance);
  const imageProgress = 1 - Math.pow(1 - clamp(heroProgress / .92), 3);

  if (!usesTriggeredTransition) {
    if (reducedMotionQuery.matches || heroProgress <= .001) {
      hero.classList.remove('is-letters-active');
    } else if (currentScroll > previousScroll) {
      hero.classList.add('is-letters-active');
    }
  }

  hero.style.setProperty('--hero-image-progress', imageProgress.toFixed(4));
  const mediaIsCovered = mission && mission.getBoundingClientRect().top <= 0;
  heroTransitionImage.style.setProperty('--hero-image-progress', mediaIsCovered ? '0' : imageProgress.toFixed(4));
}

function updateScrollIndicators(current = window.scrollY) {
  const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max(current / max, 0), 1);
  progressBar.style.width = `${progress * 100}%`;

  if (!scrollThumb) return;
  const trackHeight = Math.max(window.innerHeight - 16, 1);
  const naturalThumbHeight = Math.max(trackHeight * (window.innerHeight / document.documentElement.scrollHeight), 44);
  const thumbHeight = Math.min(naturalThumbHeight * 1.25, trackHeight);
  const thumbOffset = Math.max(trackHeight - thumbHeight, 0) * progress;
  scrollThumb.style.height = `${thumbHeight}px`;
  scrollThumb.style.setProperty('--scroll-thumb-y', `${thumbOffset}px`);
  siteScrollbar?.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
}

function updateIntroSharedMedia() {
  if (!about || !mission || !heroTransitionImage) return;

  if (reducedMotionQuery.matches) {
    heroTransitionImage.style.removeProperty('--intro-media-y');
    return;
  }

  const rect = about.getBoundingClientRect();
  const startPosition = window.innerHeight * .8;
  const progress = clamp((startPosition - rect.top) / (startPosition + rect.height));
  const mediaTravel = window.innerWidth < 768 ? 8 : window.innerWidth < 1200 ? 12 : 50;
  heroTransitionImage.style.setProperty('--intro-media-y', `${(-mediaTravel * progress).toFixed(3)}%`);
}

function scrollToHeroPosition(top) {
  cancelSmoothScroll();
  window.scrollTo({ top, left: 0, behavior: 'instant' });
  previousScroll = window.scrollY;
  headerDirectionAnchor = previousScroll;
}

function settleHeroTransitionForScroll(top) {
  if (!hero || !aboutStory || window.innerWidth < 1200) return;
  if (heroTransition.frame) cancelAnimationFrame(heroTransition.frame);
  heroTransition.frame = null;
  heroTransition.scrollBoost = 0;

  const restingScroll = Math.max(getHeroRestingScroll(), 1);
  heroTransition.progress = clamp(top / restingScroll);
  heroTransition.state = heroTransition.progress >= .5 ? 'about' : 'hero';
  hero.classList.toggle('is-letters-active', heroTransition.progress > .001);
  updateHeroTransition(top);
}

function settleHeroTransitionForTarget(target) {
  if (!hero || !aboutStory || !target || window.innerWidth < 1200) return;
  if (heroTransition.frame) cancelAnimationFrame(heroTransition.frame);
  heroTransition.frame = null;
  heroTransition.scrollBoost = 0;

  const showsHero = target === hero || target.id === 'top';
  heroTransition.progress = showsHero ? 0 : 1;
  heroTransition.state = showsHero ? 'hero' : 'about';
  hero.classList.toggle('is-letters-active', !showsHero);
  updateHeroTransition(window.scrollY);
}

function completeHeroTransition(direction) {
  heroTransition.frame = null;
  heroTransition.scrollBoost = 0;
  heroTransition.progress = direction === 'forward' ? 1 : 0;
  heroTransition.state = direction === 'forward' ? 'about' : 'hero';

  scrollToHeroPosition(direction === 'forward' ? getHeroRestingScroll() : hero.offsetTop);
  updateScrollUI();
}

function startHeroTransition(direction) {
  const expectedState = direction === 'forward' ? 'hero' : 'about';
  const isTransitioning = heroTransition.state === 'transitioning-forward' || heroTransition.state === 'transitioning-backward';
  if ((!isTransitioning && heroTransition.state !== expectedState) || !hero || !aboutStory) return;

  if (heroTransition.frame) cancelAnimationFrame(heroTransition.frame);
  heroTransition.frame = null;

  heroTransition.state = direction === 'forward'
    ? 'transitioning-forward'
    : 'transitioning-backward';
  heroTransition.scrollBoost = 0;

  if (direction === 'forward') {
    hero.classList.add('is-letters-active');
  } else {
    hero.classList.remove('is-letters-active');
  }

  if (reducedMotionQuery.matches) {
    hero.classList.remove('is-letters-active');
    completeHeroTransition(direction);
    return;
  }

  const startedAt = performance.now();
  const startProgress = heroTransition.progress;
  const endProgress = direction === 'forward' ? 1 : 0;
  const transitionDistance = Math.max(Math.abs(endProgress - startProgress), .001);
  const transitionDuration = heroTransitionDuration * transitionDistance;
  const animate = now => {
    const timeProgress = clamp((now - startedAt) / transitionDuration + heroTransition.scrollBoost);
    const easedProgress = smoothstep(timeProgress);
    heroTransition.progress = startProgress + (endProgress - startProgress) * easedProgress;
    updateHeroTransition(window.scrollY);
    const heroStart = hero.offsetTop;
    const virtualScroll = heroStart + (getHeroRestingScroll() - heroStart) * heroTransition.progress;
    updateScrollIndicators(virtualScroll);

    if (timeProgress < 1) {
      heroTransition.frame = requestAnimationFrame(animate);
    } else {
      completeHeroTransition(direction);
    }
  };

  heroTransition.frame = requestAnimationFrame(animate);
}

function handleHeroWheel(event) {
  if (!hero || !aboutStory || window.innerWidth < 1200 || Math.abs(event.deltaY) < heroWheelThreshold) return;

  if (heroTransition.state === 'transitioning-forward' || heroTransition.state === 'transitioning-backward') {
    event.preventDefault();
    const transitionDirection = heroTransition.state === 'transitioning-forward' ? 'forward' : 'backward';
    const scrollsWithTransition = transitionDirection === 'forward' ? event.deltaY > 0 : event.deltaY < 0;
    if (scrollsWithTransition) {
      const deltaFactor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      heroTransition.scrollBoost = clamp(heroTransition.scrollBoost + Math.abs(event.deltaY) * deltaFactor / heroTransitionScrollRange);
    } else {
      startHeroTransition(transitionDirection === 'forward' ? 'backward' : 'forward');
    }
    return;
  }

  if (heroTransition.state === 'hero' && event.deltaY > 0) {
    event.preventDefault();
    startHeroTransition('forward');
    return;
  }

  const heroRestingScroll = getHeroRestingScroll();
  if (heroTransition.state === 'about' && event.deltaY < 0 && window.scrollY <= heroRestingScroll + 2) {
    event.preventDefault();
    startHeroTransition('backward');
  }
}

function updateScrollDrifts() {
  const motionFactor = window.innerWidth < 768 ? .5 : 1;
  const sectionRects = new Map();

  scrollDriftTargets.forEach(({ section, target, from, to, driftFactor }) => {
    if (!section || !target) return;
    if (reducedMotionQuery.matches) {
      target.style.removeProperty('--scroll-drift-y');
      return;
    }

    const rect = sectionRects.get(section) || section.getBoundingClientRect();
    sectionRects.set(section, rect);
    const localRange = Math.min(rect.height, window.innerHeight * 1.35);
    const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + localRange));
    const offset = (from + (to - from) * progress) * driftFactor * motionFactor * 2.75;
    target.style.setProperty('--scroll-drift-y', `${offset.toFixed(2)}px`);
  });
}

function updateArchitecturalSections() {
  architecturalSections.forEach(({ element: section, depth, mode, start, span }) => {
    if (!section) return;
    if (reducedMotionQuery.matches) {
      section.style.removeProperty('--architectural-step-y');
      return;
    }

    const rect = section.getBoundingClientRect();
    const viewportProgress = clamp((window.innerHeight - rect.top) / window.innerHeight);
    const localProgress = clamp((viewportProgress - start) / span);
    const transitionProgress = mode === 'close'
      ? 1 - smoothstep(localProgress)
      : smoothstep(localProgress);
    section.style.setProperty('--architectural-step-y', `${(depth * transitionProgress).toFixed(2)}px`);
  });
}

function refreshArchitecturalDepths() {
  architecturalSections.forEach(target => {
    if (target.element) target.depth = parseFloat(getComputedStyle(target.element).getPropertyValue('--architectural-depth'));
  });
}

function updateScrollUI() {
  const current = window.scrollY;

  const isPostHero = current >= getHeroRestingScroll() - 2;
  header.classList.toggle('is-scrolled', isPostHero);
  header.classList.toggle('is-post-hero', isPostHero);
  header.classList.remove('is-hidden');
  header.classList.toggle(
    'is-mobile-collapsed',
    window.innerWidth < 1200 && current > 24 && !menu.classList.contains('is-open')
  );
  if (!isPostHero && menu.classList.contains('is-open')) closeMenu();
  updateScrollIndicators(current);

  updateHeroTransition(current);
  updateIntroSharedMedia();
  updateScrollDrifts();
  updateArchitecturalSections();

  if (horizontalNumbers && horizontalNumbersTrack && window.innerWidth >= 1200 && !reducedMotionQuery.matches) {
    const rect = horizontalNumbers.getBoundingClientRect();
    const scrollDistance = horizontalNumbers.offsetHeight - window.innerHeight;
    const traveled = Math.min(Math.max(-rect.top, 0), scrollDistance);
    const trackDistance = Math.max(horizontalNumbersTrack.scrollWidth - window.innerWidth, 0);
    const offset = scrollDistance > 0 ? trackDistance * (traveled / scrollDistance) : 0;
    horizontalNumbersTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;

    horizontalNumberCards.forEach(card => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.min(Math.abs(cardCenter - window.innerWidth / 2) / (window.innerWidth * .58), 1);
      const focus = 1 - distance;
      const easedFocus = focus * focus * (3 - 2 * focus);
      let maximumScale = 1.05;
      if (card.classList.contains('number-card--employees')) maximumScale = 1.2;
      if (card.classList.contains('number-card--substations')) maximumScale = 1.14;
      if (card.classList.contains('number-card--hdd')) maximumScale = 1.07;
      if (card.classList.contains('number-card--built')) maximumScale = 1.08;
      if (card.classList.contains('number-card--facilities')) maximumScale = 1.18;
      card.style.setProperty('--number-focus-scale', (.94 + easedFocus * (maximumScale - .94)).toFixed(3));
    });
  } else if (horizontalNumbers && horizontalNumbersTrack) {
    horizontalNumbersTrack.style.transform = 'none';
    horizontalNumberCards.forEach(card => card.style.removeProperty('--number-focus-scale'));
  }

  parallaxTargets.forEach(element => {
    const section = element.closest('.scene');
    const rect = section.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const shift = Math.max(-8, Math.min(8, -rect.top / window.innerHeight * 8));
      element.style.backgroundPosition = `center calc(50% + ${shift}px)`;
    }
  });

  previousScroll = current;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollUI);
    ticking = true;
  }
}, { passive: true });
window.addEventListener('wheel', event => {
  handleHeroWheel(event);
  handleSmoothWheel(event);
}, { passive: false });
window.addEventListener('resize', () => {
  if (menu.classList.contains('is-open')) closeMenu();
  refreshArchitecturalDepths();
  updateScrollUI();
}, { passive: true });
if (heroTransition.state === 'about') hero?.classList.add('is-letters-active');
refreshArchitecturalDepths();
updateScrollUI();

window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    const hashTarget = window.location.hash
      ? document.getElementById(window.location.hash.slice(1))
      : null;
    if (window.innerWidth >= 1200 && hashTarget && hashTarget !== hero) {
      settleHeroTransitionForTarget(hashTarget);
      updateScrollUI();
    }
  });
}, { once: true });

document.addEventListener('click', event => {
  const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
  if (!link) return;

  const hash = link.getAttribute('href');
  if (!hash || hash === '#') return;
  const target = document.getElementById(hash.slice(1));
  if (!target) return;

  event.preventDefault();
  cancelSmoothScroll();
  settleHeroTransitionForTarget(target);
  anchorNavigationUntil = performance.now() + 1400;
  header.classList.remove('is-hidden');
  let targetTop = 0;
  let offsetNode = target;
  while (offsetNode) {
    targetTop += offsetNode.offsetTop;
    offsetNode = offsetNode.offsetParent;
  }
  window.scrollTo({
    top: targetTop,
    left: 0,
    behavior: reducedMotionQuery.matches ? 'auto' : 'smooth'
  });
  if (!reducedMotionQuery.matches) {
    let anchorAligned = false;
    const alignAnchor = () => {
      if (anchorAligned) return;
      anchorAligned = true;
      const visualOffset = target.getBoundingClientRect().top;
      if (Math.abs(visualOffset) > 1) {
        window.scrollTo({ top: window.scrollY + visualOffset, left: 0, behavior: 'auto' });
      }
    };
    window.addEventListener('scrollend', alignAnchor, { once: true });
    window.setTimeout(alignAnchor, 1600);
  }
  if (window.location.hash !== hash) history.pushState(null, '', hash);
});

if (siteScrollbar && scrollThumb) {
  let activePointerId = null;
  let pointerOffset = 0;

  const scrollFromPointer = clientY => {
    const track = siteScrollbar.getBoundingClientRect();
    const thumbHeight = scrollThumb.offsetHeight;
    const travel = Math.max(track.height - thumbHeight, 1);
    const ratio = clamp((clientY - track.top - pointerOffset) / travel);
    const top = ratio * Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    cancelSmoothScroll();
    settleHeroTransitionForScroll(top);
    window.scrollTo({ top, left: 0, behavior: 'instant' });
  };

  scrollThumb.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    activePointerId = event.pointerId;
    isScrollbarDragging = true;
    closeMenu();
    document.body.classList.add('is-scrollbar-dragging');
    scrollThumb.classList.add('is-dragging');
    pointerOffset = event.clientY - scrollThumb.getBoundingClientRect().top;
    scrollThumb.setPointerCapture(event.pointerId);
  });

  scrollThumb.addEventListener('pointermove', event => {
    if (event.pointerId !== activePointerId) return;
    event.preventDefault();
    scrollFromPointer(event.clientY);
  }, { passive: false });

  const releaseScrollThumb = event => {
    if (event.pointerId !== activePointerId) return;
    activePointerId = null;
    isScrollbarDragging = false;
    document.body.classList.remove('is-scrollbar-dragging');
    scrollThumb.classList.remove('is-dragging');
    if (event.type !== 'lostpointercapture' && scrollThumb.hasPointerCapture(event.pointerId)) {
      scrollThumb.releasePointerCapture(event.pointerId);
    }
  };

  scrollThumb.addEventListener('pointerup', releaseScrollThumb);
  scrollThumb.addEventListener('pointercancel', releaseScrollThumb);
  scrollThumb.addEventListener('lostpointercapture', releaseScrollThumb);
  window.addEventListener('pointerup', releaseScrollThumb);
  window.addEventListener('pointercancel', releaseScrollThumb);
  window.addEventListener('blur', () => {
    if (activePointerId === null) return;
    releaseScrollThumb({ pointerId: activePointerId, type: 'blur' });
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden || activePointerId === null) return;
    releaseScrollThumb({ pointerId: activePointerId, type: 'visibilitychange' });
  });

  siteScrollbar.addEventListener('keydown', event => {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    const keyOffsets = {
      ArrowUp: -80,
      ArrowDown: 80,
      PageUp: -window.innerHeight * .85,
      PageDown: window.innerHeight * .85,
      Home: -maxScroll,
      End: maxScroll
    };
    if (!(event.key in keyOffsets)) return;
    event.preventDefault();
    const top = clamp(window.scrollY + keyOffsets[event.key], 0, maxScroll);
    cancelSmoothScroll();
    settleHeroTransitionForScroll(top);
    window.scrollTo({ top, left: 0, behavior: reducedMotionQuery.matches ? 'auto' : 'smooth' });
  });
}

function closeMenu() {
  menu.classList.remove('is-open');
  menu.setAttribute('aria-hidden', 'true');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
  document.body.classList.remove('menu-open');
  header.classList.toggle('is-mobile-collapsed', window.innerWidth < 1200 && window.scrollY > 24);
}

function openMenu() {
  header.classList.remove('is-mobile-collapsed');
  menu.classList.add('is-open');
  menu.setAttribute('aria-hidden', 'false');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Закрыть меню');
  document.body.classList.add('menu-open');
}

let menuHoverFrame = null;
const scheduleMenuClose = () => {
  if (menuHoverFrame) cancelAnimationFrame(menuHoverFrame);
  menuHoverFrame = requestAnimationFrame(() => {
    menuHoverFrame = null;
    if (!menuToggle.matches(':hover') && !menu.matches(':hover')) closeMenu();
  });
};

[menuToggle, menu].forEach(element => {
  element.addEventListener('pointerenter', () => {
    if (window.innerWidth < 1200 || isScrollbarDragging) return;
    if (menuHoverFrame) cancelAnimationFrame(menuHoverFrame);
    menuHoverFrame = null;
    openMenu();
  });
  element.addEventListener('pointerleave', () => {
    if (window.innerWidth >= 1200) scheduleMenuClose();
  });
});

menuToggle.addEventListener('click', event => {
  if (window.innerWidth >= 1200 && event.detail > 0) {
    openMenu();
    return;
  }
  const willOpen = !menu.classList.contains('is-open');
  if (willOpen) openMenu();
  else closeMenu();
  header.classList.remove('is-hidden');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !menu.classList.contains('is-open')) return;
  closeMenu();
  menuToggle.focus();
});

const phoneMask = input => {
  let digits = input.value.replace(/\D/g, '').replace(/^8/, '7').slice(0, 11);
  if (!digits) { input.value = ''; return; }
  if (digits[0] !== '7') digits = `7${digits}`;
  let value = '+7';
  if (digits.length > 1) value += ` (${digits.slice(1, 4)}`;
  if (digits.length >= 4) value += ')';
  if (digits.length > 4) value += ` ${digits.slice(4, 7)}`;
  if (digits.length > 7) value += `-${digits.slice(7, 9)}`;
  if (digits.length > 9) value += `-${digits.slice(9, 11)}`;
  input.value = value;
};

document.querySelectorAll('input[type="tel"]').forEach(input => {
  input.addEventListener('input', () => phoneMask(input));
});

document.querySelectorAll('[data-form]').forEach(form => {
  const captcha = form.querySelector('[data-captcha]');
  const captchaQuestion = captcha?.querySelector('[data-captcha-question]');
  const captchaAnswer = captcha?.querySelector('[data-captcha-answer]');
  const captchaRefresh = captcha?.querySelector('[data-captcha-refresh]');
  const captchaTrap = captcha?.querySelector('[data-captcha-trap]');
  let captchaResult = 0;

  const refreshCaptcha = () => {
    const first = Math.floor(Math.random() * 7) + 2;
    const second = Math.floor(Math.random() * 7) + 1;
    captchaResult = first + second;
    if (captchaQuestion) captchaQuestion.textContent = `${first} + ${second} =`;
    if (captchaAnswer) {
      captchaAnswer.value = '';
      captchaAnswer.classList.remove('is-invalid');
      captchaAnswer.removeAttribute('aria-invalid');
    }
  };

  captchaRefresh?.addEventListener('click', () => {
    refreshCaptcha();
    captchaAnswer?.focus();
  });
  refreshCaptcha();

  form.addEventListener('submit', event => {
    event.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      const fieldValid = field.type === 'checkbox' ? field.checked : Boolean(field.value.trim()) && field.checkValidity();
      field.classList.toggle('is-invalid', !fieldValid);
      valid = valid && fieldValid;
    });

    const phone = form.querySelector('input[type="tel"]');
    if (phone && phone.value.replace(/\D/g, '').length < 11) {
      phone.classList.add('is-invalid');
      valid = false;
    }

    const captchaValid = !captchaAnswer || Number(captchaAnswer.value.trim()) === captchaResult;
    if (captchaAnswer) {
      captchaAnswer.classList.toggle('is-invalid', !captchaValid);
      captchaAnswer.setAttribute('aria-invalid', String(!captchaValid));
      valid = valid && captchaValid;
    }

    if (captchaTrap?.value) valid = false;

    const status = form.querySelector('.form-status');
    if (!valid) {
      status.textContent = captchaValid
        ? 'Проверьте обязательные поля и согласие.'
        : 'Неверный ответ. Решите проверочный пример.';
      return;
    }

    status.textContent = 'Спасибо. Заявка принята — мы скоро свяжемся с вами.';
    form.reset();
    refreshCaptcha();
  });
});

const competenciesRoot = document.querySelector('[data-competencies]');

if (competenciesRoot) {
  const competencies = [
    {
      id: 'energy',
      number: '01',
      navigationLabel: 'ЭНЕРГЕТИКА',
      title: 'Объекты энергетики',
      subtitle: 'Энергия для развития',
      description: 'Проектируем и строим электрические сети, линии электропередачи и трансформаторные подстанции. Выполняем наружное освещение, пусконаладочные работы и ГНБ.',
      mainImage: 'assets/images/competency-energy-main-1280.webp',
      mainSrcset: 'assets/images/competency-energy-main-720.webp 720w, assets/images/competency-energy-main-1280.webp 1280w',
      mainSize: [1280, 720],
      mainPosition: '52% center',
      mainAlt: 'Современная трансформаторная подстанция',
      detailImage: 'assets/images/competency-energy-detail-720.webp',
      detailSrcset: 'assets/images/competency-energy-detail-360.webp 360w, assets/images/competency-energy-detail-720.webp 720w',
      detailSize: [720, 405],
      detailPosition: '52% center',
      detailAlt: 'Крупный план силового трансформатора',
      linkLabel: 'Обсудить объект',
      href: '#contacts'
    },
    {
      id: 'industrial',
      number: '02',
      navigationLabel: 'ПРОМЫШЛЕННОСТЬ',
      title: 'Промышленные объекты',
      subtitle: 'Коммерческая недвижимость · Инженерные сети',
      description: 'Проектируем и строим коммерческую недвижимость класса В/В+, автомобильные дороги и инженерные сети. Обеспечиваем электроснабжение строительных площадок.',
      mainImage: 'assets/images/competency-industrial-main-1440.webp',
      mainSrcset: 'assets/images/competency-industrial-main-720.webp 720w, assets/images/competency-industrial-main-1440.webp 1440w',
      mainSize: [1440, 960],
      mainPosition: '58% center',
      mainAlt: 'Современный промышленный комплекс с инженерными коммуникациями',
      detailImage: 'assets/images/competency-industrial-detail-720.webp',
      detailSrcset: 'assets/images/competency-industrial-detail-360.webp 360w, assets/images/competency-industrial-detail-720.webp 720w',
      detailSize: [720, 1080],
      detailPosition: 'center',
      detailAlt: 'Промышленные трубопроводы и металлические соединения',
      linkLabel: 'Обсудить промышленный объект',
      href: '#contacts'
    },
    {
      id: 'civil',
      number: '03',
      navigationLabel: 'ГРАЖДАНСКИЕ',
      title: 'Объекты гражданского назначения',
      subtitle: 'Жилые дома · Комфорт-класс',
      description: 'Строим кирпичные многоэтажные жилые дома комфорт-класса с индивидуальным отоплением и выполняем полный комплекс работ до ввода объекта в эксплуатацию.',
      mainImage: 'assets/images/competency-civil-main-1440.webp',
      mainSrcset: 'assets/images/competency-civil-main-720.webp 720w, assets/images/competency-civil-main-1440.webp 1440w',
      mainSize: [1440, 960],
      mainPosition: '58% center',
      mainAlt: 'Современный жилой объект с архитектурным освещением',
      detailImage: 'assets/images/competency-civil-detail-720.webp',
      detailSrcset: 'assets/images/competency-civil-detail-360.webp 360w, assets/images/competency-civil-detail-720.webp 720w',
      detailSize: [720, 1080],
      detailPosition: 'center',
      detailAlt: 'Деталь фасада с интегрированным архитектурным освещением',
      linkLabel: 'Обсудить гражданский объект',
      href: '#contacts'
    }
  ];
  const competencyNumber = competenciesRoot.querySelector('[data-competency-number]');
  const competencyTitle = competenciesRoot.querySelector('[data-competency-title]');
  const competencySubtitle = competenciesRoot.querySelector('[data-competency-subtitle]');
  const competencyDescription = competenciesRoot.querySelector('[data-competency-description]');
  const competencyLink = competenciesRoot.querySelector('[data-competency-link]');
  const competencyMain = competenciesRoot.querySelector('[data-competency-main]');
  const competencyDetail = competenciesRoot.querySelector('[data-competency-detail]');
  const competencyMask = competenciesRoot.querySelector('.competency-media-mask');
  const competencyCounter = competenciesRoot.querySelector('[data-competency-counter]');
  const competencyLabels = [...competenciesRoot.querySelectorAll('[data-competency-label]')];
  const competencyPrevious = competenciesRoot.querySelector('[data-competency-prev]');
  const competencyNext = competenciesRoot.querySelector('[data-competency-next]');
  const competencyText = [competencyTitle, competencySubtitle, competencyDescription, competencyLink].filter(Boolean);
  let activeCompetency = 0;
  let competencyAnimating = false;
  let swipeStart = null;

  const preloadCompetency = index => {
    const item = competencies[(index + competencies.length) % competencies.length];
    [item.mainImage, item.detailImage].forEach(source => {
      const image = new Image();
      image.src = source;
    });
  };

  const renderCompetency = index => {
    const item = competencies[index];
    competencyNumber.textContent = item.number;
    competencyTitle.textContent = item.title;
    competencySubtitle.textContent = item.subtitle;
    competencyDescription.textContent = item.description;
    if (competencyLink) {
      competencyLink.childNodes[0].nodeValue = `${item.linkLabel} `;
      competencyLink.href = item.href;
    }
    competencyMain.src = item.mainImage;
    competencyMain.srcset = item.mainSrcset;
    competencyMain.width = item.mainSize[0];
    competencyMain.height = item.mainSize[1];
    competencyMain.alt = item.mainAlt;
    competencyMain.style.objectPosition = item.mainPosition;
    competencyDetail.src = item.detailImage;
    competencyDetail.srcset = item.detailSrcset;
    competencyDetail.width = item.detailSize[0];
    competencyDetail.height = item.detailSize[1];
    competencyDetail.alt = item.detailAlt;
    competencyDetail.style.objectPosition = item.detailPosition;
    competencyCounter.textContent = item.number;
    competencyLabels.forEach((label, labelIndex) => {
      label.setAttribute('aria-current', String(labelIndex === index));
    });
    activeCompetency = index;
    preloadCompetency(index - 1);
    preloadCompetency(index + 1);
  };

  const runAnimation = (element, keyframes, options) => {
    if (!element?.animate) return null;
    return element.animate(keyframes, { easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both', ...options });
  };

  const decodeVisibleCompetencyMedia = () => Promise.allSettled(
    [competencyMain, competencyDetail]
      .filter(image => image.offsetParent !== null)
      .map(image => image.decode?.())
      .filter(Boolean)
  );

  const switchCompetency = async (nextIndex, direction = 'forward') => {
    const normalizedIndex = (nextIndex + competencies.length) % competencies.length;
    if (competencyAnimating || normalizedIndex === activeCompetency) return;
    competencyAnimating = true;
    competenciesRoot.classList.add('is-changing');

    if (reducedMotionQuery.matches) {
      const fadeOut = [competencyMain, competencyDetail].map(element => runAnimation(element, [{ opacity: 1 }, { opacity: 0 }], { duration: 100 }));
      await Promise.all(fadeOut.filter(Boolean).map(animation => animation.finished.catch(() => {})));
      fadeOut.forEach(animation => animation?.cancel());
      renderCompetency(normalizedIndex);
      await decodeVisibleCompetencyMedia();
      const fadeIn = [competencyMain, competencyDetail].map(element => runAnimation(element, [{ opacity: 0 }, { opacity: 1 }], { duration: 140 }));
      await Promise.all(fadeIn.filter(Boolean).map(animation => animation.finished.catch(() => {})));
      fadeIn.forEach(animation => animation?.cancel());
      competenciesRoot.classList.remove('is-changing');
      competencyAnimating = false;
      return;
    }

    const forward = direction === 'forward';
    const maskIn = runAnimation(competencyMask, [
      { transform: `translateX(${forward ? '-101%' : '101%'})` },
      { transform: 'translateX(0)' }
    ], { duration: 390 });
    const mainOut = runAnimation(competencyMain, [{ transform: 'scale(1)' }, { transform: 'scale(1.015)' }], { duration: 390 });
    const detailOut = runAnimation(competencyDetail, [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: `translateY(${forward ? '18px' : '-18px'})` }
    ], { duration: 260, delay: 90 });
    const numberOut = runAnimation(competencyNumber, [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: `translateY(${forward ? '-105%' : '105%'})` }
    ], { duration: 260 });
    const textOut = competencyText.map(element => runAnimation(element, [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-12px)' }
    ], { duration: 210 }));

    await maskIn.finished.catch(() => {});
    renderCompetency(normalizedIndex);
    await decodeVisibleCompetencyMedia();
    [mainOut, detailOut, numberOut, ...textOut].forEach(animation => animation?.cancel());
    maskIn.cancel();

    const maskOut = runAnimation(competencyMask, [
      { transform: 'translateX(0)' },
      { transform: `translateX(${forward ? '101%' : '-101%'})` }
    ], { duration: 390 });
    const mainIn = runAnimation(competencyMain, [{ transform: 'scale(1.025)' }, { transform: 'scale(1)' }], { duration: 520 });
    const detailIn = runAnimation(competencyDetail, [
      { opacity: 0, clipPath: forward ? 'inset(100% 0 0)' : 'inset(0 0 100%)', transform: `translateY(${forward ? '18px' : '-18px'})` },
      { opacity: 1, clipPath: 'inset(0)', transform: 'translateY(0)' }
    ], { duration: 560, delay: 90 });
    const numberIn = runAnimation(competencyNumber, [
      { opacity: 0, transform: `translateY(${forward ? '105%' : '-105%'})` },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 480 });
    const textIn = competencyText.map((element, index) => runAnimation(element, [
      { opacity: 0, transform: 'translateY(16px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 420, delay: index * 65 }));
    const incomingAnimations = [maskOut, mainIn, detailIn, numberIn, ...textIn].filter(Boolean);
    await Promise.all(incomingAnimations.map(animation => animation.finished.catch(() => {})));
    incomingAnimations.forEach(animation => animation.cancel());
    competenciesRoot.classList.remove('is-changing');
    competencyAnimating = false;
  };

  competencyPrevious?.addEventListener('click', () => switchCompetency(activeCompetency - 1, 'backward'));
  competencyNext?.addEventListener('click', () => switchCompetency(activeCompetency + 1, 'forward'));
  competencyLabels.forEach((label, index) => {
    label.addEventListener('click', () => {
      const direction = index > activeCompetency ? 'forward' : 'backward';
      switchCompetency(index, direction);
    });
  });
  competenciesRoot.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    switchCompetency(activeCompetency + (event.key === 'ArrowRight' ? 1 : -1), event.key === 'ArrowRight' ? 'forward' : 'backward');
  });
  competenciesRoot.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && window.innerWidth >= 768) return;
    swipeStart = { x: event.clientX, y: event.clientY };
  }, { passive: true });
  competenciesRoot.addEventListener('pointerup', event => {
    if (!swipeStart || (event.pointerType === 'mouse' && window.innerWidth >= 768)) return;
    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;
    switchCompetency(activeCompetency + (deltaX < 0 ? 1 : -1), deltaX < 0 ? 'forward' : 'backward');
  }, { passive: true });
  competenciesRoot.addEventListener('pointercancel', () => {
    swipeStart = null;
  }, { passive: true });
  competenciesRoot.addEventListener('dragstart', event => {
    if (window.innerWidth < 768) event.preventDefault();
  });

  if (reducedMotionQuery.matches) {
    competenciesRoot.classList.add('is-entered');
  } else {
    const competenciesObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .55)) return;
      competenciesRoot.classList.add('is-entered');
      competenciesObserver.disconnect();
    }, { threshold: [.55] });
    competenciesObserver.observe(competenciesRoot);
  }
  renderCompetency(0);
}

const geography = document.querySelector('[data-geography]');

if (geography) {
  const regionsData = [
    { id: 'bryansk', name: 'Брянская область', coordinates: [34.37, 53.24], projectsCount: null, categories: [], href: '#contacts' },
    { id: 'vladimir', name: 'Владимирская область', coordinates: [40.41, 56.13], projectsCount: null, categories: [], href: '#contacts' },
    { id: 'volgograd', name: 'Волгоградская область', coordinates: [44.52, 48.71], projectsCount: null, categories: [], href: '#contacts' },
    { id: 'vologda', name: 'Вологодская область', coordinates: [39.89, 59.22], projectsCount: null, categories: [], href: '#contacts' },
    { id: 'voronezh', name: 'Воронежская область', coordinates: [39.20, 51.66], projectsCount: null, categories: [], href: '#contacts' },
    { id: 'leningrad', name: 'Ленинградская область', coordinates: [29.13, 59.57], projectsCount: null, categories: [], href: '#contacts' },
    { id: 'lipetsk', name: 'Липецкая область', coordinates: [39.60, 52.61], projectsCount: null, categories: [], href: '#contacts' },
    { id: 'moscow', name: 'Московская область', coordinates: [37.62, 55.75], projectsCount: 1, categories: [], href: '#contacts' },
    { id: 'murmansk', name: 'Мурманская область', coordinates: [33.08, 68.97], projectsCount: null, categories: [], href: '#contacts' },
    { id: 'nizhny', name: 'Нижегородская область', coordinates: [44.00, 56.33], projectsCount: null, categories: [], href: '#contacts' },
    { id: 'oryol', name: 'Орловская область', coordinates: [36.06, 52.97], projectsCount: null, categories: [], href: '#contacts' },
    { id: 'ryazan', name: 'Рязанская область', coordinates: [39.74, 54.63], projectsCount: null, categories: [], href: '#contacts' },
    { id: 'smolensk', name: 'Смоленская область', coordinates: [32.04, 54.78], projectsCount: null, categories: [], href: '#contacts' },
    { id: 'tambov', name: 'Тамбовская область', coordinates: [41.45, 52.72], projectsCount: null, categories: [], href: '#contacts' },
    { id: 'tver', name: 'Тверская область', coordinates: [35.91, 56.86], projectsCount: 2, categories: ['Проектирование', 'Строительство', 'ЛЭП'], href: '#contacts' },
    { id: 'tula', name: 'Тульская область', coordinates: [37.62, 54.19], projectsCount: null, categories: [], href: '#contacts' },
    { id: 'yaroslavl', name: 'Ярославская область', coordinates: [39.89, 57.63], projectsCount: null, categories: [], href: '#contacts' }
  ];
  const regionsCount = regionsData.length;
  const geographyNames = Object.fromEntries(regionsData.map(region => [region.id, region.name]));
  const regionsById = Object.fromEntries(regionsData.map(region => [region.id, region]));
  geography.querySelector('[data-geography-count]').textContent = regionsCount;
  if (regionsCount !== 17 || new Set(regionsData.map(region => region.id)).size !== regionsCount) {
    console.error('На карте должно быть ровно 17 уникальных регионов');
  }
  const geographyProjects = {
    tver: [
      {
        title: 'Западный мост',
        description: 'Переустройство воздушных линий электропередачи напряжением 0,4–110 кВ при строительстве мостового перехода через Волгу в Твери.'
      },
      {
        title: 'ПС 110 кВ «Западная Двина»',
        description: 'Ремонт силового трансформатора ТДТН-40000/110/35/10.',
        meta: 'Заказчик: ПАО «МРСК Центра» — «Тверьэнерго» · 2020'
      }
    ],
    moscow: [
      {
        title: 'Освещение скоростной дороги М‑11',
        description: 'Устройство освещения на участках км 58–97 и км 208–258.',
        meta: 'Заказчик: Государственная компания «Автодор» · 2016–2019'
      },
      {
        title: 'Аструм-Сити',
        description: 'Объект коммерческой недвижимости класса B/B+ — шестое по высоте здание в Московской области.'
      }
    ],
    vologda: [
      {
        title: 'Монтаж трансформатора ТДН-25000/110 УХЛ1 А',
        description: 'ПС 110/10 кВ с питанием по ЛЭП 110 кВ от ПС 220 кВ «РПП-1» для нужд Череповецкого тепличного комплекса «Новый».',
        meta: 'Заказчик: ООО «Череповецкий ТК «Новый» · 2019'
      }
    ],
    voronezh: [
      {
        title: 'Реконструкция ВЛ 110 кВ «НВАЭС — Лискинская 1, 2»',
        description: 'Разнос цепей ВЛ 110 кВ в разные анкерные участки в рамках схемы выдачи мощности Нововоронежской АЭС‑2.',
        meta: 'Заказчик: филиал ПАО «МРСК Центра» — «Воронежэнерго» · 2018'
      }
    ]
  };
  let geographyControls = [...geography.querySelectorAll('.geography-point')];
  const geographyMap = geography.querySelector('.geography-map');
  const geographyName = geography.querySelector('[data-geography-name]');
  const geographyIndex = geography.querySelector('[data-geography-index]');
  const geographyProjectList = geography.querySelector('[data-geography-projects]');
  const geographyPopup = geography.querySelector('[data-geography-popup]');
  let activeRegion = '';
  let visibleRegion = '';
  let geographyCloseTimer = 0;
  const geographyMarkerPositions = {
    murmansk: [971, 91], leningrad: [546, 237], vologda: [794, 220], smolensk: [529, 391],
    tver: [615, 320], yaroslavl: [713, 374], moscow: [622, 387], vladimir: [730, 448],
    nizhny: [788, 455], bryansk: [453, 527], oryol: [558, 453], tula: [667, 492],
    ryazan: [751, 535], lipetsk: [669, 677], tambov: [672, 578], voronezh: [552, 639],
    volgograd: [784, 684]
  };
  const geographyMarkerOrder = [...geographyControls].sort((first, second) => {
    const [firstX, firstY] = geographyMarkerPositions[first.dataset.region];
    const [secondX, secondY] = geographyMarkerPositions[second.dataset.region];
    return (firstX / 1633 + firstY / 963) - (secondX / 1633 + secondY / 963);
  });
  const geographyMarkerDelays = Object.fromEntries(
    geographyMarkerOrder.map((control, index) => [control.dataset.region, index * 220])
  );

  geographyControls.forEach(control => {
    const [x, y] = geographyMarkerPositions[control.dataset.region];
    control.querySelector('.geography-region-shape')?.remove();
    control.querySelector('.geography-label')?.remove();
    control.querySelectorAll('circle').forEach(circle => {
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
    });
    control.querySelector('.geography-marker-pulse')?.setAttribute('r', '13');
    control.querySelector('.geography-marker-core')?.setAttribute('r', '5');
    const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hitArea.classList.add('geography-marker-hit');
    hitArea.setAttribute('cx', x);
    hitArea.setAttribute('cy', y);
    hitArea.setAttribute('r', '26');
    control.prepend(hitArea);
    control.style.setProperty('--region-delay', `${geographyMarkerDelays[control.dataset.region]}ms`);
  });

  const geographyMarkerObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    geographyMap.classList.add('is-visible');
    geographyMarkerObserver.disconnect();
  }, { threshold: .18 });
  geographyMarkerObserver.observe(geographyMap);

  const renderRegion = region => {
    geographyName.textContent = geographyNames[region];
    const projects = geographyProjects[region] || [];
    geographyIndex.textContent = projects.length
      ? `${projects.length} ${projects.length === 1 ? 'проект' : 'проекта'}`
      : 'Регион присутствия';
    geographyProjectList.replaceChildren();
    if (!projects.length) {
      const neutral = document.createElement('p');
      neutral.className = 'geography-neutral';
      neutral.textContent = 'Регион присутствия ЭнергоГрупп';
      geographyProjectList.append(neutral);
      return;
    }
    projects.forEach((project, index) => {
      const row = document.createElement('p');
      const number = document.createElement('b');
      const copy = document.createElement('span');
      number.textContent = String(index + 1).padStart(2, '0');
      copy.textContent = project.title;
      if (project.description) {
        const detail = document.createElement('small');
        detail.textContent = project.description;
        copy.append(detail);
      }
      if (project.meta) {
        const meta = document.createElement('em');
        meta.textContent = project.meta;
        copy.append(meta);
      }
      row.append(number, copy);
      geographyProjectList.append(row);
    });
  };

  const positionGeographyPopup = region => {
    const control = geographyControls.find(item => item.dataset.region === region);
    if (!control || !geographyPopup.classList.contains('is-open')) return;
    const mapRect = geographyMap.getBoundingClientRect();
    const pointRect = (control.querySelector('.geography-marker-core') || control).getBoundingClientRect();
    const pointX = pointRect.left + pointRect.width / 2 - mapRect.left;
    const pointY = pointRect.top + pointRect.height / 2 - mapRect.top;
    const popupWidth = geographyPopup.offsetWidth;
    const popupHeight = geographyPopup.offsetHeight;
    let left = pointX + 18;
    if (left + popupWidth > mapRect.width - 14) left = pointX - popupWidth - 18;
    left = Math.max(14, Math.min(left, mapRect.width - popupWidth - 14));
    const top = Math.max(14, Math.min(pointY - popupHeight / 2, mapRect.height - popupHeight - 14));
    geographyPopup.style.left = `${left}px`;
    geographyPopup.style.top = `${top}px`;
  };

  const showRegion = (region, isPreview = false) => {
    if (!geographyNames[region]) return;
    window.clearTimeout(geographyCloseTimer);
    visibleRegion = region;
    renderRegion(region);
    geographyPopup.classList.add('is-open');
    geographyPopup.setAttribute('aria-hidden', 'false');
    geographyMap.classList.add('is-popup-open');
    geographyMap.classList.toggle('has-preview', isPreview);
    geographyControls.forEach(control => {
      control.classList.toggle('is-preview', isPreview && control.dataset.region === region);
      control.classList.toggle('is-active', control.dataset.region === activeRegion);
    });
    requestAnimationFrame(() => positionGeographyPopup(region));
  };

  const closeRegion = () => {
    visibleRegion = '';
    geographyPopup.classList.remove('is-open');
    geographyPopup.setAttribute('aria-hidden', 'true');
    geographyMap.classList.remove('has-preview', 'is-popup-open');
    geographyControls.forEach(control => {
      control.classList.remove('is-preview');
      control.classList.toggle('is-active', control.dataset.region === activeRegion);
    });
  };

  const scheduleRegionClose = () => {
    window.clearTimeout(geographyCloseTimer);
    geographyCloseTimer = window.setTimeout(() => {
      if (activeRegion) showRegion(activeRegion);
      else closeRegion();
    }, 160);
  };

  const setActiveRegion = region => {
    activeRegion = region;
    geographyControls.forEach(control => {
      const isActive = control.dataset.region === activeRegion;
      control.classList.toggle('is-active', isActive);
      control.setAttribute('aria-pressed', String(isActive));
    });
    if (activeRegion) showRegion(activeRegion);
    else closeRegion();
  };

  const bindGeographyControl = control => {
    const region = control.dataset.region;
    control.setAttribute('aria-pressed', 'false');
    control.addEventListener('click', event => {
      event.stopPropagation();
      setActiveRegion(region);
    });
    control.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      setActiveRegion(region);
    });
    control.addEventListener('pointerenter', () => showRegion(region, region !== activeRegion));
    control.addEventListener('pointerleave', scheduleRegionClose);
    control.addEventListener('focus', () => showRegion(region, region !== activeRegion));
    control.addEventListener('blur', scheduleRegionClose);
  };

  geographyControls.forEach(bindGeographyControl);

  geographyPopup.addEventListener('pointerenter', () => window.clearTimeout(geographyCloseTimer));
  geographyPopup.addEventListener('pointerleave', scheduleRegionClose);
  geographyMap.addEventListener('click', event => {
    if (event.target.closest('.geography-point, .geography-region')) return;
    activeRegion = '';
    closeRegion();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (visibleRegion) {
      activeRegion = '';
      closeRegion();
    }
  });

  window.addEventListener('resize', () => {
    if (visibleRegion) positionGeographyPopup(visibleRegion);
  });

  const createSvgElement = name => document.createElementNS('http://www.w3.org/2000/svg', name);
  const buildGeographyGeometry = async () => {
    const geometry = await fetch('assets/data/geography-map.json').then(response => {
      if (!response.ok) throw new Error('Не удалось загрузить геометрию карты');
      return response.json();
    });
    const svg = geography.querySelector('.geography-map-svg');
    const terrain = geography.querySelector('.geography-terrain');
    const outline = geography.querySelector('.geography-land-outline');
    const regionLayer = geography.querySelector('.geography-points');
    terrain.replaceChildren(...geometry.contextRegions.map(shape => {
      const path = createSvgElement('path');
      path.classList.add('geography-context-region');
      if (shape.active) path.classList.add('is-present');
      path.setAttribute('d', shape.path);
      path.setAttribute('fill-rule', 'evenodd');
      return path;
    }));
    outline.removeAttribute('d');
    svg.setAttribute('viewBox', '45 295 155 305');
    svg.setAttribute('preserveAspectRatio', 'none');
    const bounds = geometry.regions.reduce((result, shape) => ({
      minX: Math.min(result.minX, shape.x), maxX: Math.max(result.maxX, shape.x),
      minY: Math.min(result.minY, shape.y), maxY: Math.max(result.maxY, shape.y)
    }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
    regionLayer.replaceChildren(...geometry.regions.map(shape => {
      const data = regionsById[shape.id];
      const group = createSvgElement('g');
      const normalizedX = (shape.x - bounds.minX) / (bounds.maxX - bounds.minX || 1);
      const normalizedY = (shape.y - bounds.minY) / (bounds.maxY - bounds.minY || 1);
      group.classList.add('geography-point');
      group.dataset.region = shape.id;
      group.setAttribute('role', 'button');
      group.setAttribute('tabindex', '0');
      group.setAttribute('aria-label', data.name);
      group.style.setProperty('--region-delay', `${250 + (normalizedX * .55 + normalizedY * .45) * 1300}ms`);
      const regionPath = createSvgElement('path');
      regionPath.classList.add('geography-region-shape');
      regionPath.setAttribute('d', shape.path);
      regionPath.setAttribute('fill-rule', 'evenodd');
      const pulse = createSvgElement('circle');
      pulse.classList.add('geography-marker-pulse');
      pulse.setAttribute('cx', shape.x);
      pulse.setAttribute('cy', shape.y);
      pulse.setAttribute('r', '10');
      const marker = createSvgElement('circle');
      marker.classList.add('geography-marker-core');
      marker.setAttribute('cx', shape.x);
      marker.setAttribute('cy', shape.y);
      marker.setAttribute('r', '4');
      const label = createSvgElement('text');
      label.classList.add('geography-label');
      const opensLeft = shape.x > (bounds.minX + bounds.maxX) / 2;
      label.setAttribute('x', shape.x + (opensLeft ? -14 : 14));
      label.setAttribute('y', shape.y - 4);
      if (opensLeft) label.setAttribute('text-anchor', 'end');
      const labelParts = data.name.toUpperCase().split(' ОБЛАСТЬ');
      label.textContent = labelParts[0];
      if (labelParts.length > 1) {
        const secondLine = createSvgElement('tspan');
        secondLine.setAttribute('x', label.getAttribute('x'));
        secondLine.setAttribute('dy', '12');
        secondLine.textContent = 'ОБЛАСТЬ';
        label.append(secondLine);
      }
      group.append(regionPath, pulse, marker, label);
      return group;
    }));
    geographyControls = [...geography.querySelectorAll('.geography-point')];
    geographyControls.forEach(bindGeographyControl);
    geographyMap.classList.add('has-geometry');
    requestAnimationFrame(() => geographyMap.classList.add('is-visible'));
  };

  closeRegion();
}

const projectsDirectory = document.querySelector('[data-projects-directory]');
const projectsDirectoryOpen = document.querySelector('[data-projects-directory-open]');
const projectsDirectoryClose = document.querySelector('[data-projects-directory-close]');

const closeProjectsDirectory = () => {
  if (projectsDirectory?.open) projectsDirectory.close();
};

projectsDirectoryOpen?.addEventListener('click', () => {
  if (!projectsDirectory?.showModal) return;
  projectsDirectory.showModal();
  document.body.classList.add('projects-directory-open');
});
projectsDirectoryClose?.addEventListener('click', closeProjectsDirectory);
projectsDirectory?.addEventListener('click', event => {
  if (event.target === projectsDirectory) closeProjectsDirectory();
});
projectsDirectory?.addEventListener('close', () => {
  document.body.classList.remove('projects-directory-open');
  projectsDirectoryOpen?.focus();
});

const partnersSlider = document.querySelector('[data-partners-slider]');

if (partnersSlider) {
  const partnersViewport = partnersSlider.querySelector('[data-partners-viewport]');
  const partnersTrack = partnersSlider.querySelector('[data-partners-track]');
  const partnerCards = [...partnersSlider.querySelectorAll('.partner-card')];
  const partnersPrev = partnersSlider.querySelector('[data-partners-prev]');
  const partnersNext = partnersSlider.querySelector('[data-partners-next]');
  const partnersCounter = partnersSlider.querySelector('[data-partners-counter]');
  const partnersDirectory = document.querySelector('[data-partners-directory]');
  const partnersDirectoryOpen = document.querySelector('[data-partners-directory-open]');
  const partnersDirectoryClose = document.querySelector('[data-partners-directory-close]');
  const partnersDirectoryGrid = document.querySelector('[data-partners-directory-grid]');
  let partnerIndex = 0;
  let partnerSwipeStart = null;

  if (partnersDirectoryGrid) {
    partnerCards.forEach((card, index) => {
      const image = card.querySelector('img');
      if (!image) return;
      const directoryCard = document.createElement('article');
      directoryCard.className = 'partners-directory__card';
      const number = document.createElement('small');
      number.textContent = String(index + 1).padStart(2, '0');
      const directoryImage = image.cloneNode(true);
      const name = document.createElement('p');
      name.textContent = image.alt;
      directoryCard.append(number, directoryImage, name);
      partnersDirectoryGrid.append(directoryCard);
    });
  }

  const openPartnersDirectory = () => {
    if (!partnersDirectory?.showModal) return;
    partnersDirectory.showModal();
    document.body.classList.add('partners-directory-open');
  };

  const closePartnersDirectory = () => {
    if (!partnersDirectory?.open) return;
    partnersDirectory.close();
  };

  partnersDirectoryOpen?.addEventListener('click', openPartnersDirectory);
  partnersDirectoryClose?.addEventListener('click', closePartnersDirectory);
  partnersDirectory?.addEventListener('click', event => {
    if (event.target === partnersDirectory) closePartnersDirectory();
  });
  partnersDirectory?.addEventListener('close', () => {
    document.body.classList.remove('partners-directory-open');
    partnersDirectoryOpen?.focus();
  });

  const getVisiblePartners = () => window.innerWidth < 768 ? 1 : window.innerWidth <= 1100 ? 2 : 3;

  const renderPartnersSlider = () => {
    const visiblePartners = getVisiblePartners();
    const maxIndex = Math.max(partnerCards.length - visiblePartners, 0);
    partnerIndex = Math.min(partnerIndex, maxIndex);
    const gap = parseFloat(getComputedStyle(partnersTrack).gap) || 0;
    const cardWidth = partnerCards[0]?.getBoundingClientRect().width || 0;
    partnersTrack.style.setProperty('--partners-x', `${-partnerIndex * (cardWidth + gap)}px`);
    partnersPrev.disabled = partnerIndex === 0;
    partnersNext.disabled = partnerIndex === maxIndex;
    const visibleEndIndex = Math.min(partnerIndex + visiblePartners, partnerCards.length);
    partnersCounter.textContent = `${String(visibleEndIndex).padStart(2, '0')} / ${String(partnerCards.length).padStart(2, '0')}`;
    partnerCards.forEach((card, index) => {
      card.setAttribute('aria-hidden', index < partnerIndex || index >= partnerIndex + visiblePartners ? 'true' : 'false');
    });
  };

  const movePartnersSlider = direction => {
    const maxIndex = Math.max(partnerCards.length - getVisiblePartners(), 0);
    partnerIndex = Math.max(0, Math.min(partnerIndex + direction, maxIndex));
    renderPartnersSlider();
  };

  partnersPrev.addEventListener('click', () => movePartnersSlider(-1));
  partnersNext.addEventListener('click', () => movePartnersSlider(1));
  partnersSlider.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      movePartnersSlider(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      movePartnersSlider(1);
    }
  });
  partnersSlider.addEventListener('pointerdown', event => {
    if (window.innerWidth >= 768) return;
    partnerSwipeStart = { x: event.clientX, y: event.clientY };
  }, { passive: true });
  partnersSlider.addEventListener('pointerup', event => {
    if (!partnerSwipeStart) return;
    const deltaX = event.clientX - partnerSwipeStart.x;
    const deltaY = event.clientY - partnerSwipeStart.y;
    partnerSwipeStart = null;
    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;
    movePartnersSlider(deltaX < 0 ? 1 : -1);
  }, { passive: true });
  partnersSlider.addEventListener('pointercancel', () => {
    partnerSwipeStart = null;
  }, { passive: true });
  partnersSlider.addEventListener('dragstart', event => event.preventDefault());

  if ('ResizeObserver' in window) {
    new ResizeObserver(renderPartnersSlider).observe(partnersViewport);
  } else {
    window.addEventListener('resize', renderPartnersSlider, { passive: true });
  }

  renderPartnersSlider();
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -8%' });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(element);
});

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
}
