/* ═══════════════════════════════════════════════════════════════
   dashboard.js — 이 문서 사이트 전용 ✗ 외부 프로젝트 사용 금지
   페이지 라우팅(fetch pages/*.html) · 사이드바 active 상태 관리 ·
   브레드크럼 업데이트 · Getting Started Hub 빌더 · 페이지 전환 애니메이션.
   app-shell 사이드바 토글 · 사이드바 내비게이션 드롭다운.
   컴포넌트 인터랙션 JS는 js/components.js 에 있음.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getNavLabel(link) {
    if (!link) return '';
    if (link.matches('[data-slot="combobox-item"]')) {
      return link.textContent.trim();
    }
    var span = link.querySelector('span');
    return (span || link).textContent.trim();
  }

  function openParentCollapsible(link) {
    var item = link.closest('[data-slot="accordion-item"]');
    if (!item) return;

    var accordion = item.closest('[data-slot="accordion"]');
    if (accordion) {
      accordion.querySelectorAll('[data-slot="accordion-item"]').forEach(function (i) {
        var t = i.querySelector('[data-slot="accordion-trigger"]');
        var c = i.querySelector('[data-slot="accordion-content"]');
        i.setAttribute('data-state', 'closed');
        if (c) c.setAttribute('data-state', 'closed');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }

    var trigger = item.querySelector('[data-slot="accordion-trigger"]');
    var content = item.querySelector('[data-slot="accordion-content"]');
    var inner = content && content.querySelector('[data-slot="accordion-content-inner"]');

    item.setAttribute('data-state', 'open');
    if (content) content.setAttribute('data-state', 'open');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (content && inner) content.style.setProperty('--accordion-content-height', inner.scrollHeight + 'px');
  }

  function setActiveNav(activeLink) {
    document.querySelectorAll(
      '[data-slot="sidebar-menu-sub-button"][data-page], [data-slot="sidebar-menu-button"][data-page], [data-sidebar-nav] [data-slot="combobox-item"][data-page]'
    ).forEach(function (link) {
      link.removeAttribute('data-active');
    });

    if (!activeLink) return;

    var page = activeLink.getAttribute('data-page');
    if (!page) {
      activeLink.setAttribute('data-active', 'true');
      return;
    }

    document.querySelectorAll(
      '[data-slot="sidebar-menu-sub-button"][data-page="' + page + '"], [data-slot="sidebar-menu-button"][data-page="' + page + '"], [data-sidebar-nav] [data-slot="combobox-item"][data-page="' + page + '"]'
    ).forEach(function (link) {
      link.setAttribute('data-active', 'true');
    });
  }

  function syncSidebarComboboxes(page) {
    document.querySelectorAll('[data-sidebar-nav]').forEach(function (combobox) {
      var input = combobox.querySelector('[data-slot="combobox-input"]');
      var item = combobox.querySelector('[data-slot="combobox-item"][data-page="' + page + '"]');

      combobox.querySelectorAll('[data-slot="combobox-item"]').forEach(function (option) {
        var selected = option === item;
        option.setAttribute('data-selected', selected ? 'true' : 'false');
        option.setAttribute('aria-selected', selected ? 'true' : 'false');
      });

      if (!input) return;

      if (item) {
        input.value = item.textContent.trim();
        input.dataset.comboboxValue = item.getAttribute('data-value') || page;
      } else if (input.dataset.comboboxValue) {
        input.value = '';
        delete input.dataset.comboboxValue;
      }
    });
  }

  function updateHeaderBreadcrumb(activeLink) {
    var pageEl = document.getElementById('header-breadcrumb-page');
    var groupEl = document.getElementById('header-breadcrumb-group');
    var groupText = document.getElementById('header-breadcrumb-group-text');
    var sepEl = document.getElementById('header-breadcrumb-sep');
    if (!pageEl) return;

    pageEl.textContent = getNavLabel(activeLink);

    var groupRow = activeLink && activeLink.closest('[data-sidebar-nav-group]');
    var accordionItem = activeLink && activeLink.closest('[data-slot="accordion-item"]');
    var labelEl = accordionItem && accordionItem.querySelector('[data-slot="accordion-trigger"] [data-slot="label"]');
    var groupName = labelEl ? labelEl.textContent.trim() : '';

    if (!groupName && groupRow) {
      var comboboxTrigger = groupRow.querySelector('[data-combobox-trigger]');
      groupName = comboboxTrigger ? comboboxTrigger.getAttribute('aria-label') || '' : '';
    }

    if (groupName) {
      groupText.textContent = groupName;
      groupEl.style.display = '';
      sepEl.style.display = '';
    } else {
      groupEl.style.display = 'none';
      sepEl.style.display = 'none';
    }
  }

  function initLoadedPage(contentInner) {
    buildGettingStartedHub(contentInner.querySelector('[data-slot="getting-started-root"]'));
    if (window.lucide) window.lucide.createIcons();
    if (window.initDesignSystemComponents) window.initDesignSystemComponents(contentInner);
    if (window.lucide) window.lucide.createIcons();
  }

  var HUB_SECTIONS = [
    {
      group: 'foundation',
      title: 'Foundation',
    },
    {
      group: 'components',
      title: 'Components',
    },
    {
      group: 'extra',
      title: 'Extra',
    }
  ];

  var HUB_ICONS = {
    color: 'palette',
    grid: 'layout-grid',
    shadow: 'circle-half',
    spacing: 'ruler',
    typography: 'type',
    accordion: 'chevrons-up-down',
    alert: 'triangle-alert',
    'alert-dialog': 'message-square-warning',
    'aspect-ratio': 'ratio',
    avatar: 'user-round',
    badge: 'badge',
    breadcrumb: 'chevrons-right',
    button: 'square',
    'button-group': 'columns-2',
    calendar: 'calendar',
    card: 'square-stack',
    checkbox: 'square-check',
    collapsible: 'chevrons-up-down',
    command: 'terminal',
    combobox: 'chevrons-up-down',
    'context-menu': 'mouse-pointer-click',
    'data-table': 'table',
    'date-picker': 'calendar-days',
    dialog: 'square',
    direction: 'languages',
    drawer: 'panel-bottom',
    empty: 'inbox',
    field: 'text-cursor-input',
    'file-tree': 'folder-tree',
    'hover-card': 'square-mouse-pointer',
    input: 'text-cursor-input',
    'input-group': 'text-cursor-input',
    'input-otp': 'binary',
    item: 'list',
    kbd: 'keyboard',
    menubar: 'menu',
    'navigation-menu': 'navigation',
    pagination: 'chevrons-left-right',
    progress: 'loader',
    'radio-group': 'circle-dot',
    resizable: 'columns-2',
    'scroll-area': 'scroll',
    select: 'chevrons-up-down',
    sheet: 'panel-right',
    sidebar: 'panel-left',
    skeleton: 'loader',
    slider: 'sliders-horizontal',
    sonner: 'bell',
    sortable: 'grip-vertical',
    spinner: 'loader',
    switch: 'toggle-left',
    table: 'table',
    tabs: 'folder',
    textarea: 'align-left',
    toggle: 'toggle-left',
    'toggle-group': 'toggle-left',
    tooltip: 'message-circle',
    animate: 'sparkles',
    carousel: 'gallery-horizontal',
    chart: 'chart-no-axes-column',
    editor: 'pencil'
  };

  var FOUNDATION_SVGS = {
    color: '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 38c0-11 9-20 20-20 2.5 0 4.9.5 7.1 1.3" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M41 19.3C37.8 16.5 33.6 15 29 15 18 15 9 24 9 35c0 8.3 6.7 15 15 15h20c5.5 0 10-4.5 10-10 0-4.8-3.4-8.8-8-9.7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="22" cy="28" r="3.5" fill="currentColor" opacity="0.45"/><circle cx="31" cy="23" r="3.5" fill="currentColor" opacity="0.65"/><circle cx="39" cy="30" r="3.5" fill="currentColor" opacity="0.85"/><circle cx="30" cy="36" r="3.5" fill="currentColor"/></svg>',
    grid: '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="14" width="16" height="16" rx="4" fill="currentColor" opacity="0.25"/><rect x="34" y="14" width="16" height="16" rx="4" fill="currentColor"/><rect x="14" y="34" width="16" height="16" rx="4" fill="currentColor" opacity="0.25"/><rect x="34" y="34" width="16" height="16" rx="4" fill="currentColor" opacity="0.25"/></svg>',
    shadow: '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="18" fill="currentColor" opacity="0.18"/><path d="M32 14a18 18 0 0 1 0 36V14Z" fill="currentColor"/></svg>',
    spacing: '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="18" width="40" height="6" rx="2" fill="currentColor" opacity="0.25"/><rect x="12" y="29" width="40" height="6" rx="2" fill="currentColor"/><rect x="12" y="40" width="40" height="6" rx="2" fill="currentColor" opacity="0.25"/></svg>',
    typography: '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 46V18h8l8 22" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 34h12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M14 18h36" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.45"/><path d="M14 46h36" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.45"/><path d="M48 22v20" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.45"/></svg>'
  };

  function getHubIcon(page) {
    var key = page.replace(/^extra\//, '');
    return HUB_ICONS[key] || 'box';
  }

  var HUB_VIEW_KEY = 'ds-hub-view';

  function getStoredHubView() {
    try {
      return window.localStorage.getItem(HUB_VIEW_KEY) === 'list' ? 'list' : 'card';
    } catch (e) {
      return 'card';
    }
  }

  function setStoredHubView(view) {
    try { window.localStorage.setItem(HUB_VIEW_KEY, view); } catch (e) {}
  }

  function applyHubView(root, view) {
    root.setAttribute('data-view', view);
    root.querySelectorAll('[data-slot="hub-view-btn"]').forEach(function (btn) {
      var active = btn.getAttribute('data-view') === view;
      btn.setAttribute('data-active', active ? 'true' : 'false');
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function createHubToolbar() {
    var toolbar = document.createElement('div');
    toolbar.setAttribute('data-slot', 'hub-toolbar');

    var group = document.createElement('div');
    group.setAttribute('data-slot', 'hub-view-toggle');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', '보기 형식');

    [
      { view: 'card', icon: 'layout-grid', label: '카드형식' },
      { view: 'list', icon: 'list', label: '텍스트형식' }
    ].forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-slot', 'hub-view-btn');
      btn.setAttribute('data-view', opt.view);
      btn.setAttribute('aria-label', opt.label);
      btn.title = opt.label;
      var icon = document.createElement('i');
      icon.setAttribute('data-lucide', opt.icon);
      icon.setAttribute('aria-hidden', 'true');
      btn.appendChild(icon);
      group.appendChild(btn);
    });

    toolbar.appendChild(group);
    return toolbar;
  }

  function createHubCard(page, label, group) {
    var card = document.createElement('a');
    card.href = '#';
    card.className = 'getting-started-card';
    card.setAttribute('data-slot', 'hub-card');
    card.setAttribute('data-page', page);

    var media = document.createElement('div');
    media.setAttribute('data-slot', 'hub-card-media');
    media.setAttribute('aria-hidden', 'true');

    var foundationSvg = group === 'foundation' && FOUNDATION_SVGS[page];
    if (foundationSvg) {
      media.innerHTML = foundationSvg;
    } else {
      var icon = document.createElement('i');
      icon.setAttribute('data-lucide', getHubIcon(page));
      icon.setAttribute('aria-hidden', 'true');
      media.appendChild(icon);
    }

    var labelEl = document.createElement('span');
    labelEl.setAttribute('data-slot', 'hub-card-label');
    labelEl.textContent = label;

    card.appendChild(media);
    card.appendChild(labelEl);
    return card;
  }

  function buildGettingStartedHub(root) {
    if (!root || root.dataset.hubBuilt === 'true') return;

    HUB_SECTIONS.forEach(function (section, sectionIndex) {
      var links = document.querySelectorAll(
        '.sidebar-nav-expanded [data-sidebar-nav-group="' + section.group + '"] [data-slot="sidebar-menu-sub-button"][data-page]'
      );
      if (!links.length) return;

      var sectionEl = document.createElement('section');
      sectionEl.className = 'getting-started-section';
      sectionEl.setAttribute('data-slot', 'hub-section');
      sectionEl.id = section.group;

      var textArea = document.createElement('div');
      textArea.setAttribute('data-slot', 'text-area');

      var headingRow = document.createElement('div');
      headingRow.setAttribute('data-slot', 'hub-heading-row');

      var heading = document.createElement('h2');
      heading.setAttribute('data-slot', 'typography-h2');
      heading.textContent = section.title;

      headingRow.appendChild(heading);
      if (sectionIndex === 0) {
        headingRow.appendChild(createHubToolbar());
      }

      var desc = document.createElement('p');
      desc.setAttribute('data-slot', 'desc');
      desc.textContent = section.desc;

      textArea.appendChild(headingRow);
      textArea.appendChild(desc);

      var grid = document.createElement('div');
      grid.setAttribute('data-slot', 'hub-grid');

      links.forEach(function (link) {
        var page = link.getAttribute('data-page');
        var labelSpan = link.querySelector('span');
        var label = (labelSpan || link).textContent.trim();
        grid.appendChild(createHubCard(page, label, section.group));
      });

      sectionEl.appendChild(textArea);
      sectionEl.appendChild(grid);
      root.appendChild(sectionEl);
    });

    root.dataset.hubBuilt = 'true';
    applyHubView(root, getStoredHubView());
  }

  function waitForOpacityTransition(element) {
    return new Promise(function (resolve) {
      if (prefersReducedMotion) {
        resolve();
        return;
      }

      function onTransitionEnd(event) {
        if (event.target !== element || event.propertyName !== 'opacity') return;
        element.removeEventListener('transitionend', onTransitionEnd);
        resolve();
      }

      element.addEventListener('transitionend', onTransitionEnd);
      window.setTimeout(resolve, 200);
    });
  }

  function fadePage(element, visible) {
    if (prefersReducedMotion) return Promise.resolve();

    if (!visible) {
      element.setAttribute('data-page-transition', '');
      return waitForOpacityTransition(element);
    }

    element.setAttribute('data-page-transition', '');
    element.offsetHeight;
    element.removeAttribute('data-page-transition');
    return waitForOpacityTransition(element);
  }

  function scrollContentToTop(contentInner) {
    var contentLayout = contentInner.closest('[data-slot="content-layout"]');
    if (contentLayout) contentLayout.scrollTop = 0;
  }

  function initPageLoader() {
    var contentInner = document.querySelector('[data-slot="content-inner"]');
    var navLinks = document.querySelectorAll(
      '[data-slot="sidebar-menu-sub-button"][data-page], [data-slot="sidebar-menu-button"][data-page], [data-sidebar-nav] [data-slot="combobox-item"][data-page]'
    );
    var isFirstLoad = true;
    var loadId = 0;

    if (!contentInner) return;

    contentInner.addEventListener('click', function (event) {
      var viewBtn = event.target.closest('[data-slot="hub-view-btn"]');
      if (viewBtn && contentInner.contains(viewBtn)) {
        var hubRoot = viewBtn.closest('[data-slot="getting-started-root"]');
        var view = viewBtn.getAttribute('data-view');
        if (hubRoot && view) {
          applyHubView(hubRoot, view);
          setStoredHubView(view);
        }
      }
    });

    contentInner.addEventListener('click', function (event) {
      var card = event.target.closest('[data-slot="hub-card"][data-page]:not([data-disabled="true"])');
      if (!card || !contentInner.contains(card)) return;

      event.preventDefault();

      var page = card.getAttribute('data-page');
      if (!page) return;

      var link = document.querySelector(
        '[data-slot="sidebar-menu-sub-button"][data-page="' + page + '"], [data-sidebar-nav] [data-slot="combobox-item"][data-page="' + page + '"]'
      );
      loadPage(page, link || null);
    });

    function applyPage(html, pageName, activeLink) {
      contentInner.innerHTML = html;

      initLoadedPage(contentInner);
      setActiveNav(activeLink);
      syncSidebarComboboxes(pageName);
      openParentCollapsible(activeLink);
      if (activeLink) {
        var page = activeLink.getAttribute('data-page');
        var subLink = page
          ? document.querySelector('[data-slot="sidebar-menu-sub-button"][data-page="' + page + '"]')
          : null;
        if (subLink && subLink !== activeLink) openParentCollapsible(subLink);
      }
      updateHeaderBreadcrumb(activeLink);
      if (window.lucide) window.lucide.createIcons();
      scrollContentToTop(contentInner);

      var titleEl = contentInner.querySelector('[data-slot="title"]');
      history.replaceState(null, '', '#' + pageName);
      document.title = (titleEl ? titleEl.textContent : pageName) + ' — Design System';
    }

    function loadPage(pageName, activeLink) {
      var currentLoadId = ++loadId;
      var shouldAnimate = !isFirstLoad && !prefersReducedMotion && contentInner.childElementCount > 0;

      var fadeOutPromise = shouldAnimate ? fadePage(contentInner, false) : Promise.resolve();

      return fadeOutPromise
        .then(function () {
          if (currentLoadId !== loadId) return null;
          return fetch('pages/' + pageName + '.html').then(function (response) {
            if (!response.ok) throw new Error('not found');
            return response.text();
          });
        })
        .then(function (html) {
          if (currentLoadId !== loadId || html === null) return;

          applyPage(html, pageName, activeLink);

          if (shouldAnimate) {
            return fadePage(contentInner, true).then(function () {
              isFirstLoad = false;
            });
          }

          isFirstLoad = false;
        })
        .catch(function () {
          if (currentLoadId !== loadId) return;

          applyPage('<p data-col-span="12">페이지를 불러올 수 없습니다.</p>', pageName, null);

          if (shouldAnimate) {
            return fadePage(contentInner, true).then(function () {
              isFirstLoad = false;
            });
          }

          isFirstLoad = false;
        });
    }

    navLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (!link.matches('[data-slot="combobox-item"]')) {
          event.preventDefault();
        }

        var page = link.getAttribute('data-page');
        if (!page) return;

        if (link.hasAttribute('data-active')) {
          if (link.matches('[data-slot="combobox-item"]')) event.stopPropagation();
          return;
        }

        if (link.matches('[data-slot="combobox-item"]')) {
          window.setTimeout(function () {
            loadPage(page, link);
          }, 0);
          return;
        }

        loadPage(page, link);
      });
    });

    window.addEventListener('hashchange', function () {
      var page = location.hash.replace('#', '');
      if (page === 'carousel') page = 'extra/carousel';
      if (!page) return;

      var link = document.querySelector(
        '[data-slot="sidebar-menu-sub-button"][data-page="' + page + '"], [data-slot="sidebar-menu-button"][data-page="' + page + '"], [data-sidebar-nav] [data-slot="combobox-item"][data-page="' + page + '"]'
      );
      if (!link || link.hasAttribute('data-active')) return;

      loadPage(page, link);
    });

    var hash = location.hash.replace('#', '');
    if (hash === 'carousel') hash = 'extra/carousel';

    var initialLink = hash
      ? document.querySelector(
          '[data-slot="sidebar-menu-sub-button"][data-page="' + hash + '"], [data-slot="sidebar-menu-button"][data-page="' + hash + '"], [data-sidebar-nav] [data-slot="combobox-item"][data-page="' + hash + '"]'
        )
      : null;

    if (initialLink) {
      loadPage(hash, initialLink);
      return;
    }

    var defaultLink = document.querySelector('[data-slot="sidebar-menu-button"][data-page="getting-started"]');
    if (defaultLink) loadPage('getting-started', defaultLink);
  }

  /* ── [이 사이트 전용] app-shell 메인 사이드바 토글 ── */
  function initSidebar() {
    var wrapper = document.querySelector('body > .app-shell[data-slot="sidebar-wrapper"]');
    if (!wrapper || wrapper.dataset.sidebarShellBound === 'true') return;
    wrapper.dataset.sidebarShellBound = 'true';

    var sidebar = wrapper.querySelector('[data-slot="sidebar"]');
    if (!sidebar) return;

    var mobileQuery = window.matchMedia('(max-width: 767px)');

    function isMobile() {
      return mobileQuery.matches;
    }

    function isExpanded() {
      if (isMobile()) return wrapper.getAttribute('data-mobile-open') === 'true';
      return wrapper.getAttribute('data-state') !== 'collapsed';
    }

    function setSidebarState(expanded) {
      if (isMobile()) {
        wrapper.setAttribute('data-mobile-open', expanded ? 'true' : 'false');
        document.body.classList.toggle('sidebar-mobile-open', expanded);
        wrapper.setAttribute('data-state', 'expanded');
        sidebar.setAttribute('data-state', 'expanded');
        sidebar.setAttribute('data-collapsible', '');
        return;
      }

      wrapper.removeAttribute('data-mobile-open');
      document.body.classList.remove('sidebar-mobile-open');
      var state = expanded ? 'expanded' : 'collapsed';
      wrapper.setAttribute('data-state', state);
      sidebar.setAttribute('data-state', state);
      sidebar.setAttribute('data-collapsible', expanded ? '' : 'icon');
    }

    function toggleSidebar() {
      setSidebarState(!isExpanded());
    }

    document.querySelectorAll('[data-sidebar-trigger]').forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        toggleSidebar();
      });
    });

    wrapper.addEventListener('click', function (event) {
      if (!isMobile() || !isExpanded()) return;
      if (event.target.closest('[data-slot="sidebar-container"]')) return;
      setSidebarState(false);
    });

    wrapper.querySelectorAll('[data-page]').forEach(function (link) {
      link.addEventListener('click', function () {
        if (isMobile()) setSidebarState(false);
      });
    });

    wrapper.querySelector('[data-slot="main"]').addEventListener('click', function () {
      if (isMobile() && isExpanded()) setSidebarState(false);
    });

    mobileQuery.addEventListener('change', function () {
      if (!isMobile()) {
        wrapper.removeAttribute('data-mobile-open');
        document.body.classList.remove('sidebar-mobile-open');
        return;
      }
      setSidebarState(false);
    });

    if (isMobile()) setSidebarState(false);
  }

  /* ── [이 사이트 전용] 사이드바 내비게이션 드롭다운 ── */
  function closeAllDropdowns(except) {
    document.querySelectorAll('[data-slot="dropdown"]').forEach(function (dropdown) {
      if (except && dropdown === except) return;
      var content = dropdown.querySelector('[data-slot="dropdown-content"]');
      var trigger = dropdown.querySelector('[data-slot="sidebar-menu-button"], [data-slot="sidebar-menu-action"]');
      if (content) content.setAttribute('data-state', 'closed');
      if (trigger) {
        trigger.setAttribute('data-state', 'closed');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initDropdowns() {
    document.querySelectorAll('[data-slot="dropdown"]').forEach(function (dropdown) {
      var trigger = dropdown.querySelector('[data-slot="sidebar-menu-button"], [data-slot="sidebar-menu-action"]');
      var content = dropdown.querySelector('[data-slot="dropdown-content"]');
      if (!trigger || !content) return;

      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var isOpen = content.getAttribute('data-state') === 'open';
        closeAllDropdowns();
        if (!isOpen) {
          content.setAttribute('data-state', 'open');
          trigger.setAttribute('data-state', 'open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });

      content.addEventListener('click', function (event) {
        event.stopPropagation();
      });
    });

    document.addEventListener('click', function () {
      closeAllDropdowns();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeAllDropdowns();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initSidebar();
      initDropdowns();
      initPageLoader();
    });
  } else {
    initSidebar();
    initDropdowns();
    initPageLoader();
  }
})();
