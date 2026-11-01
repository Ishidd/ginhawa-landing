// Keep the examples usable independently of the lazily loaded WebGL scene.
const host = document.querySelector<HTMLElement>('.adaptive-orb-root');
const suggestions: Record<string, string> = {
  studies: 'Break one assignment into a smaller first step.',
  relationships: 'Plan a calm conversation about one thing you need.',
  finances: 'List one manageable expense to review this week.',
};
document.querySelectorAll<HTMLButtonElement>('[data-factor]').forEach((button, i) => button.addEventListener('click', () => {
  document.querySelectorAll<HTMLButtonElement>('[data-factor]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('#ai-example-text')!.textContent = suggestions[button.dataset.factor!];
  if (host) {
    host.dataset.factor = String(i);
    host.dispatchEvent(new CustomEvent('guidance-factor', {detail:i}));
  }
}));
if (host) {
  const near = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    near.disconnect();
    import('./AdaptiveGuidanceOrb').then(({mountAdaptiveOrb}) => mountAdaptiveOrb(host)).catch(() => {
      // The complete static orb and readable example remain available.
      host.closest('.guidance-orb')?.classList.add('orb-static');
    });
  }, {rootMargin:'500px'});
  near.observe(host);
}
