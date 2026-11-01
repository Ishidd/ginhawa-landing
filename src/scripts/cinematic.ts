import { screens, screenPath, type ScreenTheme } from '../data/showcase';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const carousel = document.querySelector<HTMLElement>('.screen-carousel')!;
const phones = [...carousel.querySelectorAll<HTMLButtonElement>('.gallery-phone')];
let theme: ScreenTheme = 'dark';
let active = 'home';
let position = 0;
let destination = 0;
let animation = 0;
let order = [...screens].sort((a, b) => a[theme] - b[theme]);


// Sample the track itself throughout the tween. Interpolating only end transforms
// would make a straight diagonal move, not the shallow spatial arc in the brief.
function paintPhones() {
  const mobile = carousel.clientWidth < 760;
  const radius = mobile ? Math.min(365, carousel.clientWidth * .62) : Math.min(590, carousel.clientWidth * .54);
  for (const phone of phones) {
    const index = order.findIndex(screen => screen.id === phone.dataset.screenId);
    let offset = ((index - position + 4.5) % 9 + 9) % 9 - 4.5;
    const angle = offset * .48;
    const x = Math.sin(angle) * radius;
    const z = (Math.cos(angle) - 1) * radius - Math.abs(offset) * 34;
    const y = (1 - Math.cos(angle)) * 62;
    const isActive = phone.dataset.screenId === active;
    const visible = Math.abs(offset) < 2.7;
    phone.style.transform = `translateX(-50%) translate3d(${x}px,${y}px,${z}px) rotateY(${-offset * 17}deg) scale(${1 - Math.min(Math.abs(offset), 3) * .055})`;
    phone.style.filter = `brightness(${1 - Math.min(Math.abs(offset), 3) * .18})`;
    phone.style.opacity = String(clamp(3 - Math.abs(offset), 0, 1));
    phone.style.visibility = visible ? 'visible' : 'hidden';
    phone.style.zIndex = String(10 - Math.round(Math.abs(offset) * 2));
    phone.tabIndex = visible ? 0 : -1;
    phone.setAttribute('aria-pressed', String(isActive));
    phone.setAttribute('aria-hidden', String(!visible));
  }
}

function caption() {
  const screen = screens.find(screen => screen.id === active)!;
  document.querySelector('#screen-announcement')!.textContent = `Screen ${screen[theme]} of 9: ${screen.title}. ${screen.description}`;
  document.querySelector('.gallery-count b')!.textContent = String(screen[theme]).padStart(2, '0');
  document.querySelectorAll<HTMLButtonElement>('.feature-menu button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.focusScreen === active)));
}

function moveTo(target: number) {
  cancelAnimationFrame(animation);
  destination = target;
  active = order[((target % 9) + 9) % 9].id;
  caption();
  const from = position;
  const started = performance.now();
  const frame = (now: number) => {
    const progress = reducedMotion.matches ? 1 : clamp((now - started) / 850, 0, 1);
    // Quintic ease-out: deliberate travel, soft landing, no overshoot while reading.
    position = from + (target - from) * (1 - Math.pow(1 - progress, 5));
    paintPhones();
    if (progress < 1) animation = requestAnimationFrame(frame);
  };
  animation = requestAnimationFrame(frame);
}

phones.forEach(phone => phone.addEventListener('click', () => {
  if (suppressClick) return;
  const index = order.findIndex(screen => screen.id === phone.dataset.screenId);
  const current = ((destination % 9) + 9) % 9;
  const delta = ((index - current + 13) % 9) - 4;
  moveTo(destination + delta);
}));
document.querySelectorAll<HTMLElement>('[data-focus-screen]').forEach(control => control.addEventListener('click', () => {
  const index = order.findIndex(screen => screen.id === control.dataset.focusScreen);
  if (index < 0) return;
  const current = ((destination % 9) + 9) % 9;
  const delta = ((index - current + 13) % 9) - 4;
  moveTo(destination + delta);
}));
document.querySelectorAll<HTMLButtonElement>('[data-step]').forEach(button => button.addEventListener('click', () => moveTo(destination + Number(button.dataset.step))));
carousel.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  // Keep keyboard focus stable when the previously focused side phone retreats.
  carousel.focus({preventScroll:true});
  if (event.key === 'Home') moveTo(0);
  else if (event.key === 'End') moveTo(8);
  else moveTo(destination + (event.key === 'ArrowRight' ? 1 : -1));
});

