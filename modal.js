(function () {
  var modal = document.getElementById('modal');
  if (!modal) return;

  var viewport = modal.querySelector('.modal__viewport');
  var scrollEl = modal.querySelector('.modal__scroll');
  var backdrop = modal.querySelector('.modal__backdrop');
  var media = modal.querySelector('.modal__media');
  var info = modal.querySelector('.modal__info');
  var closeBtn = modal.querySelector('.modal__close');
  var numberEl = modal.querySelector('.modal__number');
  var titleEl = modal.querySelector('.modal__title');
  var tagsEl = modal.querySelector('.modal__tags');

  var startRect = null;
  var lastTrigger = null;

  function populate(item) {
    var number = item.querySelector('.gallery__item-number');
    var title = item.querySelector('.gallery__item-title');
    var tags = item.querySelectorAll('.gallery__item-tags span');
    var imgInner = item.querySelector('.gallery__item-imginner');

    numberEl.textContent = number ? number.textContent : '';
    titleEl.textContent = title ? title.textContent : '';
    tagsEl.innerHTML = '';
    tags.forEach(function (tag) {
      var li = document.createElement('li');
      li.textContent = tag.textContent;
      tagsEl.appendChild(li);
    });
    media.style.backgroundImage = imgInner ? getComputedStyle(imgInner).backgroundImage : '';
  }

  var smoothScroll = (function () {
    var current = 0;
    var target = 0;
    var max = 0;
    var raf = null;
    var lerp = 0.1;

    function apply() {
      scrollEl.style.transform = 'translateY(' + -current + 'px)';
    }

    function loop() {
      current += (target - current) * lerp;
      if (Math.abs(target - current) < 0.5) {
        current = target;
        apply();
        raf = null;
        return;
      }
      apply();
      raf = requestAnimationFrame(loop);
    }

    function ensureLoop() {
      if (!raf) raf = requestAnimationFrame(loop);
    }

    function recalc() {
      max = Math.max(0, scrollEl.scrollHeight - viewport.clientHeight);
      target = Math.min(target, max);
      current = Math.min(current, max);
    }

    function moveBy(delta) {
      target = Math.max(0, Math.min(target + delta, max));
      ensureLoop();
    }

    function reset() {
      current = 0;
      target = 0;
      max = 0;
      apply();
    }

    function onWheel(e) {
      e.preventDefault();
      moveBy(e.deltaY);
    }

    var touchStartY = 0;
    var touchStartTarget = 0;

    function onTouchStart(e) {
      touchStartY = e.touches[0].clientY;
      touchStartTarget = target;
    }

    function onTouchMove(e) {
      var dy = touchStartY - e.touches[0].clientY;
      target = Math.max(0, Math.min(touchStartTarget + dy, max));
      ensureLoop();
    }

    function handleKeydown(e) {
      var page = viewport.clientHeight * 0.9;
      if (e.key === 'ArrowDown') moveBy(80);
      else if (e.key === 'ArrowUp') moveBy(-80);
      else if (e.key === 'PageDown') moveBy(page);
      else if (e.key === 'PageUp') moveBy(-page);
      else if (e.key === 'Home') moveBy(-max);
      else if (e.key === 'End') moveBy(max);
      else return false;
      e.preventDefault();
      return true;
    }

    viewport.addEventListener('wheel', onWheel, { passive: false });
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: true });

    return { recalc: recalc, reset: reset, handleKeydown: handleKeydown };
  })();

  function pinScroll(lscroll) {
    if (!lscroll.scroll || !lscroll.scroll.instance) return;
    var current = lscroll.scroll.instance.scroll;
    lscroll.setScroll(current.x, current.y);
  }

  function lockScroll() {
    var lscroll = window.__lscroll;
    if (!lscroll) return;
    lscroll.stop();
    pinScroll(lscroll);

    var frames = 0;
    var holdFrame = function () {
      if (frames >= 20 || !modal.classList.contains('is-open')) return;
      frames += 1;
      pinScroll(lscroll);
      requestAnimationFrame(holdFrame);
    };
    requestAnimationFrame(holdFrame);
  }

  function unlockScroll() {
    var lscroll = window.__lscroll;
    if (lscroll) lscroll.start();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    smoothScroll.handleKeydown(e);
  }

  function openModal(item) {
    var imgEl = item.querySelector('.gallery__item-img');
    if (!imgEl) return;

    lastTrigger = item.querySelector('.gallery__item-link') || imgEl;
    startRect = imgEl.getBoundingClientRect();

    populate(item);
    lockScroll();

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('modal-open');
    smoothScroll.reset();

    gsap.set(backdrop, { opacity: 0 });
    gsap.set(closeBtn, { opacity: 0 });
    gsap.set(info, { opacity: 0, x: 24 });
    gsap.set(media, { opacity: 1, clearProps: 'position,top,left,width,height,margin' });

    requestAnimationFrame(function () {
      smoothScroll.recalc();
      var endRect = media.getBoundingClientRect();
      gsap.set(media, {
        position: 'fixed',
        top: startRect.top,
        left: startRect.left,
        width: startRect.width,
        height: startRect.height,
        margin: 0
      });

      var tl = gsap.timeline();
      tl.to(backdrop, { opacity: 1, duration: 0.35, ease: 'power1.out' }, 0);
      tl.to(
        media,
        {
          top: endRect.top,
          left: endRect.left,
          width: endRect.width,
          height: endRect.height,
          duration: 0.7,
          ease: 'power3.inOut',
          onComplete: function () {
            gsap.set(media, { clearProps: 'position,top,left,width,height,margin' });
          }
        },
        0
      );
      tl.to(closeBtn, { opacity: 1, duration: 0.4 }, 0.2);
      tl.to(info, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.7);
    });

    closeBtn.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeModal() {
    if (!modal.classList.contains('is-open')) return;

    var tl = gsap.timeline({
      onComplete: function () {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('modal-open');
        gsap.set(media, { clearProps: 'all' });
        gsap.set(info, { clearProps: 'all' });
        gsap.set(backdrop, { clearProps: 'all' });
        gsap.set(closeBtn, { clearProps: 'all' });
        smoothScroll.reset();
        unlockScroll();
        if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
        startRect = null;
      }
    });
    tl.to(info, { opacity: 0, y: -12, duration: 0.3, ease: 'power1.in' }, 0);
    tl.to(media, { opacity: 0, scale: 0.96, duration: 0.35, ease: 'power1.in' }, 0);
    tl.to(closeBtn, { opacity: 0, duration: 0.2 }, 0);
    tl.to(backdrop, { opacity: 0, duration: 0.35 }, 0.1);

    document.removeEventListener('keydown', onKeydown);
  }

  document.querySelectorAll('.gallery__item').forEach(function (item) {
    var img = item.querySelector('.gallery__item-img');
    var link = item.querySelector('.gallery__item-link');

    if (img) {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.addEventListener('click', function () {
        openModal(item);
      });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(item);
        }
      });
    }

    if (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(item);
      });
    }
  });

  modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });
})();
