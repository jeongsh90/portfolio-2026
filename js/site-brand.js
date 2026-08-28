(function () {
  var brand = document.querySelector('.site-brand');

  var heroText = document.querySelector('.gallery__text');
  if (!brand || !heroText || typeof gsap === 'undefined') return;

  gsap.set(brand, { opacity: 0 });

  if (typeof IntersectionObserver === 'undefined') {

    gsap.set(brand, { opacity: 1 });
    return;
  }

  var isVisible = null;

  function setBrandVisible(visible) {
    if (isVisible === visible) return;
    isVisible = visible;
    gsap.to(brand, { opacity: visible ? 1 : 0, duration: 0.4, ease: 'power1.out' });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {

        setBrandVisible(!entry.isIntersecting);
      });
    },
    { threshold: 0 }
  );

  observer.observe(heroText);
})();
