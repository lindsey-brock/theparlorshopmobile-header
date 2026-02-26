/* parlor-shop-mobile-header.js */
(() => {
  "use strict";

  // -------------------------
  // CONFIG
  // -------------------------
  const CONFIG = {
    mobileQuery: "(max-width: 768px)",

    exactPaths: new Set([
      "/category/all-products",
      "/limited-edition",
      "/self-care",
      "/tea-rituals",
      "/apparel-accessories",
      "/apparel",
    ]),

    productPathRegex: [
      /^\/product-page(\/|$)/,
      /^\/product(\/|$)/,
      /^\/product-details(\/|$)/,
      /\/product\//,
    ],

    scrollTriggerPx: 8,

    loginAdoptTimeoutMs: 12000,
    loginRetryIntervalMs: 350,

    // ✅ Your Wix Members/Login bar ROOT id (from the HTML you pasted)
    wixMembersRootId: "comp-mlwaz3zu",

    ids: {
      header: "parlorStickyHeader",
      overlay: "parlorOverlay",
      drawer: "parlorDrawer",
      drawerTop: "parlorDrawerTop",
      hamburger: "parlorHamburger",
      loginSlot: "parlorLoginSlot",
      style: "parlorStickyHeaderStyles",
    },
  };

  // -------------------------
  // Guards
  // -------------------------
  const isMobile = () =>
    typeof window.matchMedia === "function" &&
    window.matchMedia(CONFIG.mobileQuery).matches;

  const normalizePath = () => (location.pathname || "").replace(/\/+$/, "") || "/";

  const isProductPage = (path) =>
    CONFIG.productPathRegex.some((rx) => rx.test(path));

  const shouldRunHere = () => {
    if (!isMobile()) return false;
    const path = normalizePath();
    return CONFIG.exactPaths.has(path) || isProductPage(path);
  };

  const alreadyMounted = () => document.getElementById(CONFIG.ids.header);

  if (!shouldRunHere() || alreadyMounted()) return;

  // -------------------------
  // CSS
  // -------------------------
  const injectCSS = () => {
    if (document.getElementById(CONFIG.ids.style)) return;

    const css = `
:root{
  --parlor-font:"thermal-variable",ui-serif,serif;

  /* FORCE true black UI */
  --parlor-text:#fff;
  --parlor-bg:#0a0a10;

  --parlor-line:rgba(255,255,255,0.22);
  --parlor-focus:rgba(255,255,255,0.35);

  --header-h:64px;
  --fade-h:26px;
  --btn-size:44px;
}

/* Make sure the page can’t introduce side gaps */
html,body{ width:100%; max-width:100%; overflow-x:hidden; }

/* Reserve space so content doesn't sit under fixed header */
body{ padding-top:var(--header-h)!important; }

/* Optional lock when menu open */
body.parlor-lock{
  overflow:hidden!important;
  position:fixed!important;
  width:100%!important;
}

/* Sticky header wrapper (TRUE full-width) */
#${CONFIG.ids.header}{
  position:fixed;
  top:0; left:0;
  width:100vw;
  height:var(--header-h);
  z-index:99999;
  display:flex;
  align-items:center;
  justify-content:space-between;

  /* important: no transparency here */
  pointer-events:none;
}

/* Background strip: ALWAYS BLACK */
#${CONFIG.ids.header} .bg{
  position:absolute;
  inset:0;
  background:var(--parlor-bg)!important;
  opacity:1!important;
  pointer-events:none;
}

/* Feather ONLY after scroll */
#${CONFIG.ids.header} .bg::after{
  content:"";
  position:absolute;
  left:0; right:0;
  top:var(--header-h);
  height:var(--fade-h);

  /* start hidden */
  opacity:0;
  transition:opacity .18s ease;

  background:linear-gradient(
    to bottom,
    rgba(10,10,16,0.96) 0%,
    rgba(10,10,16,0.90) 75%,
    rgba(10,10,16,0.00) 100%
  );
}
#${CONFIG.ids.header}.scrolled .bg::after{ opacity:1; }

/* Clickable inner (pad the content, not the bg) */
#${CONFIG.ids.header} .inner{
  width:100%;
  height:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 14px;
  pointer-events:auto;
  position:relative;
}

/* Hamburger (WHITE) */
#${CONFIG.ids.hamburger}{
  width:var(--btn-size);
  height:var(--btn-size);
  display:grid;
  place-items:center;
  border:0;
  background:transparent!important;
  cursor:pointer;
  -webkit-tap-highlight-color:transparent;
  z-index:2;
}
#${CONFIG.ids.hamburger}:focus-visible{
  outline:2px solid var(--parlor-focus);
  outline-offset:4px;
  border-radius:10px;
}
#${CONFIG.ids.hamburger} .bars{ width:26px; height:18px; position:relative; }
#${CONFIG.ids.hamburger} .bars span{
  position:absolute; left:0; right:0;
  height:2px;
  background:var(--parlor-text)!important;
  border-radius:2px;
  transition:transform .22s ease, top .22s ease, opacity .18s ease;
}
#${CONFIG.ids.hamburger} .bars span:nth-child(1){ top:0; }
#${CONFIG.ids.hamburger} .bars span:nth-child(2){ top:8px; }
#${CONFIG.ids.hamburger} .bars span:nth-child(3){ top:16px; }
#${CONFIG.ids.hamburger}.is-open .bars span:nth-child(1){ top:8px; transform:rotate(45deg); }
#${CONFIG.ids.hamburger}.is-open .bars span:nth-child(2){ opacity:0; }
#${CONFIG.ids.hamburger}.is-open .bars span:nth-child(3){ top:8px; transform:rotate(-45deg); }

/* Login slot */
#${CONFIG.ids.loginSlot}{
  display:flex;
  align-items:center;
  gap:10px;
  z-index:2;
  font-family:var(--parlor-font);
  color:var(--parlor-text);
  position:relative;
}

/* Force adopted Wix members UI to be white (icons/text) */
#${CONFIG.ids.loginSlot} *{
  color:var(--parlor-text)!important;
}
#${CONFIG.ids.loginSlot} svg,
#${CONFIG.ids.loginSlot} path{
  fill:var(--parlor-text)!important;
  stroke:var(--parlor-text)!important;
}

/* Overlay */
#${CONFIG.ids.overlay}{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.45);
  opacity:0;
  pointer-events:none;
  transition:opacity .22s ease;
  z-index:99970;
}
#${CONFIG.ids.overlay}.show{
  opacity:1;
  pointer-events:auto;
}

/* Drawer: FULL SCREEN, BLACK, NO GAPS */
#${CONFIG.ids.drawer}{
  position:fixed;
  top:0; left:0;
  width:100vw;
  height:100vh;
  max-width:100vw;
  background:var(--parlor-bg)!important;
  color:var(--parlor-text)!important;
  transform:translateX(-100%);
  transition:transform .25s ease;
  z-index:99980;
  padding:0 16px 24px;
  overflow-y:auto;
  overflow-x:hidden;
  font-family:var(--parlor-font);
}
#${CONFIG.ids.drawer}.open{ transform:translateX(0); }

/* Top cap inside drawer */
#${CONFIG.ids.drawerTop}{
  position:sticky;
  top:0;
  height:var(--header-h);
  z-index:5;
  background:var(--parlor-bg)!important;
  margin:0 -16px;
}
#${CONFIG.ids.drawerTop}::after{
  content:"";
  position:absolute;
  left:0; right:0;
  top:var(--header-h);
  height:var(--fade-h);
  background:linear-gradient(
    to bottom,
    rgba(10,10,16,0.96) 0%,
    rgba(10,10,16,0.90) 75%,
    rgba(10,10,16,0.00) 100%
  );
  pointer-events:none;
}

/* Drawer menu styles */
#${CONFIG.ids.drawer} nav{ margin-top:6px; }
#${CONFIG.ids.drawer} .menu,
#${CONFIG.ids.drawer} .submenu{ list-style:none; margin:0; padding:0; }
#${CONFIG.ids.drawer} .menu>li{ border-bottom:1px solid var(--parlor-line); }

#${CONFIG.ids.drawer} .row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  padding:14px 6px;
  font-size:18px;
  letter-spacing:.01em;
}

#${CONFIG.ids.drawer} a.link{
  color:var(--parlor-text)!important;
  text-decoration:none;
  display:block;
  width:100%;
  padding:14px 6px;
  font-size:18px;
  letter-spacing:.01em;
}

#${CONFIG.ids.drawer} .toggle{
  border:0;
  background:transparent!important;
  color:var(--parlor-text)!important;
  cursor:pointer;
  padding:10px 10px;
  border-radius:10px;
  display:grid;
  place-items:center;
  flex:0 0 auto;
}

#${CONFIG.ids.drawer} .chev{
  width:14px;
  height:14px;
  border-right:2px solid var(--parlor-text);
  border-bottom:2px solid var(--parlor-text);
  transform:rotate(45deg);
  transition:transform .2s ease;
  margin-top:-2px;
}
#${CONFIG.ids.drawer} .expanded .chev{
  transform:rotate(-135deg);
  margin-top:2px;
}

#${CONFIG.ids.drawer} .submenu-wrap{
  max-height:0;
  overflow:hidden;
  transition:max-height .25s ease;
}
#${CONFIG.ids.drawer} .submenu{
  padding:6px 0 12px 14px;
}
#${CONFIG.ids.drawer} .submenu li a{
  display:block;
  padding:10px 6px;
  font-size:16px;
  color:rgba(255,255,255,0.78)!important;
  text-decoration:none;
}
    `.trim();

    const style = document.createElement("style");
    style.id = CONFIG.ids.style;
    style.textContent = css;
    document.head.appendChild(style);
  };

  // -------------------------
  // HTML injection
  // -------------------------
  const injectHTML = () => {
    const header = document.createElement("div");
    header.id = CONFIG.ids.header;
    header.innerHTML = `
      <div class="bg" aria-hidden="true"></div>
      <div class="inner">
        <button id="${CONFIG.ids.hamburger}" aria-label="Open menu" aria-controls="${CONFIG.ids.drawer}" aria-expanded="false">
          <div class="bars" aria-hidden="true"><span></span><span></span><span></span></div>
        </button>
        <div id="${CONFIG.ids.loginSlot}" aria-label="Account"></div>
      </div>
    `.trim();

    const overlay = document.createElement("div");
    overlay.id = CONFIG.ids.overlay;
    overlay.setAttribute("aria-hidden", "true");

    const drawer = document.createElement("aside");
    drawer.id = CONFIG.ids.drawer;
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", "Site menu");

    drawer.innerHTML = `
      <div id="${CONFIG.ids.drawerTop}" aria-hidden="true"></div>
      <nav aria-label="Primary">
        <ul class="menu">
          <li><a class="link" href="/home">Home</a></li>
          <li><a class="link" href="/limited-edition">Limited Edition</a></li>

          <li class="accordion" data-acc>
            <div class="row">
              <a class="link" href="/self-care" style="padding:0; flex:1;">Self Care</a>
              <button class="toggle" type="button" aria-label="Toggle Self Care submenu" aria-expanded="false">
                <span class="chev" aria-hidden="true"></span>
              </button>
            </div>
            <div class="submenu-wrap" aria-hidden="true">
              <ul class="submenu">
                <li><a href="/self-care/soap">Soap</a></li>
                <li><a href="/self-care/facewash">Facewash</a></li>
                <li><a href="/self-care/facemasks">Facemasks</a></li>
                <li><a href="/self-care/scrubs">Scrubs</a></li>
                <li><a href="/self-care/body-butter">Body Butter</a></li>
                <li><a href="/self-care/bath-bombs">Bath Bombs</a></li>
              </ul>
            </div>
          </li>

          <li class="accordion" data-acc>
            <div class="row">
              <a class="link" href="/tea-rituals" style="padding:0; flex:1;">Tea &amp; Rituals</a>
              <button class="toggle" type="button" aria-label="Toggle Tea & Rituals submenu" aria-expanded="false">
                <span class="chev" aria-hidden="true"></span>
              </button>
            </div>
            <div class="submenu-wrap" aria-hidden="true">
              <ul class="submenu">
                <li><a href="/tea-rituals/tea">Tea</a></li>
                <li><a href="/tea-rituals/mugs">Mugs</a></li>
                <li><a href="/tea-rituals/tea-sets">Teasets</a></li>
                <li><a href="/tea-rituals/coasters">Coasters</a></li>
                <li><a href="/tea-rituals/candles">Candles</a></li>
                <li><a href="/tea-rituals/sage">Sage</a></li>
              </ul>
            </div>
          </li>

          <li class="accordion" data-acc>
            <div class="row">
              <a class="link" href="/apparel-accessories" style="padding:0; flex:1;">Apparel &amp; Accessories</a>
              <button class="toggle" type="button" aria-label="Toggle Apparel & Accessories submenu" aria-expanded="false">
                <span class="chev" aria-hidden="true"></span>
              </button>
            </div>
            <div class="submenu-wrap" aria-hidden="true">
              <ul class="submenu">
                <li><a href="/apparel-accessories/tote-bags">Tote Bags</a></li>
                <li><a href="/apparel-accessories/t-shirts">T-Shirts</a></li>
                <li><a href="/apparel-accessories/neck-gaiters-scarves">Neck Gaiters &amp; Scarves</a></li>
                <li><a href="/apparel-accessories/athletic-wear">Athletic Wear</a></li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>
    `.trim();

    document.body.appendChild(header);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    return { header, overlay, drawer };
  };

  // -------------------------
  // Hide duplicate Wix members bars outside our header
  // (Wix sometimes re-renders a fresh one after we move it)
  // -------------------------
  const suppressDuplicateMembersBars = () => {
    const header = document.getElementById(CONFIG.ids.header);
    if (!header) return;

    const bars = Array.from(document.querySelectorAll(".wixui-login-social-bar.login-social-bar"));
    bars.forEach((bar) => {
      const insideHeader = header.contains(bar);
      if (!insideHeader) {
        bar.style.display = "none";
        bar.setAttribute("data-parlor-suppressed", "1");
      }
    });
  };

  // -------------------------
  // Menu open/close + accordions
  // -------------------------
  const wireMenu = ({ overlay, drawer }) => {
    const hamburger = document.getElementById(CONFIG.ids.hamburger);

    let lockedScrollY = 0;

    const lockBody = () => {
      lockedScrollY = window.scrollY || 0;
      document.body.classList.add("parlor-lock");
      document.body.style.top = `-${lockedScrollY}px`;
    };

    const unlockBody = () => {
      document.body.classList.remove("parlor-lock");
      const top = document.body.style.top;
      document.body.style.top = "";
      const y = top ? Math.abs(parseInt(top, 10)) : lockedScrollY;
      window.scrollTo(0, y || 0);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeMenu();
    };

    const openMenu = () => {
      hamburger.classList.add("is-open");
      drawer.classList.add("open");
      overlay.classList.add("show");
      hamburger.setAttribute("aria-expanded", "true");
      lockBody();
      document.addEventListener("keydown", onKeyDown);
    };

    const closeMenu = () => {
      hamburger.classList.remove("is-open");
      drawer.classList.remove("open");
      overlay.classList.remove("show");
      hamburger.setAttribute("aria-expanded", "false");
      unlockBody();
      document.removeEventListener("keydown", onKeyDown);
    };

    hamburger.addEventListener("click", () => {
      drawer.classList.contains("open") ? closeMenu() : openMenu();
    });

    overlay.addEventListener("click", closeMenu);

    drawer.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) closeMenu();
    });

    const accordions = Array.from(drawer.querySelectorAll("[data-acc]"));
    accordions.forEach((acc) => {
      const toggle = acc.querySelector(".toggle");
      const wrap = acc.querySelector(".submenu-wrap");
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        acc.classList.toggle("expanded", !expanded);
        if (!expanded) {
          wrap.style.maxHeight = wrap.scrollHeight + "px";
          wrap.setAttribute("aria-hidden", "false");
        } else {
          wrap.style.maxHeight = "0px";
          wrap.setAttribute("aria-hidden", "true");
        }
      });
    });

    return { closeMenu };
  };

  // -------------------------
  // Scroll feather enable
  // -------------------------
  const wireScrollFade = (headerEl) => {
    const onScroll = () => {
      if (window.scrollY > CONFIG.scrollTriggerPx) headerEl.classList.add("scrolled");
      else headerEl.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  };

  // -------------------------
  // Adopt Wix Members bar by ID (MOVE the real element)
  // -------------------------
  const findWixMembersBar = () => {
    const byId = document.getElementById(CONFIG.wixMembersRootId);
    if (byId) return byId;

    const anyBar = document.querySelector(".wixui-login-social-bar.login-social-bar:not([data-parlor-suppressed='1'])");
    if (anyBar) return anyBar;

    return null;
  };

  const adoptMembersBarIntoSlot = (loginSlotEl) => {
    const bar = findWixMembersBar();
    if (!bar) return false;

    // If it’s already inside our header, great.
    const header = document.getElementById(CONFIG.ids.header);
    if (header && header.contains(bar)) return true;

    // Move the entire bar node
    bar.style.margin = "0";
    bar.style.padding = "0";
    bar.style.background = "transparent";
    bar.style.position = "static";
    bar.style.zIndex = "2";

    loginSlotEl.innerHTML = "";
    loginSlotEl.appendChild(bar);

    // After moving, hide any re-rendered duplicates elsewhere
    suppressDuplicateMembersBars();

    return true;
  };

  const ensureMembersBar = (loginSlotEl) => {
    const start = Date.now();
    let adopted = false;

    const tryAdopt = () => {
      if (adopted) return true;

      adopted = adoptMembersBarIntoSlot(loginSlotEl);
      if (adopted) return true;

      if (Date.now() - start > CONFIG.loginAdoptTimeoutMs) {
        // If we can’t find it, just hide the slot (per your request: no fallback link)
        loginSlotEl.style.display = "none";
        return false;
      }
      return false;
    };

    // Poll because Wix renders late and may re-render after move
    const t = setInterval(() => {
      const ok = tryAdopt();
      suppressDuplicateMembersBars();
      if (ok || Date.now() - start > CONFIG.loginAdoptTimeoutMs) clearInterval(t);
    }, CONFIG.loginRetryIntervalMs);

    // Immediate attempt
    tryAdopt();
  };

  // -------------------------
  // Init
  // -------------------------
  const init = () => {
    if (!shouldRunHere()) return;
    if (alreadyMounted()) return;

    injectCSS();
    const els = injectHTML();
    wireMenu(els);
    wireScrollFade(els.header);

    const loginSlot = document.getElementById(CONFIG.ids.loginSlot);
    if (loginSlot) ensureMembersBar(loginSlot);

    // One more suppression pass
    setTimeout(suppressDuplicateMembersBars, 1200);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  // SPA-ish nav safeguard
  const _pushState = history.pushState;
  history.pushState = function () {
    _pushState.apply(this, arguments);
    setTimeout(init, 80);
  };
  window.addEventListener("popstate", () => setTimeout(init, 80));
})();
