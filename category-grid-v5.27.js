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
    originalShowIconPicker(itemId, anchorEl, ev);

    const pops = document.querySelectorAll('.icon-pop');
    const pop = pops[pops.length - 1];
    if (!pop) return;

    pop.classList.add('category-grid-v527');

    const grid = pop.querySelector('.icon-grid');
    const header = pop.querySelector('.icon-pop-hd');
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
  };
})();
