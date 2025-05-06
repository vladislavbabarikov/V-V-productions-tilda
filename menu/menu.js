/* 
  Name: menu.js
  Author: Vladislav Babarikov
  Version: 1.2.1
  Description: Логика динамического меню V//V Productions
  License: Все права защищены © Vladislav Babarikov
*/

const CONFIG_URL =
  'https://raw.githubusercontent.com/vladislavbabarikov/V-V-productions-tilda/refs/heads/main/menu/menu-config.json';
const MENU_HTML_URL =
  'https://raw.githubusercontent.com/vladislavbabarikov/V-V-productions-tilda/refs/heads/main/menu/menu.html';

const sectionLabels = { t337: 'Professional Page' };

document.addEventListener('DOMContentLoaded', () => {
  fetch(MENU_HTML_URL)
    .then(r => r.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);
      fetch(CONFIG_URL)
        .then(r => r.json())
        .then(cfg => {
          initializeSidebar(cfg);
          initializeMobileNav(cfg);
        });
    });
});

/* ─────────── SIDEBAR (десктоп) ─────────── */
function initializeSidebar(config) {
  const labelEl = document.getElementById('sidebar-label');
  const topMenu = document.getElementById('menu-top');
  const bottomMenu = document.getElementById('menu-bottom');
  const sidebar = document.getElementById('sidebar');
  const submenuState = { open: false };

  let activeLabel = 'V//V Production';
  for (const cls in sectionLabels) {
    if (document.querySelector(`.${cls}`)) {
      activeLabel = sectionLabels[cls];
      break;
    }
  }
  labelEl.textContent = activeLabel;

  const menuConfig = config.menuConfig || [];
  const modules = config.modules || {};

  const topItems = menuConfig
    .filter(
      i =>
        i.position === 'top' &&
        (i.showIn.includes('Default') || i.showIn.includes(activeLabel))
    )
    .sort((a, b) => a.rowId - b.rowId);

  const bottomItems = menuConfig
    .filter(
      i =>
        i.position === 'bottom' &&
        (i.showIn.includes('Default') || i.showIn.includes(activeLabel))
    )
    .sort((a, b) => a.rowId - b.rowId);

  [...topItems, ...bottomItems].forEach(item => {
    const target = item.position === 'top' ? topMenu : bottomMenu;
    createMenuItem(item).forEach(el => target.appendChild(el));
  });

  if (modules.socialButtons) {
    const s = document.createElement('script');
    s.src =
      'https://cdn.jsdelivr.net/gh/vladislavbabarikov/V-V-productions-tilda@main/menu/modules/social-buttons.js';
    s.onload = () => {
      if (typeof applySocialButtons === 'function') {
        applySocialButtons('#menu-top');
      }
    };
    document.body.appendChild(s);
  }

  sidebar.addEventListener('mouseleave', () => {
    if (submenuState.open) toggleSubmenu(false);
  });

  sidebar.addEventListener('mouseenter', () => {
    if (submenuState.open) toggleSubmenu(true);
  });

  function toggleSubmenu(open) {
    const submenu = sidebar.querySelector('.submenu');
    const arrow = sidebar.querySelector('.toggle-arrow');
    submenu?.classList.toggle('open', open);
    arrow?.classList.toggle('open', open);
  }

  function createMenuItem(item) {
    if (item.submenu) {
      const wrap = document.createElement('div');
      wrap.className = 'menu-item project-toggle';
      wrap.innerHTML = `
        <img src="${item.icon}" alt="${item.label}">
        <span class="menu-text">${item.label}</span>
        <svg class="toggle-arrow" width="12" height="12" viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z" fill="currentColor"/>
        </svg>`;
      const sub = document.createElement('div');
      sub.className = 'submenu';
      item.submenu.forEach(s =>
        sub.insertAdjacentHTML(
          'beforeend',
          `<a href="${s.href}" class="submenu-item">
             <img src="${s.icon}" alt="${s.label}">
             <span class="menu-text">${s.label}</span>
           </a>`
        )
      );
      wrap.addEventListener('click', e => {
        sub.classList.toggle('open');
        wrap.querySelector('.toggle-arrow').classList.toggle('open');
        submenuState.open = sub.classList.contains('open');
        e.stopPropagation();
      });
      return [wrap, sub];
    }

    const link = document.createElement('a');
    link.href = item.href;
    link.className = 'menu-item';
    link.innerHTML = `
      <img src="${item.icon}" alt="${item.label}">
      <span class="menu-text">${item.label}</span>`;
    return [link];
  }
}

/* ─────────── MOBILE NAV (нижняя панель) ─────────── */
function initializeMobileNav(config) {
  const mobileNav = document.getElementById('mobile-nav');
  if (!mobileNav) return;

  const items = (config.menuConfig || [])
    .filter(i => i.showIn.includes('Default'))
    .sort((a, b) => (a.mobileRowId ?? a.rowId) - (b.mobileRowId ?? b.rowId))
    .slice(0, 5); // до 5 элементов

  items.forEach(item => {
    const btn = document.createElement('a');
    btn.href = item.href;
    btn.className = 'nav-btn';
    btn.innerHTML = `
      <img src="${item.icon}" alt="${item.label}">
      <span>${item.label}</span>`;
    mobileNav.appendChild(btn);
  });
}
