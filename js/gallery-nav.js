(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  if (!items.length) return;

  var prevBtn = document.getElementById('galleryNavPrev');
  var nextBtn = document.getElementById('galleryNavNext');
  var homeBtn = document.getElementById('galleryNavHome');
  if (!prevBtn || !nextBtn || !homeBtn) return;

  function itemCenterX(item) {
    var rect = item.getBoundingClientRect();
    return rect.left + rect.width / 2;
  }

  function currentIndex() {
    var viewportCenter = window.innerWidth / 2;
    var closest = 0;
    var closestDist = Infinity;
    items.forEach(function (item, i) {
      var dist = Math.abs(itemCenterX(item) - viewportCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  }

  function isSmoothMode() {
    var lscroll = window.__lscroll;
    return !!(
      lscroll &&
      lscroll.scroll &&
      typeof lscroll.scroll.updateDelta === 'function' &&
      lscroll.scroll.instance
    );
  }

  function goToSmooth(item) {
    var lscroll = window.__lscroll;
    var axis = lscroll.scroll.directionAxis || 'x';
    var rect = item.getBoundingClientRect();
    var currentScroll = lscroll.scroll.instance.scroll[axis];
    var desiredLeft = (window.innerWidth - rect.width) / 2;
    var contentPos = rect.left + currentScroll;
    var limit = lscroll.scroll.instance.limit[axis];
    var target = Math.max(0, Math.min(contentPos - desiredLeft, limit));

    lscroll.scroll.instance.scroll[axis] = target;
    lscroll.scroll.instance.delta[axis] = target;
    lscroll.scroll.update();
  }

  function goToNative(item) {
    var targetCenter = window.innerWidth / 2;
    var delta = itemCenterX(item) - targetCenter;
    if (Math.abs(delta) < 1) return;
    window.scrollBy({ left: delta, top: 0, behavior: 'smooth' });
  }

  function goTo(index) {
    index = Math.max(0, Math.min(index, items.length - 1));
    var item = items[index];
    if (isSmoothMode()) {
      goToSmooth(item);
    } else {
      goToNative(item);
    }
  }

  prevBtn.addEventListener('click', function () {
    goTo(currentIndex() - 1);
  });
  nextBtn.addEventListener('click', function () {
    goTo(currentIndex() + 1);
  });
  homeBtn.addEventListener('click', function () {
    goTo(0);
  });

  window.__galleryGoTo = goTo;
})();
