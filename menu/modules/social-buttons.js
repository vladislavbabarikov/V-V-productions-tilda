(function waitForT188AndApplySocialButtons(topMenuSelector = '#menu-top') {
  let alreadyApplied = false;

  function applySocialButtons(t188Element, topMenuSelector) {
    if (alreadyApplied) return;
    alreadyApplied = true;

    const topMenu = document.querySelector(topMenuSelector);
    if (!topMenu) return;

    const links = t188Element.querySelectorAll('.t-sociallinks__wrapper a');
    links.forEach(link => {
      const label = link.getAttribute('aria-label') || 'Соц.сеть';
      const href = link.getAttribute('href') || '#';
      const imgEl = link.querySelector('img');
      const svgEl = link.querySelector('svg');
      let iconHTML = '';

      if (imgEl) {
        const src = imgEl.getAttribute('src');
        iconHTML = `<img src="${src}" alt="${label}" style="width: 24px; height: 24px; object-fit: contain; vertical-align: middle;">`;
      } else if (svgEl) {
        const clonedSvg = svgEl.cloneNode(true);
        clonedSvg.setAttribute('width', '24');
        clonedSvg.setAttribute('height', '24');
        clonedSvg.style.flexShrink = '0';
        clonedSvg.style.display = 'inline-block';
        clonedSvg.style.verticalAlign = 'middle';
        clonedSvg.style.objectFit = 'contain';
        iconHTML = clonedSvg.outerHTML;
      }

      const button = document.createElement('a');
      button.href = href;
      button.classList.add('menu-item');
      button.innerHTML = `
        ${iconHTML}
        <span class="menu-text">${label}</span>
      `;
      topMenu.appendChild(button);
    });
  }

  const observer = new MutationObserver((mutations, obs) => {
    const t188 = document.querySelector('.t188');
    if (t188) {
      obs.disconnect();
      applySocialButtons(t188, topMenuSelector);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  const t188 = document.querySelector('.t188');
  if (t188) {
    applySocialButtons(t188, topMenuSelector);
  }
})();
