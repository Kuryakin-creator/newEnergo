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
const startsAfterMobileHeroTransition = window.innerWidth < 1200 && window.scrollY > 1;
const mobileHeroTransition = {
  active: startsAfterMobileHeroTransition
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

// Единый состав экранов на всех ширинах; карточки и их анимация сохраняются.
if (horizontalNumbers) {
  const numberGroups = [
    { title: 'Ресурсы компании', cards: ['employees', 'equipment', 'facilities'] },
    { title: 'Энергетическая инфраструктура созданная нами', cards: ['substations', 'connected', 'supports'] },
    { title: 'Энергетическое строительство', cards: ['powerlines', 'hdd', 'built'] }
  ];
  horizontalNumberPanels.slice(1).forEach((panel, index) => {
    const group = numberGroups[index];
    const metrics = panel.querySelector('.horizontal-numbers__metrics');
    group.cards.forEach(key => metrics.append(horizontalNumbers.querySelector(`.number-card--${key}`)));
    panel.querySelector('.number-context').textContent = group.title;
    panel.setAttribute('aria-label', group.title);
    horizontalNumbersSwipeButtons[index + 1]?.setAttribute('aria-label', group.title);
  });
  [
    ['facilities', 'собственных производственных площадей'],
    ['hdd', 'проколов выполнено методом ГНБ']
  ].forEach(([key, text]) => {
    const caption = horizontalNumbers.querySelector(`.number-card--${key} > p`);
    caption.textContent = text;
  });
}

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
  const usesDesktopTriggeredTransition = window.innerWidth >= 1200;
  const usesMobileTriggeredTransition = window.innerWidth < 1200;
  const heroProgress = usesDesktopTriggeredTransition
    ? heroTransition.progress
    : usesMobileTriggeredTransition
      ? Number(mobileHeroTransition.active)
      : clamp(-rect.top / scrollDistance);
  const imageProgress = 1 - Math.pow(1 - clamp(heroProgress / .92), 3);

  if (usesMobileTriggeredTransition) {
    hero.classList.toggle('is-letters-active', heroProgress > .001);
  } else if (!usesDesktopTriggeredTransition) {
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

function updateMobileHeroTransition(currentScroll = window.scrollY) {
  if (window.innerWidth >= 1200) {
    hero?.classList.remove('is-mobile-media-active');
    heroTransitionImage?.classList.remove('is-mobile-media-active');
    return;
  }

  mobileHeroTransition.active = currentScroll > 1;
  const mediaIsCovered = mission && mission.getBoundingClientRect().top <= 0;
  hero?.classList.toggle('is-mobile-media-active', mobileHeroTransition.active);
  heroTransitionImage?.classList.toggle('is-mobile-media-active', mobileHeroTransition.active && !mediaIsCovered);
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

  const postHeroThreshold = Math.max(getHeroRestingScroll() - 2, 24);
  const isPostHero = current >= postHeroThreshold;
  header.classList.toggle('is-scrolled', isPostHero);
  header.classList.toggle('is-post-hero', isPostHero);
  header.classList.remove('is-hidden');
  header.classList.toggle(
    'is-mobile-collapsed',
    window.innerWidth < 1200 && current > 24 && !menu.classList.contains('is-open')
  );
  if (!isPostHero && menu.classList.contains('is-open')) closeMenu();
  updateScrollIndicators(current);

  updateMobileHeroTransition(current);
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
      if (card.classList.contains('number-card--employees') || card.classList.contains('number-card--powerlines')) maximumScale = 1.2;
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
  // Показываем нижние подписи «О компании» после перехода на desktop.
  const anchorOffset = target === about && window.innerWidth >= 1024 ? 40 : 0;
  let targetTop = 0;
  let offsetNode = target;
  while (offsetNode) {
    targetTop += offsetNode.offsetTop;
    offsetNode = offsetNode.offsetParent;
  }
  window.scrollTo({
    top: targetTop + anchorOffset,
    left: 0,
    behavior: reducedMotionQuery.matches ? 'auto' : 'smooth'
  });
  if (!reducedMotionQuery.matches) {
    let anchorAligned = false;
    const alignAnchor = () => {
      if (anchorAligned) return;
      anchorAligned = true;
      const visualOffset = target.getBoundingClientRect().top + anchorOffset;
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
  const competencyPhoto = (file, size, alt, position = 'center') => ({
    src: `assets/images/competencies/${file}`,
    size,
    alt,
    position
  });
  const competencies = [
    {
      id: 'internal-networks',
      number: '01',
      navigationLabel: 'ВНУТРЕННИЕ СЕТИ',
      title: 'Внутренние электрические сети',
      subtitle: 'Инженерные системы',
      description: ['Внутренняя электрическая сеть', 'Пожарная сигнализация', 'Охранная сигнализация', 'Локальная сеть', 'Диспетчеризация'],
      photos: [
        competencyPhoto('internal-01-enhanced.png', [1448, 1086], 'Внутренние электрические сети в офисном помещении'),
        competencyPhoto('internal-02-enhanced.png', [1448, 1086], 'Монтаж внутренних электрических сетей'),
        competencyPhoto('internal-04.jpg', [1280, 964], 'Смонтированные внутренние инженерные сети'),
        competencyPhoto('internal-08-enhanced.png', [1448, 1086], 'Кабельная трасса внутренней электрической сети')
      ]
    },
    {
      id: 'cable-lines',
      number: '02',
      navigationLabel: 'КАБЕЛЬНЫЕ ЛИНИИ',
      title: 'Кабельные линии',
      subtitle: 'Энергетическая инфраструктура',
      description: ['Собственная спецтехника', 'Профессиональный инженерный состав', 'Аккредитация заводов-изготовителей', 'Оптимизация сроков', 'Многолетний опыт строительства'],
      photos: [
        competencyPhoto('cable-01-enhanced.webp', [1600, 983], 'Прокладка кабельной линии собственной спецтехникой'),
        competencyPhoto('cable-02-enhanced.webp', [1497, 1051], 'Подготовка трассы для прокладки кабельных линий'),
        competencyPhoto('cable-03-enhanced.webp', [1493, 1053], 'Земляные работы при строительстве кабельной линии')
      ]
    },
    {
      id: 'overhead-lines',
      number: '03',
      navigationLabel: 'ВОЗДУШНЫЕ ЛИНИИ',
      title: 'Воздушные линии электропередачи',
      subtitle: 'Электросетевое строительство',
      description: ['Проектирование воздушных линий', 'Строительство и реконструкция ВЛ', 'Монтаж опор и проводов'],
      photos: [
        competencyPhoto('overhead-01.jpg', [1280, 960], 'Монтаж опоры воздушной линии электропередачи'),
        competencyPhoto('overhead-02-enhanced.png', [1448, 1086], 'Установка железобетонной опоры воздушной линии'),
        competencyPhoto('overhead-03-enhanced.png', [1448, 1086], 'Монтаж опор воздушной линии кранами'),
        competencyPhoto('overhead-04.jpg', [1280, 960], 'Опора воздушной линии и техника ЭнергоГрупп'),
        competencyPhoto('overhead-05.jpg', [1280, 960], 'Установленная опора воздушной линии'),
        competencyPhoto('overhead-06.jpg', [1280, 960], 'Кран при строительстве воздушной линии электропередачи'),
        competencyPhoto('overhead-07.jpg', [1280, 960], 'Работы на опоре воздушной линии электропередачи')
      ]
    },
    {
      id: 'substations',
      number: '04',
      navigationLabel: 'ПОДСТАНЦИИ',
      title: 'Распределительные пункты и трансформаторные подстанции',
      subtitle: 'Подстанционная инфраструктура',
      description: ['Технико-экономическое обоснование', 'Проектирование', 'Строительство'],
      photos: [
        competencyPhoto('substation-01-clean.png', [1448, 1086], 'Трансформаторная подстанция после строительства'),
        competencyPhoto('substation-02.jpg', [1280, 960], 'Распределительное устройство и трансформаторная подстанция'),
        competencyPhoto('substation-03.jpg', [1280, 960], 'Строительство основания распределительного пункта'),
        competencyPhoto('substation-04.jpg', [1280, 960], 'Подстанция с воздушными линиями электропередачи'),
        competencyPhoto('substation-05.jpg', [1280, 960], 'Территория новой трансформаторной подстанции'),
        competencyPhoto('substation-06.png', [1448, 1086], 'Трансформаторная подстанция без рекламной маркировки')
      ]
    },
    {
      id: 'decorative-lighting',
      number: '05',
      navigationLabel: 'АРХИТЕКТУРНОЕ ОСВЕЩЕНИЕ',
      title: 'Декоративное и архитектурное освещение',
      subtitle: 'Светотехнические решения',
      description: ['Проектирование', 'Монтажные работы'],
      photos: [competencyPhoto('decorative-lighting-01-enhanced.webp', [1608, 978], 'Декоративное архитектурное освещение здания')]
    },
    {
      id: 'outdoor-lighting',
      number: '06',
      navigationLabel: 'НАРУЖНОЕ ОСВЕЩЕНИЕ',
      title: 'Наружное электроосвещение',
      subtitle: 'Инфраструктурное освещение',
      description: ['Проектирование', 'Строительство'],
      photos: [
        competencyPhoto('outdoor-lighting-01-enhanced.webp', [1448, 1086], 'Работы по устройству наружного электроосвещения ночью'),
        competencyPhoto('outdoor-lighting-02-clean.webp', [1733, 907], 'Освещение участка автомобильной дороги М-11')
      ]
    },
    {
      id: 'commissioning',
      number: '07',
      navigationLabel: 'ПУСКОНАЛАДКА',
      title: 'Пусконаладочные работы',
      subtitle: 'Наладка инженерных систем',
      description: ['Наладка работоспособности систем', 'Проверка проектной документации', 'Подготовка к вводу в эксплуатацию'],
      photos: [
        competencyPhoto('commissioning-01-enhanced.png', [1448, 1086], 'Работы на оборудовании трансформаторной подстанции'),
        competencyPhoto('commissioning-02-enhanced.png', [1448, 1086], 'Специалист выполняет пусконаладочные работы'),
        competencyPhoto('commissioning-03.jpg', [1489, 895], 'Проверка электрического оборудования при пусконаладке')
      ]
    },
    {
      id: 'hdd',
      number: '08',
      navigationLabel: 'ГНБ',
      title: 'ГНБ — горизонтально-направленное бурение',
      subtitle: 'Бестраншейная прокладка коммуникаций',
      description: ['Собственные установки', 'Квалифицированный инженерный состав', 'Оптимизация сроков', 'Многолетний опыт строительства'],
      photos: [competencyPhoto('hdd-01-enhanced.webp', [1733, 907], 'Горизонтально-направленное бурение под автомобильной дорогой')]
    },
    {
      id: 'civil',
      number: '09',
      navigationLabel: 'ГРАЖДАНСКОЕ СТРОИТЕЛЬСТВО',
      title: 'Гражданское строительство',
      subtitle: 'Жилые объекты',
      description: ['Кирпичные многоэтажные жилые дома', 'Индивидуальное отопление', 'Объекты комфорт-класса'],
      photos: [
        competencyPhoto('civil-01-enhanced.png', [1448, 1086], 'Кирпичный многоэтажный жилой дом'),
        competencyPhoto('civil-02-enhanced.png', [1448, 1086], 'Завершённый жилой дом комфорт-класса'),
        competencyPhoto('civil-03-enhanced.png', [1448, 1086], 'Фасад введённого в эксплуатацию жилого дома'),
        competencyPhoto('civil-04-enhanced.png', [1448, 1086], 'Строительство кирпичного жилого дома')
      ]
    },
    {
      id: 'industrial',
      number: '10',
      navigationLabel: 'ПРОМЫШЛЕННОЕ СТРОИТЕЛЬСТВО',
      title: 'Промышленное строительство',
      subtitle: 'Коммерческие объекты',
      description: ['Строительство коммерческой недвижимости', 'Класс зданий B/B+'],
      photos: [
        competencyPhoto('industrial-01.jpg', [1280, 720], 'Высотный объект коммерческой недвижимости'),
        competencyPhoto('industrial-02-enhanced.png', [1447, 1087], 'Фасад высотного коммерческого объекта')
      ]
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
  const competencyCounterTotal = competenciesRoot.querySelector('[data-competency-counter-total]');
  const competencyLabels = [...competenciesRoot.querySelectorAll('[data-competency-label]')];
  const competencyPrevious = competenciesRoot.querySelector('[data-competency-prev]');
  const competencyNext = competenciesRoot.querySelector('[data-competency-next]');
  const competencyText = [competencyTitle, competencySubtitle, competencyDescription, competencyLink].filter(Boolean);
  let activeCompetency = 0;
  let activePhoto = 0;
  let competencyAnimating = false;
  let swipeStart = null;

  const stepState = (competencyIndex, photoIndex, delta) => {
    let nextCompetency = competencyIndex;
    let nextPhoto = photoIndex + delta;
    if (nextPhoto >= competencies[nextCompetency].photos.length) {
      nextCompetency = (nextCompetency + 1) % competencies.length;
      nextPhoto = 0;
    } else if (nextPhoto < 0) {
      nextCompetency = (nextCompetency - 1 + competencies.length) % competencies.length;
      nextPhoto = competencies[nextCompetency].photos.length - 1;
    }
    return { competencyIndex: nextCompetency, photoIndex: nextPhoto };
  };

  const preloadState = ({ competencyIndex, photoIndex }) => {
    const image = new Image();
    image.src = competencies[competencyIndex].photos[photoIndex].src;
  };

  const renderDescription = lines => {
    const fragment = document.createDocumentFragment();
    lines.forEach((line, index) => {
      if (index) fragment.append(document.createElement('br'));
      fragment.append(document.createTextNode(`• ${line}`));
    });
    competencyDescription.replaceChildren(fragment);
  };

  const renderCompetency = (index, photoIndex = 0) => {
    const item = competencies[index];
    const photo = item.photos[photoIndex];
    competenciesRoot.dataset.activeCompetency = item.id;
    competencyNumber.textContent = item.number;
    competencyTitle.textContent = item.title;
    competencySubtitle.textContent = item.subtitle;
    renderDescription(item.description);
    if (competencyLink) {
      competencyLink.childNodes[0].nodeValue = `${item.linkLabel} `;
      competencyLink.href = item.href;
    }
    competencyMain.src = photo.src;
    competencyMain.srcset = `${photo.src} ${photo.size[0]}w`;
    competencyMain.width = photo.size[0];
    competencyMain.height = photo.size[1];
    competencyMain.alt = photo.alt;
    competencyMain.style.objectPosition = photo.position;
    competencyDetail.src = photo.src;
    competencyDetail.srcset = `${photo.src} ${photo.size[0]}w`;
    competencyDetail.width = photo.size[0];
    competencyDetail.height = photo.size[1];
    competencyDetail.alt = '';
    competencyDetail.style.objectPosition = photo.position;
    competencyCounter.textContent = String(photoIndex + 1).padStart(2, '0');
    competencyCounterTotal.textContent = String(item.photos.length).padStart(2, '0');
    const labelIndexes = [index - 1, index, index + 1].map(value => (value + competencies.length) % competencies.length);
    competencyLabels.forEach((label, labelIndex) => {
      const linkedIndex = labelIndexes[labelIndex];
      label.textContent = competencies[linkedIndex].navigationLabel;
      label.dataset.competencyIndex = linkedIndex;
      label.dataset.competencyDirection = String(labelIndex - 1);
      label.setAttribute('aria-current', String(labelIndex === 1));
      label.setAttribute('aria-label', `Открыть компетенцию «${competencies[linkedIndex].title}»`);
    });
    activeCompetency = index;
    activePhoto = photoIndex;
    preloadState(stepState(index, photoIndex, -1));
    preloadState(stepState(index, photoIndex, 1));
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

  const switchCompetency = async (nextIndex, nextPhotoIndex = 0, direction = 'forward') => {
    const normalizedIndex = (nextIndex + competencies.length) % competencies.length;
    const normalizedPhoto = Math.min(Math.max(nextPhotoIndex, 0), competencies[normalizedIndex].photos.length - 1);
    if (competencyAnimating || (normalizedIndex === activeCompetency && normalizedPhoto === activePhoto)) return;
    const competencyChanged = normalizedIndex !== activeCompetency;
    competencyAnimating = true;
    competenciesRoot.classList.add('is-changing');

    if (reducedMotionQuery.matches) {
      const fadeOut = [competencyMain, competencyDetail].map(element => runAnimation(element, [{ opacity: 1 }, { opacity: 0 }], { duration: 100 }));
      await Promise.all(fadeOut.filter(Boolean).map(animation => animation.finished.catch(() => {})));
      fadeOut.forEach(animation => animation?.cancel());
      renderCompetency(normalizedIndex, normalizedPhoto);
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
    const numberOut = competencyChanged ? runAnimation(competencyNumber, [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: `translateY(${forward ? '-105%' : '105%'})` }
    ], { duration: 260 }) : null;
    const textOut = competencyChanged ? competencyText.map(element => runAnimation(element, [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-12px)' }
    ], { duration: 210 })) : [];

    await maskIn.finished.catch(() => {});
    renderCompetency(normalizedIndex, normalizedPhoto);
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
    const numberIn = competencyChanged ? runAnimation(competencyNumber, [
      { opacity: 0, transform: `translateY(${forward ? '105%' : '-105%'})` },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 480 }) : null;
    const textIn = competencyChanged ? competencyText.map((element, index) => runAnimation(element, [
      { opacity: 0, transform: 'translateY(16px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 420, delay: index * 65 })) : [];
    const incomingAnimations = [maskOut, mainIn, detailIn, numberIn, ...textIn].filter(Boolean);
    await Promise.all(incomingAnimations.map(animation => animation.finished.catch(() => {})));
    incomingAnimations.forEach(animation => animation.cancel());
    competenciesRoot.classList.remove('is-changing');
    competencyAnimating = false;
  };

  const moveCompetency = direction => {
    const nextState = stepState(activeCompetency, activePhoto, direction);
    switchCompetency(nextState.competencyIndex, nextState.photoIndex, direction > 0 ? 'forward' : 'backward');
  };

  competencyPrevious?.addEventListener('click', () => moveCompetency(-1));
  competencyNext?.addEventListener('click', () => moveCompetency(1));
  competencyLabels.forEach(label => {
    label.addEventListener('click', () => {
      const index = Number(label.dataset.competencyIndex);
      const direction = Number(label.dataset.competencyDirection) < 0 ? 'backward' : 'forward';
      switchCompetency(index, 0, direction);
    });
  });
  competenciesRoot.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    moveCompetency(event.key === 'ArrowRight' ? 1 : -1);
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
    moveCompetency(deltaX < 0 ? 1 : -1);
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
  renderCompetency(0, 0);
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
  const geographyTitle = geography.querySelector('.geography-title');
  const geographyRegionItems = [...geography.querySelectorAll('.geography-region-list li')];
  const geographyRegionList = geography.querySelector('.geography-region-list');
  geography.querySelector('[data-geography-count]').textContent = regionsCount;
  if (regionsCount !== 17 || new Set(regionsData.map(region => region.id)).size !== regionsCount) {
    console.error('На карте должно быть ровно 17 уникальных регионов');
  }
  let geographyControls = [...geography.querySelectorAll('.geography-point')];
  const geographyMap = geography.querySelector('.geography-map');
  const geographyCompactLayout = window.matchMedia('(max-width: 1023px)');
  const geographyMobileLayout = window.matchMedia('(max-width: 767px)');
  const placeGeographyRegionList = () => {
    if (geographyCompactLayout.matches) {
      geographyMap.after(geographyRegionList);
    } else {
      geographyTitle.append(geographyRegionList);
    }
    if (geographyMobileLayout.matches) {
      geographyMap.style.order = '4';
      geographyRegionList.style.order = '5';
    } else {
      geographyMap.style.removeProperty('order');
      geographyRegionList.style.removeProperty('order');
    }
  };
  placeGeographyRegionList();
  geographyCompactLayout.addEventListener('change', placeGeographyRegionList);
  geographyMobileLayout.addEventListener('change', placeGeographyRegionList);
  let activeRegion = '';
  let geographyCloseTimer = 0;
  const geographyMarkerPositions = {
    murmansk: [807, 136], leningrad: [545, 272], vologda: [603, 354], smolensk: [385, 389],
    tver: [474, 373], yaroslavl: [560, 420], moscow: [468, 454], vladimir: [526, 496],
    nizhny: [573, 550], bryansk: [345, 450], oryol: [376, 495], tula: [421, 494],
    ryazan: [475, 531], lipetsk: [409, 547], tambov: [448, 592], voronezh: [383, 605],
    volgograd: [416, 712]
  };
  const geographyMarkerOrder = [...geographyControls].sort((first, second) => {
    const [firstX, firstY] = geographyMarkerPositions[first.dataset.region];
    const [secondX, secondY] = geographyMarkerPositions[second.dataset.region];
    return ((firstX - 45) / 155 + (firstY - 295) / 305) - ((secondX - 45) / 155 + (secondY - 295) / 305);
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
    control.querySelector('.geography-marker-pulse')?.setAttribute('r', '14');
    control.querySelector('.geography-marker-core')?.setAttribute('r', '5');
    const hitArea = control.querySelector('.geography-marker-hit')
      || document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hitArea.classList.add('geography-marker-hit');
    hitArea.setAttribute('cx', x);
    hitArea.setAttribute('cy', y);
    hitArea.setAttribute('r', '22');
    if (!hitArea.parentNode) control.prepend(hitArea);
    control.style.setProperty('--region-delay', `${geographyMarkerDelays[control.dataset.region]}ms`);
  });

  const geographyMarkerObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    geographyMap.classList.add('is-visible');
    geographyMarkerObserver.disconnect();
  }, { threshold: .18 });
  geographyMarkerObserver.observe(geographyMap);

  const highlightRegionItem = region => {
    geographyRegionItems.forEach(item => {
      item.classList.toggle('is-highlighted', item.dataset.region === region);
    });
  };

  const showRegion = (region, isPreview = false) => {
    if (!geographyNames[region]) return;
    window.clearTimeout(geographyCloseTimer);
    geographyMap.classList.toggle('has-preview', isPreview);
    geographyControls.forEach(control => {
      control.classList.toggle('is-preview', isPreview && control.dataset.region === region);
      control.classList.toggle('is-active', control.dataset.region === activeRegion);
    });
    highlightRegionItem(region);
  };

  const closeRegion = () => {
    geographyMap.classList.remove('has-preview');
    geographyControls.forEach(control => {
      control.classList.remove('is-preview');
      control.classList.toggle('is-active', control.dataset.region === activeRegion);
    });
    highlightRegionItem(activeRegion);
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

  geographyRegionItems.forEach((item, index) => {
    const region = regionsData[index]?.id;
    if (!region) return;
    item.dataset.region = region;
    item.tabIndex = 0;
    item.addEventListener('pointerenter', () => showRegion(region, region !== activeRegion));
    item.addEventListener('pointerleave', scheduleRegionClose);
    item.addEventListener('focus', () => showRegion(region, region !== activeRegion));
    item.addEventListener('blur', scheduleRegionClose);
  });

  geographyMap.addEventListener('click', event => {
    if (event.target.closest('.geography-point')) return;
    activeRegion = '';
    closeRegion();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (activeRegion || geographyMap.classList.contains('has-preview')) {
      activeRegion = '';
      closeRegion();
    }
  });

  const createSvgElement = name => document.createElementNS('http://www.w3.org/2000/svg', name);
  const buildGeographyGeometry = () => {
    const regionLayer = geography.querySelector('.geography-points');
    const markerEntries = Object.entries(geographyMarkerPositions);
    const bounds = markerEntries.reduce((result, [, [x, y]]) => ({
      minX: Math.min(result.minX, x), maxX: Math.max(result.maxX, x),
      minY: Math.min(result.minY, y), maxY: Math.max(result.maxY, y)
    }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
    regionLayer.replaceChildren(...markerEntries.map(([regionId, [markerX, markerY]]) => {
      const data = regionsById[regionId];
      const group = createSvgElement('g');
      const normalizedX = (markerX - bounds.minX) / (bounds.maxX - bounds.minX || 1);
      const normalizedY = (markerY - bounds.minY) / (bounds.maxY - bounds.minY || 1);
      group.classList.add('geography-point');
      group.dataset.region = regionId;
      group.setAttribute('role', 'button');
      group.setAttribute('tabindex', '0');
      group.setAttribute('aria-label', data.name);
      group.style.setProperty('--region-delay', `${250 + (normalizedX * .55 + normalizedY * .45) * 1300}ms`);
      const hitArea = createSvgElement('circle');
      hitArea.classList.add('geography-marker-hit');
      hitArea.setAttribute('cx', markerX);
      hitArea.setAttribute('cy', markerY);
      hitArea.setAttribute('r', '26');
      const pulse = createSvgElement('circle');
      pulse.classList.add('geography-marker-pulse');
      pulse.setAttribute('cx', markerX);
      pulse.setAttribute('cy', markerY);
      pulse.setAttribute('r', '13');
      const marker = createSvgElement('circle');
      marker.classList.add('geography-marker-core');
      marker.setAttribute('cx', markerX);
      marker.setAttribute('cy', markerY);
      marker.setAttribute('r', '5');
      const label = createSvgElement('text');
      label.classList.add('geography-label');
      const opensLeft = markerX > (bounds.minX + bounds.maxX) / 2;
      label.setAttribute('x', markerX + (opensLeft ? -14 : 14));
      label.setAttribute('y', markerY - 4);
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
      group.append(hitArea, pulse, marker, label);
      return group;
    }));
    geographyControls = [...geography.querySelectorAll('.geography-point')];
    geographyControls.forEach(bindGeographyControl);
    geographyMap.classList.add('has-geometry');
    requestAnimationFrame(() => geographyMap.classList.add('is-visible'));
  };

  buildGeographyGeometry();
  closeRegion();
}

// Keep desktop dialogs in browser history so native Back also closes them.
const bindDirectoryHistory = (dialog, trigger, key) => {
  if (!dialog || !trigger) return;
  const desktop = window.matchMedia('(min-width: 1200px)');
  let restoring = false;

  trigger.addEventListener('click', () => {
    if (!desktop.matches || !dialog.open || restoring) return;
    history.pushState({ ...history.state, energoDirectory: key }, '');
  });

  window.addEventListener('popstate', () => {
    if (history.state?.energoDirectory !== key) {
      if (dialog.open) dialog.close();
    } else if (desktop.matches && !dialog.open) {
      restoring = true;
      try {
        trigger.click();
      } finally {
        restoring = false;
      }
    }
  });

  dialog.addEventListener('close', () => {
    if (history.state?.energoDirectory === key) history.back();
  });
};

const projectsDirectory = document.querySelector('[data-projects-directory]');
const projectsDirectoryOpen = document.querySelector('[data-projects-directory-open]');
const projectsDirectoryNavLinks = document.querySelectorAll('[data-projects-directory-nav-open]');
const projectsDirectoryClose = document.querySelector('[data-projects-directory-close]');

const closeProjectsDirectory = () => {
  if (projectsDirectory?.open) projectsDirectory.close();
};

projectsDirectoryOpen?.addEventListener('click', () => {
  if (!projectsDirectory?.showModal) return;
  projectsDirectory.showModal();
  document.body.classList.add('projects-directory-open');
});
projectsDirectoryNavLinks.forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  event.stopPropagation();
  projectsDirectoryOpen?.click();
}));
projectsDirectoryClose?.addEventListener('click', closeProjectsDirectory);
projectsDirectory?.addEventListener('click', event => {
  if (event.target === projectsDirectory) closeProjectsDirectory();
});
projectsDirectory?.addEventListener('close', () => {
  document.body.classList.remove('projects-directory-open');
  projectsDirectoryOpen?.focus();
});
bindDirectoryHistory(projectsDirectory, projectsDirectoryOpen, 'projects');

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
  const partnersDirectoryNavLinks = document.querySelectorAll('[data-partners-directory-nav-open]');
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
  partnersDirectoryNavLinks.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    partnersDirectoryOpen?.click();
  }));
  partnersDirectoryClose?.addEventListener('click', closePartnersDirectory);
  partnersDirectory?.addEventListener('click', event => {
    if (event.target === partnersDirectory) closePartnersDirectory();
  });
  partnersDirectory?.addEventListener('close', () => {
    document.body.classList.remove('partners-directory-open');
    partnersDirectoryOpen?.focus();
  });
  bindDirectoryHistory(partnersDirectory, partnersDirectoryOpen, 'partners');

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
