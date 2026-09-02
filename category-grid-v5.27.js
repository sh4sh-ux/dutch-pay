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

    const anchorRect = anchorEl && anchorEl.getBoundingClientRect ? anchorEl.getBoundingClientRect() : null;
    const row = anchorEl && anchorEl.closest ? anchorEl.closest('.detail-row,.rc-item-row') : null;
    const area = row && row.parentElement ? row.parentElement : null;
    const areaRect = area && area.getBoundingClientRect ? area.getBoundingClientRect() : null;
    const margin = 8;
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;

    let left;
    let width;
    if (areaRect && areaRect.width > 0) {
      left = areaRect.left + window.scrollX;
      width = areaRect.width;
    } else {
      width = Math.min(640, viewportWidth - margin * 2);
      left = Math.max(margin, ((viewportWidth - width) / 2) + window.scrollX);
    }

    const maxWidth = Math.max(0, viewportWidth - margin * 2);
    width = Math.min(width, maxWidth);
    left = Math.min(
      Math.max(window.scrollX + margin, left),
      window.scrollX + viewportWidth - width - margin
    );

    pop.style.width = width + 'px';
    pop.style.minWidth = '0';
    pop.style.left = left + 'px';
    if (anchorRect) pop.style.top = (anchorRect.bottom + window.scrollY + 6) + 'px';

    // On mobile, align the title's left edge exactly with the first label (외식).
    if (window.matchMedia('(max-width:700px)').matches && header && grid) {
      requestAnimationFrame(() => {
        if (!pop.isConnected) return;
        const firstLabel = grid.querySelector('.icon-opt[data-key="food"] .icon-lbl');
        if (!firstLabel) return;
        const popRect = pop.getBoundingClientRect();
        const labelRect = firstLabel.getBoundingClientRect();
        const rightPad = 10;
        const leftPad = Math.max(10, Math.round(labelRect.left - popRect.left));
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
          return;
        }
        const onAnchor = anchorEl && (e.target === anchorEl || anchorEl.contains(e.target));
        if (!pop.contains(e.target) && !onAnchor) {
          pop.remove();
          document.removeEventListener('pointerdown', closeOutside, true);
        }
      };
      document.addEventListener('pointerdown', closeOutside, true);
    }, 0);
  };
})();