let gesture: {x:number; y:number; id:number} | null = null;
let suppressClick = false;
carousel.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  gesture = {x:event.clientX, y:event.clientY, id:event.pointerId};
  suppressClick = false;
});
carousel.addEventListener('pointermove', event => {
  if (!gesture || gesture.id !== event.pointerId) return;
  const dx = event.clientX - gesture.x;
  const dy = event.clientY - gesture.y;
  if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    suppressClick = true;
    carousel.setPointerCapture(event.pointerId);
  }
});
carousel.addEventListener('pointerup', event => {
  if (!gesture || gesture.id !== event.pointerId) return;
  const dx = event.clientX - gesture.x;
  const dy = event.clientY - gesture.y;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) moveTo(destination + (dx < 0 ? 1 : -1));
  gesture = null;
  // The click synthesized after pointerup must not select the phone underneath.
  setTimeout(() => { suppressClick = false; }, 0);
});
carousel.addEventListener('pointercancel', () => {gesture = null; suppressClick = false;});

let themeRevision = 0;
document.querySelectorAll<HTMLButtonElement>('[data-theme]').forEach(button => button.addEventListener('click', async () => {
  const next = button.dataset.theme as ScreenTheme;
  if (next === theme) return;
  const revision = ++themeRevision;
  theme = next;
  cancelAnimationFrame(animation);
  order = [...screens].sort((a, b) => a[theme] - b[theme]);
  position = destination = order.findIndex(screen => screen.id === active);
  document.querySelector('.theme-switch')!.setAttribute('data-theme', theme);
  document.querySelectorAll<HTMLButtonElement>('.theme-switch button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  caption();
  paintPhones();
  await Promise.all(phones.map(async phone => {
    const screen = screens.find(screen => screen.id === phone.dataset.screenId)!;
    const img = phone.querySelector('img')!;
    const source = screenPath(screen, next);
    const preload = new Image(); preload.src = source;
    try { await preload.decode(); } catch { return; }
    if (revision !== themeRevision) return;
    img.src = source;
    if (!reducedMotion.matches) img.animate([{opacity:.35},{opacity:1}], {duration:400,easing:'ease-out'});
  }));
}));
new ResizeObserver(paintPhones).observe(carousel);
paintPhones();

// Like the supplied line-draw reference, the tip follows a reading line at 55%
// of the viewport. The SVG lives in page space; it never continues into the footer.
const journey = document.querySelector<SVGSVGElement>('.scroll-journey')!;
const path = journey.querySelector<SVGPathElement>('.journey-draw')!;
const trail = journey.querySelector<SVGPathElement>('.journey-trail')!;
const tip = journey.querySelector<SVGGElement>('.journey-tip')!;
const nodes = [...journey.querySelectorAll<SVGCircleElement>('.journey-node')];
const sections = nodes.map(node => document.getElementById(node.dataset.stop!)!);
const main = document.querySelector<HTMLElement>('#main')!;
const hero = document.querySelector<HTMLElement>('.hero')!;
const heroPhone = document.querySelector<HTMLElement>('.hero-phone')!;
let pathLength = 0;
let mainTop = 0;
let stops: {x:number; y:number}[] = [];
let scrollFrame = 0;
let measureFrame = 0;
let tiltX = 0, tiltY = 0;
let targetDistance = 0;
let drawnDistance = 0;
let journeyFrame = 0;
let journeyTime = 0;
let journeyStarted = false;
let stopDistances: number[] = [];

function lengthAtY(y: number) {
  if (y <= stops[0].y) return 0;
  if (y >= stops[stops.length - 1].y) return pathLength;
  let low = 0, high = pathLength;
  for (let i = 0; i < 18; i++) {
    const middle = (low + high) / 2;
    if (path.getPointAtLength(middle).y < y) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

function measure() {
  measureFrame = 0;
  mainTop = main.getBoundingClientRect().top + scrollY;
  const pageWidth = main.clientWidth;
  const mobile = innerWidth <= 760;
  // Layout offsets ignore reveal transforms, so the route stays still as text enters.
  const layoutBox = (element: HTMLElement) => {
    let x = 0, y = 0;
    for (let item: HTMLElement | null = element; item && item !== main; item = item.offsetParent as HTMLElement | null) {
      x += item.offsetLeft;
      y += item.offsetTop;
    }
    return {x, y, width: element.offsetWidth, height: element.offsetHeight};
  };
  const columnGap = (left: string, right: string) => {
    const leftElement = document.querySelector<HTMLElement>(left)!;
    const rightElement = document.querySelector<HTMLElement>(right)!;
    const a = layoutBox(leftElement);
    const b = layoutBox(rightElement);
    const row = leftElement.parentElement;
    // The route follows the shared grid gap, even when a reading block is
    // narrower and centered inside its column.
    if (row === rightElement.parentElement && row?.classList.contains('balanced-layout')) {
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const inset = parseFloat(getComputedStyle(rightElement).left) || 0;
      return a.x + a.width + (gap + inset) / 2;
    }
    return (a.x + a.width + b.x) / 2;
  };
  const left = mobile ? 14 : Math.max(40, pageWidth * .045);
  const right = pageWidth - left;
  const corridors = mobile
    ? [right, left, right, left, right, left]
    : [right, columnGap('.purpose-copy', '.assessment-overview'), columnGap('.chika-world', '.chika-copy'), innerWidth > 1100 ? columnGap('.showcase-context', '.showcase-stage') : left, columnGap('.ai-copy', '.ai-visual'), left];
  const boxes = sections.map(section => layoutBox(section));
  stops = sections.map((section, i) => {
    const heading = section.querySelector<HTMLElement>('h1, h2')!;
    const box = layoutBox(heading);
    return {x: corridors[i], y: box.y + box.height / 2};
  });
  const end = stops[stops.length - 1].y;
  journey.style.height = `${end + 40}px`;
  journey.setAttribute('viewBox', `0 0 ${pageWidth} ${end + 40}`);
  // Traverse the whole composition. Cross-column sweeps sit in the shared
  // breathing space between sections; within sections the line follows gaps.
  const points = [stops[0]];
  for (let i = 0; i < sections.length - 1; i++) {
    const boundary = boxes[i + 1].y;
    const previous = points[points.length - 1];
    const departureY = Math.max(previous.y + 12, boundary - 64);
    const arrivalY = Math.min(stops[i + 1].y - 12, boundary + 56);
    points.push({x: corridors[i], y: departureY});
    points.push({x: corridors[i + 1], y: arrivalY});
    points.push(stops[i + 1]);
  }
  let previous = points[0];
  let d = `M ${previous.x} ${previous.y}`;
  for (const point of points.slice(1)) {
    const dy = (point.y - previous.y) * .45;
    d += ` C ${previous.x} ${previous.y + dy}, ${point.x} ${point.y - dy}, ${point.x} ${point.y}`;
    previous = point;
  }
  path.setAttribute('d', d);
  trail.setAttribute('d', d);
  pathLength = path.getTotalLength();
  path.style.strokeDasharray = String(pathLength);
  stopDistances = stops.map(stop => lengthAtY(stop.y));
  nodes.forEach((node, i) => {
    const point = path.getPointAtLength(stopDistances[i]);
    node.setAttribute('cx', String(point.x));
    node.setAttribute('cy', String(point.y));
    node.setAttribute('r', mobile ? '2.5' : '4');
  });
  tip.querySelector('image')!.setAttribute('width', mobile ? '40' : '72');
  tip.querySelector('image')!.setAttribute('height', mobile ? '40' : '72');
  tip.querySelector('image')!.setAttribute('x', mobile ? '-20' : '-36');
  tip.querySelector('image')!.setAttribute('y', mobile ? '-20' : '-36');
  journey.classList.add('is-measured');
  // A resize or disclosure changes the route itself; remap in place rather than
  // tweening from obsolete coordinates. Ordinary scrolling uses the eased path.
  cancelAnimationFrame(journeyFrame);
  journeyFrame = 0;
  targetDistance = drawnDistance = lengthAtY(scrollY + innerHeight * .55 - mainTop);
  updateScroll();
  paintJourney();
}

function paintJourney() {
  path.style.strokeDashoffset = String(pathLength - drawnDistance);
  const point = path.getPointAtLength(drawnDistance);
  tip.setAttribute('transform', `translate(${point.x} ${point.y})`);
  tip.style.opacity = journeyStarted ? '1' : '0';
  nodes.forEach((node, i) => node.classList.toggle('is-read', journeyStarted && drawnDistance >= stopDistances[i]));
}

function easeJourney(now: number) {
  journeyFrame = 0;
  const dt = Math.max(0, now - journeyTime);
  journeyTime = now;
  const delta = targetDistance - drawnDistance;
  if (reducedMotion.matches || document.hidden || Math.abs(delta) < .5) {
    drawnDistance = targetDistance;
  } else {
    // Time-based damping is identical on 60/120 Hz screens. A speed ceiling
    // softens cross-page turns, with catch-up for long anchor/keyboard jumps.
    const speed = Math.max(innerWidth <= 760 ? 700 : 1100, Math.abs(delta) * 2.5);
    const step = Math.min(Math.abs(delta) * (1 - Math.exp(-dt / 280)), speed * dt / 1000);
    drawnDistance += Math.sign(delta) * step;
  }
  if (Math.abs(targetDistance - drawnDistance) < .5) drawnDistance = targetDistance;
  paintJourney();
  if (Math.abs(targetDistance - drawnDistance) >= .5) journeyFrame = requestAnimationFrame(easeJourney);
}

function updateScroll() {
  scrollFrame = 0;
  if (pathLength > 0 && stops.length) {
    const readingY = scrollY + innerHeight * .55 - mainTop;
    targetDistance = lengthAtY(readingY);
    journeyStarted = readingY >= stops[0].y;
    if (reducedMotion.matches || document.hidden) {
      cancelAnimationFrame(journeyFrame);
      journeyFrame = 0;
      drawnDistance = targetDistance;
      paintJourney();
    } else if (!journeyFrame) {
      journeyTime = performance.now();
      journeyFrame = requestAnimationFrame(easeJourney);
    }
  }
  const turn = 1 - clamp(scrollY / (hero.offsetHeight * .75), 0, 1);
  heroPhone.style.transform = reducedMotion.matches ? 'none' : `rotateX(${8 * turn + tiltX}deg) rotateY(${-18 * turn + tiltY}deg)`;
}
function scheduleScroll() {if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);}
function scheduleMeasure() {if (!measureFrame) measureFrame = requestAnimationFrame(measure);}
addEventListener('scroll', scheduleScroll, {passive:true});
addEventListener('resize', scheduleMeasure);
// Native FAQ disclosures and font swaps can move Download. Remeasure the real
// content, not just the viewport, including while an answer expands/collapses.
new ResizeObserver(scheduleMeasure).observe(main);
document.fonts.ready.then(scheduleMeasure);
measure();
hero.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
  const bounds = hero.getBoundingClientRect();
  tiltY = (event.clientX / bounds.width - .5) * 5;
  tiltX = (.5 - (event.clientY - bounds.top) / bounds.height) * 3;
  scheduleScroll();
});
hero.addEventListener('pointerleave', () => {tiltX = 0; tiltY = 0; scheduleScroll();});

