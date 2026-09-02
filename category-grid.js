(function () {
  if (window.__categoryGridV527Installed || typeof window.showIconPicker !== 'function') return;
  window.__categoryGridV527Installed = true;

  const CATEGORY_ORDER = [
    'food', 'cafe', 'beer', 'mic',
    'shop', 'movie', 'car', 'plane',
    'bed', 'golf', 'spa', 'dumbbell',
    'cake', 'event', 'medical', 'receipt'
  ];

  const originalShowIconPicker = window.showIconPicker;

  window.showIconPicker = function (itemId, anchorEl, ev) {
    const existing = Array.from(document.querySelectorAll('.icon-pop')).find(
      (p) => p.dataset.categoryItemId === String(itemId)
    );

    if (existing) {
      if (ev) {
        ev.stopPropagation();
        ev.preventDefault();
      }
      if (typeof existing._categoryCleanup === 'function') existing._categoryCleanup();
      existing.remove();
      return;
    }

    originalShowIconPicker(itemId, anchorEl, ev);

    const pops = document.querySelectorAll('.icon-pop');
    const pop = pops[pops.length - 1];
    if (!pop) return;

    pop.classList.add('category-grid-v527');
    pop.dataset.categoryItemId = String(itemId);

    const grid = pop.querySelector('.icon-grid');
    const header = pop.querySelector('.icon-pop-hd');

    if (header) {
      const titleNode = Array.from(header.childNodes).find(
        (node) => node.nodeType === 3 && node.textContent.trim()
      );
      if (titleNode) titleNode.textContent = '카테고리 선택';
    }

    if (grid && header) {
      const auto = grid.querySelector('.icon-opt[data-key=""]');
      if (auto) {
        auto.classList.add('icon-auto');
        auto.removeAttribute('data-tip');
        header.appendChild(auto);
      }

      const byKey = new Map(
        Array.from(grid.querySelectorAll('.icon-opt[data-key]')).map((btn) => [btn.dataset.key, btn])
      );
      CATEGORY_ORDER.forEach((key) => {
        const btn = byKey.get(key);
        if (btn) grid.appendChild(btn);
      });
    }

    const row = anchorEl && anchorEl.closest ? anchorEl.closest('.detail-row,.rc-item-row') : null;
    const area = row && row.parentElement ? row.parentElement : null;
    const margin = 8;
    const gap = 6;

    // Escape any overflow:hidden/auto ancestor so the popup itself is never clipped.
    if (pop.parentElement !== document.body) document.body.appendChild(pop);
    pop.style.position = 'fixed';
    pop.style.margin = '0';
    pop.style.zIndex = '1000';

    const visibleBounds = () => {
      let top = margin;
      let bottom = (window.innerHeight || document.documentElement.clientHeight) - margin;
      let node = anchorEl && anchorEl.parentElement;

      while (node && node !== document.body && node !== document.documentElement) {
        const cs = getComputedStyle(node);
        const overflowY = cs.overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden' || overflowY === 'clip') {
          const r = node.getBoundingClientRect();
          top = Math.max(top, r.top + margin);
          bottom = Math.min(bottom, r.bottom - margin);
        }
        node = node.parentElement;
      }
      return { top, bottom };
    };

    const positionPopup = () => {
      if (!pop.isConnected) return;

      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const anchorRect = anchorEl && anchorEl.getBoundingClientRect ? anchorEl.getBoundingClientRect() : null;
      const areaRect = area && area.getBoundingClientRect ? area.getBoundingClientRect() : null;
      if (!anchorRect) return;

      let left;
      let width;
      if (areaRect && areaRect.width > 0) {
        left = areaRect.left;
        width = areaRect.width;
      } else {
        width = Math.min(640, viewportWidth - margin * 2);
        left = Math.max(margin, (viewportWidth - width) / 2);
      }

      const maxWidth = Math.max(0, viewportWidth - margin * 2);
      width = Math.min(width, maxWidth);
      left = Math.min(Math.max(margin, left), viewportWidth - width - margin);

      pop.style.width = width + 'px';
      pop.style.minWidth = '0';
      pop.style.left = left + 'px';
      pop.style.maxHeight = '';
      pop.style.overflowY = '';

      const bounds = visibleBounds();
      const popupHeight = pop.getBoundingClientRect().height;
      const belowTop = anchorRect.bottom + gap;
      const aboveTop = anchorRect.top - gap - popupHeight;
      const fitsBelow = belowTop + popupHeight <= bounds.bottom;
      const fitsAbove = aboveTop >= bounds.top;

      let top;
      if (fitsBelow) {
        top = belowTop;
        pop.dataset.openDirection = 'down';
      } else if (fitsAbove) {
        top = aboveTop;
        pop.dataset.openDirection = 'up';
      } else {
        const available = Math.max(120, bounds.bottom - bounds.top);
        pop.style.maxHeight = available + 'px';
        pop.style.overflowY = 'auto';
        top = Math.min(Math.max(bounds.top, belowTop), bounds.bottom - Math.min(popupHeight, available));
        pop.dataset.openDirection = 'clamped';
      }

      pop.style.top = Math.round(top) + 'px';
    };

    let raf = 0;
    const followAnchor = () => {
      if (!pop.isConnected) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(positionPopup);
    };

    const cleanup = () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', followAnchor, true);
      window.removeEventListener('resize', followAnchor);
      document.removeEventListener('pointerdown', closeOutside, true);
    };

    const closeOutside = (e) => {
      if (!pop.isConnected) {
        cleanup();
        return;
      }
      const onAnchor = anchorEl && (e.target === anchorEl || anchorEl.contains(e.target));
      if (!pop.contains(e.target) && !onAnchor) {
        cleanup();
        pop.remove();
      }
    };

    pop._categoryCleanup = cleanup;
    window.addEventListener('scroll', followAnchor, true);
    window.addEventListener('resize', followAnchor);

    requestAnimationFrame(() => {
      positionPopup();

      if (window.matchMedia('(max-width:700px)').matches && header && grid) {
        const firstIcon = grid.querySelector('.icon-opt[data-key="food"] svg');
        if (firstIcon && pop.isConnected) {
          const popRect = pop.getBoundingClientRect();
          const iconRect = firstIcon.getBoundingClientRect();
          const leftPad = Math.max(10, Math.round(iconRect.left - popRect.left));
          header.style.paddingLeft = leftPad + 'px';
          header.style.paddingRight = '10px';
          positionPopup();
        }
      }
    });

    setTimeout(() => {
      document.addEventListener('pointerdown', closeOutside, true);
    }, 0);
  };
})();
