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

    // Same category icon tapped again: toggle the picker closed.
    if (existing) {
      if (ev) {
        ev.stopPropagation();
        ev.preventDefault();
      }
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
      // Replace only the header text while preserving the Auto button.
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

    // Keep the popup attached to the clicked category row while the page scrolls.
    // The popup itself is fixed to the viewport, so its position is recalculated
    // from the anchor's live getBoundingClientRect() on scroll/resize.
    pop.style.position = 'fixed';
    pop.style.margin = '0';

    const positionPopup = () => {
      if (!pop.isConnected) return;

      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const anchorRect = anchorEl && anchorEl.getBoundingClientRect ? anchorEl.getBoundingClientRect() : null;
      const areaRect = area && area.getBoundingClientRect ? area.getBoundingClientRect() : null;

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
      left = Math.min(
        Math.max(margin, left),
        viewportWidth - width - margin
      );

      pop.style.width = width + 'px';
      pop.style.minWidth = '0';
      pop.style.left = left + 'px';
      if (anchorRect) pop.style.top = (anchorRect.bottom + 6) + 'px';
    };

    positionPopup();

    let raf = 0;
    const followAnchor = () => {
      if (!pop.isConnected) {
        window.removeEventListener('scroll', followAnchor, true);
        window.removeEventListener('resize', followAnchor);
        return;
      }
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(positionPopup);
    };
    window.addEventListener('scroll', followAnchor, true);
    window.addEventListener('resize', followAnchor);

    // On mobile, align the title's left edge with the left edge of the food icon itself.
    if (window.matchMedia('(max-width:700px)').matches && header && grid) {
      requestAnimationFrame(() => {
        if (!pop.isConnected) return;
        const firstIcon = grid.querySelector('.icon-opt[data-key="food"] svg');
        if (!firstIcon) return;
        const popRect = pop.getBoundingClientRect();
        const iconRect = firstIcon.getBoundingClientRect();
        const rightPad = 10;
        const leftPad = Math.max(10, Math.round(iconRect.left - popRect.left));
        header.style.paddingLeft = leftPad + 'px';
        header.style.paddingRight = rightPad + 'px';
      });
    }

    // Mobile-safe outside dismiss. The opening anchor is ignored here so a
    // second tap reaches showIconPicker above and can toggle the picker closed.
    setTimeout(() => {
      const closeOutside = (e) => {
        if (!pop.isConnected) {
          document.removeEventListener('pointerdown', closeOutside, true);
          window.removeEventListener('scroll', followAnchor, true);
          window.removeEventListener('resize', followAnchor);
          return;
        }
        const onAnchor = anchorEl && (e.target === anchorEl || anchorEl.contains(e.target));
        if (!pop.contains(e.target) && !onAnchor) {
          pop.remove();
          document.removeEventListener('pointerdown', closeOutside, true);
          window.removeEventListener('scroll', followAnchor, true);
          window.removeEventListener('resize', followAnchor);
        }
      };
      document.addEventListener('pointerdown', closeOutside, true);
    }, 0);
  };
})();
