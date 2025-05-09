/* 
  Name: menu.js
  Author: Vladislav Babarikov
  Version: 1.5
  Description: Логика динамического меню V//V Productions
*/
<script>
const CONFIG_URL = 'https://vladislavbabarikov.github.io/V-V-productions-tilda/menu/menu-config.json';

document.addEventListener('DOMContentLoaded', () => {
  let lastOpenedKey = null;
  let pageIDRaw = null;
  let pageID    = null;

  // read <!-- ID: ... --> comment
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_COMMENT, null, false);
  let node;
  while (node = walker.nextNode()) {
    const m = node.nodeValue.match(/ID:\s*(.+)/);
    if (m) {
      pageIDRaw = m[1].trim();
      pageID    = pageIDRaw.toLowerCase();
      break;
    }
  }

  const labelEl = document.getElementById('sidebar-label');
  if (labelEl) labelEl.innerText = pageIDRaw || 'V//V Productions';

  fetch(CONFIG_URL)
    .then(r => r.json())
    .then(cfg => {
      initializeSidebar(cfg, pageID);
      if (cfg.modules?.socialButtons) integrateSocial(cfg);
      initializeMobileMenu(cfg, pageID);
    })
    .catch(err => console.error('Не удалось загрузить конфиг меню:', err));
});

function initializeSidebar(config, pageID) {
  const top = document.getElementById('menu-top');
  const bot = document.getElementById('menu-bottom');
  if (!top || !bot) return;
  const items = Array.isArray(config.menuConfig) ? config.menuConfig : [];

  const topItems = items.filter(i =>
    i.position==='top' &&
    Array.isArray(i.showIn) &&
    (i.showIn.map(x=>x.toLowerCase()).includes('default') ||
     i.showIn.map(x=>x.toLowerCase()).includes(pageID))
  );
  const botItems = items.filter(i =>
    i.position==='bottom' &&
    Array.isArray(i.showIn) &&
    (i.showIn.map(x=>x.toLowerCase()).includes('default') ||
     i.showIn.map(x=>x.toLowerCase()).includes(pageID))
  );

  function makeItem(item) {
    const a = document.createElement('a');
    a.href = item.href==='#' ? 'javascript:void(0)' : item.href;
    a.className = 'menu-item';
    a.innerHTML =
      `<img src="${item.icon}" alt="${item.label}">` +
      `<div class="menu-text">${item.label}</div>`;
    return a;
  }

  function makeWithSubmenu(item) {
    const p = document.createElement('a');
    p.href = 'javascript:void(0)';
    p.className = 'menu-item has-submenu';
    p.dataset.key = item.key;
    p.innerHTML =
      `<img src="${item.icon}" alt="${item.label}">` +
      `<div class="menu-text">${item.label}</div>`;
    const arrow = document.createElement('span');
    arrow.className = 'toggle-arrow';
    arrow.innerHTML = '&#9662;';
    p.appendChild(arrow);
    const sub = document.createElement('div');
    sub.className = 'submenu';
    item.submenu.forEach(si=>{
      const sa = document.createElement('a');
      sa.href = si.href==='#'? 'javascript:void(0)' : si.href;
      sa.className = 'submenu-item';
      sa.innerHTML =
        `<img src="${si.icon}" alt="${si.label}">` +
        `<div class="menu-text">${si.label}</div>`;
      sub.appendChild(sa);
    });
    p.addEventListener('click', e=>{
      e.preventDefault();
      const open = sub.classList.toggle('open');
      arrow.classList.toggle('open', open);
      lastOpenedKey = open ? p.dataset.key : null;
    });
    return { parent: p, submenu: sub };
  }

  top.innerHTML = '';
  topItems.forEach(i=>{
    if (i.submenu) {
      const { parent, submenu } = makeWithSubmenu(i);
      top.appendChild(parent);
      top.appendChild(submenu);
    } else top.appendChild(makeItem(i));
  });

  bot.innerHTML = '';
  botItems.forEach(i=>{
    if (i.submenu) {
      const { parent, submenu } = makeWithSubmenu(i);
      bot.appendChild(parent);
      bot.appendChild(submenu);
    } else bot.appendChild(makeItem(i));
  });

  const sidebar = document.getElementById('sidebar');
  sidebar.addEventListener('mouseleave', ()=>{
    sidebar.querySelectorAll('.submenu.open').forEach(s=>s.classList.remove('open'));
    sidebar.querySelectorAll('.toggle-arrow.open').forEach(a=>a.classList.remove('open'));
  });
  sidebar.addEventListener('mouseenter', ()=>{
    if (!lastOpenedKey) return;
    const p = sidebar.querySelector(`.menu-item.has-submenu[data-key="${lastOpenedKey}"]`);
    if (!p) return;
    const arrow = p.querySelector('.toggle-arrow');
    const sub   = p.nextElementSibling;
    sub.classList.add('open');
    arrow.classList.add('open');
  });
}

function initializeMobileMenu(config, pageID) {
  const mobileMain  = document.getElementById('mobile-main');
  const mobileTitle = document.getElementById('mobile-title');

  mobileMain.innerHTML = '';
  config.mobileButtonsKey.forEach(key=>{
    const it = (config.menuConfig||[]).find(i=>i.key===key);
    const a  = document.createElement('a');
    a.href = it?.href || 'javascript:void(0)';
    if (it) {
      const img = document.createElement('img');
      img.src = it.icon; img.alt = it.label;
      a.appendChild(img);
      if (config.visibleText) {
        const span = document.createElement('span');
        span.innerText = it.label;
        a.appendChild(span);
      }
    }
    mobileMain.appendChild(a);
  });

  mobileTitle.innerText = pageID;
}

function integrateSocial(config) {
  (function(topMenuSelector = '#menu-top') {
    let applied = false;
    function applySocialButtons(t188) {
      if (applied) return;
      applied = true;
      const topMenu = document.querySelector(topMenuSelector);
      t188.querySelectorAll('.t-sociallinks__wrapper a').forEach(link=>{
        const label = link.getAttribute('aria-label') || 'Соц.сеть';
        const href  = link.getAttribute('href') || '#';
        let iconHTML = '';
        const img = link.querySelector('img');
        const svg = link.querySelector('svg');
        if (img) {
          iconHTML = `<img src="${img.src}" alt="${label}" style="width:24px;height:24px;object-fit:contain;vertical-align:middle;">`;
        } else if (svg) {
          const clone = svg.cloneNode(true);
          clone.setAttribute('width','24');
          clone.setAttribute('height','24');
          clone.style.verticalAlign = 'middle';
          iconHTML = clone.outerHTML;
        }
        const btn = document.createElement('a');
        btn.href = href;
        btn.className = 'menu-item';
        btn.innerHTML = iconHTML + `<div class="menu-text">${label}</div>`;
        topMenu.appendChild(btn);
      });
    }
    const obs = new MutationObserver((_, o)=>{
      const t188 = document.querySelector('.t188');
      if (t188) { o.disconnect(); applySocialButtons(t188); }
    });
    obs.observe(document.body,{ childList:true, subtree:true });
    const initial = document.querySelector('.t188');
    if (initial) applySocialButtons(initial);
  })();
}
</script>
