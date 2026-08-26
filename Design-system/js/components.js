/* ═══════════════════════════════════════════════════════════════
   components.js — ✓ 
   ───────────────────────────────────────────────────────────────
   컴포넌트 함수:
      initIcons · initThemeToggle · initDocSidebars ·
      initDropdownMenus · initContextMenus · initMenubars · initNavigationMenus · initComboboxes ·
      initAccordions · initCollapsibles · initSelects · initDialogs ·
      initSheets · initDrawers · initAlertDialogs · initCheckboxes · initSwitches ·
      initToggles · initToggleGroups · initTabs · initTooltips · initHoverCards ·
      initSliders · initProgress · initPagination · initScrollAreas ·
      initInputGroups · initCards · initDirections · initEmpties · initCarousels · initSortables ·
      initDataTables · initResizables · initAvatars · initInputOtps ·
      initCalendars · initDatePickers · initPopovers · initCommands ·
      initRadioGroups · initItems · initSonnerDemos

   window.initDesignSystemComponents(root) — 컴포넌트 전체 초기화.
   페이지(또는 DOM 영역)가 교체된 후 호출해 모든 컴포넌트를 바인딩.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  /* ── Lucide 아이콘 초기화 ── */
  function initIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /* ── Sidebar 컴포넌트 데모 shell ── */
  function initDocSidebars(root) {
    (root || document).querySelectorAll('.sidebar-doc-shell').forEach(function (wrapper) {
      if (wrapper.dataset.docSidebarBound === 'true') return;
      wrapper.dataset.docSidebarBound = 'true';

      var sidebar = wrapper.querySelector('[data-slot="sidebar"]');
      if (!sidebar) return;

      function setSidebarState(expanded) {
        var state = expanded ? 'expanded' : 'collapsed';
        wrapper.setAttribute('data-state', state);
        sidebar.setAttribute('data-state', state);
        sidebar.setAttribute('data-collapsible', expanded ? '' : 'icon');
      }

      wrapper.querySelectorAll('a[href="#"]').forEach(function (link) {
        link.addEventListener('click', function (event) {
          event.preventDefault();
        });
      });

      var trigger = wrapper.querySelector('[data-sidebar-trigger]');
      if (trigger) {
        trigger.addEventListener('click', function (event) {
          event.preventDefault();
          setSidebarState(wrapper.getAttribute('data-state') !== 'expanded');
        });
      }
    });
  }

  /* ── Dropdown Menu 컴포넌트 ── */
  function closeAllDropdownMenus(except) {
    document.querySelectorAll('[data-slot="dropdown-menu"]').forEach(function (menu) {
      if (except && menu === except) return;
      var trigger = menu.querySelector('[data-slot="dropdown-menu-trigger"]') || menu.querySelector('[data-slot="button"]');
      var content = menu.querySelector('[data-slot="dropdown-menu-content"]');
      if (content) content.setAttribute('data-state', 'closed');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function closeAllSelects(except) {
    document.querySelectorAll('[data-slot="select"]').forEach(function (select) {
      if (except && select === except) return;
      var trigger = select.querySelector('[data-slot="select-trigger"]');
      var content = select.querySelector('[data-slot="select-content"]');
      if (content) content.setAttribute('data-state', 'closed');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function closeAllPopovers(except) {
    document.querySelectorAll('[data-slot="popover"]').forEach(function (popover) {
      if (except && popover === except) return;
      var trigger = popover.querySelector('[data-slot="popover-trigger"]') ||
        popover.querySelector('[data-slot="button"]') ||
        popover.querySelector('[data-slot="input-group-button"]');
      var content = popover.querySelector('[data-slot="popover-content"]');
      if (content) content.setAttribute('data-state', 'closed');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function initDropdownMenus() {
    document.querySelectorAll('[data-slot="dropdown-menu"]').forEach(function (menu) {
      if (menu.dataset.dropdownMenuBound === 'true') return;
      menu.dataset.dropdownMenuBound = 'true';

      var trigger = menu.querySelector('[data-slot="dropdown-menu-trigger"]') || menu.querySelector('[data-slot="button"]');
      var content = menu.querySelector('[data-slot="dropdown-menu-content"]');
      if (!trigger || !content) return;

      function getMenuItems() {
        return Array.from(content.querySelectorAll('[data-slot="dropdown-menu-item"]:not([disabled]):not([data-disabled])'));
      }

      function openMenu() {
        closeAllDropdownMenus(menu);
        content.setAttribute('data-state', 'open');
        trigger.setAttribute('aria-expanded', 'true');
      }

      function closeMenu() {
        content.setAttribute('data-state', 'closed');
        trigger.setAttribute('aria-expanded', 'false');
      }

      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var isOpen = content.getAttribute('data-state') === 'open';
        if (isOpen) {
          closeMenu();
        } else {
          openMenu();
          /* 첫 번째 항목으로 포커스 이동 (Radix 동작 일치) */
          var first = getMenuItems()[0];
          if (first) setTimeout(function () { first.focus(); }, 0);
        }
      });

      /* 트리거 키보드: ArrowDown → 열고 첫 항목, ArrowUp → 열고 마지막 항목 */
      trigger.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          openMenu();
          var first = getMenuItems()[0];
          if (first) setTimeout(function () { first.focus(); }, 0);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          openMenu();
          var items = getMenuItems();
          var last = items[items.length - 1];
          if (last) setTimeout(function () { last.focus(); }, 0);
        }
      });

      /* 메뉴 내 키보드 탐색 */
      content.addEventListener('keydown', function (event) {
        var items = getMenuItems();
        var idx = items.indexOf(document.activeElement);

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          var next = items[(idx + 1) % items.length];
          if (next) next.focus();
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          var prev = items[(idx - 1 + items.length) % items.length];
          if (prev) prev.focus();
        } else if (event.key === 'Home') {
          event.preventDefault();
          if (items[0]) items[0].focus();
        } else if (event.key === 'End') {
          event.preventDefault();
          if (items[items.length - 1]) items[items.length - 1].focus();
        } else if (event.key === 'Escape') {
          event.stopPropagation();
          closeMenu();
          trigger.focus();
        } else if (event.key === 'Tab') {
          closeMenu();
        }
      });

      /* 항목 클릭 시 메뉴 닫기 */
      content.addEventListener('click', function (event) {
        event.stopPropagation();
        if (event.target.closest('[data-slot="dropdown-menu-item"]')) {
          closeMenu();
          trigger.focus();
        }
      });
    });
  }

  function closeAllContextMenus(except) {
    document.querySelectorAll('[data-slot="context-menu"]').forEach(function (menu) {
      if (except && menu === except) return;
      var content = menu.querySelector('[data-slot="context-menu-content"]');
      if (content) {
        content.setAttribute('data-state', 'closed');
        content.style.removeProperty('left');
        content.style.removeProperty('top');
      }
      menu.querySelectorAll('[data-slot="context-menu-sub-content"]').forEach(function (subContent) {
        subContent.setAttribute('data-state', 'closed');
        subContent.style.removeProperty('left');
        subContent.style.removeProperty('top');
      });
      menu.querySelectorAll('[data-slot="context-menu-sub-trigger"]').forEach(function (subTrigger) {
        subTrigger.removeAttribute('data-state');
      });
    });
  }

  function positionFloatingMenu(content, x, y) {
    content.style.left = x + 'px';
    content.style.top = y + 'px';

    window.requestAnimationFrame(function () {
      var rect = content.getBoundingClientRect();
      var left = x;
      var top = y;
      var padding = calcSpacing(2);

      if (rect.right > window.innerWidth - padding) {
        left = window.innerWidth - rect.width - padding;
      }
      if (rect.bottom > window.innerHeight - padding) {
        top = window.innerHeight - rect.height - padding;
      }
      if (left < padding) left = padding;
      if (top < padding) top = padding;

      content.style.left = left + 'px';
      content.style.top = top + 'px';
    });
  }

  function calcSpacing(units) {
    var root = getComputedStyle(document.documentElement);
    var spacing = parseFloat(root.getPropertyValue('--spacing')) || 4;
    return spacing * units;
  }

  function positionContextSubMenu(subContent, subTrigger) {
    var rect = subTrigger.getBoundingClientRect();
    var left = rect.right + calcSpacing(1);
    var top = rect.top;

    subContent.style.left = left + 'px';
    subContent.style.top = top + 'px';

    window.requestAnimationFrame(function () {
      var subRect = subContent.getBoundingClientRect();
      var padding = calcSpacing(2);

      if (subRect.right > window.innerWidth - padding) {
        left = rect.left - subRect.width - calcSpacing(1);
      }
      if (subRect.bottom > window.innerHeight - padding) {
        top = window.innerHeight - subRect.height - padding;
      }
      if (top < padding) top = padding;

      subContent.style.left = left + 'px';
      subContent.style.top = top + 'px';
    });
  }

  function initContextMenus(root) {
    (root || document).querySelectorAll('[data-slot="context-menu"]').forEach(function (menu) {
      if (menu.dataset.contextMenuBound === 'true') return;
      menu.dataset.contextMenuBound = 'true';

      var trigger = menu.querySelector('[data-slot="context-menu-trigger"]');
      var content = menu.querySelector('[data-slot="context-menu-content"]');
      if (!trigger || !content) return;

      var longPressTimer = null;

      function getFocusableItems(container) {
        return Array.from(container.querySelectorAll(
          '[data-slot="context-menu-item"]:not([disabled]):not([data-disabled="true"]), ' +
          '[data-slot="context-menu-sub-trigger"]:not([disabled]):not([data-disabled="true"]), ' +
          '[data-slot="context-menu-checkbox-item"]:not([disabled]):not([data-disabled="true"]), ' +
          '[data-slot="context-menu-radio-item"]:not([disabled]):not([data-disabled="true"])'
        ));
      }

      function closeSubMenus(exceptSub) {
        menu.querySelectorAll('[data-slot="context-menu-sub"]').forEach(function (sub) {
          if (exceptSub && sub === exceptSub) return;
          var subContent = sub.querySelector('[data-slot="context-menu-sub-content"]');
          var subTrigger = sub.querySelector('[data-slot="context-menu-sub-trigger"]');
          if (subContent) subContent.setAttribute('data-state', 'closed');
          if (subTrigger) subTrigger.removeAttribute('data-state');
        });
      }

      function openSubMenu(sub) {
        var subTrigger = sub.querySelector('[data-slot="context-menu-sub-trigger"]');
        var subContent = sub.querySelector('[data-slot="context-menu-sub-content"]');
        if (!subTrigger || !subContent) return;

        closeSubMenus(sub);
        subContent.setAttribute('data-state', 'open');
        subTrigger.setAttribute('data-state', 'open');
        positionContextSubMenu(subContent, subTrigger);
      }

      function openMenu(x, y) {
        closeAllContextMenus(menu);
        closeAllDropdownMenus();
        closeAllPopovers();
        content.setAttribute('data-state', 'open');
        positionFloatingMenu(content, x, y);
        closeSubMenus();

        window.setTimeout(function () {
          var first = getFocusableItems(content)[0];
          if (first) first.focus();
        }, 0);
      }

      function closeMenu() {
        content.setAttribute('data-state', 'closed');
        content.style.removeProperty('left');
        content.style.removeProperty('top');
        closeSubMenus();
      }

      trigger.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        openMenu(event.clientX, event.clientY);
      });

      trigger.addEventListener('keydown', function (event) {
        if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
          event.preventDefault();
          var rect = trigger.getBoundingClientRect();
          openMenu(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      });

      trigger.addEventListener('touchstart', function (event) {
        if (event.touches.length !== 1) return;
        var touch = event.touches[0];
        longPressTimer = window.setTimeout(function () {
          openMenu(touch.clientX, touch.clientY);
        }, 500);
      }, { passive: true });

      function clearLongPress() {
        if (longPressTimer) {
          window.clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }

      trigger.addEventListener('touchend', clearLongPress);
      trigger.addEventListener('touchmove', clearLongPress);
      trigger.addEventListener('touchcancel', clearLongPress);

      menu.querySelectorAll('[data-slot="context-menu-sub"]').forEach(function (sub) {
        var subTrigger = sub.querySelector('[data-slot="context-menu-sub-trigger"]');
        var subContent = sub.querySelector('[data-slot="context-menu-sub-content"]');
        if (!subTrigger || !subContent) return;

        subTrigger.setAttribute('aria-haspopup', 'menu');
        subTrigger.setAttribute('aria-expanded', 'false');

        subTrigger.addEventListener('mouseenter', function () {
          if (content.getAttribute('data-state') !== 'open') return;
          openSubMenu(sub);
          subTrigger.setAttribute('aria-expanded', 'true');
        });

        subTrigger.addEventListener('focus', function () {
          if (content.getAttribute('data-state') !== 'open') return;
          openSubMenu(sub);
          subTrigger.setAttribute('aria-expanded', 'true');
        });

        sub.addEventListener('mouseleave', function () {
          window.setTimeout(function () {
            if (sub.matches(':hover') || subContent.matches(':hover')) return;
            subContent.setAttribute('data-state', 'closed');
            subTrigger.removeAttribute('data-state');
            subTrigger.setAttribute('aria-expanded', 'false');
          }, 120);
        });
      });

      menu.querySelectorAll('[data-slot="context-menu-checkbox-item"]').forEach(function (item) {
        item.setAttribute('role', 'menuitemcheckbox');
        if (!item.hasAttribute('aria-checked')) {
          item.setAttribute('aria-checked', item.hasAttribute('data-checked') ? 'true' : 'false');
        }
        if (!item.querySelector('[data-slot="context-menu-item-indicator"]')) {
          var indicator = document.createElement('span');
          indicator.setAttribute('data-slot', 'context-menu-item-indicator');
          indicator.setAttribute('aria-hidden', 'true');
          indicator.innerHTML = '<i data-lucide="check" aria-hidden="true"></i>';
          item.insertBefore(indicator, item.firstChild);
        }

        item.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          var checked = item.getAttribute('aria-checked') === 'true';
          item.setAttribute('aria-checked', checked ? 'false' : 'true');
        });
      });

      menu.querySelectorAll('[data-slot="context-menu-radio-item"]').forEach(function (item) {
        item.setAttribute('role', 'menuitemradio');
        if (!item.querySelector('[data-slot="context-menu-item-indicator"]')) {
          var indicator = document.createElement('span');
          indicator.setAttribute('data-slot', 'context-menu-item-indicator');
          indicator.setAttribute('aria-hidden', 'true');
          indicator.innerHTML = '<i data-lucide="circle" aria-hidden="true"></i>';
          item.insertBefore(indicator, item.firstChild);
        }

        item.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          var group = item.closest('[data-slot="context-menu-radio-group"]');
          if (!group) return;
          group.querySelectorAll('[data-slot="context-menu-radio-item"]').forEach(function (radio) {
            radio.setAttribute('aria-checked', radio === item ? 'true' : 'false');
          });
        });
      });

      function bindMenuKeyboard(container, onClose) {
        container.addEventListener('keydown', function (event) {
          var items = getFocusableItems(container);
          var idx = items.indexOf(document.activeElement);

          if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!items.length) return;
            var next = items[(idx + 1) % items.length];
            if (next) next.focus();
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!items.length) return;
            var prev = items[(idx - 1 + items.length) % items.length];
            if (prev) prev.focus();
          } else if (event.key === 'Home') {
            event.preventDefault();
            if (items[0]) items[0].focus();
          } else if (event.key === 'End') {
            event.preventDefault();
            if (items[items.length - 1]) items[items.length - 1].focus();
          } else if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
          } else if (event.key === 'ArrowRight') {
            var subTrigger = document.activeElement.closest('[data-slot="context-menu-sub-trigger"]');
            if (subTrigger) {
              event.preventDefault();
              var sub = subTrigger.closest('[data-slot="context-menu-sub"]');
              if (sub) {
                openSubMenu(sub);
                var subItems = getFocusableItems(sub.querySelector('[data-slot="context-menu-sub-content"]'));
                if (subItems[0]) subItems[0].focus();
              }
            }
          } else if (event.key === 'ArrowLeft') {
            if (container.matches('[data-slot="context-menu-sub-content"]')) {
              event.preventDefault();
              var parentSub = container.closest('[data-slot="context-menu-sub"]');
              var parentTrigger = parentSub && parentSub.querySelector('[data-slot="context-menu-sub-trigger"]');
              container.setAttribute('data-state', 'closed');
              if (parentTrigger) {
                parentTrigger.removeAttribute('data-state');
                parentTrigger.focus();
              }
            }
          }
        });
      }

      bindMenuKeyboard(content, function () {
        closeMenu();
        trigger.focus();
      });

      menu.querySelectorAll('[data-slot="context-menu-sub-content"]').forEach(function (subContent) {
        bindMenuKeyboard(subContent, function () {
          closeMenu();
          trigger.focus();
        });
      });

      content.addEventListener('click', function (event) {
        event.stopPropagation();
        if (event.target.closest('[data-slot="context-menu-item"]')) {
          closeMenu();
          trigger.focus();
        }
      });

      menu.querySelectorAll('[data-slot="context-menu-sub-content"]').forEach(function (subContent) {
        subContent.addEventListener('click', function (event) {
          event.stopPropagation();
          if (event.target.closest('[data-slot="context-menu-item"]')) {
            closeMenu();
            trigger.focus();
          }
        });
      });
    });

    if (window.lucide) window.lucide.createIcons({ root: root || document });
  }

  function closeAllMenubars(exceptMenubar) {
    document.querySelectorAll('[data-slot="menubar"]').forEach(function (menubar) {
      if (exceptMenubar && menubar === exceptMenubar) return;
      menubar.querySelectorAll('[data-slot="menubar-content"]').forEach(function (content) {
        content.setAttribute('data-state', 'closed');
      });
      menubar.querySelectorAll('[data-slot="menubar-trigger"]').forEach(function (trigger) {
        trigger.removeAttribute('data-state');
        trigger.setAttribute('aria-expanded', 'false');
      });
      menubar.querySelectorAll('[data-slot="menubar-sub-content"]').forEach(function (sub) {
        sub.setAttribute('data-state', 'closed');
        sub.style.removeProperty('left');
        sub.style.removeProperty('top');
      });
      menubar.querySelectorAll('[data-slot="menubar-sub-trigger"]').forEach(function (subTrigger) {
        subTrigger.removeAttribute('data-state');
      });
    });
  }

  function positionMenubarSubMenu(subTrigger, subContent) {
    var rect = subTrigger.getBoundingClientRect();
    var gap = 4;
    var left = rect.right + gap;
    var top = rect.top;

    if (left + subContent.offsetWidth > window.innerWidth - 8) {
      left = rect.left - subContent.offsetWidth - gap;
    }
    if (top + subContent.offsetHeight > window.innerHeight - 8) {
      top = Math.max(8, window.innerHeight - subContent.offsetHeight - 8);
    }

    subContent.style.left = left + 'px';
    subContent.style.top = top + 'px';
  }

  function initMenubars(root) {
    (root || document).querySelectorAll('[data-slot="menubar"]').forEach(function (menubar) {
      if (menubar.dataset.menubarBound === 'true') return;
      menubar.dataset.menubarBound = 'true';

      menubar.querySelectorAll('[data-slot="menubar-checkbox-item"], [data-slot="menubar-radio-item"]').forEach(function (item) {
        if (!item.querySelector('[data-slot="menubar-item-indicator"]')) {
          var indicator = document.createElement('span');
          indicator.setAttribute('data-slot', 'menubar-item-indicator');
          indicator.innerHTML = '<i data-lucide="check" aria-hidden="true"></i>';
          item.insertBefore(indicator, item.firstChild);
        }
      });

      menubar.querySelectorAll('[data-slot="menubar-sub-trigger"]').forEach(function (subTrigger) {
        if (!subTrigger.querySelector('[data-slot="menubar-sub-trigger-icon"]')) {
          var icon = document.createElement('span');
          icon.setAttribute('data-slot', 'menubar-sub-trigger-icon');
          icon.innerHTML = '<i data-lucide="chevron-right" aria-hidden="true"></i>';
          subTrigger.appendChild(icon);
        }
      });

      function getOpenContent() {
        return menubar.querySelector('[data-slot="menubar-content"][data-state="open"]');
      }

      function getMenuItems(content) {
        if (!content) return [];
        return Array.from(content.querySelectorAll(
          '[data-slot="menubar-item"]:not([disabled]):not([data-disabled]),' +
          '[data-slot="menubar-sub-trigger"]:not([disabled]):not([data-disabled]),' +
          '[data-slot="menubar-checkbox-item"]:not([disabled]):not([data-disabled]),' +
          '[data-slot="menubar-radio-item"]:not([disabled]):not([data-disabled])'
        ));
      }

      function closeSubMenus(content) {
        if (!content) return;
        content.querySelectorAll('[data-slot="menubar-sub-content"]').forEach(function (sub) {
          sub.setAttribute('data-state', 'closed');
          sub.style.removeProperty('left');
          sub.style.removeProperty('top');
        });
        content.querySelectorAll('[data-slot="menubar-sub-trigger"]').forEach(function (subTrigger) {
          subTrigger.removeAttribute('data-state');
        });
      }

      function openSubMenu(subTrigger) {
        var sub = subTrigger.closest('[data-slot="menubar-sub"]');
        if (!sub) return;
        var subContent = sub.querySelector('[data-slot="menubar-sub-content"]');
        if (!subContent) return;

        var content = subTrigger.closest('[data-slot="menubar-content"]');
        if (content) {
          content.querySelectorAll('[data-slot="menubar-sub-content"]').forEach(function (other) {
            if (other !== subContent) {
              other.setAttribute('data-state', 'closed');
              other.style.removeProperty('left');
              other.style.removeProperty('top');
            }
          });
          content.querySelectorAll('[data-slot="menubar-sub-trigger"]').forEach(function (otherTrigger) {
            if (otherTrigger !== subTrigger) otherTrigger.removeAttribute('data-state');
          });
        }

        subContent.setAttribute('data-state', 'open');
        subTrigger.setAttribute('data-state', 'open');
        positionMenubarSubMenu(subTrigger, subContent);
      }

      function closeMenu(menu) {
        var content = menu.querySelector('[data-slot="menubar-content"]');
        var trigger = menu.querySelector('[data-slot="menubar-trigger"]');
        if (content) {
          content.setAttribute('data-state', 'closed');
          closeSubMenus(content);
        }
        if (trigger) {
          trigger.removeAttribute('data-state');
          trigger.setAttribute('aria-expanded', 'false');
        }
      }

      function openMenu(menu) {
        var content = menu.querySelector('[data-slot="menubar-content"]');
        var trigger = menu.querySelector('[data-slot="menubar-trigger"]');
        if (!content || !trigger) return;

        menubar.querySelectorAll('[data-slot="menubar-menu"]').forEach(function (otherMenu) {
          if (otherMenu !== menu) closeMenu(otherMenu);
        });

        content.setAttribute('data-state', 'open');
        trigger.setAttribute('data-state', 'open');
        trigger.setAttribute('aria-expanded', 'true');
      }

      function toggleMenu(menu) {
        var content = menu.querySelector('[data-slot="menubar-content"]');
        if (content && content.getAttribute('data-state') === 'open') {
          closeMenu(menu);
        } else {
          closeAllComboboxes();
          closeAllSelects();
          closeAllPopovers();
          closeAllDropdownMenus();
          closeAllContextMenus();
          closeAllMenubars(menubar);
          openMenu(menu);
        }
      }

      menubar.querySelectorAll('[data-slot="menubar-menu"]').forEach(function (menu) {
        var trigger = menu.querySelector('[data-slot="menubar-trigger"]');
        var content = menu.querySelector('[data-slot="menubar-content"]');
        if (!trigger || !content) return;

        trigger.setAttribute('aria-haspopup', 'menu');
        trigger.setAttribute('aria-expanded', 'false');
        content.setAttribute('data-state', 'closed');

        trigger.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          toggleMenu(menu);
        });

        trigger.addEventListener('keydown', function (event) {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (content.getAttribute('data-state') !== 'open') {
              closeAllComboboxes();
              closeAllSelects();
              closeAllPopovers();
              closeAllDropdownMenus();
              closeAllContextMenus();
              closeAllMenubars(menubar);
              openMenu(menu);
            }
            var items = getMenuItems(content);
            if (items.length) items[0].focus();
          } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            var menus = Array.from(menubar.querySelectorAll('[data-slot="menubar-menu"]'));
            var index = menus.indexOf(menu);
            var next = event.key === 'ArrowRight'
              ? menus[(index + 1) % menus.length]
              : menus[(index - 1 + menus.length) % menus.length];
            var nextTrigger = next.querySelector('[data-slot="menubar-trigger"]');
            if (nextTrigger) nextTrigger.focus();
          }
        });

        content.addEventListener('keydown', function (event) {
          var items = getMenuItems(content);
          var current = document.activeElement;
          var index = items.indexOf(current);

          if (event.key === 'Escape') {
            event.preventDefault();
            closeMenu(menu);
            trigger.focus();
          } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!items.length) return;
            items[(index + 1) % items.length].focus();
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!items.length) return;
            items[(index - 1 + items.length) % items.length].focus();
          } else if (event.key === 'Home') {
            event.preventDefault();
            if (items.length) items[0].focus();
          } else if (event.key === 'End') {
            event.preventDefault();
            if (items.length) items[items.length - 1].focus();
          } else if (event.key === 'ArrowRight' && current.matches('[data-slot="menubar-sub-trigger"]')) {
            event.preventDefault();
            openSubMenu(current);
            var sub = current.closest('[data-slot="menubar-sub"]');
            var subItems = sub ? getMenuItems(sub.querySelector('[data-slot="menubar-sub-content"]')) : [];
            if (subItems.length) subItems[0].focus();
          } else if (event.key === 'ArrowLeft' && current.closest('[data-slot="menubar-sub-content"]')) {
            event.preventDefault();
            var subTriggerEl = current.closest('[data-slot="menubar-sub"]').querySelector('[data-slot="menubar-sub-trigger"]');
            closeSubMenus(content);
            if (subTriggerEl) subTriggerEl.focus();
          }
        });

        content.querySelectorAll('[data-slot="menubar-sub-trigger"]').forEach(function (subTrigger) {
          subTrigger.addEventListener('mouseenter', function () {
            if (content.getAttribute('data-state') === 'open') openSubMenu(subTrigger);
          });
          subTrigger.addEventListener('focus', function () {
            if (content.getAttribute('data-state') === 'open') openSubMenu(subTrigger);
          });
        });

        content.querySelectorAll('[data-slot="menubar-sub-content"]').forEach(function (subContent) {
          subContent.addEventListener('keydown', function (event) {
            var items = getMenuItems(subContent);
            var current = document.activeElement;
            var index = items.indexOf(current);

            if (event.key === 'Escape') {
              event.preventDefault();
              var subTriggerEl = subContent.closest('[data-slot="menubar-sub"]').querySelector('[data-slot="menubar-sub-trigger"]');
              closeSubMenus(content);
              if (subTriggerEl) subTriggerEl.focus();
            } else if (event.key === 'ArrowDown') {
              event.preventDefault();
              if (items.length) items[(index + 1) % items.length].focus();
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              if (items.length) items[(index - 1 + items.length) % items.length].focus();
            } else if (event.key === 'ArrowLeft') {
              event.preventDefault();
              var subTriggerEl = subContent.closest('[data-slot="menubar-sub"]').querySelector('[data-slot="menubar-sub-trigger"]');
              closeSubMenus(content);
              if (subTriggerEl) subTriggerEl.focus();
            }
          });
        });

        content.querySelectorAll('[data-slot="menubar-checkbox-item"]').forEach(function (item) {
          item.setAttribute('role', 'menuitemcheckbox');
          if (!item.hasAttribute('aria-checked')) item.setAttribute('aria-checked', 'false');

          item.addEventListener('click', function (event) {
            event.preventDefault();
            var checked = item.getAttribute('aria-checked') === 'true';
            item.setAttribute('aria-checked', checked ? 'false' : 'true');
          });
        });

        content.querySelectorAll('[data-slot="menubar-radio-group"]').forEach(function (group) {
          var radios = group.querySelectorAll('[data-slot="menubar-radio-item"]');
          radios.forEach(function (radio) {
            radio.setAttribute('role', 'menuitemradio');
            if (!radio.hasAttribute('aria-checked')) radio.setAttribute('aria-checked', 'false');

            radio.addEventListener('click', function (event) {
              event.preventDefault();
              radios.forEach(function (r) { r.setAttribute('aria-checked', 'false'); });
              radio.setAttribute('aria-checked', 'true');
            });
          });
        });

        content.addEventListener('click', function (event) {
          if (event.target.closest('[data-slot="menubar-item"]')) {
            closeMenu(menu);
            trigger.focus();
          }
        });
      });
    });

    if (window.lucide) window.lucide.createIcons({ root: root || document });
  }

  function closeAllNavigationMenus(exceptNav) {
    document.querySelectorAll('[data-slot="navigation-menu"]').forEach(function (nav) {
      if (exceptNav && nav === exceptNav) return;

      var useViewport = nav.getAttribute('data-viewport') !== 'false';
      var viewport = nav.querySelector('[data-slot="navigation-menu-viewport"]');

      nav.querySelectorAll('[data-slot="navigation-menu-trigger"]').forEach(function (trigger) {
        trigger.setAttribute('data-state', 'closed');
        trigger.setAttribute('aria-expanded', 'false');
      });

      nav.querySelectorAll('[data-slot="navigation-menu-content"]').forEach(function (content) {
        content.setAttribute('data-state', 'closed');
      });

      if (useViewport && viewport) {
        viewport.setAttribute('data-state', 'closed');
        viewport.style.removeProperty('--navigation-menu-viewport-width');
        viewport.style.removeProperty('--navigation-menu-viewport-height');
      }
    });
  }

  function initNavigationMenus(root) {
    (root || document).querySelectorAll('[data-slot="navigation-menu"]').forEach(function (nav) {
      if (nav.dataset.navigationMenuBound === 'true') return;
      nav.dataset.navigationMenuBound = 'true';

      var useViewport = nav.getAttribute('data-viewport') !== 'false';
      var list = nav.querySelector('[data-slot="navigation-menu-list"]');
      if (!list) return;

      nav.querySelectorAll('[data-slot="navigation-menu-trigger"]').forEach(function (trigger) {
        if (!trigger.querySelector('[data-slot="navigation-menu-trigger-icon"]')) {
          var icon = document.createElement('span');
          icon.setAttribute('data-slot', 'navigation-menu-trigger-icon');
          icon.innerHTML = '<i data-lucide="chevron-down" aria-hidden="true"></i>';
          trigger.appendChild(icon);
        }
        trigger.setAttribute('aria-haspopup', 'true');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('data-state', 'closed');
      });

      list.querySelectorAll('[data-slot="navigation-menu-item"]').forEach(function (item) {
        var panel = item.querySelector('[data-slot="navigation-menu-content"]');
        if (panel && panel.getAttribute('data-value') && !item.getAttribute('data-value')) {
          item.setAttribute('data-value', panel.getAttribute('data-value'));
        }
      });

      var viewport = null;
      var viewportInner = null;

      if (useViewport) {
        viewport = nav.querySelector('[data-slot="navigation-menu-viewport"]');
        if (!viewport) {
          var positioner = document.createElement('div');
          positioner.setAttribute('data-slot', 'navigation-menu-viewport-positioner');
          viewport = document.createElement('div');
          viewport.setAttribute('data-slot', 'navigation-menu-viewport');
          viewport.setAttribute('data-state', 'closed');
          viewportInner = document.createElement('div');
          viewportInner.setAttribute('data-slot', 'navigation-menu-viewport-inner');
          viewport.appendChild(viewportInner);
          positioner.appendChild(viewport);
          nav.appendChild(positioner);
        } else {
          viewportInner = viewport.querySelector('[data-slot="navigation-menu-viewport-inner"]');
          if (!viewportInner) {
            viewportInner = document.createElement('div');
            viewportInner.setAttribute('data-slot', 'navigation-menu-viewport-inner');
            viewport.appendChild(viewportInner);
          }
        }

        nav.querySelectorAll('[data-slot="navigation-menu-content"]').forEach(function (content) {
          viewportInner.appendChild(content);
          content.setAttribute('data-state', 'closed');
        });
      } else {
        nav.querySelectorAll('[data-slot="navigation-menu-content"]').forEach(function (content) {
          content.setAttribute('data-state', 'closed');
        });
      }

      function getItems() {
        return Array.from(list.querySelectorAll('[data-slot="navigation-menu-item"]'));
      }

      function getTrigger(item) {
        return item.querySelector('[data-slot="navigation-menu-trigger"]');
      }

      function getContent(item) {
        var value = item.getAttribute('data-value');
        if (useViewport && value && viewportInner) {
          return viewportInner.querySelector('[data-slot="navigation-menu-content"][data-value="' + value + '"]');
        }
        return item.querySelector('[data-slot="navigation-menu-content"]');
      }

      function updateViewportSize(content) {
        if (!viewport || !content) return;
        content.setAttribute('data-state', 'open');
        viewport.style.setProperty('--navigation-menu-viewport-width', content.offsetWidth + 'px');
        viewport.style.setProperty('--navigation-menu-viewport-height', content.offsetHeight + 'px');
      }

      function closeItem(item) {
        var trigger = getTrigger(item);
        var content = getContent(item);
        if (trigger) {
          trigger.setAttribute('data-state', 'closed');
          trigger.setAttribute('aria-expanded', 'false');
        }
        if (content) content.setAttribute('data-state', 'closed');
      }

      function closeAll(exceptItem) {
        getItems().forEach(function (item) {
          if (exceptItem && item === exceptItem) return;
          closeItem(item);
        });
        if (useViewport && viewport) {
          viewport.setAttribute('data-state', 'closed');
          viewport.style.removeProperty('--navigation-menu-viewport-width');
          viewport.style.removeProperty('--navigation-menu-viewport-height');
        }
      }

      function openItem(item) {
        var trigger = getTrigger(item);
        var content = getContent(item);
        if (!trigger || !content) return;

        closeAllNavigationMenus(nav);
        closeAllMenubars();
        closeAllDropdownMenus();
        closeAllContextMenus();
        closeAllComboboxes();
        closeAllSelects();
        closeAllPopovers();

        getItems().forEach(function (other) {
          if (other !== item) closeItem(other);
        });

        trigger.setAttribute('data-state', 'open');
        trigger.setAttribute('aria-expanded', 'true');

        if (useViewport && viewport) {
          nav.querySelectorAll('[data-slot="navigation-menu-content"]').forEach(function (panel) {
            panel.setAttribute('data-state', 'closed');
          });
          viewport.setAttribute('data-state', 'open');
          updateViewportSize(content);
        } else {
          content.setAttribute('data-state', 'open');
        }
      }

      function toggleItem(item) {
        var content = getContent(item);
        if (!content) return;
        if (content.getAttribute('data-state') === 'open') {
          closeItem(item);
          if (useViewport && viewport) {
            viewport.setAttribute('data-state', 'closed');
            viewport.style.removeProperty('--navigation-menu-viewport-width');
            viewport.style.removeProperty('--navigation-menu-viewport-height');
          }
        } else {
          openItem(item);
        }
      }

      getItems().forEach(function (item) {
        var trigger = getTrigger(item);
        var content = getContent(item);
        if (!trigger || !content) return;

        trigger.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          toggleItem(item);
        });

        item.addEventListener('mouseenter', function () {
          openItem(item);
        });

        trigger.addEventListener('keydown', function (event) {
          var items = getItems().filter(function (entry) { return getTrigger(entry); });
          var index = items.indexOf(item);

          if (event.key === 'ArrowRight') {
            event.preventDefault();
            var next = items[(index + 1) % items.length];
            var nextTrigger = getTrigger(next);
            if (nextTrigger) nextTrigger.focus();
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            var prev = items[(index - 1 + items.length) % items.length];
            var prevTrigger = getTrigger(prev);
            if (prevTrigger) prevTrigger.focus();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            closeAll();
            trigger.focus();
          }
        });
      });

      nav.addEventListener('mouseleave', function () {
        closeAll();
      });
    });

    if (window.lucide) window.lucide.createIcons({ root: root || document });
  }

  function initSelects(root) {
    (root || document).querySelectorAll('[data-slot="select"]').forEach(function (select) {
      if (select.dataset.selectBound === 'true') return;
      select.dataset.selectBound = 'true';

      var trigger = select.querySelector('[data-slot="select-trigger"]');
      var content = select.querySelector('[data-slot="select-content"]');
      if (!trigger || !content) return;

      content.querySelectorAll('[data-slot="select-item"]').forEach(function (item) {
        if (!item.querySelector('[data-slot="select-item-indicator"]')) {
          var indicator = document.createElement('span');
          indicator.setAttribute('data-slot', 'select-item-indicator');
          indicator.innerHTML = '<i data-lucide="check" aria-hidden="true"></i>';
          item.appendChild(indicator);
        }
      });

      if (window.lucide) window.lucide.createIcons({ root: select });

      function getItems() {
        return Array.from(content.querySelectorAll('[data-slot="select-item"]:not([disabled]):not([data-disabled])'));
      }

      function openSelect() {
        closeAllComboboxes();
        closeAllSelects(select);
        closeAllPopovers();
        closeAllDropdownMenus();
        content.setAttribute('data-state', 'open');
        trigger.setAttribute('aria-expanded', 'true');
      }

      function closeSelect() {
        content.setAttribute('data-state', 'closed');
        trigger.setAttribute('aria-expanded', 'false');
      }

      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var isOpen = content.getAttribute('data-state') === 'open';
        if (isOpen) {
          closeSelect();
        } else {
          openSelect();
          var first = getItems()[0];
          if (first) setTimeout(function () { first.focus(); }, 0);
        }
      });

      trigger.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          openSelect();
          var first = getItems()[0];
          if (first) setTimeout(function () { first.focus(); }, 0);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          openSelect();
          var items = getItems();
          var last = items[items.length - 1];
          if (last) setTimeout(function () { last.focus(); }, 0);
        }
      });

      content.addEventListener('keydown', function (event) {
        var items = getItems();
        var idx = items.indexOf(document.activeElement);

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          var next = items[(idx + 1) % items.length];
          if (next) next.focus();
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          var prev = items[(idx - 1 + items.length) % items.length];
          if (prev) prev.focus();
        } else if (event.key === 'Home') {
          event.preventDefault();
          if (items[0]) items[0].focus();
        } else if (event.key === 'End') {
          event.preventDefault();
          if (items[items.length - 1]) items[items.length - 1].focus();
        } else if (event.key === 'Escape') {
          event.stopPropagation();
          closeSelect();
          trigger.focus();
        } else if (event.key === 'Tab') {
          closeSelect();
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          var active = document.activeElement;
          if (active && active.matches('[data-slot="select-item"]')) {
            items.forEach(function (item) { item.removeAttribute('data-state'); });
            active.setAttribute('data-state', 'checked');
            var label = active.textContent.trim();
            var valueEl = trigger.querySelector('[data-slot="select-value"]');
            if (valueEl) valueEl.textContent = label;
            closeSelect();
            trigger.focus();
          }
        }
      });

      content.addEventListener('click', function (event) {
        event.stopPropagation();
        var item = event.target.closest('[data-slot="select-item"]');
        if (!item) return;
        getItems().forEach(function (el) { el.removeAttribute('data-state'); });
        item.setAttribute('data-state', 'checked');
        var label = item.textContent.trim();
        var valueEl = trigger.querySelector('[data-slot="select-value"]');
        if (valueEl) valueEl.textContent = label;
        closeSelect();
        trigger.focus();
      });
    });
  }

  function closeAllComboboxes(except) {
    document.querySelectorAll('[data-slot="combobox"]').forEach(function (combobox) {
      if (except && combobox === except) return;
      var content = combobox.querySelector('[data-slot="combobox-content"]');
      var input = combobox.querySelector('[data-slot="combobox-input"], [data-slot="combobox-chip-input"]');
      var trigger = combobox.querySelector('[data-combobox-trigger]');
      if (content) content.setAttribute('data-state', 'closed');
      if (input) input.setAttribute('aria-expanded', 'false');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      combobox.querySelectorAll('[data-slot="combobox-item"]').forEach(function (item) {
        item.removeAttribute('data-highlighted');
      });
    });
  }

  function initComboboxes(root) {
    (root || document).querySelectorAll('[data-slot="combobox"]').forEach(function (combobox) {
      if (combobox.dataset.comboboxBound === 'true') return;
      combobox.dataset.comboboxBound = 'true';

      var isMultiple = combobox.getAttribute('data-multiple') === 'true';
      var isSelectMode = combobox.getAttribute('data-mode') === 'select';
      var autoHighlight = combobox.getAttribute('data-auto-highlight') === 'true';
      var input = combobox.querySelector('[data-slot="combobox-input"]');
      var chipInput = combobox.querySelector('[data-slot="combobox-chip-input"]');
      var chipsRoot = combobox.querySelector('[data-slot="combobox-chips"]');
      var content = combobox.querySelector('[data-slot="combobox-content"]');
      var emptyEl = combobox.querySelector('[data-slot="combobox-empty"]');
      var trigger = combobox.querySelector('[data-combobox-trigger]');
      var clearBtn = combobox.querySelector('[data-slot="combobox-clear"]');
      var listId = content && content.id ? content.id : 'combobox-list-' + Math.random().toString(36).slice(2, 9);

      if (content && !content.id) content.id = listId;

      var activeInput = isMultiple ? chipInput : input;
      if (!activeInput || !content) return;

      activeInput.setAttribute('role', 'combobox');
      activeInput.setAttribute('aria-autocomplete', isSelectMode ? 'none' : 'list');
      activeInput.setAttribute('aria-expanded', 'false');
      activeInput.setAttribute('aria-controls', listId);

      if (isSelectMode && input) {
        input.readOnly = true;
        input.setAttribute('aria-readonly', 'true');
      }

      function syncTriggerExpanded(isOpen) {
        if (trigger) trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }

      function getItemLabel(item) {
        var textEl = item.querySelector('[data-slot="combobox-item-text"]');
        if (textEl) return textEl.textContent.trim();
        var clone = item.cloneNode(true);
        var indicator = clone.querySelector('[data-slot="combobox-item-indicator"]');
        if (indicator) indicator.remove();
        return clone.textContent.trim();
      }

      function resetFilter() {
        combobox.querySelectorAll('[data-slot="combobox-item"]').forEach(function (item) {
          item.hidden = false;
        });
        updateGroupsVisibility();
        updateEmptyState();
      }

      function getItems() {
        return Array.from(combobox.querySelectorAll(
          '[data-slot="combobox-item"]:not([hidden]):not([disabled]):not([data-disabled="true"])'
        ));
      }

      function updateGroupsVisibility() {
        combobox.querySelectorAll('[data-slot="combobox-group"]').forEach(function (group) {
          var visible = Array.from(group.querySelectorAll('[data-slot="combobox-item"]')).some(function (item) {
            return !item.hidden;
          });
          group.hidden = !visible;
        });
        combobox.querySelectorAll('[data-slot="combobox-separator"]').forEach(function (separator) {
          var prev = separator.previousElementSibling;
          var next = separator.nextElementSibling;
          separator.hidden = !prev || prev.hidden || !next || next.hidden;
        });
      }

      function updateEmptyState() {
        if (!emptyEl) return;
        emptyEl.hidden = getItems().length > 0;
      }

      function filterItems(query) {
        var q = query.toLowerCase().trim();
        combobox.querySelectorAll('[data-slot="combobox-item"]').forEach(function (item) {
          var text = getItemLabel(item).toLowerCase();
          item.hidden = q.length > 0 && text.indexOf(q) === -1;
        });
        updateGroupsVisibility();
        updateEmptyState();
      }

      function clearHighlights() {
        combobox.querySelectorAll('[data-slot="combobox-item"]').forEach(function (item) {
          item.removeAttribute('data-highlighted');
          item.setAttribute('aria-selected', 'false');
        });
      }

      function highlightItem(item) {
        clearHighlights();
        if (item) {
          item.setAttribute('data-highlighted', 'true');
          item.setAttribute('aria-selected', 'true');
          item.scrollIntoView({ block: 'nearest' });
        }
      }

      function openCombobox(options) {
        if (activeInput.disabled || (chipsRoot && chipsRoot.getAttribute('aria-disabled') === 'true')) return;
        var shouldFilter = options && options.filter === true;
        closeAllComboboxes(combobox);
        closeAllSelects();
        closeAllPopovers();
        closeAllDropdownMenus();
        content.setAttribute('data-state', 'open');
        activeInput.setAttribute('aria-expanded', 'true');
        syncTriggerExpanded(true);
        if (shouldFilter) {
          filterItems(activeInput.value || '');
        } else {
          resetFilter();
        }
        if (autoHighlight) {
          var items = getItems();
          if (items[0]) highlightItem(items[0]);
        }
      }

      function closeCombobox() {
        content.setAttribute('data-state', 'closed');
        activeInput.setAttribute('aria-expanded', 'false');
        syncTriggerExpanded(false);
        clearHighlights();
      }

      function updateClearButton() {
        if (!clearBtn) return;
        var hasValue = isMultiple
          ? combobox.querySelectorAll('[data-slot="combobox-chip"]').length > 0
          : input && input.value.length > 0;
        clearBtn.hidden = !hasValue;
      }

      function setSingleValue(value, label) {
        if (!input) return;
        input.value = label || value;
        input.dataset.comboboxValue = value;
        combobox.querySelectorAll('[data-slot="combobox-item"]').forEach(function (item) {
          item.setAttribute('data-selected', item.getAttribute('data-value') === value ? 'true' : 'false');
          item.setAttribute('aria-selected', item.getAttribute('data-value') === value ? 'true' : 'false');
        });
        updateClearButton();
        combobox.dispatchEvent(new CustomEvent('combobox-change', { bubbles: true, detail: { value: value, label: label } }));
      }

      function addChip(value, label) {
        if (!chipsRoot) return;
        if (chipsRoot.querySelector('[data-slot="combobox-chip"][data-value="' + value + '"]')) return;
        var chip = document.createElement('div');
        chip.setAttribute('data-slot', 'combobox-chip');
        chip.setAttribute('data-value', value);
        chip.textContent = label;
        var remove = document.createElement('button');
        remove.type = 'button';
        remove.setAttribute('data-slot', 'combobox-chip-remove');
        remove.setAttribute('aria-label', 'Remove ' + label);
        remove.innerHTML = '<i data-lucide="x" aria-hidden="true"></i>';
        chip.appendChild(remove);
        chipsRoot.insertBefore(chip, chipInput);
        if (window.lucide) window.lucide.createIcons({ root: chip });
        remove.addEventListener('click', function (event) {
          event.stopPropagation();
          chip.remove();
          var item = combobox.querySelector('[data-slot="combobox-item"][data-value="' + value + '"]');
          if (item) item.setAttribute('data-selected', 'false');
          updateClearButton();
        });
        var item = combobox.querySelector('[data-slot="combobox-item"][data-value="' + value + '"]');
        if (item) item.setAttribute('data-selected', 'true');
      }

      function selectItem(item) {
        var value = item.getAttribute('data-value') || getItemLabel(item);
        var label = getItemLabel(item);
        if (isMultiple) {
          addChip(value, label);
          if (chipInput) {
            chipInput.value = '';
            resetFilter();
          }
          if (autoHighlight) {
            var items = getItems();
            if (items[0]) highlightItem(items[0]);
          }
          chipInput.focus();
        } else {
          setSingleValue(value, label);
          closeCombobox();
          input.focus();
        }
      }

      combobox.querySelectorAll('[data-slot="combobox-item"]').forEach(function (item) {
        item.setAttribute('role', 'option');
        if (!item.querySelector('[data-slot="combobox-item-indicator"]')) {
          var indicator = document.createElement('span');
          indicator.setAttribute('data-slot', 'combobox-item-indicator');
          indicator.innerHTML = '<i data-lucide="check" aria-hidden="true"></i>';
          item.appendChild(indicator);
        }
        item.addEventListener('click', function (event) {
          event.stopPropagation();
          selectItem(item);
        });
      });

      if (window.lucide) window.lucide.createIcons({ root: combobox });

      combobox.addEventListener('click', function (event) {
        event.stopPropagation();
      });

      if (isSelectMode) {
        activeInput.addEventListener('click', function () {
          if (content.getAttribute('data-state') === 'open') return;
          openCombobox();
        });
      } else {
        activeInput.addEventListener('focus', function () {
          openCombobox();
        });
      }

      activeInput.addEventListener('input', function () {
        if (isSelectMode) return;
        openCombobox({ filter: true });
        if (autoHighlight) {
          var items = getItems();
          highlightItem(items[0] || null);
        }
      });

      activeInput.addEventListener('keydown', function (event) {
        if (isSelectMode && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
        }

        var items = getItems();
        var highlighted = combobox.querySelector('[data-slot="combobox-item"][data-highlighted="true"]');
        var idx = highlighted ? items.indexOf(highlighted) : -1;

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          if (content.getAttribute('data-state') !== 'open') openCombobox({ filter: !isSelectMode });
          items = getItems();
          var next = items[(idx + 1) % items.length];
          if (next) highlightItem(next);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          if (content.getAttribute('data-state') !== 'open') openCombobox({ filter: !isSelectMode });
          items = getItems();
          var prev = items[(idx - 1 + items.length) % items.length];
          if (prev) highlightItem(prev);
        } else if (event.key === 'Enter') {
          if (content.getAttribute('data-state') === 'open' && highlighted) {
            event.preventDefault();
            selectItem(highlighted);
          }
        } else if (event.key === 'Escape') {
          event.stopPropagation();
          closeCombobox();
        } else if (event.key === 'Tab') {
          closeCombobox();
        } else if (isSelectMode && event.key === ' ') {
          event.preventDefault();
          if (content.getAttribute('data-state') === 'open') {
            closeCombobox();
          } else {
            openCombobox();
          }
        }
      });

      if (trigger) {
        trigger.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          if (content.getAttribute('data-state') === 'open') {
            closeCombobox();
            activeInput.focus();
          } else {
            openCombobox();
            activeInput.focus();
          }
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          if (isMultiple) {
            combobox.querySelectorAll('[data-slot="combobox-chip"]').forEach(function (chip) { chip.remove(); });
            combobox.querySelectorAll('[data-slot="combobox-item"]').forEach(function (item) {
              item.setAttribute('data-selected', 'false');
            });
          } else if (input) {
            input.value = '';
            delete input.dataset.comboboxValue;
            combobox.querySelectorAll('[data-slot="combobox-item"]').forEach(function (item) {
              item.setAttribute('data-selected', 'false');
            });
          }
          updateClearButton();
          activeInput.focus();
        });
      }

      content.addEventListener('mousedown', function (event) {
        event.preventDefault();
      });

      if (combobox.getAttribute('data-default-value') && input) {
        var defaultValue = combobox.getAttribute('data-default-value');
        var defaultItem = combobox.querySelector('[data-slot="combobox-item"][data-value="' + defaultValue + '"]');
        if (defaultItem) setSingleValue(defaultValue, getItemLabel(defaultItem));
      }

      if (isMultiple && combobox.getAttribute('data-default-values')) {
        combobox.getAttribute('data-default-values').split('|').forEach(function (value) {
          var item = combobox.querySelector('[data-slot="combobox-item"][data-value="' + value + '"]');
          if (item) addChip(value, getItemLabel(item));
        });
      }

      updateClearButton();
      updateEmptyState();
    });
  }

  function closeAllTooltips(except) {
    document.querySelectorAll('[data-slot="tooltip"]').forEach(function (tooltip) {
      if (except && tooltip === except) return;
      var content = tooltip.querySelector('[data-slot="tooltip-content"]');
      if (content) content.setAttribute('data-state', 'closed');
    });
  }

  function initTooltips(root) {
    (root || document).querySelectorAll('[data-slot="tooltip"]').forEach(function (tooltip) {
      if (tooltip.dataset.tooltipBound === 'true') return;
      tooltip.dataset.tooltipBound = 'true';

      var trigger = tooltip.querySelector('[data-slot="tooltip-trigger"]');
      var content = tooltip.querySelector('[data-slot="tooltip-content"]');
      if (!trigger || !content) return;

      var delay = parseInt(tooltip.getAttribute('data-delay-duration') || '0', 10);
      var sideOffset = tooltip.getAttribute('data-side-offset') || content.getAttribute('data-side-offset') || '0';
      content.style.setProperty('--tooltip-side-offset', sideOffset + 'px');

      if (!content.getAttribute('data-side')) {
        content.setAttribute('data-side', 'top');
      }

      if (!content.querySelector('[data-slot="tooltip-arrow"]')) {
        var arrow = document.createElement('span');
        arrow.setAttribute('data-slot', 'tooltip-arrow');
        arrow.setAttribute('aria-hidden', 'true');
        content.appendChild(arrow);
      }

      var showTimer = null;

      function show() {
        clearTimeout(showTimer);
        showTimer = setTimeout(function () {
          closeAllTooltips(tooltip);
          content.setAttribute('data-state', 'open');
        }, delay);
      }

      function hide() {
        clearTimeout(showTimer);
        content.setAttribute('data-state', 'closed');
      }

      trigger.addEventListener('mouseenter', show);
      trigger.addEventListener('mouseleave', hide);
      trigger.addEventListener('focusin', show);
      trigger.addEventListener('focusout', function (event) {
        if (!tooltip.contains(event.relatedTarget)) hide();
      });

      trigger.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') hide();
      });
    });
  }

  function closeAllHoverCards(exceptCard) {
    document.querySelectorAll('[data-slot="hover-card"]').forEach(function (card) {
      if (card === exceptCard) return;
      var content = card.querySelector('[data-slot="hover-card-content"]');
      if (content) content.setAttribute('data-state', 'closed');
    });
  }

  function initHoverCards(root) {
    (root || document).querySelectorAll('[data-slot="hover-card"]').forEach(function (card) {
      if (card.dataset.hoverCardBound === 'true') return;
      card.dataset.hoverCardBound = 'true';

      var trigger = card.querySelector('[data-slot="hover-card-trigger"]');
      var content = card.querySelector('[data-slot="hover-card-content"]');
      if (!trigger || !content) return;

      var openDelay = parseInt(card.getAttribute('data-open-delay') || '700', 10);
      var closeDelay = parseInt(card.getAttribute('data-close-delay') || '300', 10);
      var sideOffset = content.getAttribute('data-side-offset') || '4';
      content.style.setProperty('--hover-card-side-offset', sideOffset + 'px');

      if (!content.getAttribute('data-side')) {
        content.setAttribute('data-side', 'bottom');
      }

      var openTimer = null;
      var closeTimer = null;

      function show() {
        clearTimeout(closeTimer);
        clearTimeout(openTimer);
        openTimer = window.setTimeout(function () {
          closeAllHoverCards(card);
          content.setAttribute('data-state', 'open');
        }, openDelay);
      }

      function hide() {
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
        closeTimer = window.setTimeout(function () {
          content.setAttribute('data-state', 'closed');
        }, closeDelay);
      }

      card.addEventListener('mouseenter', show);
      card.addEventListener('mouseleave', hide);
      card.addEventListener('focusin', show);
      card.addEventListener('focusout', function (event) {
        if (!card.contains(event.relatedTarget)) hide();
      });

      trigger.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          clearTimeout(openTimer);
          clearTimeout(closeTimer);
          content.setAttribute('data-state', 'closed');
        }
      });
    });
  }

  function initPopovers(root) {
    (root || document).querySelectorAll('[data-slot="popover"]').forEach(function (popover) {
      if (popover.dataset.popoverBound === 'true') return;
      popover.dataset.popoverBound = 'true';

      var trigger = popover.querySelector('[data-slot="popover-trigger"]') ||
        popover.querySelector('[data-slot="button"]') ||
        popover.querySelector('[data-slot="input-group-button"]');
      var content = popover.querySelector('[data-slot="popover-content"]');
      if (!trigger || !content) return;

      function openPopover() {
        closeAllPopovers(popover);
        closeAllSelects();
        closeAllDropdownMenus();
        content.setAttribute('data-state', 'open');
        trigger.setAttribute('aria-expanded', 'true');
      }

      function closePopover() {
        content.setAttribute('data-state', 'closed');
        trigger.setAttribute('aria-expanded', 'false');
      }

      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var isOpen = content.getAttribute('data-state') === 'open';
        if (isOpen) {
          closePopover();
        } else {
          openPopover();
        }
      });

      trigger.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          var isOpen = content.getAttribute('data-state') === 'open';
          if (isOpen) closePopover();
          else openPopover();
        } else if (event.key === 'Escape') {
          closePopover();
        }
      });

      content.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          event.stopPropagation();
          closePopover();
          trigger.focus();
        }
      });
    });
  }

  function setAccordionItemState(item, open, animate) {
    var trigger = item.querySelector('[data-slot="accordion-trigger"]');
    var content = item.querySelector('[data-slot="accordion-content"]');
    var inner = content && content.querySelector('[data-slot="accordion-content-inner"]');

    if (content && inner && animate) {
      content.style.setProperty('--accordion-content-height', inner.scrollHeight + 'px');
    }

    item.setAttribute('data-state', open ? 'open' : 'closed');
    if (content) content.setAttribute('data-state', open ? 'open' : 'closed');
    if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function getAccordionItems(accordion) {
    return Array.from(accordion.children).filter(function (child) {
      return child.matches('[data-slot="accordion-item"]');
    });
  }

  function initAccordions(root) {
    var scope = root || document;

    scope.querySelectorAll('[data-slot="accordion"]').forEach(function (accordion) {
      var type = accordion.getAttribute('data-type') || 'single';
      var collapsible = accordion.hasAttribute('data-collapsible');
      var items = getAccordionItems(accordion);

      items.forEach(function (item) {
        var trigger = item.querySelector('[data-slot="accordion-trigger"]');
        if (item.hasAttribute('data-disabled') && trigger) {
          trigger.disabled = true;
        }
        var shouldOpen =
          item.hasAttribute('data-default-open') ||
          item.getAttribute('data-value') === accordion.getAttribute('data-default-value');
        setAccordionItemState(item, shouldOpen, false);
      });

      items.forEach(function (item) {
        if (item.hasAttribute('data-disabled')) return;
        var trigger = item.querySelector('[data-slot="accordion-trigger"]');
        if (!trigger || trigger.dataset.accordionBound === 'true') return;

        trigger.dataset.accordionBound = 'true';
        trigger.addEventListener('click', function () {
          var isOpen = item.getAttribute('data-state') === 'open';

          if (type === 'multiple') {
            setAccordionItemState(item, !isOpen, true);
            return;
          }

          if (isOpen) {
            if (!collapsible) return;
            setAccordionItemState(item, false, true);
            return;
          }

          items.forEach(function (other) {
            if (other !== item) setAccordionItemState(other, false, true);
          });
          setAccordionItemState(item, true, true);
        });
      });
    });
  }

  function setCollapsibleState(collapsible, open, animate) {
    var trigger = collapsible.querySelector('[data-slot="collapsible-trigger"]');
    var content = collapsible.querySelector('[data-slot="collapsible-content"]');
    var inner = content && content.querySelector('[data-slot="collapsible-content-inner"]');

    if (content && inner && animate) {
      content.style.setProperty('--accordion-content-height', inner.scrollHeight + 'px');
    }

    collapsible.setAttribute('data-state', open ? 'open' : 'closed');
    if (content) content.setAttribute('data-state', open ? 'open' : 'closed');
    if (trigger) {
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      trigger.setAttribute('data-state', open ? 'open' : 'closed');
    }
  }

  function initCollapsibles(root) {
    var scope = root || document;

    scope.querySelectorAll('[data-slot="collapsible"]').forEach(function (collapsible) {
      var trigger = collapsible.querySelector('[data-slot="collapsible-trigger"]');
      var shouldOpen =
        collapsible.hasAttribute('data-default-open') ||
        collapsible.getAttribute('data-open') === 'true';

      setCollapsibleState(collapsible, shouldOpen, false);

      if (!trigger || trigger.dataset.collapsibleBound === 'true') return;

      if (collapsible.hasAttribute('data-disabled')) {
        trigger.disabled = true;
        return;
      }

      trigger.dataset.collapsibleBound = 'true';
      trigger.addEventListener('click', function (event) {
        event.stopPropagation();
        var isOpen = collapsible.getAttribute('data-state') === 'open';
        setCollapsibleState(collapsible, !isOpen, true);
      });
    });
  }

  /* ── 다크모드 테마 토글 ── */
  function initThemeToggle() {
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    if (!buttons.length) return;

    var isDark = document.documentElement.classList.contains('dark');

    function applyTheme(dark) {
      isDark = dark;
      document.documentElement.classList.toggle('dark', dark);
      document.querySelectorAll('[data-theme-icon-light]').forEach(function (icon) {
        icon.style.display = dark ? 'none' : '';
      });
      document.querySelectorAll('[data-theme-icon-dark]').forEach(function (icon) {
        icon.style.display = dark ? '' : 'none';
      });
      document.querySelectorAll('[data-theme-label]').forEach(function (label) {
        label.textContent = dark ? '다크 모드' : '라이트 모드';
      });
      try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
    }

    try {
      var saved = localStorage.getItem('theme');
      if (saved === 'dark') applyTheme(true);
      else if (saved === 'light') applyTheme(false);
      else if (window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme(true);
    } catch (e) {}

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () { applyTheme(!isDark); });
    });
  }

  /* ── Sonner ── */
  var TOAST_DURATION = 4000;

  function getToaster() {
    var toaster = document.querySelector('[data-slot="toaster"]');
    if (!toaster) {
      toaster = document.createElement('div');
      toaster.setAttribute('data-slot', 'toaster');
      document.body.appendChild(toaster);
    }
    return toaster;
  }

  function getViewport(position) {
    var toaster = getToaster();
    var viewport = toaster.querySelector('[data-slot="toaster-viewport"][data-position="' + position + '"]');
    if (!viewport) {
      viewport = document.createElement('div');
      viewport.setAttribute('data-slot', 'toaster-viewport');
      viewport.setAttribute('data-position', position);
      toaster.appendChild(viewport);
    }
    return viewport;
  }

  function getIconName(type) {
    if (type === 'success') return 'circle-check';
    if (type === 'info') return 'info';
    if (type === 'warning') return 'triangle-alert';
    if (type === 'error') return 'circle-x';
    if (type === 'loading') return 'loader-circle';
    return null;
  }

  function dismissToast(toast) {
    toast.setAttribute('data-state', 'closed');
    window.setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 200);
  }

  function createToast(message, options) {
    options = options || {};
    var type = options.type || 'default';
    var position = options.position || 'bottom-center';
    var viewport = getViewport(position);
    var toast = document.createElement('div');
    toast.setAttribute('data-slot', 'sonner-toast');
    toast.setAttribute('data-type', type);
    toast.setAttribute('data-state', 'open');

    var iconName = getIconName(type);
    if (iconName) {
      var icon = document.createElement('span');
      icon.setAttribute('data-slot', 'sonner-icon');
      icon.innerHTML = '<i data-lucide="' + iconName + '" aria-hidden="true"></i>';
      toast.appendChild(icon);
    }

    var content = document.createElement('div');
    content.setAttribute('data-slot', 'sonner-content');

    var title = document.createElement('div');
    title.setAttribute('data-slot', 'sonner-title');
    title.textContent = message;
    content.appendChild(title);

    if (options.description) {
      var description = document.createElement('div');
      description.setAttribute('data-slot', 'sonner-description');
      description.textContent = options.description;
      content.appendChild(description);
    }

    toast.appendChild(content);

    if (options.action && options.action.label) {
      var action = document.createElement('button');
      action.type = 'button';
      action.setAttribute('data-slot', 'sonner-action');
      action.textContent = options.action.label;
      action.addEventListener('click', function () {
        if (typeof options.action.onClick === 'function') options.action.onClick();
        dismissToast(toast);
      });
      toast.appendChild(action);
    }

    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('data-slot', 'sonner-close');
    close.setAttribute('aria-label', 'Close');
    close.innerHTML = '<i data-lucide="x" aria-hidden="true"></i>';
    close.addEventListener('click', function () { dismissToast(toast); });
    toast.appendChild(close);

    viewport.appendChild(toast);

    if (window.lucide) window.lucide.createIcons();

    if (options.duration !== 0) {
      window.setTimeout(function () { dismissToast(toast); }, options.duration || TOAST_DURATION);
    }

    return toast;
  }

  function updateToast(toastEl, message, options) {
    options = options || {};
    var title = toastEl.querySelector('[data-slot="sonner-title"]');
    if (title) title.textContent = message;

    if (options.type) {
      toastEl.setAttribute('data-type', options.type);
      var iconName = getIconName(options.type);
      var existingIcon = toastEl.querySelector('[data-slot="sonner-icon"]');
      if (iconName) {
        if (!existingIcon) {
          existingIcon = document.createElement('span');
          existingIcon.setAttribute('data-slot', 'sonner-icon');
          toastEl.insertBefore(existingIcon, toastEl.firstChild);
        }
        existingIcon.innerHTML = '<i data-lucide="' + iconName + '" aria-hidden="true"></i>';
      } else if (existingIcon) {
        existingIcon.remove();
      }
      if (window.lucide) window.lucide.createIcons();
    }

    window.setTimeout(function () { dismissToast(toastEl); }, options.duration || TOAST_DURATION);
  }

  function toast(message, options) { return createToast(message, options); }

  toast.success = function (message, options) { return createToast(message, Object.assign({}, options, { type: 'success' })); };
  toast.info    = function (message, options) { return createToast(message, Object.assign({}, options, { type: 'info' })); };
  toast.warning = function (message, options) { return createToast(message, Object.assign({}, options, { type: 'warning' })); };
  toast.error   = function (message, options) { return createToast(message, Object.assign({}, options, { type: 'error' })); };

  toast.promise = function (promiseFn, messages) {
    messages = messages || {};
    var loadingToast = createToast(messages.loading || 'Loading...', { type: 'loading', duration: 0 });
    return Promise.resolve()
      .then(promiseFn)
      .then(function (data) {
        var successMessage = typeof messages.success === 'function' ? messages.success(data) : messages.success || 'Success';
        updateToast(loadingToast, successMessage, { type: 'success' });
        return data;
      })
      .catch(function () { updateToast(loadingToast, messages.error || 'Error', { type: 'error' }); });
  };

  function initSonnerDemos(root) {
    root.querySelectorAll('[data-sonner-trigger]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var type = trigger.getAttribute('data-sonner-type') || 'default';
        var message = trigger.getAttribute('data-sonner-message') || 'Event has been created';
        var description = trigger.getAttribute('data-sonner-description');
        var position = trigger.getAttribute('data-sonner-position');
        var actionLabel = trigger.getAttribute('data-sonner-action-label');
        var options = {};

        if (description) options.description = description;
        if (position) options.position = position;
        if (actionLabel) { options.action = { label: actionLabel, onClick: function () {} }; }

        if (type === 'promise') {
          toast.promise(
            function () { return new Promise(function (resolve) { window.setTimeout(function () { resolve({ name: 'Event' }); }, 2000); }); },
            { loading: 'Loading...', success: function (data) { return data.name + ' has been created'; }, error: 'Error' }
          );
          return;
        }

        if (type === 'success') toast.success(message, options);
        else if (type === 'info') toast.info(message, options);
        else if (type === 'warning') toast.warning(message, options);
        else if (type === 'error') toast.error(message, options);
        else toast(message, options);
      });
    });
  }

  window.toast = toast;
  window.initSonnerDemos = initSonnerDemos;

  /* ── Alert Dialog ── */
  function initAlertDialogs(root) {
    var scope = root || document;

    scope.querySelectorAll('[data-slot="alert-dialog"]').forEach(function (dialog) {
      if (dialog.dataset.alertDialogBound === 'true') return;
      dialog.dataset.alertDialogBound = 'true';

      var triggerWrapper = dialog.querySelector('[data-slot="alert-dialog-trigger"]');
      var trigger = triggerWrapper ? (triggerWrapper.querySelector('button') || triggerWrapper) : null;
      var overlay = dialog.querySelector('[data-slot="alert-dialog-overlay"]');
      var content = dialog.querySelector('[data-slot="alert-dialog-content"]');
      var cancelBtn = dialog.querySelector('[data-slot="alert-dialog-cancel"]');
      var actionBtn = dialog.querySelector('[data-slot="alert-dialog-action"]');

      if (!trigger || !content) return;

      var previousFocus = null;

      function openDialog() {
        previousFocus = document.activeElement;
        if (overlay) overlay.setAttribute('data-state', 'open');
        content.setAttribute('data-state', 'open');
        content.removeAttribute('aria-hidden');
        document.body.style.overflow = 'hidden';
        /* 첫 번째 포커스 가능 요소로 포커스 이동 */
        var focusable = getFocusableElements(content);
        if (focusable.length) {
          window.setTimeout(function () { focusable[0].focus(); }, 0);
        }
      }

      function closeDialog() {
        if (overlay) overlay.setAttribute('data-state', 'closed');
        content.setAttribute('data-state', 'closed');
        document.body.style.overflow = '';
        if (previousFocus && typeof previousFocus.focus === 'function') {
          previousFocus.focus();
        }
        /* 닫힘 애니메이션(200ms) 종료 후 display:none 복원 */
        window.setTimeout(function () {
          content.removeAttribute('data-state');
          if (overlay) overlay.removeAttribute('data-state');
        }, 210);
      }

      trigger.addEventListener('click', openDialog);

      /* Cancel·Action 모두 닫기 */
      if (cancelBtn) cancelBtn.addEventListener('click', closeDialog);
      if (actionBtn) actionBtn.addEventListener('click', closeDialog);

      /* 포커스 트랩 — ESC는 AlertDialog에서 닫힘 없음 (Radix 명세) */
      content.addEventListener('keydown', function (event) {
        var focusable = getFocusableElements(content);
        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.key === 'Tab') {
          if (!focusable.length) { event.preventDefault(); return; }
          if (event.shiftKey) {
            if (document.activeElement === first) {
              event.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }
        }
        /* ESC 키는 AlertDialog를 닫지 않음 — 의도치 않은 파괴적 작업 방지 */
      });

      /* 오버레이 클릭도 AlertDialog는 닫지 않음 */
    });
  }

  function getFocusableElements(container) {
    return Array.from(container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
  }

  /* ── Dialog ── */
  function initCommands(root) {
    (root || document).querySelectorAll('[data-slot="command"]').forEach(function (command) {
      if (command.dataset.commandBound === 'true') return;
      command.dataset.commandBound = 'true';

      var input = command.querySelector('[data-slot="command-input"]');
      var empty = command.querySelector('[data-slot="command-empty"]');
      var list = command.querySelector('[data-slot="command-list"]');

      function getItemLabel(item) {
        var textEl = item.querySelector('[data-slot="command-item-text"]');
        if (textEl) return textEl.textContent.trim();
        var clone = item.cloneNode(true);
        var shortcut = clone.querySelector('[data-slot="command-shortcut"]');
        if (shortcut) shortcut.remove();
        clone.querySelectorAll('svg, i').forEach(function (icon) { icon.remove(); });
        return clone.textContent.trim();
      }

      function getVisibleItems() {
        return Array.from(command.querySelectorAll(
          '[data-slot="command-item"]:not([hidden]):not([disabled]):not([data-disabled="true"])'
        ));
      }

      function clearSelection() {
        command.querySelectorAll('[data-slot="command-item"]').forEach(function (item) {
          item.removeAttribute('data-selected');
        });
      }

      function highlightItem(item) {
        clearSelection();
        if (item) {
          item.setAttribute('data-selected', 'true');
          item.scrollIntoView({ block: 'nearest' });
        }
      }

      function updateGroups() {
        command.querySelectorAll('[data-slot="command-group"]').forEach(function (group) {
          var visible = Array.from(group.querySelectorAll('[data-slot="command-item"]')).some(function (item) {
            return !item.hidden;
          });
          group.hidden = !visible;
        });

        command.querySelectorAll('[data-slot="command-separator"]').forEach(function (separator) {
          var prev = separator.previousElementSibling;
          var next = separator.nextElementSibling;
          separator.hidden = !prev || prev.hidden || !next || next.hidden;
        });
      }

      function updateEmpty() {
        if (!empty) return;
        empty.hidden = getVisibleItems().length > 0;
      }

      function filterItems() {
        var query = input ? input.value.toLowerCase().trim() : '';

        command.querySelectorAll('[data-slot="command-item"]').forEach(function (item) {
          var disabled = item.hasAttribute('disabled') || item.getAttribute('data-disabled') === 'true';
          if (disabled) return;
          var label = getItemLabel(item).toLowerCase();
          item.hidden = query.length > 0 && label.indexOf(query) === -1;
        });

        updateGroups();
        updateEmpty();
        var items = getVisibleItems();
        highlightItem(items[0] || null);
      }

      command._commandReset = function () {
        if (input) input.value = '';
        command.querySelectorAll('[data-slot="command-item"]').forEach(function (item) {
          item.hidden = false;
        });
        command.querySelectorAll('[data-slot="command-group"]').forEach(function (group) {
          group.hidden = false;
        });
        command.querySelectorAll('[data-slot="command-separator"]').forEach(function (separator) {
          separator.hidden = false;
        });
        updateEmpty();
        highlightItem(getVisibleItems()[0] || null);
      };

      command.querySelectorAll('[data-slot="command-item"]').forEach(function (item) {
        item.setAttribute('role', 'option');
        item.setAttribute('aria-disabled', item.hasAttribute('disabled') || item.getAttribute('data-disabled') === 'true' ? 'true' : 'false');

        item.addEventListener('mouseenter', function () {
          if (item.hidden || item.getAttribute('aria-disabled') === 'true') return;
          highlightItem(item);
        });

        item.addEventListener('click', function (event) {
          if (item.hidden || item.getAttribute('aria-disabled') === 'true') return;
          event.preventDefault();
          highlightItem(item);
          var dialog = command.closest('[data-slot="dialog-content"]');
          if (dialog) {
            var dialogRoot = dialog.closest('[data-slot="dialog"]');
            var closeBtn = dialog.querySelector('[data-slot="dialog-close"], [data-dialog-close]');
            if (closeBtn) closeBtn.click();
            else if (dialogRoot) {
              var overlay = dialogRoot.querySelector('[data-slot="dialog-overlay"]');
              if (overlay) overlay.click();
            }
          }
        });
      });

      if (input) {
        input.setAttribute('role', 'combobox');
        input.setAttribute('aria-autocomplete', 'list');
        input.setAttribute('aria-expanded', 'true');
        if (list && list.id) {
          input.setAttribute('aria-controls', list.id);
        } else if (list) {
          list.id = 'command-list-' + Math.random().toString(36).slice(2, 9);
          input.setAttribute('aria-controls', list.id);
        }

        input.addEventListener('input', filterItems);

        input.addEventListener('keydown', function (event) {
          var items = getVisibleItems();
          var selected = command.querySelector('[data-slot="command-item"][data-selected="true"]');
          var index = selected ? items.indexOf(selected) : -1;

          if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!items.length) return;
            highlightItem(items[Math.min(index + 1, items.length - 1)]);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!items.length) return;
            highlightItem(items[Math.max(index - 1, 0)]);
          } else if (event.key === 'Home') {
            event.preventDefault();
            highlightItem(items[0] || null);
          } else if (event.key === 'End') {
            event.preventDefault();
            highlightItem(items[items.length - 1] || null);
          } else if (event.key === 'Enter' && selected) {
            event.preventDefault();
            selected.click();
          }
        });
      }

      updateEmpty();
      highlightItem(getVisibleItems()[0] || null);
    });
  }

  function initDialogs(root) {
    (root || document).querySelectorAll('[data-slot="dialog"]').forEach(function (dialog) {
      if (dialog.dataset.dialogBound === 'true') return;
      dialog.dataset.dialogBound = 'true';

      var triggerWrapper = dialog.querySelector('[data-slot="dialog-trigger"]');
      var trigger = triggerWrapper
        ? (triggerWrapper.querySelector('button') || triggerWrapper)
        : dialog.querySelector('[data-dialog-trigger]');
      var overlay = dialog.querySelector('[data-slot="dialog-overlay"]');
      var content = dialog.querySelector('[data-slot="dialog-content"]');
      var closeButtons = dialog.querySelectorAll('[data-slot="dialog-close"], [data-dialog-close]');

      if (!trigger || !content) return;

      var previousFocus = null;
      var isOpen = false;

      function openDialog() {
        if (isOpen) return;
        isOpen = true;
        previousFocus = document.activeElement;
        if (overlay) {
          overlay.setAttribute('data-state', 'open');
          overlay.setAttribute('aria-hidden', 'false');
        }
        content.setAttribute('data-state', 'open');
        content.removeAttribute('aria-hidden');
        trigger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';

        var commandInput = content.querySelector('[data-slot="command-input"]');
        if (commandInput) {
          window.setTimeout(function () { commandInput.focus(); }, 0);
        } else {
          var focusable = getFocusableElements(content);
          if (focusable.length) {
            window.setTimeout(function () { focusable[0].focus(); }, 0);
          }
        }
      }

      function closeDialog() {
        if (!isOpen) return;
        isOpen = false;
        if (overlay) overlay.setAttribute('data-state', 'closed');
        content.setAttribute('data-state', 'closed');
        trigger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';

        if (previousFocus && typeof previousFocus.focus === 'function') {
          previousFocus.focus();
        }

        content.querySelectorAll('[data-slot="command"]').forEach(function (command) {
          if (typeof command._commandReset === 'function') command._commandReset();
        });

        window.setTimeout(function () {
          content.setAttribute('aria-hidden', 'true');
          content.removeAttribute('data-state');
          if (overlay) {
            overlay.removeAttribute('data-state');
            overlay.setAttribute('aria-hidden', 'true');
          }
        }, 210);
      }

      content.setAttribute('aria-hidden', 'true');
      if (overlay) overlay.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');

      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        openDialog();
      });

      if (overlay) {
        overlay.addEventListener('click', closeDialog);
      }

      closeButtons.forEach(function (btn) {
        btn.addEventListener('click', function (event) {
          event.preventDefault();
          closeDialog();
        });
      });

      var form = content.querySelector('form');
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          closeDialog();
        });
      }

      content.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          event.stopPropagation();
          closeDialog();
          return;
        }

        var focusable = getFocusableElements(content);
        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.key === 'Tab') {
          if (!focusable.length) {
            event.preventDefault();
            return;
          }
          if (event.shiftKey) {
            if (document.activeElement === first) {
              event.preventDefault();
              last.focus();
            }
          } else if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      });
    });
  }

  /* ── Checkbox ── */
  function setCheckboxState(checkbox, checked) {
    checkbox.setAttribute('aria-checked', checked ? 'true' : 'false');
    if (checked) {
      checkbox.setAttribute('data-checked', 'true');
    } else {
      checkbox.removeAttribute('data-checked');
    }
  }

  function isCheckboxChecked(checkbox) {
    return checkbox.getAttribute('aria-checked') === 'true';
  }

  function toggleCheckbox(checkbox) {
    if (checkbox.disabled) return;
    setCheckboxState(checkbox, !isCheckboxChecked(checkbox));
  }

  function bindCheckbox(checkbox) {
    if (checkbox.dataset.checkboxBound === 'true') return;
    checkbox.dataset.checkboxBound = 'true';

    checkbox.addEventListener('click', function (event) {
      event.preventDefault();
      toggleCheckbox(checkbox);
      checkbox.dispatchEvent(new CustomEvent('checkbox-change', { bubbles: true }));
    });

    checkbox.addEventListener('keydown', function (event) {
      if (event.key === ' ') {
        event.preventDefault();
        toggleCheckbox(checkbox);
        checkbox.dispatchEvent(new CustomEvent('checkbox-change', { bubbles: true }));
      }
    });
  }

  function initCheckboxTable(table) {
    if (table.dataset.checkboxTableBound === 'true') return;
    table.dataset.checkboxTableBound = 'true';

    var selectAll = table.querySelector('[data-checkbox-select-all]');
    var rowCheckboxes = Array.prototype.slice.call(
      table.querySelectorAll('[data-checkbox-row]')
    );

    if (!selectAll || !rowCheckboxes.length) return;

    function syncRowState(rowCheckbox) {
      var row = rowCheckbox.closest('[data-slot="table-row"]');
      if (!row) return;
      if (isCheckboxChecked(rowCheckbox)) {
        row.setAttribute('data-state', 'selected');
      } else {
        row.removeAttribute('data-state');
      }
    }

    function syncSelectAll() {
      var allChecked = rowCheckboxes.every(isCheckboxChecked);
      setCheckboxState(selectAll, allChecked);
    }

    rowCheckboxes.forEach(function (rowCheckbox) {
      bindCheckbox(rowCheckbox);
      syncRowState(rowCheckbox);
      rowCheckbox.addEventListener('checkbox-change', function () {
        syncRowState(rowCheckbox);
        syncSelectAll();
      });
    });

    bindCheckbox(selectAll);
    selectAll.addEventListener('checkbox-change', function () {
      var checked = isCheckboxChecked(selectAll);
      rowCheckboxes.forEach(function (rowCheckbox) {
        setCheckboxState(rowCheckbox, checked);
        syncRowState(rowCheckbox);
      });
    });

    syncSelectAll();
  }

  function initCheckboxes(root) {
    var scope = root || document;

    scope.querySelectorAll('[data-slot="checkbox"]').forEach(function (checkbox) {
      bindCheckbox(checkbox);
    });

    scope.querySelectorAll('[data-slot="table"][data-checkbox-table="true"]').forEach(initCheckboxTable);
  }

  /* ── Radio Group ── */
  function getGroupItems(group) {
    return Array.prototype.slice.call(
      group.querySelectorAll('[data-slot="radio-group-item"]')
    );
  }

  function isItemChecked(item) {
    return item.getAttribute('aria-checked') === 'true';
  }

  function setItemChecked(item, checked) {
    item.setAttribute('aria-checked', checked ? 'true' : 'false');
    item.tabIndex = checked ? 0 : -1;
    if (checked) {
      item.setAttribute('data-checked', 'true');
    } else {
      item.removeAttribute('data-checked');
    }
  }

  function selectRadioItem(group, item) {
    if (!item || item.disabled) return;

    getGroupItems(group).forEach(function (radioItem) {
      setItemChecked(radioItem, radioItem === item);
    });

    item.focus();
    group.dispatchEvent(new CustomEvent('radio-group-change', {
      bubbles: true,
      detail: { value: item.getAttribute('data-value') || '' }
    }));
  }

  function bindRadioItem(group, item, items) {
    if (item.dataset.radioBound === 'true') return;
    item.dataset.radioBound = 'true';

    item.addEventListener('click', function (event) {
      event.preventDefault();
      selectRadioItem(group, item);
    });

    item.addEventListener('keydown', function (event) {
      var index = items.indexOf(item);
      var nextIndex = index;

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        selectRadioItem(group, item);
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        nextIndex = (index + 1) % items.length;
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        nextIndex = (index - 1 + items.length) % items.length;
      } else {
        return;
      }

      var nextItem = items[nextIndex];
      while (nextItem && nextItem.disabled) {
        nextIndex = event.key === 'ArrowDown' || event.key === 'ArrowRight'
          ? (nextIndex + 1) % items.length
          : (nextIndex - 1 + items.length) % items.length;
        nextItem = items[nextIndex];
        if (nextItem === item) break;
      }

      if (nextItem && !nextItem.disabled) {
        selectRadioItem(group, nextItem);
      }
    });
  }

  function initRadioGroup(group) {
    if (group.dataset.radioGroupBound === 'true') return;
    group.dataset.radioGroupBound = 'true';

    var allItems = getGroupItems(group);
    var defaultValue = group.getAttribute('data-default-value');
    var selected = allItems.find(function (item) {
      return item.hasAttribute('data-checked');
    }) || allItems.find(function (item) {
      return item.getAttribute('data-value') === defaultValue;
    }) || allItems.find(function (item) {
      return !item.disabled;
    });

    allItems.forEach(function (item) {
      bindRadioItem(group, item, allItems);
      setItemChecked(item, selected ? item === selected : false);
    });
  }

  function initRadioGroups(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-slot="radio-group"]').forEach(initRadioGroup);
  }

  /* ── Switch ── */
  function setSwitchState(sw, checked) {
    sw.setAttribute('aria-checked', checked ? 'true' : 'false');
    sw.setAttribute('data-state', checked ? 'checked' : 'unchecked');
  }

  function isSwitchChecked(sw) {
    return sw.getAttribute('data-state') === 'checked' || sw.getAttribute('aria-checked') === 'true';
  }

  function toggleSwitch(sw) {
    if (sw.disabled || sw.getAttribute('aria-disabled') === 'true') return;
    setSwitchState(sw, !isSwitchChecked(sw));
    sw.dispatchEvent(new CustomEvent('switch-change', { bubbles: true }));
  }

  function initSwitch(sw) {
    if (sw.dataset.switchBound === 'true') return;
    sw.dataset.switchBound = 'true';

    if (!sw.hasAttribute('data-state')) {
      setSwitchState(sw, sw.getAttribute('aria-checked') === 'true');
    }

    sw.addEventListener('click', function (event) {
      event.preventDefault();
      toggleSwitch(sw);
    });

    sw.addEventListener('keydown', function (event) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        toggleSwitch(sw);
      }
    });
  }

  function initSwitches(root) {
    (root || document).querySelectorAll('[data-slot="switch"]').forEach(initSwitch);
  }

  /* ── Toggle ── */
  function setToggleState(toggle, pressed) {
    toggle.setAttribute('data-state', pressed ? 'on' : 'off');
    toggle.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  }

  function isTogglePressed(toggle) {
    return toggle.getAttribute('data-state') === 'on' || toggle.getAttribute('aria-pressed') === 'true';
  }

  function toggleToggle(toggle) {
    if (toggle.disabled) return;
    var pressed = !isTogglePressed(toggle);
    setToggleState(toggle, pressed);
    toggle.dispatchEvent(new CustomEvent('toggle-change', {
      bubbles: true,
      detail: { pressed: pressed }
    }));
  }

  function initToggle(toggle) {
    if (toggle.dataset.toggleBound === 'true') return;
    toggle.dataset.toggleBound = 'true';

    if (!toggle.hasAttribute('data-state')) {
      setToggleState(toggle, toggle.getAttribute('aria-pressed') === 'true');
    } else if (!toggle.hasAttribute('aria-pressed')) {
      setToggleState(toggle, toggle.getAttribute('data-state') === 'on');
    }

    toggle.addEventListener('click', function (event) {
      event.preventDefault();
      toggleToggle(toggle);
    });

    toggle.addEventListener('keydown', function (event) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        toggleToggle(toggle);
      }
    });
  }

  function initToggles(root) {
    (root || document).querySelectorAll('[data-slot="toggle"]').forEach(initToggle);
  }

  function initToggleGroups(root) {
    (root || document).querySelectorAll('[data-slot="toggle-group"]').forEach(function (group) {
      if (group.dataset.toggleGroupBound === 'true') return;
      group.dataset.toggleGroupBound = 'true';

      var type = group.getAttribute('data-type') || 'single';
      var isMultiple = type === 'multiple';
      var isDisabled = group.disabled || group.getAttribute('data-disabled') === 'true';
      var variant = group.getAttribute('data-variant');
      var size = group.getAttribute('data-size');
      var items = Array.from(group.querySelectorAll('[data-slot="toggle-group-item"]'));

      if (!group.hasAttribute('role')) group.setAttribute('role', 'group');

      items.forEach(function (item) {
        if (variant) item.setAttribute('data-variant', variant);
        else item.removeAttribute('data-variant');
        if (size) item.setAttribute('data-size', size);
        else item.removeAttribute('data-size');

        if (!item.hasAttribute('data-state')) {
          setToggleState(item, item.getAttribute('aria-pressed') === 'true');
        }

        item.addEventListener('click', function (event) {
          event.preventDefault();
          if (isDisabled || item.disabled) return;

          if (isMultiple) {
            setToggleState(item, !isTogglePressed(item));
          } else {
            var wasOn = isTogglePressed(item);
            items.forEach(function (el) {
              setToggleState(el, false);
            });
            setToggleState(item, wasOn ? false : true);
          }

          group.dispatchEvent(new CustomEvent('toggle-group-change', { bubbles: true }));
        });

        item.addEventListener('keydown', function (event) {
          if (isDisabled || item.disabled) return;
          var idx = items.indexOf(item);

          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            item.click();
          } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            var next = items[(idx + 1) % items.length];
            if (next) next.focus();
          } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            var prev = items[(idx - 1 + items.length) % items.length];
            if (prev) prev.focus();
          } else if (event.key === 'Home') {
            event.preventDefault();
            if (items[0]) items[0].focus();
          } else if (event.key === 'End') {
            event.preventDefault();
            if (items[items.length - 1]) items[items.length - 1].focus();
          }
        });
      });

      if (group.getAttribute('data-default-value')) {
        var defaultValue = group.getAttribute('data-default-value');
        items.forEach(function (item) {
          setToggleState(item, item.getAttribute('data-value') === defaultValue);
        });
      }

      if (isMultiple && group.getAttribute('data-default-values')) {
        var defaultValues = group.getAttribute('data-default-values').split('|');
        items.forEach(function (item) {
          setToggleState(item, defaultValues.indexOf(item.getAttribute('data-value') || '') !== -1);
        });
      }

      if (isDisabled) {
        items.forEach(function (item) { item.disabled = true; });
      }
    });
  }

  /* ── Slider ── */
  function initSliders(root) {
    (root || document).querySelectorAll('[data-slot="slider"]').forEach(initSlider);
  }

  function initSlider(slider) {
    if (slider.dataset.sliderBound === 'true') return;
    slider.dataset.sliderBound = 'true';

    var min = parseFloat(slider.getAttribute('data-min') || slider.getAttribute('min') || '0');
    var max = parseFloat(slider.getAttribute('data-max') || slider.getAttribute('max') || '100');
    var step = parseFloat(slider.getAttribute('data-step') || slider.getAttribute('step') || '1');
    var orientation = slider.getAttribute('data-orientation') || 'horizontal';
    var isVertical = orientation === 'vertical';
    var isDisabled = slider.disabled || slider.getAttribute('data-disabled') === 'true';

    var track = slider.querySelector('[data-slot="slider-track"]');
    var rangeEl = slider.querySelector('[data-slot="slider-range"]');
    if (!track || !rangeEl) return;

    var output = slider.id
      ? document.querySelector('[data-slider-output="' + slider.id + '"]')
      : null;
    var label = slider.id
      ? document.querySelector('[data-slider-label="' + slider.id + '"]')
      : null;

    function parseValues(str) {
      if (!str) return null;
      return str.split(/[|,]/).map(function (part) {
        return parseFloat(part.trim());
      }).filter(function (value) {
        return !isNaN(value);
      });
    }

    var values = parseValues(slider.getAttribute('data-value')) ||
      parseValues(slider.getAttribute('data-default-value')) ||
      [min];
    if (values.length === 0) values = [min];

    var thumbs = Array.from(slider.querySelectorAll('[data-slot="slider-thumb"]'));
    while (thumbs.length < values.length) {
      var thumbEl = document.createElement('span');
      thumbEl.setAttribute('data-slot', 'slider-thumb');
      thumbEl.setAttribute('role', 'slider');
      slider.appendChild(thumbEl);
      thumbs.push(thumbEl);
    }
    while (thumbs.length > values.length) {
      thumbs.pop().remove();
    }
    thumbs = Array.from(slider.querySelectorAll('[data-slot="slider-thumb"]'));

    if (isDisabled) slider.setAttribute('data-disabled', 'true');

    function clamp(value) {
      return Math.min(max, Math.max(min, value));
    }

    function snap(value) {
      if (!step || step <= 0) return clamp(value);
      var snapped = min + Math.round((value - min) / step) * step;
      return clamp(parseFloat(snapped.toFixed(6)));
    }

    function percent(value) {
      return ((value - min) / (max - min)) * 100;
    }

    function emitChange() {
      slider.setAttribute('data-value', values.join('|'));
      if (output) output.textContent = values.join(', ');
      slider.dispatchEvent(new CustomEvent('slider-change', {
        bubbles: true,
        detail: { value: values.slice() }
      }));
    }

    function layout() {
      var sorted = values.slice().sort(function (a, b) { return a - b; });
      var rangeStart = values.length === 1 ? min : sorted[0];
      var rangeEnd = sorted[sorted.length - 1];
      var lo = percent(rangeStart);
      var hi = percent(rangeEnd);

      if (isVertical) {
        rangeEl.style.left = '0';
        rangeEl.style.right = '0';
        rangeEl.style.width = '';
        rangeEl.style.bottom = lo + '%';
        rangeEl.style.height = (hi - lo) + '%';
        rangeEl.style.top = '';
      } else {
        rangeEl.style.top = '0';
        rangeEl.style.bottom = '0';
        rangeEl.style.height = '';
        rangeEl.style.left = lo + '%';
        rangeEl.style.width = (hi - lo) + '%';
      }

      thumbs.forEach(function (thumb, index) {
        var p = percent(values[index]);
        thumb.setAttribute('aria-valuemin', String(min));
        thumb.setAttribute('aria-valuemax', String(max));
        thumb.setAttribute('aria-valuenow', String(values[index]));
        thumb.setAttribute('aria-orientation', orientation);
        if (label) thumb.setAttribute('aria-labelledby', label.id);

        thumb.tabIndex = isDisabled ? -1 : 0;

        if (isVertical) {
          thumb.style.left = '50%';
          thumb.style.bottom = p + '%';
          thumb.style.top = 'auto';
          thumb.style.transform = 'translate(-50%, 50%)';
        } else {
          thumb.style.left = p + '%';
          thumb.style.top = '50%';
          thumb.style.bottom = 'auto';
          thumb.style.transform = 'translate(-50%, -50%)';
        }
      });
    }

    function setValues(nextValues) {
      values = nextValues.map(snap);
      layout();
      emitChange();
    }

    function pointerToValue(clientX, clientY) {
      var rect = track.getBoundingClientRect();
      var ratio = isVertical
        ? 1 - (clientY - rect.top) / rect.height
        : (clientX - rect.left) / rect.width;
      ratio = Math.max(0, Math.min(1, ratio));
      return snap(min + ratio * (max - min));
    }

    function closestThumbIndex(target) {
      var bestIndex = 0;
      var bestDistance = Infinity;
      values.forEach(function (value, index) {
        var distance = Math.abs(value - target);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });
      return bestIndex;
    }

    var activeIndex = null;

    function onPointerMove(event) {
      if (activeIndex === null) return;
      var next = values.slice();
      next[activeIndex] = pointerToValue(event.clientX, event.clientY);
      setValues(next);
    }

    function onPointerUp() {
      activeIndex = null;
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('pointerdown', function (event) {
        if (isDisabled) return;
        event.preventDefault();
        activeIndex = index;
        if (thumb.setPointerCapture) thumb.setPointerCapture(event.pointerId);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
      });

      thumb.addEventListener('keydown', function (event) {
        if (isDisabled) return;
        var delta = 0;

        if (isVertical) {
          if (event.key === 'ArrowUp') delta = step;
          else if (event.key === 'ArrowDown') delta = -step;
        } else if (event.key === 'ArrowRight') {
          delta = step;
        } else if (event.key === 'ArrowLeft') {
          delta = -step;
        }

        if (event.key === 'Home') {
          event.preventDefault();
          var homeValues = values.slice();
          homeValues[index] = min;
          setValues(homeValues);
          return;
        }

        if (event.key === 'End') {
          event.preventDefault();
          var endValues = values.slice();
          endValues[index] = max;
          setValues(endValues);
          return;
        }

        if (!delta) return;

        event.preventDefault();
        var keyValues = values.slice();
        keyValues[index] = snap(values[index] + delta);
        setValues(keyValues);
      });
    });

    track.addEventListener('pointerdown', function (event) {
      if (isDisabled || event.target.closest('[data-slot="slider-thumb"]')) return;
      var value = pointerToValue(event.clientX, event.clientY);
      var index = values.length === 1 ? 0 : closestThumbIndex(value);
      var next = values.slice();
      next[index] = value;
      setValues(next);
      activeIndex = index;
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    });

    layout();
    emitChange();
  }

  /* ── Avatar ── */
  function initAvatar(avatar) {
    if (avatar.dataset.avatarBound === 'true') return;
    avatar.dataset.avatarBound = 'true';

    var image = avatar.querySelector('[data-slot="avatar-image"]');
    var fallback = avatar.querySelector('[data-slot="avatar-fallback"]');

    function showFallback() {
      if (image) image.setAttribute('data-state', 'error');
      if (fallback) fallback.setAttribute('data-state', 'visible');
    }

    function showImage() {
      if (image) image.setAttribute('data-state', 'loaded');
      if (fallback) fallback.setAttribute('data-state', 'hidden');
    }

    if (!image) {
      if (fallback) fallback.setAttribute('data-state', 'visible');
      return;
    }

    var src = image.getAttribute('src');

    if (!src) {
      showFallback();
      return;
    }

    if (image.complete) {
      if (image.naturalWidth > 0) {
        showImage();
      } else {
        showFallback();
      }
      return;
    }

    image.setAttribute('data-state', 'loading');
    if (fallback) fallback.setAttribute('data-state', 'visible');

    image.addEventListener('load', function () {
      if (image.naturalWidth > 0) {
        showImage();
      } else {
        showFallback();
      }
    });

    image.addEventListener('error', showFallback);
  }

  function initAvatars(root) {
    (root || document).querySelectorAll('[data-slot="avatar"]').forEach(initAvatar);
  }

  /* ── Scroll Area ── */
  function setupScrollbar(viewport, bar, orientation) {
    if (!bar) return;

    var thumb = bar.querySelector('[data-slot="scroll-area-thumb"]');
    if (!thumb) return;

    var dragging = false;
    var dragStart = 0;
    var scrollStart = 0;

    function update() {
      var clientSize = orientation === 'vertical' ? viewport.clientHeight : viewport.clientWidth;
      var scrollSize = orientation === 'vertical' ? viewport.scrollHeight : viewport.scrollWidth;
      var scrollPos = orientation === 'vertical' ? viewport.scrollTop : viewport.scrollLeft;

      if (scrollSize <= clientSize + 1) {
        bar.setAttribute('data-state', 'hidden');
        return;
      }

      bar.removeAttribute('data-state');

      var trackSize = orientation === 'vertical' ? bar.clientHeight : bar.clientWidth;
      var thumbSize = Math.max(20, (clientSize / scrollSize) * trackSize);
      var maxScroll = scrollSize - clientSize;
      var maxThumbOffset = trackSize - thumbSize;
      var thumbOffset = maxScroll > 0 ? (scrollPos / maxScroll) * maxThumbOffset : 0;

      if (orientation === 'vertical') {
        thumb.style.height = thumbSize + 'px';
        thumb.style.width = '';
        thumb.style.transform = 'translateY(' + thumbOffset + 'px)';
      } else {
        thumb.style.width = thumbSize + 'px';
        thumb.style.height = '';
        thumb.style.transform = 'translateX(' + thumbOffset + 'px)';
      }
    }

    viewport.addEventListener('scroll', update, { passive: true });

    thumb.addEventListener('mousedown', function (event) {
      dragging = true;
      dragStart = orientation === 'vertical' ? event.clientY : event.clientX;
      scrollStart = orientation === 'vertical' ? viewport.scrollTop : viewport.scrollLeft;
      event.preventDefault();
    });

    document.addEventListener('mousemove', function (event) {
      if (!dragging) return;

      var delta = (orientation === 'vertical' ? event.clientY : event.clientX) - dragStart;
      var clientSize = orientation === 'vertical' ? viewport.clientHeight : viewport.clientWidth;
      var scrollSize = orientation === 'vertical' ? viewport.scrollHeight : viewport.scrollWidth;
      var trackSize = orientation === 'vertical' ? bar.clientHeight : bar.clientWidth;
      var thumbSize = Math.max(20, (clientSize / scrollSize) * trackSize);
      var maxScroll = scrollSize - clientSize;
      var maxThumbOffset = trackSize - thumbSize;
      var ratio = maxThumbOffset > 0 ? maxScroll / maxThumbOffset : 0;
      var nextScroll = scrollStart + delta * ratio;

      if (orientation === 'vertical') viewport.scrollTop = nextScroll;
      else viewport.scrollLeft = nextScroll;
    });

    document.addEventListener('mouseup', function () {
      dragging = false;
    });

    bar.addEventListener('mousedown', function (event) {
      if (event.target === thumb) return;

      var rect = bar.getBoundingClientRect();
      var clientSize = orientation === 'vertical' ? viewport.clientHeight : viewport.clientWidth;
      var scrollSize = orientation === 'vertical' ? viewport.scrollHeight : viewport.scrollWidth;
      var trackSize = orientation === 'vertical' ? bar.clientHeight : bar.clientWidth;
      var thumbSize = Math.max(20, (clientSize / scrollSize) * trackSize);
      var maxScroll = scrollSize - clientSize;
      var maxThumbOffset = trackSize - thumbSize;
      var clickPos = orientation === 'vertical'
        ? event.clientY - rect.top - thumbSize / 2
        : event.clientX - rect.left - thumbSize / 2;
      var ratio = maxThumbOffset > 0 ? maxScroll / maxThumbOffset : 0;

      if (orientation === 'vertical') viewport.scrollTop = clickPos * ratio;
      else viewport.scrollLeft = clickPos * ratio;
    });

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(update).observe(viewport);
    }

    update();
    return update;
  }

  function initScrollArea(area) {
    if (area.dataset.scrollAreaBound === 'true') return;
    area.dataset.scrollAreaBound = 'true';

    var viewport = area.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    var verticalBar = area.querySelector('[data-slot="scroll-area-scrollbar"][data-orientation="vertical"]');
    var horizontalBar = area.querySelector('[data-slot="scroll-area-scrollbar"][data-orientation="horizontal"]');
    var defaultBar = area.querySelector('[data-slot="scroll-area-scrollbar"]:not([data-orientation="horizontal"])');

    var updateVertical = setupScrollbar(viewport, verticalBar || defaultBar, 'vertical');
    var updateHorizontal = setupScrollbar(viewport, horizontalBar, 'horizontal');

    area._scrollAreaUpdate = function () {
      if (updateVertical) updateVertical();
      if (updateHorizontal) updateHorizontal();
    };
  }

  function initScrollAreas(root) {
    (root || document).querySelectorAll('[data-slot="scroll-area"]').forEach(initScrollArea);
  }

  /* ── Progress ── */
  function initProgress(root) {
    (root || document).querySelectorAll('[data-slot="progress"]').forEach(initProgressBar);
  }

  function initPagination(root) {
    (root || document).querySelectorAll('[data-slot="pagination"]').forEach(function (pagination) {
      pagination.querySelectorAll('a[href="#"]').forEach(function (link) {
        link.addEventListener('click', function (event) {
          event.preventDefault();
        });
      });
    });
  }

  function initInputGroups(root) {
    (root || document).querySelectorAll('[data-slot="input-group-addon"]').forEach(function (addon) {
      if (addon.dataset.inputGroupAddonBound === 'true') return;
      addon.dataset.inputGroupAddonBound = 'true';

      addon.addEventListener('click', function (event) {
        if (event.target.closest('[data-slot="input-group-button"], button, a')) return;
        var group = addon.closest('[data-slot="input-group"]');
        if (!group) return;
        var control = group.querySelector('[data-slot="input-group-control"], [data-slot="textarea"]');
        if (control) control.focus();
      });
    });
  }

  function initItems(root) {
    (root || document).querySelectorAll('a[data-slot="item"][href="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
      });
    });
  }

  function initCards(root) {
    (root || document).querySelectorAll('[data-slot="card"] a[href="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
      });
    });
  }

  /* ── Direction ── */
  var DIRECTION_LOCALES = {
    en: {
      dir: 'ltr',
      strings: {
        title: 'Login to your account',
        description: 'Enter your email below to login to your account',
        signUp: 'Sign Up',
        email: 'Email',
        emailPlaceholder: 'm@example.com',
        password: 'Password',
        forgotPassword: 'Forgot your password?',
        login: 'Login',
        loginWithGoogle: 'Login with Google'
      }
    },
    ar: {
      dir: 'rtl',
      strings: {
        title: 'تسجيل الدخول إلى حسابك',
        description: 'أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك',
        signUp: 'إنشاء حساب',
        email: 'البريد الإلكتروني',
        emailPlaceholder: 'm@example.com',
        password: 'كلمة المرور',
        forgotPassword: 'نسيت كلمة المرور؟',
        login: 'تسجيل الدخول',
        loginWithGoogle: 'تسجيل الدخول باستخدام Google'
      }
    },
    he: {
      dir: 'rtl',
      strings: {
        title: 'התחבר לחשבון שלך',
        description: 'הזן את האימייל שלך למטה כדי להתחבר לחשבון שלך',
        signUp: 'הירשם',
        email: 'אימייל',
        emailPlaceholder: 'm@example.com',
        password: 'סיסמה',
        forgotPassword: 'שכחת את הסיסמה?',
        login: 'התחבר',
        loginWithGoogle: 'התחבר עם Google'
      }
    }
  };

  function applyDirectionLocale(demo, localeKey) {
    var locale = DIRECTION_LOCALES[localeKey];
    if (!locale) return;

    var provider = demo.querySelector('[data-slot="direction-provider"]');
    if (!provider) return;

    provider.setAttribute('dir', locale.dir);
    provider.setAttribute('data-direction', locale.dir);

    demo.querySelectorAll('[data-direction-key]').forEach(function (el) {
      var key = el.getAttribute('data-direction-key');
      if (locale.strings[key] === undefined) return;
      if (el.tagName === 'INPUT') {
        el.placeholder = locale.strings[key];
      } else {
        el.textContent = locale.strings[key];
      }
    });

    provider.dispatchEvent(new CustomEvent('direction-change', {
      bubbles: true,
      detail: { direction: locale.dir, locale: localeKey }
    }));
  }

  function initDirectionDemo(demo) {
    if (demo.dataset.directionBound === 'true') return;
    demo.dataset.directionBound = 'true';

    var combobox = demo.querySelector('[data-slot="combobox"][data-direction-lang]');
    var defaultLocale = combobox ? (combobox.getAttribute('data-default-value') || 'ar') : 'en';

    applyDirectionLocale(demo, defaultLocale);

    if (!combobox) return;

    combobox.querySelectorAll('[data-slot="combobox-item"]').forEach(function (item) {
      item.addEventListener('click', function () {
        var localeKey = item.getAttribute('data-value');
        if (localeKey) applyDirectionLocale(demo, localeKey);
      });
    });
  }

  function initDirections(root) {
    (root || document).querySelectorAll('[data-direction-demo]').forEach(initDirectionDemo);
  }

  /* ── Attachment ── */
  function initAttachment(el) {
    if (el.dataset.attachmentBound === 'true') return;
    el.dataset.attachmentBound = 'true';

    var trigger = el.querySelector('[data-slot="attachment-trigger"]');
    if (trigger) {
      trigger.addEventListener('click', function (event) {
        var actionClicked = event.target.closest('[data-slot="attachment-action"]');
        if (actionClicked) return;
        el.dispatchEvent(new CustomEvent('attachment-trigger-click', { bubbles: true, detail: { attachment: el } }));
      });
    }
  }

  function initAttachments(root) {
    (root || document).querySelectorAll('[data-slot="attachment"]').forEach(initAttachment);
  }

  function initEmpties(root) {
    (root || document).querySelectorAll('[data-slot="empty"] a[href="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
      });
    });
  }

  /* ── Carousel (Swiper JS + shadcn CSS) ── */
  function getCarouselSpaceBetween(carousel) {
    var spacingMultiplier = parseInt(carousel.getAttribute('data-spacing') || '4', 10);
    var probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;width:calc(var(--spacing)*' + spacingMultiplier + ')';
    document.body.appendChild(probe);
    var px = probe.getBoundingClientRect().width;
    document.body.removeChild(probe);
    return px || spacingMultiplier * 4;
  }

  function getCarouselSlidesConfig(carousel) {
    var item = carousel.querySelector('[data-slot="carousel-item"]');
    var basis = carousel.getAttribute('data-basis') || (item ? item.getAttribute('data-basis') : null);

    if (basis === 'half-third') {
      return {
        slidesPerView: 2,
        breakpoints: {
          1024: {
            slidesPerView: 3
          }
        }
      };
    }
    if (basis === 'half') return { slidesPerView: 2 };
    if (basis === 'third') return { slidesPerView: 3 };
    return { slidesPerView: 1 };
  }

  function initCarousels(root) {
    if (typeof Swiper === 'undefined') return;

    (root || document).querySelectorAll('[data-slot="carousel"]').forEach(function (carousel) {
      if (carousel.dataset.carouselBound === 'true') return;

      var viewport = carousel.querySelector('[data-slot="carousel-content"]');
      var prevBtn = carousel.querySelector('[data-slot="carousel-previous"]');
      var nextBtn = carousel.querySelector('[data-slot="carousel-next"]');
      if (!viewport || !viewport.querySelector('[data-slot="carousel-item"]')) return;

      viewport.classList.add('swiper');
      var track = viewport.querySelector('[data-slot="carousel-track"]');
      if (track) track.classList.add('swiper-wrapper');
      viewport.querySelectorAll('[data-slot="carousel-item"]').forEach(function (item) {
        item.classList.add('swiper-slide');
      });

      var orientation = carousel.getAttribute('data-orientation') || 'horizontal';
      var slidesConfig = getCarouselSlidesConfig(carousel);
      var swiperOptions = {
        direction: orientation === 'vertical' ? 'vertical' : 'horizontal',
        slidesPerView: slidesConfig.slidesPerView,
        spaceBetween: getCarouselSpaceBetween(carousel),
        breakpoints: slidesConfig.breakpoints,
        centeredSlides: carousel.getAttribute('data-align') === 'center',
        loop: carousel.getAttribute('data-loop') === 'true',
        initialSlide: parseInt(carousel.getAttribute('data-start-index') || '0', 10),
        watchOverflow: true,
        keyboard: {
          enabled: true,
          onlyInViewport: true
        },
        navigation: prevBtn && nextBtn ? {
          prevEl: prevBtn,
          nextEl: nextBtn
        } : undefined
      };

      if (carousel.getAttribute('data-autoplay') === 'true') {
        swiperOptions.autoplay = {
          delay: parseInt(carousel.getAttribute('data-autoplay-delay') || '2000', 10),
          disableOnInteraction: true
        };
      }

      var swiper = new Swiper(viewport, swiperOptions);

      if (carousel.getAttribute('data-carousel-api') === 'true') {
        var statusEl = carousel.parentElement
          ? carousel.parentElement.querySelector('[data-slot="carousel-status"]')
          : null;

        function updateCarouselStatus() {
          if (!statusEl) return;
          statusEl.textContent = 'Slide ' + (swiper.realIndex + 1) + ' of ' + swiper.slides.length;
        }

        swiper.on('slideChange', updateCarouselStatus);
        updateCarouselStatus();
      }

      if (swiper.autoplay) {
        carousel.addEventListener('mouseenter', function () {
          swiper.autoplay.stop();
        });
        carousel.addEventListener('mouseleave', function () {
          swiper.autoplay.start();
        });
      }

      carousel.dataset.carouselBound = 'true';
      carousel._swiper = swiper;
    });
  }

  /* ── Data Table (Table + Vanilla JS) ── */
  var DATA_TABLE_PAYMENTS = [
    { id: 'm5gr84i9', status: 'success', email: 'ken99@example.com', amount: 316 },
    { id: '3u1reuv4', status: 'success', email: 'Abe45@example.com', amount: 242 },
    { id: 'derv1ws0', status: 'processing', email: 'Monserrat44@example.com', amount: 837 },
    { id: '5kma53ae', status: 'success', email: 'Silas22@example.com', amount: 874 },
    { id: 'bhqecj4p', status: 'failed', email: 'carmella@example.com', amount: 721 },
    { id: '8j2k1lm3', status: 'pending', email: 'demo01@example.com', amount: 120 },
    { id: '9p3q4rs5', status: 'success', email: 'demo02@example.com', amount: 455 }
  ];

  function formatDataTableCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  function initDataTables(root) {
    var scope = root || document;

    scope.querySelectorAll('[data-slot="data-table"]').forEach(function (wrapper) {
      if (wrapper.dataset.dataTableBound === 'true') return;
      wrapper.dataset.dataTableBound = 'true';

      var features = (wrapper.dataset.features || 'filter,sort,pagination,visibility,selection,actions')
        .split(',')
        .map(function (feature) { return feature.trim(); });
      var pageSize = parseInt(wrapper.dataset.pageSize || '5', 10);
      var table = wrapper.querySelector('[data-slot="table"]');
      var tbody = wrapper.querySelector('[data-slot="table-body"]');
      if (!table || !tbody) return;

      wrapper.querySelectorAll('[data-feature]').forEach(function (element) {
        if (features.indexOf(element.getAttribute('data-feature')) === -1) {
          element.setAttribute('hidden', '');
        }
      });

      var filterInput = wrapper.querySelector('[data-table-filter]');
      var selectionInfo = wrapper.querySelector('[data-slot="data-table-selection-info"]');
      var prevBtn = wrapper.querySelector('[data-action="prev"]');
      var nextBtn = wrapper.querySelector('[data-action="next"]');
      var selectAll = table.querySelector('[data-checkbox-select-all]');

      var state = {
        filter: '',
        sortColumn: null,
        sortDir: 'asc',
        page: 0,
        pageSize: pageSize,
        selected: Object.create(null),
        hiddenColumns: Object.create(null)
      };

      function hasFeature(name) {
        return features.indexOf(name) !== -1;
      }

      function getFilteredRows() {
        var rows = DATA_TABLE_PAYMENTS.slice();

        if (hasFeature('filter') && state.filter) {
          rows = rows.filter(function (row) {
            return row.email.toLowerCase().indexOf(state.filter) !== -1;
          });
        }

        if (hasFeature('sort') && state.sortColumn) {
          rows.sort(function (a, b) {
            var left = a[state.sortColumn];
            var right = b[state.sortColumn];
            var result = 0;

            if (typeof left === 'number' && typeof right === 'number') {
              result = left - right;
            } else {
              left = String(left).toLowerCase();
              right = String(right).toLowerCase();
              if (left < right) result = -1;
              if (left > right) result = 1;
            }

            return state.sortDir === 'asc' ? result : -result;
          });
        }

        return rows;
      }

      function setColumnVisibility(column, visible) {
        state.hiddenColumns[column] = !visible;
        wrapper.querySelectorAll('[data-column="' + column + '"]').forEach(function (cell) {
          if (visible) cell.removeAttribute('hidden');
          else cell.setAttribute('hidden', '');
        });
      }

      function updateSelectionInfo(filteredRows) {
        if (!selectionInfo) return;
        var rows = filteredRows || [];
        var selectedCount = rows.filter(function (row) {
          return state.selected[row.id];
        }).length;
        selectionInfo.textContent = selectedCount + ' of ' + rows.length + ' row(s) selected.';
      }

      function getVisibleColumnCount() {
        var count = 0;
        if (hasFeature('selection')) count += 1;
        if (!state.hiddenColumns.status) count += 1;
        if (!state.hiddenColumns.email) count += 1;
        if (!state.hiddenColumns.amount) count += 1;
        if (hasFeature('actions') && !state.hiddenColumns.actions) count += 1;
        return Math.max(count, 1);
      }

      function bindRowSelection(pageRows) {
        if (!hasFeature('selection')) return;

        var rowCheckboxes = Array.prototype.slice.call(
          tbody.querySelectorAll('[data-checkbox-row]')
        );

        rowCheckboxes.forEach(function (checkbox) {
          var rowId = checkbox.getAttribute('data-row-id');
          setCheckboxState(checkbox, !!state.selected[rowId]);
          bindCheckbox(checkbox);

          var row = checkbox.closest('[data-slot="table-row"]');
          if (row) {
            if (state.selected[rowId]) row.setAttribute('data-state', 'selected');
            else row.removeAttribute('data-state');
          }
        });

        syncSelectAll(pageRows, rowCheckboxes);
      }

      if (hasFeature('selection') && !tbody.dataset.dataTableSelectionBound) {
        tbody.dataset.dataTableSelectionBound = 'true';
        tbody.addEventListener('checkbox-change', function (event) {
          var checkbox = event.target.closest('[data-checkbox-row]');
          if (!checkbox || !tbody.contains(checkbox)) return;

          var rowId = checkbox.getAttribute('data-row-id');
          state.selected[rowId] = isCheckboxChecked(checkbox);
          var row = checkbox.closest('[data-slot="table-row"]');
          if (row) {
            if (state.selected[rowId]) row.setAttribute('data-state', 'selected');
            else row.removeAttribute('data-state');
          }

          var filteredRows = getFilteredRows();
          var pageRows = hasFeature('pagination')
            ? filteredRows.slice(state.page * state.pageSize, state.page * state.pageSize + state.pageSize)
            : filteredRows;
          var rowCheckboxes = Array.prototype.slice.call(
            tbody.querySelectorAll('[data-checkbox-row]')
          );
          syncSelectAll(pageRows, rowCheckboxes);
          updateSelectionInfo(filteredRows);
        });
      }

      if (selectAll && hasFeature('selection') && !selectAll.dataset.dataTableSelectAllBound) {
        selectAll.dataset.dataTableSelectAllBound = 'true';
        bindCheckbox(selectAll);
        selectAll.addEventListener('checkbox-change', function () {
          var filteredRows = getFilteredRows();
          var pageRows = hasFeature('pagination')
            ? filteredRows.slice(state.page * state.pageSize, state.page * state.pageSize + state.pageSize)
            : filteredRows;
          var checked = isCheckboxChecked(selectAll);
          pageRows.forEach(function (rowData) {
            state.selected[rowData.id] = checked;
          });
          render();
        });
      }

      function syncSelectAll(pageRows, rowCheckboxes) {
        if (!selectAll || !pageRows.length) return;
        var allChecked = pageRows.every(function (rowData) {
          return !!state.selected[rowData.id];
        });
        setCheckboxState(selectAll, allChecked);
      }

      function buildActionsCell(row) {
        var cell = document.createElement('td');
        cell.setAttribute('data-slot', 'table-cell');
        cell.setAttribute('data-align', 'right');
        if (state.hiddenColumns.actions) cell.setAttribute('hidden', '');
        cell.setAttribute('data-column', 'actions');

        var menu = document.createElement('div');
        menu.setAttribute('data-slot', 'dropdown-menu');

        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.setAttribute('data-slot', 'button');
        trigger.setAttribute('data-variant', 'ghost');
        trigger.setAttribute('data-size', 'icon-sm');
        trigger.setAttribute('aria-haspopup', 'menu');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.innerHTML = '<i data-lucide="more-horizontal" aria-hidden="true"></i><span data-slot="sr-only">Open menu</span>';

        var content = document.createElement('div');
        content.setAttribute('data-slot', 'dropdown-menu-content');
        content.setAttribute('data-state', 'closed');
        content.setAttribute('role', 'menu');

        var copyItem = document.createElement('button');
        copyItem.type = 'button';
        copyItem.setAttribute('data-slot', 'dropdown-menu-item');
        copyItem.setAttribute('role', 'menuitem');
        copyItem.textContent = 'Copy payment ID';
        copyItem.addEventListener('click', function () {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(row.id);
          }
        });

        var viewItem = document.createElement('button');
        viewItem.type = 'button';
        viewItem.setAttribute('data-slot', 'dropdown-menu-item');
        viewItem.setAttribute('role', 'menuitem');
        viewItem.textContent = 'View payment details';

        content.appendChild(copyItem);
        content.appendChild(viewItem);
        menu.appendChild(trigger);
        menu.appendChild(content);
        cell.appendChild(menu);
        return cell;
      }

      function buildRow(row) {
        var tr = document.createElement('tr');
        tr.setAttribute('data-slot', 'table-row');
        if (state.selected[row.id]) tr.setAttribute('data-state', 'selected');

        if (hasFeature('selection')) {
          var selectCell = document.createElement('td');
          selectCell.setAttribute('data-slot', 'table-cell');
          var checkbox = document.createElement('button');
          checkbox.type = 'button';
          checkbox.setAttribute('data-slot', 'checkbox');
          checkbox.setAttribute('role', 'checkbox');
          checkbox.setAttribute('aria-label', 'Select row');
          checkbox.setAttribute('data-checkbox-row', '');
          checkbox.setAttribute('data-row-id', row.id);
          checkbox.innerHTML = '<span data-slot="checkbox-indicator" aria-hidden="true"><i data-lucide="check"></i></span>';
          selectCell.appendChild(checkbox);
          tr.appendChild(selectCell);
        }

        var statusCell = document.createElement('td');
        statusCell.setAttribute('data-slot', 'table-cell');
        statusCell.setAttribute('data-column', 'status');
        if (state.hiddenColumns.status) statusCell.setAttribute('hidden', '');
        statusCell.textContent = row.status.charAt(0).toUpperCase() + row.status.slice(1);
        tr.appendChild(statusCell);

        var emailCell = document.createElement('td');
        emailCell.setAttribute('data-slot', 'table-cell');
        emailCell.setAttribute('data-column', 'email');
        if (state.hiddenColumns.email) emailCell.setAttribute('hidden', '');
        emailCell.textContent = row.email;
        tr.appendChild(emailCell);

        var amountCell = document.createElement('td');
        amountCell.setAttribute('data-slot', 'table-cell');
        amountCell.setAttribute('data-align', 'right');
        amountCell.setAttribute('data-column', 'amount');
        if (state.hiddenColumns.amount) amountCell.setAttribute('hidden', '');
        amountCell.setAttribute('data-variant', 'medium');
        amountCell.textContent = formatDataTableCurrency(row.amount);
        tr.appendChild(amountCell);

        if (hasFeature('actions')) {
          tr.appendChild(buildActionsCell(row));
        }

        return tr;
      }

      function render() {
        var filteredRows = getFilteredRows();
        var totalPages = Math.max(1, Math.ceil(filteredRows.length / state.pageSize));

        if (state.page >= totalPages) state.page = Math.max(0, totalPages - 1);

        var pageRows = hasFeature('pagination')
          ? filteredRows.slice(state.page * state.pageSize, state.page * state.pageSize + state.pageSize)
          : filteredRows;

        tbody.replaceChildren();

        if (!pageRows.length) {
          var emptyRow = document.createElement('tr');
          emptyRow.setAttribute('data-slot', 'table-row');
          var emptyCell = document.createElement('td');
          emptyCell.setAttribute('data-slot', 'table-cell');
          emptyCell.setAttribute('data-align', 'center');
          emptyCell.colSpan = getVisibleColumnCount();
          emptyCell.textContent = 'No results.';
          emptyRow.appendChild(emptyCell);
          tbody.appendChild(emptyRow);
        } else {
          pageRows.forEach(function (row) {
            tbody.appendChild(buildRow(row));
          });
        }

        bindRowSelection(pageRows);
        updateSelectionInfo(filteredRows);

        if (prevBtn) prevBtn.disabled = !hasFeature('pagination') || state.page <= 0;
        if (nextBtn) nextBtn.disabled = !hasFeature('pagination') || state.page >= totalPages - 1;

        initDropdownMenus(wrapper);
        if (window.lucide) window.lucide.createIcons();
      }

      if (filterInput) {
        filterInput.addEventListener('input', function () {
          state.filter = filterInput.value.trim().toLowerCase();
          state.page = 0;
          render();
        });
      }

      wrapper.querySelectorAll('[data-sort-column]').forEach(function (button) {
        button.addEventListener('click', function () {
          var column = button.getAttribute('data-sort-column');
          if (state.sortColumn === column) {
            state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            state.sortColumn = column;
            state.sortDir = 'asc';
          }
          render();
        });
      });

      wrapper.querySelectorAll('[data-column-toggle]').forEach(function (item) {
        item.addEventListener('click', function (event) {
          event.preventDefault();
          var column = item.getAttribute('data-column-toggle');
          var visible = item.getAttribute('aria-checked') !== 'true';
          item.setAttribute('aria-checked', visible ? 'true' : 'false');
          setColumnVisibility(column, visible);
          render();
        });
      });

      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          if (state.page > 0) {
            state.page -= 1;
            render();
          }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          var totalPages = Math.ceil(getFilteredRows().length / state.pageSize);
          if (state.page < totalPages - 1) {
            state.page += 1;
            render();
          }
        });
      }

      ['status', 'email', 'amount', 'actions'].forEach(function (column) {
        if (wrapper.querySelector('[data-column-toggle="' + column + '"]')) {
          setColumnVisibility(column, true);
        }
      });

      render();
    });
  }

  /* ── Sortable (SortableJS) ── */
  function initSortables(root) {
    if (typeof Sortable === 'undefined') return;

    (root || document).querySelectorAll('[data-slot="sortable"]').forEach(function (list) {
      if (list.dataset.sortableBound === 'true') return;
      list.dataset.sortableBound = 'true';

      var useHandle = list.getAttribute('data-handle') !== 'false';
      var groupName = list.getAttribute('data-group');
      var options = {
        animation: 200,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        draggable: '> [data-slot="sortable-item"]:not([data-disabled="true"])',
        handle: useHandle ? '[data-slot="sortable-item-handle"]' : undefined,
        filter: '[data-disabled="true"]',
        preventOnFilter: false,
        fallbackOnBody: true,
        swapThreshold: 0.65
      };

      if (groupName) {
        options.group = groupName;
      }

      list._sortable = Sortable.create(list, options);
    });
  }

  function initProgressBar(progress) {
    if (progress.dataset.progressBound === 'true') return;
    progress.dataset.progressBound = 'true';

    var indicator = progress.querySelector('[data-slot="progress-indicator"]');
    if (!indicator) return;

    var min = parseFloat(progress.getAttribute('data-min') || progress.getAttribute('min') || '0');
    var max = parseFloat(progress.getAttribute('data-max') || progress.getAttribute('max') || '100');
    var output = progress.id
      ? document.querySelector('[data-progress-output="' + progress.id + '"]')
      : null;

    function setValue(value) {
      var clamped = Math.min(max, Math.max(min, value));
      progress.setAttribute('data-value', String(clamped));
      progress.setAttribute('aria-valuenow', String(clamped));
      progress.setAttribute('aria-valuemin', String(min));
      progress.setAttribute('aria-valuemax', String(max));
      var percent = max === min ? 0 : ((clamped - min) / (max - min)) * 100;
      indicator.style.transform = 'translateX(-' + (100 - percent) + '%)';
      if (output) output.textContent = Math.round(percent) + '%';
    }

    setValue(parseFloat(progress.getAttribute('data-value') || progress.getAttribute('value') || '0'));

    var animateTo = progress.getAttribute('data-animate-to');
    if (animateTo !== null && animateTo !== '') {
      window.setTimeout(function () {
        setValue(parseFloat(animateTo));
      }, parseInt(progress.getAttribute('data-animate-delay') || '500', 10));
    }

    if (progress.id) {
      var slider = document.querySelector('[data-slot="slider"][data-progress-for="' + progress.id + '"]');
      if (slider) {
        slider.addEventListener('slider-change', function (event) {
          if (event.detail && event.detail.value && event.detail.value.length) {
            setValue(event.detail.value[0]);
          }
        });
      }
    }
  }

  /* ── Resizable ── */
  function initResizables(root) {
    (root || document).querySelectorAll('[data-slot="resizable-panel-group"]').forEach(initResizablePanelGroup);
  }

  function initResizablePanelGroup(group) {
    if (group.dataset.resizableBound === 'true') return;
    group.dataset.resizableBound = 'true';

    var orientation = group.getAttribute('data-orientation') || 'horizontal';
    var isVertical = orientation === 'vertical';
    var panels = [];
    var handles = [];

    Array.from(group.children).forEach(function (el) {
      var slot = el.getAttribute('data-slot');
      if (slot === 'resizable-panel') {
        panels.push(el);
      } else if (slot === 'resizable-handle') {
        handles.push({ el: el, leftIndex: panels.length - 1 });
      }
    });

    if (panels.length < 2) return;

    function parsePercent(value, fallback) {
      if (!value) return fallback;
      var num = parseFloat(String(value).replace('%', ''));
      return isNaN(num) ? fallback : num;
    }

    var sizes = panels.map(function (panel) {
      return parsePercent(
        panel.getAttribute('data-size') || panel.getAttribute('data-default-size'),
        100 / panels.length
      );
    });

    var total = sizes.reduce(function (sum, value) { return sum + value; }, 0);
    if (Math.abs(total - 100) > 0.01) {
      sizes = sizes.map(function (value) { return (value / total) * 100; });
    }

    function panelMinSize(panel) {
      return parsePercent(panel.getAttribute('data-min-size'), 10);
    }

    function applySizes() {
      panels.forEach(function (panel, index) {
        panel.style.flex = sizes[index] + ' 1 0%';
        panel.setAttribute('data-size', sizes[index].toFixed(2) + '%');
      });
    }

    function clampPair(leftIndex, nextLeft, nextRight) {
      var leftMin = panelMinSize(panels[leftIndex]);
      var rightMin = panelMinSize(panels[leftIndex + 1]);
      if (nextLeft < leftMin) {
        nextRight -= leftMin - nextLeft;
        nextLeft = leftMin;
      }
      if (nextRight < rightMin) {
        nextLeft -= rightMin - nextRight;
        nextRight = rightMin;
      }
      if (nextLeft < leftMin || nextRight < rightMin) return null;
      return { left: nextLeft, right: nextRight };
    }

    function setPair(leftIndex, nextLeft, nextRight) {
      var clamped = clampPair(leftIndex, nextLeft, nextRight);
      if (!clamped) return;
      sizes[leftIndex] = clamped.left;
      sizes[leftIndex + 1] = clamped.right;
      applySizes();
    }

    applySizes();

    handles.forEach(function (item) {
      var handle = item.el;
      var leftIndex = item.leftIndex;
      if (leftIndex < 0 || leftIndex >= panels.length - 1) return;

      handle.setAttribute('role', 'separator');
      handle.setAttribute('aria-orientation', isVertical ? 'horizontal' : 'vertical');
      if (!handle.hasAttribute('tabindex')) handle.tabIndex = 0;

      handle.addEventListener('pointerdown', function (event) {
        if (event.button !== 0) return;
        event.preventDefault();
        var cursor = isVertical ? 'row-resize' : 'col-resize';
        document.body.setAttribute('data-resizable-cursor', cursor);
        var startPos = isVertical ? event.clientY : event.clientX;
        var startSizes = sizes.slice();
        var rect = group.getBoundingClientRect();
        var totalSize = Math.max(isVertical ? rect.height : rect.width, 1);

        function onPointerMove(moveEvent) {
          var current = isVertical ? moveEvent.clientY : moveEvent.clientX;
          var delta = ((current - startPos) / totalSize) * 100;
          setPair(leftIndex, startSizes[leftIndex] + delta, startSizes[leftIndex + 1] - delta);
        }

        function onPointerUp() {
          document.body.removeAttribute('data-resizable-cursor');
          document.removeEventListener('pointermove', onPointerMove);
          document.removeEventListener('pointerup', onPointerUp);
        }

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
      });

      handle.addEventListener('keydown', function (event) {
        var step = 1;
        if (isVertical) {
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setPair(leftIndex, sizes[leftIndex] - step, sizes[leftIndex + 1] + step);
          } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            setPair(leftIndex, sizes[leftIndex] + step, sizes[leftIndex + 1] - step);
          }
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          setPair(leftIndex, sizes[leftIndex] - step, sizes[leftIndex + 1] + step);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          setPair(leftIndex, sizes[leftIndex] + step, sizes[leftIndex + 1] - step);
        }
      });
    });
  }

  /* ── Sheet ── */
  function initSheets(root) {
    (root || document).querySelectorAll('[data-slot="sheet"]').forEach(function (sheet) {
      if (sheet.dataset.sheetBound === 'true') return;
      sheet.dataset.sheetBound = 'true';

      var triggerWrapper = sheet.querySelector('[data-slot="sheet-trigger"]');
      var trigger = triggerWrapper ? (triggerWrapper.querySelector('button') || triggerWrapper) : null;
      var overlay = sheet.querySelector('[data-slot="sheet-overlay"]');
      var content = sheet.querySelector('[data-slot="sheet-content"]');
      var closeButtons = sheet.querySelectorAll('[data-slot="sheet-close"], [data-sheet-close]');

      if (!trigger || !content) return;

      var previousFocus = null;
      var isOpen = false;

      function openSheet() {
        if (isOpen) return;
        isOpen = true;
        previousFocus = document.activeElement;
        if (overlay) overlay.setAttribute('data-state', 'open');
        content.setAttribute('data-state', 'open');
        content.removeAttribute('aria-hidden');
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';

        var focusable = getFocusableElements(content);
        if (focusable.length) {
          window.setTimeout(function () { focusable[0].focus(); }, 0);
        }
      }

      function closeSheet() {
        if (!isOpen) return;
        isOpen = false;
        if (overlay) overlay.setAttribute('data-state', 'closed');
        content.setAttribute('data-state', 'closed');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';

        if (previousFocus && typeof previousFocus.focus === 'function') {
          previousFocus.focus();
        }

        window.setTimeout(function () {
          content.removeAttribute('data-state');
          if (overlay) overlay.removeAttribute('data-state');
        }, 310);
      }

      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        openSheet();
      });

      if (overlay) {
        overlay.addEventListener('click', closeSheet);
      }

      closeButtons.forEach(function (btn) {
        btn.addEventListener('click', closeSheet);
      });

      content.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          event.stopPropagation();
          closeSheet();
          return;
        }

        var focusable = getFocusableElements(content);
        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.key === 'Tab') {
          if (!focusable.length) {
            event.preventDefault();
            return;
          }
          if (event.shiftKey) {
            if (document.activeElement === first) {
              event.preventDefault();
              last.focus();
            }
          } else if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      });
    });
  }

  /* ── Drawer ── */
  function initDrawerGoals(root) {
    (root || document).querySelectorAll('[data-drawer-goal]').forEach(function (demo) {
      if (demo.dataset.drawerGoalBound === 'true') return;
      demo.dataset.drawerGoalBound = 'true';

      var valueEl = demo.querySelector('[data-drawer-goal-value]');
      var decBtn = demo.querySelector('[data-drawer-goal-decrease]');
      var incBtn = demo.querySelector('[data-drawer-goal-increase]');
      if (!valueEl || !decBtn || !incBtn) return;

      var goal = 350;

      function render() {
        valueEl.textContent = String(goal);
        decBtn.disabled = goal <= 200;
        incBtn.disabled = goal >= 400;
      }

      decBtn.addEventListener('click', function () {
        goal = Math.max(200, goal - 10);
        render();
      });

      incBtn.addEventListener('click', function () {
        goal = Math.min(400, goal + 10);
        render();
      });

      render();
    });
  }

  function initDrawers(root) {
    initDrawerGoals(root);

    (root || document).querySelectorAll('[data-slot="drawer"]').forEach(function (drawer) {
      if (drawer.dataset.drawerBound === 'true') return;
      drawer.dataset.drawerBound = 'true';

      var triggerWrapper = drawer.querySelector('[data-slot="drawer-trigger"]');
      var trigger = triggerWrapper ? (triggerWrapper.querySelector('button') || triggerWrapper) : null;
      var overlay = drawer.querySelector('[data-slot="drawer-overlay"]');
      var content = drawer.querySelector('[data-slot="drawer-content"]');
      var closeButtons = drawer.querySelectorAll('[data-slot="drawer-close"], [data-drawer-close]');

      if (!trigger || !content) return;

      var previousFocus = null;
      var isOpen = false;

      function openDrawer() {
        if (isOpen) return;
        isOpen = true;
        previousFocus = document.activeElement;
        if (overlay) overlay.setAttribute('data-state', 'open');
        content.setAttribute('data-state', 'open');
        content.removeAttribute('aria-hidden');
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';

        var focusable = getFocusableElements(content);
        if (focusable.length) {
          window.setTimeout(function () { focusable[0].focus(); }, 0);
        }
      }

      function closeDrawer() {
        if (!isOpen) return;
        isOpen = false;
        if (overlay) overlay.setAttribute('data-state', 'closed');
        content.setAttribute('data-state', 'closed');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';

        if (previousFocus && typeof previousFocus.focus === 'function') {
          previousFocus.focus();
        }

        window.setTimeout(function () {
          content.removeAttribute('data-state');
          if (overlay) overlay.removeAttribute('data-state');
        }, 310);
      }

      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        openDrawer();
      });

      if (overlay) {
        overlay.addEventListener('click', closeDrawer);
      }

      closeButtons.forEach(function (btn) {
        btn.addEventListener('click', closeDrawer);
      });

      content.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          event.stopPropagation();
          closeDrawer();
          return;
        }

        var focusable = getFocusableElements(content);
        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.key === 'Tab') {
          if (!focusable.length) {
            event.preventDefault();
            return;
          }
          if (event.shiftKey) {
            if (document.activeElement === first) {
              event.preventDefault();
              last.focus();
            }
          } else if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      });
    });
  }

  /* ── Tabs ── */
  function getTriggers(tabs) {
    return Array.prototype.slice.call(
      tabs.querySelectorAll('[data-slot="tabs-trigger"]')
    );
  }

  function getContents(tabs) {
    return Array.prototype.slice.call(
      tabs.querySelectorAll('[data-slot="tabs-content"]')
    );
  }

  function getEnabledTriggers(triggers) {
    return triggers.filter(function (trigger) {
      return !trigger.disabled;
    });
  }

  function activateTab(tabs, value) {
    var triggers = getTriggers(tabs);
    var contents = getContents(tabs);
    var target = triggers.find(function (trigger) {
      return trigger.getAttribute('data-value') === value;
    });

    if (!target || target.disabled) return;

    triggers.forEach(function (trigger) {
      var isActive = trigger === target;
      trigger.setAttribute('data-state', isActive ? 'active' : 'inactive');
      trigger.setAttribute('aria-selected', isActive ? 'true' : 'false');
      trigger.tabIndex = isActive ? 0 : -1;
    });

    contents.forEach(function (content) {
      var isActive = content.getAttribute('data-value') === value;
      content.setAttribute('data-state', isActive ? 'active' : 'inactive');
      content.hidden = !isActive;
    });

    tabs.setAttribute('data-value', value);
  }

  function bindTabs(tabs) {
    if (tabs.dataset.tabsBound === 'true') return;
    tabs.dataset.tabsBound = 'true';

    var triggers = getTriggers(tabs);
    var list = tabs.querySelector('[data-slot="tabs-list"]');
    if (!triggers.length) return;

    var defaultValue = tabs.getAttribute('data-default-value') || triggers[0].getAttribute('data-value');
    var orientation = tabs.getAttribute('data-orientation') || 'horizontal';
    var isVertical = orientation === 'vertical';
    var prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
    var nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';

    if (list && !list.getAttribute('role')) {
      list.setAttribute('role', 'tablist');
      list.setAttribute('aria-orientation', orientation);
    }

    triggers.forEach(function (trigger, index) {
      if (!trigger.getAttribute('role')) trigger.setAttribute('role', 'tab');
      if (!trigger.id) trigger.id = 'tabs-trigger-' + index + '-' + Math.random().toString(36).slice(2, 8);
      trigger.type = 'button';
    });

    getContents(tabs).forEach(function (content, index) {
      if (!content.getAttribute('role')) content.setAttribute('role', 'tabpanel');
      var value = content.getAttribute('data-value');
      var trigger = triggers.find(function (item) {
        return item.getAttribute('data-value') === value;
      });
      if (trigger) content.setAttribute('aria-labelledby', trigger.id);
    });

    activateTab(tabs, defaultValue);

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        activateTab(tabs, trigger.getAttribute('data-value'));
      });

      trigger.addEventListener('keydown', function (event) {
        var enabled = getEnabledTriggers(triggers);
        var index = enabled.indexOf(trigger);
        if (index === -1) return;

        if (event.key === prevKey) {
          event.preventDefault();
          var prev = enabled[(index - 1 + enabled.length) % enabled.length];
          activateTab(tabs, prev.getAttribute('data-value'));
          prev.focus();
        } else if (event.key === nextKey) {
          event.preventDefault();
          var next = enabled[(index + 1) % enabled.length];
          activateTab(tabs, next.getAttribute('data-value'));
          next.focus();
        } else if (event.key === 'Home') {
          event.preventDefault();
          activateTab(tabs, enabled[0].getAttribute('data-value'));
          enabled[0].focus();
        } else if (event.key === 'End') {
          event.preventDefault();
          activateTab(tabs, enabled[enabled.length - 1].getAttribute('data-value'));
          enabled[enabled.length - 1].focus();
        }
      });
    });
  }

  function initTabs(root) {
    (root || document).querySelectorAll('[data-slot="tabs"]').forEach(bindTabs);
  }

  /* ── Input OTP ── */
  var PATTERN_DIGITS = /^[0-9]$/;
  var PATTERN_ALPHANUM = /^[0-9a-zA-Z]$/;

  function getSlots(otp) {
    return Array.prototype.slice.call(
      otp.querySelectorAll('[data-slot="input-otp-slot"]')
    ).sort(function (a, b) {
      return Number(a.getAttribute('data-index')) - Number(b.getAttribute('data-index'));
    });
  }

  function getPatternTest(otp) {
    var pattern = otp.getAttribute('data-pattern');
    if (pattern === 'digits') return PATTERN_DIGITS;
    if (pattern === 'alphanumeric') return PATTERN_ALPHANUM;
    return null;
  }

  function sanitizeValue(otp, value) {
    var maxLength = parseInt(otp.getAttribute('data-max-length') || '6', 10);
    var patternTest = getPatternTest(otp);
    var chars = value.split('');
    var result = '';

    for (var i = 0; i < chars.length && result.length < maxLength; i += 1) {
      if (!patternTest || patternTest.test(chars[i])) {
        result += chars[i];
      }
    }

    return result;
  }

  function renderOtp(otp, native, slots, value, activeIndex) {
    slots.forEach(function (slot, index) {
      var char = value[index] || '';
      slot.textContent = char;

      var caret = slot.querySelector('[data-slot="input-otp-caret"]');
      if (!caret) {
        caret = document.createElement('span');
        caret.setAttribute('data-slot', 'input-otp-caret');
        slot.appendChild(caret);
      }

      var isActive = index === activeIndex;
      if (isActive) slot.setAttribute('data-active', 'true');
      else slot.removeAttribute('data-active');

      caret.hidden = !(isActive && !char);
    });

    native.value = value;
    otp.setAttribute('data-value', value);
    otp.dispatchEvent(new CustomEvent('input-otp-change', {
      bubbles: true,
      detail: { value: value }
    }));
  }

  function bindInputOtp(otp) {
    if (otp.dataset.inputOtpBound === 'true') return;
    otp.dataset.inputOtpBound = 'true';

    var maxLength = parseInt(otp.getAttribute('data-max-length') || '6', 10);
    var slots = getSlots(otp);
    if (!slots.length) return;

    var container = otp.querySelector('[data-slot="input-otp-container"]');
    if (!container) {
      container = document.createElement('div');
      container.setAttribute('data-slot', 'input-otp-container');
      while (otp.firstChild) {
        container.appendChild(otp.firstChild);
      }
      otp.appendChild(container);
    }

    var native = otp.querySelector('[data-slot="input-otp-native"]');
    if (!native) {
      native = document.createElement('input');
      native.setAttribute('data-slot', 'input-otp-native');
      native.type = 'text';
      native.autocomplete = 'one-time-code';
      native.setAttribute('inputmode', otp.getAttribute('data-pattern') === 'alphanumeric' ? 'text' : 'numeric');
      otp.insertBefore(native, container);
    }

    var linkedId = otp.id;
    if (linkedId) native.id = linkedId + '-native';

    if (otp.hasAttribute('disabled')) native.disabled = true;
    if (otp.hasAttribute('required')) native.required = true;

    var activeIndex = 0;
    var value = sanitizeValue(
      otp,
      otp.getAttribute('data-value') ||
      otp.getAttribute('data-default-value') ||
      ''
    );

    function syncFromNative() {
      value = sanitizeValue(otp, native.value);
      activeIndex = Math.min(value.length, maxLength - 1);
      renderOtp(otp, native, slots, value, document.activeElement === native ? activeIndex : -1);
    }

    function focusNative() {
      if (native.disabled) return;
      native.focus();
      activeIndex = Math.min(value.length, maxLength - 1);
      renderOtp(otp, native, slots, value, activeIndex);
    }

    container.addEventListener('click', focusNative);
    otp.addEventListener('click', function (event) {
      if (event.target === native) return;
      focusNative();
    });

    native.addEventListener('input', syncFromNative);

    native.addEventListener('focus', function () {
      activeIndex = Math.min(value.length, maxLength - 1);
      renderOtp(otp, native, slots, value, activeIndex);
    });

    native.addEventListener('blur', function () {
      renderOtp(otp, native, slots, value, -1);
    });

    native.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        activeIndex = Math.max(0, activeIndex - 1);
        renderOtp(otp, native, slots, value, activeIndex);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        activeIndex = Math.min(maxLength - 1, activeIndex + 1);
        renderOtp(otp, native, slots, value, activeIndex);
      } else if (event.key === 'Backspace' && activeIndex > 0 && !value[activeIndex]) {
        activeIndex -= 1;
      }
    });

    native.addEventListener('paste', function (event) {
      event.preventDefault();
      var pasted = (event.clipboardData || window.clipboardData).getData('text');
      value = sanitizeValue(otp, pasted);
      activeIndex = Math.min(value.length, maxLength - 1);
      renderOtp(otp, native, slots, value, activeIndex);
    });

    renderOtp(otp, native, slots, value, -1);
  }

  function initControlledHints(root) {
    (root || document).querySelectorAll('[data-slot="input-otp-controlled"]').forEach(function (wrap) {
      if (wrap.dataset.inputOtpControlledBound === 'true') return;
      wrap.dataset.inputOtpControlledBound = 'true';

      var otp = wrap.querySelector('[data-slot="input-otp"]');
      var hint = wrap.querySelector('[data-slot="input-otp-hint"]');
      if (!otp || !hint) return;

      function updateHint(value) {
        if (!value) {
          hint.innerHTML = 'Enter your one-time password.';
        } else {
          hint.innerHTML = 'You entered: ' + value;
        }
      }

      updateHint(otp.getAttribute('data-value') || '');
      otp.addEventListener('input-otp-change', function (event) {
        updateHint(event.detail.value);
      });
    });
  }

  function initInputOtps(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-slot="input-otp"]').forEach(bindInputOtp);
    initControlledHints(scope);
  }

  /* ── Calendar ── */
  var WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function dateKey(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function parseMonth(str) {
    if (!str) return null;
    var parts = str.split('-');
    if (parts.length < 2) return null;
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
  }

  function parseDate(str) {
    if (!str) return null;
    var parts = str.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    if (parts.length === 2) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    }
    return null;
  }

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function addDays(d, n) {
    var r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    r.setDate(r.getDate() + n);
    return r;
  }

  function addMonths(d, n) {
    return new Date(d.getFullYear(), d.getMonth() + n, 1);
  }

  function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getISOWeek(d) {
    var date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var day = date.getDay() || 7;
    date.setDate(date.getDate() + 4 - day);
    var yearStart = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  }

  function isDisabled(cal, d) {
    if (cal.disabledFn && cal.disabledFn(d)) return true;
    if (cal.disabledKeys && cal.disabledKeys.indexOf(dateKey(d)) !== -1) return true;
    return false;
  }

  function inRange(d, from, to) {
    if (!from || !to) return false;
    var t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    var a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
    var b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
    return t >= Math.min(a, b) && t <= Math.max(a, b);
  }

  function CalendarInstance(el) {
    this.el = el;
    this.mode = el.dataset.mode || 'single';
    this.monthCount = parseInt(el.dataset.months || '1', 10);
    this.showOutsideDays = el.dataset.showOutsideDays !== 'false';
    this.showWeekNumber = el.dataset.showWeekNumber === 'true';
    this.fixedWeeks = el.dataset.fixedWeeks === 'true';
    this.captionLayout = el.dataset.captionLayout || 'label';
    this.customCells = el.dataset.customCells || '';
    this.monthNamesLong = el.dataset.monthDropdown === 'long';
    this.viewMonth = parseMonth(el.dataset.defaultMonth) || startOfMonth(new Date());
    this.selected = parseDate(el.dataset.selected);
    this.rangeFrom = parseDate(el.dataset.rangeFrom);
    this.rangeTo = parseDate(el.dataset.rangeTo);
    if (!this.selected && !this.rangeFrom && this.mode === 'single' && el.dataset.autoToday === 'true') {
      this.selected = new Date();
    }
    this.focusedDate = this.selected || this.rangeFrom || new Date();
    this.disabledKeys = (el.dataset.disabledDates || '').split(',').filter(Boolean);
    this.bookedKeys = (el.dataset.bookedDates || '').split(',').filter(Boolean);
    this.prices = {};

    if (el.dataset.disabledFn === 'booked') {
      var year = this.viewMonth.getFullYear();
      var month = this.viewMonth.getMonth();
      for (var i = 0; i < 15; i++) {
        this.disabledKeys.push(dateKey(new Date(year, month, 12 + i)));
        this.bookedKeys.push(dateKey(new Date(year, month, 12 + i)));
      }
    }

    if (el.dataset.cellSize) {
      el.style.setProperty('--cell-size', 'calc(var(--spacing) * ' + el.dataset.cellSize + ')');
    }

    if (this.monthCount > 1) {
      el.setAttribute('data-months', String(this.monthCount));
    }

    this.render();
    this.bind();
  }

  CalendarInstance.prototype.getMonthDates = function (monthDate) {
    var year = monthDate.getFullYear();
    var month = monthDate.getMonth();
    var first = new Date(year, month, 1);
    var startPad = first.getDay();
    var total = daysInMonth(year, month);
    var cells = [];
    var i;

    if (this.showOutsideDays) {
      for (i = startPad - 1; i >= 0; i--) {
        cells.push({ date: new Date(year, month, -i), outside: true });
      }
    } else {
      for (i = 0; i < startPad; i++) cells.push(null);
    }

    for (i = 1; i <= total; i++) {
      cells.push({ date: new Date(year, month, i), outside: false });
    }

    if (this.showOutsideDays) {
      while (cells.length % 7 !== 0) {
        var nextDay = cells.length - startPad - total + 1;
        cells.push({ date: new Date(year, month + 1, nextDay), outside: true });
      }
      if (this.fixedWeeks) {
        while (cells.length < 42) {
          var extraDay = cells.length - startPad - total + 1;
          cells.push({ date: new Date(year, month + 1, extraDay), outside: true });
        }
      }
    } else {
      while (cells.length % 7 !== 0) cells.push(null);
      if (this.fixedWeeks) {
        while (cells.length < 42) cells.push(null);
      }
    }

    var weeks = [];
    for (i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  };

  CalendarInstance.prototype.dayModifiers = function (d, outside) {
    var today = new Date();
    var sel = this.mode === 'single' && sameDay(d, this.selected);
    var rangeStart = this.mode === 'range' && sameDay(d, this.rangeFrom);
    var rangeEnd = this.mode === 'range' && sameDay(d, this.rangeTo);
    var rangeMiddle = this.mode === 'range' && this.rangeFrom && this.rangeTo &&
      inRange(d, this.rangeFrom, this.rangeTo) && !rangeStart && !rangeEnd;
    var selectedSingle = sel && !rangeStart && !rangeEnd && !rangeMiddle;
    var key = dateKey(d);

    return {
      today: sameDay(d, today),
      outside: outside,
      disabled: isDisabled(this, d),
      booked: this.bookedKeys.indexOf(key) !== -1,
      selected: sel || rangeStart || rangeEnd || rangeMiddle,
      selectedSingle: selectedSingle,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd,
      rangeMiddle: rangeMiddle,
      focused: sameDay(d, this.focusedDate)
    };
  };

  CalendarInstance.prototype.createDropdown = function (monthDate) {
    var wrap = document.createElement('div');
    wrap.setAttribute('data-slot', 'calendar-dropdowns');

    var monthRoot = document.createElement('div');
    monthRoot.setAttribute('data-slot', 'calendar-dropdown-root');
    var monthSelect = document.createElement('select');
    monthSelect.setAttribute('data-slot', 'calendar-month-select');
    monthSelect.setAttribute('aria-label', '월 선택');
    (this.monthNamesLong ? MONTHS_FULL : MONTHS).forEach(function (m, idx) {
      var opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = m;
      if (idx === monthDate.getMonth()) opt.selected = true;
      monthSelect.appendChild(opt);
    });
    monthRoot.appendChild(monthSelect);

    var yearRoot = document.createElement('div');
    yearRoot.setAttribute('data-slot', 'calendar-dropdown-root');
    var yearSelect = document.createElement('select');
    yearSelect.setAttribute('data-slot', 'calendar-year-select');
    yearSelect.setAttribute('aria-label', '연도 선택');
    for (var y = 1926; y <= 2026; y++) {
      var yOpt = document.createElement('option');
      yOpt.value = String(y);
      yOpt.textContent = String(y);
      if (y === monthDate.getFullYear()) yOpt.selected = true;
      yearSelect.appendChild(yOpt);
    }
    yearRoot.appendChild(yearSelect);

    wrap.appendChild(monthRoot);
    wrap.appendChild(yearRoot);
    return wrap;
  };

  CalendarInstance.prototype.renderMonth = function (monthDate, monthIndex) {
    var self = this;
    var weeks = this.getMonthDates(monthDate);
    var monthEl = document.createElement('div');
    monthEl.setAttribute('data-slot', 'calendar-month');
    monthEl.dataset.monthIndex = String(monthIndex);

    var nav = document.createElement('div');
    nav.setAttribute('data-slot', 'calendar-nav');

    var prev = document.createElement('button');
    prev.type = 'button';
    prev.setAttribute('data-slot', 'calendar-nav-button');
    prev.dataset.action = 'prev';
    prev.setAttribute('aria-label', '이전 달');
    if (monthIndex !== 0) prev.setAttribute('data-hidden', 'true');
    prev.innerHTML = '<i data-lucide="chevron-left" aria-hidden="true"></i>';

    var next = document.createElement('button');
    next.type = 'button';
    next.setAttribute('data-slot', 'calendar-nav-button');
    next.dataset.action = 'next';
    next.setAttribute('aria-label', '다음 달');
    if (monthIndex !== this.monthCount - 1) next.setAttribute('data-hidden', 'true');
    next.innerHTML = '<i data-lucide="chevron-right" aria-hidden="true"></i>';

    nav.appendChild(prev);
    nav.appendChild(next);
    monthEl.appendChild(nav);

    var caption = document.createElement('div');
    caption.setAttribute('data-slot', 'calendar-caption');

    if (this.captionLayout === 'dropdown' && monthIndex === 0) {
      caption.appendChild(this.createDropdown(monthDate));
    } else {
      var label = document.createElement('div');
      label.setAttribute('data-slot', 'calendar-caption-label');
      label.textContent = MONTHS_FULL[monthDate.getMonth()] + ' ' + monthDate.getFullYear();
      caption.appendChild(label);
    }
    monthEl.appendChild(caption);

    var grid = document.createElement('div');
    grid.setAttribute('data-slot', 'calendar-grid');
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', MONTHS_FULL[monthDate.getMonth()] + ' ' + monthDate.getFullYear());

    var weekdays = document.createElement('div');
    weekdays.setAttribute('data-slot', 'calendar-weekdays');
    weekdays.setAttribute('role', 'row');

    if (this.showWeekNumber) {
      var wnHead = document.createElement('div');
      wnHead.setAttribute('data-slot', 'calendar-week-number-header');
      wnHead.setAttribute('role', 'columnheader');
      wnHead.setAttribute('aria-label', 'Week number');
      weekdays.appendChild(wnHead);
    }

    WEEKDAYS.forEach(function (wd) {
      var wdEl = document.createElement('div');
      wdEl.setAttribute('data-slot', 'calendar-weekday');
      wdEl.setAttribute('role', 'columnheader');
      wdEl.setAttribute('aria-label', wd);
      wdEl.textContent = wd;
      weekdays.appendChild(wdEl);
    });
    grid.appendChild(weekdays);

    weeks.forEach(function (week) {
      var weekEl = document.createElement('div');
      weekEl.setAttribute('data-slot', 'calendar-week');
      weekEl.setAttribute('role', 'row');

      if (self.showWeekNumber) {
        var firstDate = week.find(function (c) { return c && c.date; });
        var wnEl = document.createElement('div');
        wnEl.setAttribute('data-slot', 'calendar-week-number');
        wnEl.setAttribute('role', 'gridcell');
        wnEl.textContent = firstDate ? String(getISOWeek(firstDate.date)).padStart(2, '0') : '';
        weekEl.appendChild(wnEl);
      }

      week.forEach(function (cell) {
        var dayEl = document.createElement('div');
        dayEl.setAttribute('data-slot', 'calendar-day');
        dayEl.setAttribute('role', 'gridcell');

        if (!cell) {
          dayEl.setAttribute('data-hidden', 'true');
          weekEl.appendChild(dayEl);
          return;
        }

        var mods = self.dayModifiers(cell.date, cell.outside);
        if (mods.outside) dayEl.setAttribute('data-outside', 'true');
        if (mods.disabled) dayEl.setAttribute('data-disabled', 'true');
        if (mods.booked) dayEl.setAttribute('data-booked', 'true');
        if (mods.today) dayEl.setAttribute('data-today', 'true');
        if (mods.selected) dayEl.setAttribute('data-selected', 'true');
        if (mods.rangeStart) dayEl.setAttribute('data-range-start', 'true');
        if (mods.rangeEnd) dayEl.setAttribute('data-range-end', 'true');
        if (mods.rangeMiddle) dayEl.setAttribute('data-range-middle', 'true');
        if (mods.focused) dayEl.setAttribute('data-focused', 'true');

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('data-slot', 'calendar-day-button');
        btn.dataset.date = dateKey(cell.date);
        btn.setAttribute('aria-label', cell.date.toLocaleDateString('ko-KR'));
        if (mods.disabled) btn.disabled = true;
        if (mods.selectedSingle) btn.setAttribute('data-selected-single', 'true');
        if (mods.rangeStart) btn.setAttribute('data-range-start', 'true');
        if (mods.rangeEnd) btn.setAttribute('data-range-end', 'true');
        if (mods.rangeMiddle) btn.setAttribute('data-range-middle', 'true');

        if (self.customCells === 'price' && !mods.outside) {
          var dayNum = document.createElement('span');
          dayNum.setAttribute('data-slot', 'calendar-day-label');
          dayNum.textContent = String(cell.date.getDate());
          btn.appendChild(dayNum);
          var dow = cell.date.getDay();
          var priceEl = document.createElement('span');
          priceEl.setAttribute('data-slot', 'calendar-day-price');
          priceEl.textContent = dow === 0 || dow === 6 ? '$120' : '$100';
          btn.appendChild(priceEl);
        } else {
          btn.textContent = String(cell.date.getDate());
        }

        dayEl.appendChild(btn);
        weekEl.appendChild(dayEl);
      });

      grid.appendChild(weekEl);
    });

    monthEl.appendChild(grid);
    return monthEl;
  };

  CalendarInstance.prototype.render = function () {
    this.el.innerHTML = '';
    var monthsWrap = document.createElement('div');
    monthsWrap.setAttribute('data-slot', 'calendar-months');

    for (var i = 0; i < this.monthCount; i++) {
      monthsWrap.appendChild(this.renderMonth(addMonths(this.viewMonth, i), i));
    }

    this.el.appendChild(monthsWrap);

    if (window.lucide) window.lucide.createIcons();

    var focusedBtn = this.el.querySelector('[data-focused="true"] [data-slot="calendar-day-button"]:not([disabled])');
    if (focusedBtn) focusedBtn.tabIndex = 0;
  };

  CalendarInstance.prototype.selectDate = function (d) {
    if (isDisabled(this, d)) return;

    if (this.mode === 'single') {
      this.selected = d;
      this.rangeFrom = null;
      this.rangeTo = null;
    } else if (this.mode === 'range') {
      if (!this.rangeFrom || (this.rangeFrom && this.rangeTo)) {
        this.rangeFrom = d;
        this.rangeTo = null;
      } else if (d.getTime() < this.rangeFrom.getTime()) {
        this.rangeTo = this.rangeFrom;
        this.rangeFrom = d;
      } else {
        this.rangeTo = d;
      }
      this.selected = null;
    }

    this.focusedDate = d;
    this.el.dispatchEvent(new CustomEvent('calendar-select', { bubbles: true, detail: { date: d, from: this.rangeFrom, to: this.rangeTo } }));
    this.render();
  };

  CalendarInstance.prototype.moveFocus = function (days) {
    var next = addDays(this.focusedDate || new Date(), days);
    var guard = 0;
    while (isDisabled(this, next) && days !== 0 && guard < 366) {
      next = addDays(next, days > 0 ? 1 : -1);
      guard++;
    }
    this.focusedDate = next;
    this.render();
    var btn = this.el.querySelector('[data-date="' + dateKey(next) + '"]');
    if (btn) btn.focus();
  };

  CalendarInstance.prototype.bind = function () {
    var self = this;

    if (this._bound) return;
    this._bound = true;

    this.el.addEventListener('click', function (event) {
      var navBtn = event.target.closest('[data-slot="calendar-nav-button"]');
      if (navBtn && !navBtn.hasAttribute('data-hidden')) {
        event.preventDefault();
        self.viewMonth = addMonths(self.viewMonth, navBtn.dataset.action === 'prev' ? -1 : self.monthCount);
        self.render();
        return;
      }

      var dayBtn = event.target.closest('[data-slot="calendar-day-button"]');
      if (dayBtn && !dayBtn.disabled) {
        event.preventDefault();
        self.selectDate(parseDate(dayBtn.dataset.date));
      }
    });

    this.el.addEventListener('change', function (event) {
      if (!event.target.closest('[data-slot="calendar-month-select"], [data-slot="calendar-year-select"]')) return;
      var monthSel = self.el.querySelector('[data-slot="calendar-month-select"]');
      var yearSel = self.el.querySelector('[data-slot="calendar-year-select"]');
      if (!monthSel || !yearSel) return;
      self.viewMonth = new Date(parseInt(yearSel.value, 10), parseInt(monthSel.value, 10), 1);
      self.render();
    });

    this.el.addEventListener('keydown', function (event) {
      var dayBtn = event.target.closest('[data-slot="calendar-day-button"]');
      if (!dayBtn) return;

      if (event.key === 'ArrowLeft') { event.preventDefault(); self.moveFocus(-1); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); self.moveFocus(1); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); self.moveFocus(-7); }
      else if (event.key === 'ArrowDown') { event.preventDefault(); self.moveFocus(7); }
      else if (event.key === 'PageUp') { event.preventDefault(); self.viewMonth = addMonths(self.viewMonth, -1); self.render(); }
      else if (event.key === 'PageDown') { event.preventDefault(); self.viewMonth = addMonths(self.viewMonth, 1); self.render(); }
      else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); self.selectDate(parseDate(dayBtn.dataset.date)); }
    });
  };

  CalendarInstance.prototype.setSelected = function (d) {
    if (this.mode === 'range') {
      this.rangeFrom = d;
      this.rangeTo = null;
    } else {
      this.selected = d;
    }
    this.focusedDate = d;
    this.viewMonth = startOfMonth(d);
    this.render();
  };

  function initCalendarPresets(root) {
    (root || document).querySelectorAll('[data-slot="calendar-card"]').forEach(function (wrap) {
      if (wrap.dataset.presetsBound === 'true') return;
      var calEl = wrap.querySelector('[data-slot="calendar"]');
      var presetBtns = wrap.querySelectorAll('[data-calendar-preset]');
      if (!calEl || !presetBtns.length) return;
      wrap.dataset.presetsBound = 'true';

      presetBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (!calEl._calendar) return;
          var today = new Date();
          var preset = btn.dataset.preset;
          var target = today;
          if (preset === 'tomorrow') target = addDays(today, 1);
          else if (preset === 'in-3-days') target = addDays(today, 3);
          else if (preset === 'in-a-week') target = addDays(today, 7);
          else if (preset === 'in-2-weeks') target = addDays(today, 14);
          calEl._calendar.setSelected(target);
        });
      });
    });
  }

  function initDatePickers(root) {
    var MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function formatDateLong(d) {
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    function formatDateMedium(d) {
      return MONTHS_SHORT[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    }

    function formatDateInput(d) {
      return d.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }

    function getFormatter(picker) {
      var format = picker.getAttribute('data-format') || 'long';
      if (format === 'medium') return formatDateMedium;
      if (format === 'input') return formatDateInput;
      if (format === 'locale') return function (d) { return d.toLocaleDateString(); };
      return formatDateLong;
    }

    function closePickerPopover(picker) {
      var popover = picker.querySelector('[data-slot="popover"]');
      if (!popover) return;
      var content = popover.querySelector('[data-slot="popover-content"]');
      var trigger = popover.querySelector('[data-slot="popover-trigger"]') ||
        popover.querySelector('[data-slot="button"]') ||
        popover.querySelector('[data-slot="input-group-button"]');
      if (content) content.setAttribute('data-state', 'closed');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }

    function openPickerPopover(picker) {
      var popover = picker.querySelector('[data-slot="popover"]');
      if (!popover) return;
      var content = popover.querySelector('[data-slot="popover-content"]');
      var trigger = popover.querySelector('[data-slot="popover-trigger"]') ||
        popover.querySelector('[data-slot="button"]') ||
        popover.querySelector('[data-slot="input-group-button"]');
      closeAllPopovers(popover);
      closeAllSelects();
      closeAllDropdownMenus();
      if (content) content.setAttribute('data-state', 'open');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
    }

    function setEmptyState(picker, trigger, valueEl, input, isEmpty) {
      if (trigger) trigger.setAttribute('data-empty', isEmpty ? 'true' : 'false');
      if (valueEl) valueEl.setAttribute('data-empty', isEmpty ? 'true' : 'false');
      if (input && isEmpty) input.value = '';
    }

    function updatePickerDisplay(picker, trigger, valueEl, input, hintValueEl, text, isEmpty) {
      var placeholder = (valueEl && valueEl.getAttribute('data-placeholder')) ||
        (trigger && trigger.getAttribute('data-placeholder')) ||
        'Pick a date';

      if (valueEl) valueEl.textContent = isEmpty ? placeholder : text;
      if (input && !isEmpty) input.value = text;
      if (hintValueEl) hintValueEl.textContent = isEmpty ? '—' : text;
      setEmptyState(picker, trigger, valueEl, null, isEmpty);
    }

    function parseInputDate(str) {
      if (!str || !str.trim()) return null;
      var d = new Date(str.trim());
      return isNaN(d.getTime()) ? null : d;
    }

    (root || document).querySelectorAll('[data-slot="date-picker"]').forEach(function (picker) {
      if (picker.dataset.datePickerBound === 'true') return;
      picker.dataset.datePickerBound = 'true';

      var calendar = picker.querySelector('[data-slot="calendar"]');
      var popover = picker.querySelector('[data-slot="popover"]');
      var trigger = picker.querySelector('[data-slot="date-picker-trigger"]') ||
        (popover && (popover.querySelector('[data-slot="button"]') || popover.querySelector('[data-slot="input-group-button"]')));
      var valueEl = picker.querySelector('[data-slot="date-picker-value"]');
      var input = picker.querySelector('[data-date-picker-input]');
      var hintValueEl = picker.querySelector('[data-slot="date-picker-hint-value"]');
      var mode = picker.getAttribute('data-mode') || (calendar && calendar.getAttribute('data-mode')) || 'single';
      var closeOnSelect = picker.getAttribute('data-close-on-select') !== 'false';
      var fmt = getFormatter(picker);

      function syncFromCalendar() {
        if (!calendar || !calendar._calendar) return;
        var cal = calendar._calendar;
        if (mode === 'range') {
          var from = cal.rangeFrom;
          var to = cal.rangeTo;
          var text = '';
          if (from && to) text = fmt(from) + ' - ' + fmt(to);
          else if (from) text = fmt(from);
          updatePickerDisplay(picker, trigger, valueEl, input, hintValueEl, text, !from);
        } else if (cal.selected) {
          updatePickerDisplay(picker, trigger, valueEl, input, hintValueEl, fmt(cal.selected), false);
        }
      }

      function handleSelection(detail) {
        if (mode === 'range') {
          var from = detail.from;
          var to = detail.to;
          var text = '';
          if (from && to) text = fmt(from) + ' - ' + fmt(to);
          else if (from) text = fmt(from);
          updatePickerDisplay(picker, trigger, valueEl, input, hintValueEl, text, !from);
          if (from && to && closeOnSelect) closePickerPopover(picker);
        } else if (detail.date) {
          updatePickerDisplay(picker, trigger, valueEl, input, hintValueEl, fmt(detail.date), false);
          if (closeOnSelect) closePickerPopover(picker);
        }
      }

      picker.addEventListener('calendar-select', function (event) {
        handleSelection(event.detail);
      });

      if (input) {
        input.addEventListener('change', function () {
          var d = parseInputDate(input.value);
          if (d && calendar && calendar._calendar) {
            calendar._calendar.setSelected(d);
            updatePickerDisplay(picker, trigger, valueEl, input, hintValueEl, fmt(d), false);
          }
        });

        input.addEventListener('keydown', function (event) {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            openPickerPopover(picker);
          }
        });
      }

      syncFromCalendar();
    });
  }

  function initTimePickers(root) {
    (root || document).querySelectorAll('[data-slot="time-picker"]').forEach(function (picker) {
      if (picker.dataset.timePickerBound === 'true') return;
      picker.dataset.timePickerBound = 'true';

      var popover = picker.querySelector('[data-slot="popover"]');
      var trigger = popover && (popover.querySelector('[data-slot="button"]') || popover.querySelector('[data-slot="input-group-button"]'));
      var popoverContent = popover && popover.querySelector('[data-slot="popover-content"]');
      var valueEl = picker.querySelector('[data-slot="time-picker-value"]');
      var columns = picker.querySelectorAll('[data-slot="time-picker-column"]');
      var periodColumn = picker.querySelector('[data-slot="time-picker-column"][data-segment="period"]');
      var hourColumn = picker.querySelector('[data-slot="time-picker-column"][data-segment="hour"]');
      var minuteColumn = picker.querySelector('[data-slot="time-picker-column"][data-segment="minute"]');

      function columnValue(column) {
        var selected = column && column.querySelector('[data-slot="time-picker-option"][data-selected="true"]');
        return (selected && selected.getAttribute('data-value')) || '';
      }

      function render() {
        var period = columnValue(periodColumn);
        var hour = columnValue(hourColumn);
        var minute = columnValue(minuteColumn);
        var isEmpty = !period || !hour || !minute;
        var placeholder = (valueEl && valueEl.getAttribute('data-placeholder')) || '시간 선택';
        var text = isEmpty ? placeholder : (period === 'pm' ? '오후' : '오전') + ' ' + hour + ':' + minute;

        if (valueEl) {
          valueEl.textContent = text;
          valueEl.setAttribute('data-empty', isEmpty ? 'true' : 'false');
        }
        if (trigger) trigger.setAttribute('data-empty', isEmpty ? 'true' : 'false');
      }

      function selectOption(column, option) {
        column.querySelectorAll('[data-slot="time-picker-option"]').forEach(function (el) {
          el.setAttribute('data-selected', el === option ? 'true' : 'false');
        });
        render();
      }

      function scrollSelectedIntoView(column) {
        var selected = column.querySelector('[data-slot="time-picker-option"][data-selected="true"]');
        if (selected) selected.scrollIntoView({ block: 'center' });
      }

      function updateColumnFade(column) {
        if (column.getAttribute('data-segment') === 'period') return;
        var atTop = column.scrollTop <= 1;
        var atBottom = column.scrollTop + column.clientHeight >= column.scrollHeight - 1;
        if (atTop) {
          column.setAttribute('data-scroll-edge', 'top');
        } else if (atBottom) {
          column.setAttribute('data-scroll-edge', 'bottom');
        } else {
          column.removeAttribute('data-scroll-edge');
        }
      }

      columns.forEach(function (column) {
        if (column.getAttribute('data-segment') !== 'period') {
          column.addEventListener('scroll', function () { updateColumnFade(column); });
          updateColumnFade(column);
        }
        column.querySelectorAll('[data-slot="time-picker-option"]').forEach(function (option) {
          option.addEventListener('click', function () {
            selectOption(column, option);
            window.requestAnimationFrame(function () { updateColumnFade(column); });
          });
        });
      });

      if (popoverContent) {
        new MutationObserver(function () {
          if (popoverContent.getAttribute('data-state') === 'open') {
            columns.forEach(function (column) {
              scrollSelectedIntoView(column);
              window.setTimeout(function () { updateColumnFade(column); }, 50);
            });
          }
        }).observe(popoverContent, { attributes: true, attributeFilter: ['data-state'] });
      }

      render();
    });
  }

  /* ── Message Scroller ── */
  function msScrollToElement(viewport, target, behavior) {
    var vpRect = viewport.getBoundingClientRect();
    var tRect = target.getBoundingClientRect();
    var offset = viewport.scrollTop + (tRect.top - vpRect.top);
    viewport.scrollTo({ top: offset, behavior: behavior || 'smooth' });
  }

  var MS_AI_RESPONSES = [
    'That\'s a great question! The component architecture follows a composable pattern where each piece handles a single responsibility.',
    'Design tokens are named entities that store visual design attributes, making theming straightforward and consistent.',
    'Message Scroller uses content-visibility: auto to skip rendering off-screen items, dramatically improving performance for long conversations.',
    'The scroll anchoring behavior ensures new AI responses don\'t displace the user\'s reading position in the transcript.',
    'You can customize the entrance animation using CSS, and the data-anim attribute controls which animation class is applied.',
  ];
  var _msResponseIdx = 0;

  function msGetNextResponse() {
    var r = MS_AI_RESPONSES[_msResponseIdx % MS_AI_RESPONSES.length];
    _msResponseIdx++;
    return r;
  }

  function msCreateUserItem(text, anim) {
    var item = document.createElement('div');
    item.setAttribute('data-slot', 'message-scroller-item');
    item.setAttribute('data-anchor', 'true');
    if (anim) item.setAttribute('data-new', '');
    item.innerHTML = '<div class="ms-bubble ms-bubble--outgoing"><div class="ms-text">' + text + '</div></div>';
    return item;
  }

  function msCreateAIItem(text, anim) {
    var item = document.createElement('div');
    item.setAttribute('data-slot', 'message-scroller-item');
    if (anim) item.setAttribute('data-new', '');
    item.innerHTML = '<div class="ms-bubble ms-bubble--incoming"><div class="ms-avatar"><i data-lucide="bot" aria-hidden="true"></i></div><div class="ms-text">' + text + '</div></div>';
    return item;
  }

  function msRemoveEmpty(content) {
    var empty = content.querySelector('[data-slot="message-scroller-empty"]');
    if (empty) empty.remove();
  }

  function msStreamText(el, text, onDone) {
    var words = text.split(' ');
    var idx = 0;
    var textNode = document.createTextNode('');
    el.appendChild(textNode);
    var timer = window.setInterval(function () {
      if (idx >= words.length) {
        window.clearInterval(timer);
        if (onDone) onDone();
        return;
      }
      textNode.textContent += (idx > 0 ? ' ' : '') + words[idx];
      idx++;
    }, 60);
  }

  function initMessageScroller(el) {
    if (el.dataset.messageScrollerBound === 'true') return;
    el.dataset.messageScrollerBound = 'true';

    var viewport = el.querySelector('[data-slot="message-scroller-viewport"]');
    if (!viewport) return;

    var content = viewport.querySelector('[data-slot="message-scroller-content"]');
    var buttons = el.querySelectorAll('[data-slot="message-scroller-button"]');
    var chatDemo = el.closest('.chat-demo');

    /* — scroll state — */
    function updateState() {
      var atTop = viewport.scrollTop <= 1;
      var atBottom = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 1;

      if (atBottom) viewport.setAttribute('data-scroll-edge', 'bottom');
      else if (atTop) viewport.setAttribute('data-scroll-edge', 'top');
      else viewport.removeAttribute('data-scroll-edge');

      buttons.forEach(function (btn) {
        var dir = btn.getAttribute('data-direction');
        var scrollable = viewport.scrollHeight > viewport.clientHeight + 2;
        btn.setAttribute('data-active', (scrollable && (dir === 'end' ? !atBottom : !atTop)) ? 'true' : 'false');
      });

      /* scroll status header text */
      var statusEl = chatDemo && chatDemo.querySelector('#scroll-status-text');
      if (statusEl) {
        var scrollable = viewport.scrollHeight > viewport.clientHeight + 2;
        if (!scrollable) statusEl.textContent = 'No earlier messages';
        else if (atTop) statusEl.textContent = 'Scroll down to see latest messages';
        else if (atBottom) statusEl.textContent = 'Scroll up to see earlier messages';
        else statusEl.textContent = 'Scroll up or down to navigate';
      }

      /* TOC highlight */
      var toc = document.querySelector('[data-ms-toc="' + el.id + '"]');
      if (toc) {
        var anchors = content.querySelectorAll('[data-anchor="true"]');
        var active = null;
        anchors.forEach(function (a) {
          var rect = a.getBoundingClientRect();
          var vpRect = viewport.getBoundingClientRect();
          if (rect.top >= vpRect.top && rect.top < vpRect.top + vpRect.height * 0.6) {
            active = a.id;
          }
        });
        toc.querySelectorAll('[data-toc-target]').forEach(function (link) {
          if (link.getAttribute('data-toc-target') === active) {
            link.setAttribute('data-active', '');
          } else {
            link.removeAttribute('data-active');
          }
        });
      }
    }

    /* — scroll buttons — */
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = btn.getAttribute('data-direction');
        viewport.setAttribute('data-autoscrolling', '');
        viewport.scrollTo({ top: dir === 'end' ? viewport.scrollHeight : 0, behavior: 'smooth' });
        window.setTimeout(function () { viewport.removeAttribute('data-autoscrolling'); updateState(); }, 600);
      });
    });

    /* — send message — */
    var sendBtn = chatDemo && chatDemo.querySelector('[data-ms-send]');
    var inputEl = chatDemo && chatDemo.querySelector('[data-ms-input]');

    if (sendBtn && inputEl && content) {
      sendBtn.addEventListener('click', function () {
        var text = (inputEl.value || '').trim();
        if (!text) text = 'Tell me more.';
        inputEl.value = '';

        var anim = el.dataset.anim || 'none';
        msRemoveEmpty(content);

        /* opening position demo: reset to last-anchor before adding */
        var userItem = msCreateUserItem(text, anim !== 'none');
        content.appendChild(userItem);
        if (window.lucide) window.lucide.createIcons();

        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        updateState();

        /* streaming demo */
        var statusEl = chatDemo.querySelector('#stream-status');
        var isStreaming = el.id === 'ms-streaming';
        var responseText = msGetNextResponse();

        window.setTimeout(function () {
          var aiItem = msCreateAIItem('', anim !== 'none');
          var textEl = aiItem.querySelector('.ms-text');
          content.appendChild(aiItem);
          if (window.lucide) window.lucide.createIcons();

          if (isStreaming && statusEl) statusEl.textContent = 'Streaming…';

          if (isStreaming) {
            msStreamText(textEl, responseText, function () {
              if (statusEl) statusEl.textContent = 'Stream complete';
              updateState();
            });
            /* auto-scroll during streaming */
            var streamTimer = window.setInterval(function () {
              if (!textEl.textContent.endsWith(responseText.split(' ').slice(-1)[0])) {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'auto' });
              } else {
                window.clearInterval(streamTimer);
              }
            }, 80);
          } else {
            textEl.textContent = responseText;
          }

          viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
          updateState();
        }, 400);
      });
    }

    /* — reset — */
    var resetBtn = chatDemo && chatDemo.querySelector('[data-ms-reset]');
    if (resetBtn && content) {
      resetBtn.addEventListener('click', function () {
        /* restore original HTML */
        var origHTML = content.getAttribute('data-orig-html');
        if (origHTML) {
          content.innerHTML = origHTML;
          if (window.lucide) window.lucide.createIcons();
          viewport.scrollTo({ top: 0, behavior: 'auto' });
          updateState();
        }
      });
      if (!content.getAttribute('data-orig-html')) {
        content.setAttribute('data-orig-html', content.innerHTML);
      }
    }

    /* — load history — */
    var loadBtn = el.querySelector('[data-ms-load-history]');
    if (loadBtn && content) {
      loadBtn.addEventListener('click', function () {
        var prevHeight = viewport.scrollHeight;
        var prevScroll = viewport.scrollTop;

        var frag = document.createDocumentFragment();
        var msgs = [
          { user: 'What started this conversation?', ai: 'We began discussing the design system architecture and how to best structure reusable components for a large-scale application.' },
          { user: 'Any specific challenges?', ai: 'The main challenge was balancing flexibility with consistency — components needed to be customizable but still follow predictable patterns.' },
        ];

        msgs.reverse().forEach(function (m) {
          var ai = msCreateAIItem(m.ai, false);
          var user = msCreateUserItem(m.user, false);
          user.setAttribute('data-anchor', 'true');
          frag.prepend(ai);
          frag.prepend(user);
        });

        var firstChild = content.querySelector('[data-slot="message-scroller-item"]');
        content.insertBefore(frag, firstChild);

        /* preserve scroll position */
        var newHeight = viewport.scrollHeight;
        viewport.scrollTop = prevScroll + (newHeight - prevHeight);
        updateState();
      });
    }

    /* — opening position tabs — */
    var posTabs = chatDemo && chatDemo.querySelectorAll('[data-ms-position]');
    if (posTabs) {
      posTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          posTabs.forEach(function (t) { t.classList.remove('ms-toolbar-tab--active'); });
          tab.classList.add('ms-toolbar-tab--active');
          var pos = tab.getAttribute('data-ms-position');
          el.setAttribute('data-open-position', pos);
          if (pos === 'start') {
            viewport.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (pos === 'end') {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
          } else {
            /* last-anchor */
            var lastAnchor = content.querySelector('[data-ms-last-anchor]') ||
                             Array.from(content.querySelectorAll('[data-anchor="true"]')).pop();
            if (lastAnchor) msScrollToElement(viewport, lastAnchor);
          }
          updateState();
        });
      });
    }

    /* — animation tabs — */
    var animTabs = chatDemo && chatDemo.querySelectorAll('[data-ms-anim]');
    if (animTabs) {
      animTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          animTabs.forEach(function (t) { t.classList.remove('ms-toolbar-tab--active'); });
          tab.classList.add('ms-toolbar-tab--active');
          el.dataset.anim = tab.getAttribute('data-ms-anim');
        });
      });
    }

    /* — peek slider — */
    var peekSlider = chatDemo && chatDemo.querySelector('[data-ms-peek]');
    if (peekSlider) {
      var peekLabel = chatDemo.querySelector('#peek-value');
      var subtitleEl = chatDemo.querySelector('.chat-demo__subtitle');
      peekSlider.addEventListener('input', function () {
        var val = peekSlider.value;
        if (peekLabel) peekLabel.textContent = val;
        if (subtitleEl) subtitleEl.textContent = 'scrollPreviousItemPeek: ' + val + 'px';
        el.dataset.peek = val;
      });
    }

    /* — commands: jump to message — */
    var jumpScope = chatDemo || el;
    var jumpBtns = jumpScope.querySelectorAll('[data-ms-jump]');
    jumpBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-ms-jump');
        var target = content.querySelector('#' + targetId) || document.getElementById(targetId);
        if (target) msScrollToElement(viewport, target);
        window.setTimeout(updateState, 400);
      });
    });
    var jumpPosBtns = jumpScope.querySelectorAll('[data-ms-jump-pos]');
    jumpPosBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pos = btn.getAttribute('data-ms-jump-pos');
        viewport.scrollTo({ top: pos === 'end' ? viewport.scrollHeight : 0, behavior: 'smooth' });
        window.setTimeout(updateState, 400);
      });
    });

    /* — TOC links — */
    var tocLinks = document.querySelectorAll('[data-ms-toc="' + el.id + '"] [data-toc-target]');
    tocLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var target = content.querySelector('#' + link.getAttribute('data-toc-target'));
        if (target) msScrollToElement(viewport, target);
      });
    });

    viewport.addEventListener('scroll', updateState);
    updateState();
  }

  function initMessageScrollers(root) {
    (root || document).querySelectorAll('[data-slot="message-scroller"]').forEach(function (el) {
      initMessageScroller(el);
    });
  }

  function initCalendars(root) {
    (root || document).querySelectorAll('[data-slot="calendar"]').forEach(function (el) {
      if (el.dataset.calendarBound === 'true') return;
      el.dataset.calendarBound = 'true';
      el._calendar = new CalendarInstance(el);
    });
    initCalendarPresets(root);
    if (window.lucide) window.lucide.createIcons();
  }

  function init() {
    initIcons();
    initDropdownMenus();
    initContextMenus(document);
    initComboboxes(document);
    initAccordions(document);
    initCollapsibles(document);
    initThemeToggle();
  }

  window.initDesignSystemComponents = function (root) {
    initDropdownMenus();
    initContextMenus(root);
    initMenubars(root);
    initNavigationMenus(root);
    initSelects(root);
    initComboboxes(root);
    initPopovers(root);
    initCalendars(root);
    initDatePickers(root);
    initTimePickers(root);
    initCheckboxes(root);
    initRadioGroups(root);
    initScrollAreas(root);
    initResizables(root);
    initSheets(root);
    initDrawers(root);
    initCommands(root);
    initDialogs(root);
    initSwitches(root);
    initSliders(root);
    initProgress(root);
    initPagination(root);
    initInputGroups(root);
    initItems(root);
    initCards(root);
    initDirections(root);
    initAttachments(root);
    initMessageScrollers(root);
    initEmpties(root);
    initCarousels(root);
    initSortables(root);
    initDataTables(root);
    initToggles(root);
    initToggleGroups(root);
    initAvatars(root);
    initInputOtps(root);
    initTabs(root);
    initTooltips(root);
    initHoverCards(root);
    initAccordions(root || document);
    initCollapsibles(root || document);
    initSonnerDemos(root || document);
    initAlertDialogs(root || document);
    initDocSidebars(root || document);
    if (window.initAnimateDemos) window.initAnimateDemos(root || document);
    if (window.initCharts) window.initCharts(root || document);
    if (window.initEditors) window.initEditors(root || document);
  };

  document.addEventListener('click', function (event) {
    if (!event.target.closest('[data-slot="combobox"]')) {
      closeAllComboboxes();
    }
    closeAllDropdownMenus();
    if (!event.target.closest('[data-slot="context-menu-content"], [data-slot="context-menu-sub-content"]')) {
      closeAllContextMenus();
    }
    if (!event.target.closest('[data-slot="menubar"]')) {
      closeAllMenubars();
    }
    if (!event.target.closest('[data-slot="navigation-menu"]')) {
      closeAllNavigationMenus();
    }
    closeAllSelects();
    if (!event.target.closest('[data-slot="popover"]')) {
      closeAllPopovers();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeAllDropdownMenus();
      closeAllContextMenus();
      closeAllMenubars();
      closeAllNavigationMenus();
      closeAllSelects();
      closeAllComboboxes();
      closeAllPopovers();
      closeAllTooltips();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
