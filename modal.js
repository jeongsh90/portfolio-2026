(function () {
  var modal = document.getElementById('modal');
  if (!modal) return;

  var backdrop = modal.querySelector('.modal__backdrop');
  var media = modal.querySelector('.modal__media');
  var body = modal.querySelector('.modal__body');
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
    if (e.key === 'Escape') closeModal();
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
    modal.scrollTop = 0;

    gsap.set(backdrop, { opacity: 0 });
    gsap.set(closeBtn, { opacity: 0 });
    gsap.set(body, { opacity: 0, x: 24 });
    gsap.set(media, { opacity: 1, clearProps: 'position,top,left,width,height,margin' });

    requestAnimationFrame(function () {
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
      tl.to(body, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.7);
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
        gsap.set(body, { clearProps: 'all' });
        gsap.set(backdrop, { clearProps: 'all' });
        gsap.set(closeBtn, { clearProps: 'all' });
        modal.scrollTop = 0;
        unlockScroll();
        if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
        startRect = null;
      }
    });
    tl.to(body, { opacity: 0, y: -12, duration: 0.3, ease: 'power1.in' }, 0);
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
