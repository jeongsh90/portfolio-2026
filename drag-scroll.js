(function () {
  var container = document.querySelector('[data-scroll-container]');
  if (!container) return;

  var dragging = false;
  var lastX = 0;
  var multiplier = 3;

  function pushDelta(dx) {
    var lscroll = window.__lscroll;
    if (!lscroll || !lscroll.scroll) return;
    lscroll.scroll.updateDelta({ deltaX: 0, deltaY: dx * multiplier });
    if (!lscroll.scroll.isScrolling) lscroll.scroll.startScrolling();
  }

  function onPointerDown(e) {
    if (e.pointerType === 'touch') return;
    dragging = true;
    lastX = e.clientX;
    document.documentElement.classList.add('is-dragging');
    container.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    var dx = e.clientX - lastX;
    lastX = e.clientX;
    pushDelta(dx);
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    document.documentElement.classList.remove('is-dragging');
    if (container.hasPointerCapture(e.pointerId)) {
      container.releasePointerCapture(e.pointerId);
    }
  }

  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerUp);
})();
