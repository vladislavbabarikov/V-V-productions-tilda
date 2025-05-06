/* 
  Name: menu.js
  Author: Vladislav Babarikov
  Version: 1.2.5
  Description: Логика динамического меню V//V Productions
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
  // ... без изменений, как в v1.2.5 выше ...
}

function initializeMobile(cfg) {
  const mobileNav = document.getElementById('mobile-nav');
  const mainRow   = document.getElementById('mobile-main-row');
  const drawer    = document.getElementById('mobile-drawer');
  if (!mobileNav || !mainRow || !drawer) return;

  const { menuConfig = [], mobileButtonsKey = [], visibleText = true } = cfg;
  const dict = Object.fromEntries(menuConfig.map(i => [i.key, i]));

  // вспомогательные функции
  function makeBtn(item, hideLabel) {
    const a = document.createElement('a');
    a.href = item.href === '#' ? 'javascript:void(0)' : item.href;
    a.className = 'nav-btn' + (hideLabel ? ' hide-label' : '');
    a.innerHTML = `<img src="${item.icon}" alt="${item.label}">
                   <span>${item.label}</span>`;
    return a;
  }
  function collapseMenu() {
    mobileNav.classList.remove('expanded');
    drawer.style.maxHeight = '0';
  }
  function adjustDrawerHeight() {
    const count = drawer.children.length;
    if (!count) return;
    const rows = Math.ceil(count / 5);
    drawer.style.maxHeight = `${rows * 70}px`;
  }

  // 1) построить основную строку
  const mainKeys = mobileButtonsKey.slice(0, 5);
  mainRow.innerHTML = '';
  mainKeys.forEach(key => {
    const itm = dict[key];
    if (!itm) return;
    const btn = makeBtn(itm, !visibleText);
    mainRow.appendChild(btn);
    // toggle-разворачивалка
    if (itm.href === '#menu-toggle') {
      btn.addEventListener('click', e => {
        e.preventDefault();
        if (mobileNav.classList.toggle('expanded')) {
          adjustDrawerHeight();
        } else {
          collapseMenu();
        }
      });
    }
    // сабменю
    if (itm.submenu) {
      btn.addEventListener('click', e => {
        e.preventDefault();
        openSubmenu(itm);
      });
    }
  });

  // 2) заполнить drawer “остатками” (пока пусто)
  drawer.innerHTML = '';
  menuConfig.forEach(itm => {
    if (mainKeys.includes(itm.key)) return;
    drawer.appendChild(makeBtn(itm, false));
  });

  // 3) при клике вне или скролле — скрыть
  window.addEventListener('click', e => {
    if (mobileNav.classList.contains('expanded') && !mobileNav.contains(e.target)) {
      collapseMenu();
    }
  });
  window.addEventListener('scroll', () => {
    if (mobileNav.classList.contains('expanded')) collapseMenu();
  });

  // 4) открываем сабменю “вправо”
  function openSubmenu(item) {
    const sub = item.submenu || [];
    // 4.1 собрать новую main-строку: до idx включительно + sub-элементы пока слоты
    const idx = mainKeys.indexOf(item.key);
    const newMain = [];
    // исходные до idx
    for (let i = 0; i <= idx; i++) newMain.push(dict[mainKeys[i]]);
    // вставить sub
    let used = 0;
    while (newMain.length < 5 && used < sub.length) {
      newMain.push(sub[used++]);
    }
    // если не заполнили все 5, добавить пустышки
    while (newMain.length < 5) newMain.push(null);
    // отрендерить
    mainRow.innerHTML = '';
    newMain.forEach(itm => {
      if (itm) mainRow.appendChild(makeBtn(itm, false));
      else {
        const ph = document.createElement('div');
        ph.className = 'nav-btn placeholder';
        mainRow.appendChild(ph);
      }
    });

    // 4.2 в drawer — оставшиеся sub (если есть)
    const rem = sub.slice(used);
    drawer.innerHTML = '';
    rem.forEach(itm => drawer.appendChild(makeBtn(itm, false)));
    if (rem.length) {
      mobileNav.classList.add('expanded');
      adjustDrawerHeight();
    } else {
      collapseMenu();
    }
  }
}
