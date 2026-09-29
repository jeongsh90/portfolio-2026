(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  var webBtn = document.getElementById('categoryNavWeb');
  var graphicBtn = document.getElementById('categoryNavGraphic');
  if (!items.length || !webBtn || !graphicBtn) return;

  function firstIndexWithNumber(num) {
    for (var i = 0; i < items.length; i++) {
      var numEl = items[i].querySelector('.gallery__item-number');
      if (numEl && numEl.textContent.trim() === num) return i;
    }
    return -1;
  }

  function goTo(index) {
    if (index < 0 || typeof window.__galleryGoTo !== 'function') return;
    window.__galleryGoTo(index);
  }

  webBtn.addEventListener('click', function () {
    goTo(0);
  });

  graphicBtn.addEventListener('click', function () {
    goTo(firstIndexWithNumber('10'));
  });
})();
