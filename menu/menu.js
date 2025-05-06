/* 
  Name: menu.js
  Author: Vladislav Babarikov
  Version: 1.2.4
  Description: Логика динамического меню V//V Productions
  License: Все права защищены © Vladislav Babarikov
*/

const CONFIG_URL =
  'https://vladislavbabarikov.github.io/V-V-productions-tilda/menu/menu-config.json';
const MENU_HTML_URL =
  'https://vladislavbabarikov.github.io/V-V-productions-tilda/menu/menu.html';

const sectionLabels = { t337: 'Professional Page' };

document.addEventListener('DOMContentLoaded', () => {
  fetch(MENU_HTML_URL)
    .then(r => r.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);
      return fetch(CONFIG_URL);
    })
    .then(r => r.json())
    .then(cfg => {
      initializeSidebar(cfg);
      initializeMobile(cfg);
    });
});

function initializeSidebar(config) {
  const labelEl = document.getElementById('sidebar-label');
  const topMenu = document.getElementById('menu-top');
  const bottomMenu = document.getElementById('menu-bottom');
  const sidebar = document.getElementById('sidebar');
  const submenuState = { open: false };

  let activeLabel = 'V//V Production';
  for (const cls in sectionLabels) {
    if (document.querySelector(`.${cls}`)) activeLabel = sectionLabels[cls];
  }
  labelEl.textContent = activeLabel;

  const { menuConfig = [], modules = {} } = config;

  const list = key =>
    menuConfig
      .filter(
        i =>
          i.position === key &&
          (i.showIn.includes('Default') || i.showIn.includes(activeLabel))
      )
      .sort((a, b) => a.rowId - b.rowId);

  [...list('top'), ...list('bottom')].forEach(item => {
    const container = (item.position === 'top' ? topMenu : bottomMenu);
    menuNodes(item).forEach(node => container.appendChild(node));
  });

  if (modules.socialButtons) {
    const s = document.createElement('script');
    s.src =
      'https://vladislavbabarikov.github.io/V-V-productions-tilda/menu/modules/social-buttons.js';
    s.onload = () =>
      typeof applySocialButtons === 'function' && applySocialButtons('#menu-top');
    document.body.appendChild(s);
  }

  sidebar.addEventListener('mouseleave', () => {
    if (submenuState.open) toggleSide(false);
  });
  sidebar.addEventListener('mouseenter', () => {
    if (submenuState.open) toggleSide(true);
  });

  function toggleSide(open) {
    sidebar.querySelector('.submenu')?.classList.toggle('open', open);
    sidebar.querySelector('.toggle-arrow')?.classList.toggle('open', open);
  }

  function menuNodes(item) {
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
    const a = document.createElement('a');
    a.href = item.href;
    a.className = 'menu-item';
    a.innerHTML = `<img src="${item.icon}" alt="${item.label}">
                   <span class="menu-text">${item.label}</span>`;
    return [a];
  }
}

function initializeMobile(cfg) {
  const mobileNav = document.getElementById('mobile-nav');
  const mainRow = document.getElementById('mobile-main-row');
  const drawer = document.getElementById('mobile-drawer');
  if (!mobileNav || !mainRow || !drawer) return;

  const { menuConfig = [], mobileButtonsKey = [], visibleText = true } = cfg;
  const dict = Object.fromEntries(menuConfig.map(i => [i.key, i]));

  // 1) Собираем главную строку
  mobileButtonsKey.slice(0, 5).forEach(key => {
    const item = dict[key];
    if (!item) return;
    const btn = makeBtn(item, !visibleText);
    mainRow.appendChild(btn);

    // если кнопка-раскрывалка
    if (item.href === '#menu-toggle') {
      btn.addEventListener('click', e => {
        e.preventDefault();
        mobileNav.classList.toggle('expanded');
        adjustDrawerHeight();
      });
    }

    // мобильное сабменю вправо
    if (item.submenu) {
      btn.addEventListener('click', e => {
        e.preventDefault();
        openSubmenu(item);
      });
    }
  });

  // 2) Остальные — в drawer
  menuConfig.forEach(item => {
    if (mobileButtonsKey.includes(item.key)) return;
    drawer.appendChild(makeBtn(item, false));
  });

  // 3) Закрытие по клику вне
  window.addEventListener('click', e => {
    if (mobileNav.classList.contains('expanded') && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('expanded');
    }
  });

  function makeBtn(item, hideLabel) {
    const a = document.createElement('a');
    a.href = item.href;
    a.className = 'nav-btn' + (hideLabel ? ' hide-label' : '');
    a.innerHTML = `<img src="${item.icon}" alt="${item.label}">
                   <span>${item.label}</span>`;
    return a;
  }

  function adjustDrawerHeight() {
    const count = drawer.children.length;
    const rows = Math.ceil(count / 5);
    const rowH = 70; // высота одной строки
    drawer.style.maxHeight = rows * rowH + 'px';
  }

  function openSubmenu(item) {
    // сдвигаем mainRow влево
    mainRow.style.transform = 'translateX(-100%)';
    mainRow.style.transition = 'transform 0.3s ease';

    // собираем временный массив кнопок сабменю
    const subBtns = item.submenu.map(s => {
      const btn = makeBtn(s, false);
      btn.classList.add('submenu-mobile');
      return btn;
    });

    // очищаем drawer и вставляем сабменю
    drawer.innerHTML = '';
    subBtns.forEach(b => drawer.appendChild(b));

    // показываем drawer
    mobileNav.classList.add('expanded');
    adjustDrawerHeight();

    // кнопка «назад»
    const back = document.createElement('button');
    back.textContent = '← Назад';
    back.className = 'back-btn';
    back.addEventListener('click', () => {
      mainRow.style.transform = '';
      drawer.innerHTML = '';
      menuConfig.forEach(i => {
        if (!mobileButtonsKey.includes(i.key)) {
          drawer.appendChild(makeBtn(i, false));
        }
      });
      mobileNav.classList.remove('expanded');
    });
    drawer.insertBefore(back, drawer.firstChild);
  }
}
