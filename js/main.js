(function () {
  const data = PORTFOLIO_DATA;
  const track = document.getElementById('galleryTrack');
  const scrollHint = document.querySelector('.scroll-hint');

  function bindText(root, data) {
    root.querySelectorAll('[data-bind]').forEach((el) => {
      const key = el.getAttribute('data-bind');
      if (data[key] != null) el.textContent = data[key];
    });
    root.querySelectorAll('[data-bind-href]').forEach((el) => {
      const key = el.getAttribute('data-bind-href');
      if (data[key] != null) el.setAttribute('href', data[key]);
    });
  }

  bindText(document.querySelector('.frame'), data.profile);

  function createItem(project) {
    const item = document.createElement('article');
    item.className = 'gallery-item';

    const number = document.createElement('span');
    number.className = 'gallery-item__number';
    number.textContent = project.index;
    item.appendChild(number);

    const title = document.createElement('h2');
    title.className = 'gallery-item__title';
    title.textContent = project.title;
    item.appendChild(title);

    const frame = document.createElement('div');
    frame.className = 'gallery-item__frame';
    const img = document.createElement('div');
    img.className = 'gallery-item__img';
    if (project.thumbnail) img.style.backgroundImage = `url(${project.thumbnail})`;
    frame.appendChild(img);
    item.appendChild(frame);

    const link = document.createElement(project.href ? 'a' : 'span');
    link.className = 'gallery-item__link';
    link.textContent = '살펴보기';
    if (project.href) {
      link.setAttribute('href', project.href);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    } else {
      link.setAttribute('tabindex', '0');
      link.setAttribute('role', 'button');
      link.setAttribute('aria-disabled', 'true');
    }
    item.appendChild(link);

    const tags = document.createElement('ul');
    tags.className = 'gallery-item__tags';
    project.tags.forEach((tag) => {
      const li = document.createElement('li');
      li.textContent = tag;
      tags.appendChild(li);
    });
    item.appendChild(tags);

    return item;
  }

  function createDecor(text) {
    const el = document.createElement('span');
    el.className = 'gallery-decor';
    el.setAttribute('aria-hidden', 'true');
    el.textContent = text;
    return el;
  }

  data.projects.forEach((project, i) => {
    track.appendChild(createItem(project));
    if (i === 2 && data.decor[0]) track.appendChild(createDecor(data.decor[0]));
    if (i === data.projects.length - 1 && data.decor[1]) track.appendChild(createDecor(data.decor[1]));
  });

  document.body.classList.remove('loading');

  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ScrollTrigger.matchMedia({
    '(min-width: 900px)': function () {
      if (reduceMotion) return;

      const images = Array.from(document.querySelectorAll('.gallery-item__img'));
      let velocity = 0;

      const pinTween = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth + 1),
        ease: 'none',
        scrollTrigger: {
          trigger: '.gallery-section',
          pin: true,
          scrub: 0.6,
          start: 'top top',
          end: () => '+=' + (track.scrollWidth - window.innerWidth),
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            velocity = self.getVelocity() / 1000;
            const skew = gsap.utils.clamp(-15, 15, velocity);
            images.forEach((el) => {
              el.style.transform = `skewX(${skew}deg) scale(1.05)`;
            });
          },
          onLeave: () => hideHint(),
          onEnterBack: () => hideHint(),
        },
      });

      window.addEventListener('scroll', hideHintOnce, { once: true, passive: true });

      const cursor = document.querySelector('.cursor');
      const mouse = { x: 0, y: 0 };
      const bounds = cursor.getBoundingClientRect();
      let cx = 0, cy = 0, cs = 1, tx = 0, ty = 0, ts = 1;

      function onMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        gsap.to(cursor, { duration: 0.5, opacity: 1 });
      }
      window.addEventListener('mousemove', onMove);

      gsap.ticker.add(() => {
        tx = mouse.x - bounds.width / 2;
        ty = mouse.y - bounds.height / 2;
        cx += (tx - cx) * 0.2;
        cy += (ty - cy) * 0.2;
        cs += (ts - cs) * 0.15;
        cursor.style.transform = `translate(${cx}px, ${cy}px) scale(${cs})`;
      });

      document.querySelectorAll('.gallery-item__link').forEach((link) => {
        link.addEventListener('mouseenter', () => (ts = 2.4));
        link.addEventListener('mouseleave', () => (ts = 1));
      });

      return () => {
        pinTween.scrollTrigger && pinTween.scrollTrigger.kill();
        pinTween.kill();
        window.removeEventListener('mousemove', onMove);
        images.forEach((el) => (el.style.transform = ''));
      };
    },
  });

  function hideHintOnce() {
    hideHint();
  }

  function hideHint() {
    if (scrollHint) scrollHint.classList.add('is-hidden');
  }

  const track_scroll = document.querySelector('.gallery-track');
  if (track_scroll) {
    track_scroll.addEventListener('scroll', hideHint, { once: true, passive: true });
  }
})();
