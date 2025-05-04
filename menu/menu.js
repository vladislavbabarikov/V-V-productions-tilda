/* 
  Name: menu.js
  Author: Vladislav Babarikov
  Version: 1.01
  Created: 2025-05-04
  Description: Логика для динамического бокового меню проекта V//V Productions
  License: Все права защищены © Vladislav Babarikov
  Website: https://vvproductions.ru
  Contact: info@vvproductions.ru
  by V//V Productions.
*/

const sectionLabels = {
  't337': 'Professional Page'
};

document.addEventListener('DOMContentLoaded', () => {
  // Загрузка HTML меню
  fetch('https://cdn.jsdelivr.net/gh/vladislavbabarikov/V-V-productions-tilda@main/menu/menu.html')
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);
      initializeSidebar(); // Инициализировать после вставки
    });

  function initializeSidebar() {
    const labelElement = document.getElementById('sidebar-label');
    const topMenu = document.getElementById('menu-top');
    const bottomMenu = document.getElementById('menu-bottom');
    const sidebar = document.getElementById('sidebar');
    let activeLabel = 'V//V Production';
    const submenuState = { open: false };

    for (const cls in sectionLabels) {
      if (document.querySelector(`.${cls}`)) {
        activeLabel = sectionLabels[cls];
        break;
      }
    }
    labelElement.textContent = activeLabel;

    fetch('https://raw.githubusercontent.com/vladislavbabarikov/V-V-productions-tilda/refs/heads/main/menu/menu-config.json')
      .then(res => res.json())
      .then(config => {
        const menuConfig = config.menuConfig || [];
        const modules = config.modules || {};

        const topItems = menuConfig
          .filter(i => i.position === 'top' && (i.showIn.includes('Default') || i.showIn.includes(activeLabel)))
          .sort((a, b) => a.rowId - b.rowId);
        const bottomItems = menuConfig
          .filter(i => i.position === 'bottom' && (i.showIn.includes('Default') || i.showIn.includes(activeLabel)))
          .sort((a, b) => a.rowId - b.rowId);

        topItems.forEach(item => {
          const elements = createMenuItem(item);
          elements.forEach(el => topMenu.appendChild(el));
        });

        bottomItems.forEach(item => {
          const elements = createMenuItem(item);
          elements.forEach(el => bottomMenu.appendChild(el));
        });

        if (modules.socialButtons) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/gh/vladislavbabarikov/V-V-productions-tilda@main/menu/modules/social-buttons.js';
          script.onload = () => {
            if (typeof applySocialButtons === 'function') {
              applySocialButtons('#menu-top');
            }
          };
          document.body.appendChild(script);
        }

        sidebar.addEventListener('mouseleave', () => {
          if (submenuState.open) {
            const submenu = sidebar.querySelector('.submenu');
            const arrow = sidebar.querySelector('.toggle-arrow');
            submenu?.classList.remove('open');
            arrow?.classList.remove('open');
          }
        });

        sidebar.addEventListener('mouseenter', () => {
          if (submenuState.open) {
            const submenu = sidebar.querySelector('.submenu');
            const arrow = sidebar.querySelector('.toggle-arrow');
            submenu?.classList.add('open');
            arrow?.classList.add('open');
          }
        });
      });

    function createMenuItem(item) {
      if (item.submenu) {
        const container = document.createElement('div');
        container.classList.add('menu-item', 'project-toggle');
        container.innerHTML = `
          <img src="${item.icon}" alt="${item.label}">
          <span class="menu-text">${item.label}</span>
          <svg class="toggle-arrow" width="12" height="12" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z" fill="currentColor"/>
          </svg>
        `;
        const submenu = document.createElement('div');
        submenu.classList.add('submenu');
        item.submenu.forEach(sub => {
          submenu.innerHTML += `
            <a href="${sub.href}" class="submenu-item">
              <img src="${sub.icon}" alt="${sub.label}">
              <span class="menu-text">${sub.label}</span>
            </a>
          `;
        });
        container.addEventListener('click', (e) => {
          submenu.classList.toggle('open');
          container.querySelector('.toggle-arrow').classList.toggle('open');
          submenuState.open = submenu.classList.contains('open');
          e.stopPropagation();
        });
        return [container, submenu];
      } else {
        const link = document.createElement('a');
        link.href = item.href;
        link.classList.add('menu-item');
        link.innerHTML = `
          <img src="${item.icon}" alt="${item.label}">
          <span class="menu-text">${item.label}</span>
        `;
        return [link];
      }
    }
  }
});