const images = [...document.querySelectorAll<HTMLImageElement>('.chika-animation')];
function applyMotion() {
  images.forEach(img => img.src = !reducedMotion.matches && !document.hidden && img.dataset.inView === 'true' ? img.dataset.animated! : (img.dataset.still || '/assets/chika-still.webp'));
  if (reducedMotion.matches) moveTo(destination);
  updateScroll();
}
const chikaObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => (entry.target as HTMLElement).dataset.inView = String(entry.isIntersecting));
  applyMotion();
}, {rootMargin:'80px'});
images.forEach(img => chikaObserver.observe(img));
reducedMotion.addEventListener('change', applyMotion);
document.addEventListener('visibilitychange', applyMotion);
applyMotion();
const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.remove('reveal-wait');
    reveals.unobserve(entry.target);
  }
}), {threshold:0, rootMargin:'0px 0px -9% 0px'});
document.querySelectorAll<HTMLElement>('.reveal').forEach(element => {
  // Content is visible by default without JavaScript; never hide a restored
  // scroll position, a hash destination already on screen, or keyboard focus.
  if (!reducedMotion.matches && element.getBoundingClientRect().top >= innerHeight) element.classList.add('reveal-wait');
  reveals.observe(element);
  element.addEventListener('focusin', () => {
    element.classList.remove('reveal-wait');
    reveals.unobserve(element);
  }, {once:true});
});

// The guidance seal catches light only while the hero is in view.
const badge = document.querySelector<HTMLElement>('.validation-badge')!;
const badgeObserver = new IntersectionObserver(([entry]) => badge.classList.toggle('is-visible', entry.isIntersecting));
badgeObserver.observe(badge);
badge.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
  const bounds = badge.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - .5;
  const y = (event.clientY - bounds.top) / bounds.height - .5;
  badge.style.setProperty('--badge-x', `${-y * 10}deg`);
  badge.style.setProperty('--badge-y', `${x * 12}deg`);
});
badge.addEventListener('pointerleave', () => {
  badge.style.setProperty('--badge-x', '0deg');
  badge.style.setProperty('--badge-y', '0deg');
});
document.addEventListener('visibilitychange', () => badge.classList.toggle('is-hidden', document.hidden));
