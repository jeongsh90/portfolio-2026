(function () {
  function replayAnimate(shape) {
    var type = shape.getAttribute('data-animate');
    if (!type) return;
    shape.removeAttribute('data-animate');
    void shape.offsetWidth; // reflow
    shape.setAttribute('data-animate', type);
  }

  function initAnimateDemos(root) {
    (root || document).querySelectorAll('.anim-demo-box').forEach(function (box) {
      if (box.dataset.animBound === 'true') return;
      box.dataset.animBound = 'true';

      if (!box.hasAttribute('tabindex')) box.setAttribute('tabindex', '0');

      box.addEventListener('click', function () {
        var shape = box.querySelector('.anim-demo-shape');
        if (shape) replayAnimate(shape);
      });

      box.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          var shape = box.querySelector('.anim-demo-shape');
          if (shape) replayAnimate(shape);
        }
      });
    });
  }

  window.initAnimateDemos = initAnimateDemos;
})();
