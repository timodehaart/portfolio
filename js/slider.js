/**
 * slider.js
 *
 * Measures how many pixels of screen remain below the slider's top edge
 * and writes that as --remaining-vh on .slider-viewport.
 *
 * The viewport is height: calc(var(--remaining-vh) * 2), so:
 *   - the top half is the on-screen landing strip
 *   - the bottom half extends below the fold and is reached by scrolling
 */

(function () {
  const vp = document.getElementById('sliderViewport');
  if (!vp) return;

  function sync() {
    const rect = vp.getBoundingClientRect();
    // How much vertical space from the slider top to the bottom of the screen
    const remaining = window.innerHeight - rect.top;
    const clamped = Math.max(remaining, 120);
    vp.style.setProperty('--remaining-vh', clamped + 'px');
  }

  // Use rAF so layout is fully settled before measuring
  requestAnimationFrame(sync);
  window.addEventListener('resize', sync);
})();