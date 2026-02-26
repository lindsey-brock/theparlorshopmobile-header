/* parlor-shop-mobile-header.js */
(() => {
  "use strict";

  // -------------------------
  // CONFIG
  // -------------------------
  const CONFIG = {
    mobileQuery: "(max-width: 768px)",

    // Exact shop pages you listed
    exactPaths: new Set([
      "/category/all-products",
      "/limited-edition",
      "/self-care",
      "/tea-rituals",
      "/apparel-accessories",
      "/apparel",
    ]),

    // Product pages (covers your example /product-page/...)
    productPathRegex: [
      /^\/product-page(\/|$)/,
      /^\/product(\/|$)/,
      /^\/product-details(\/|$)/,
      /\/product\//,
    ],

    // You originally had a fade-on-scroll concept;
    // but per your latest screenshots/request, header should be BLACK always.
    // We'll keep the listener harmlessly, but bg is always opaque.
    scrollTriggerPx: 8,

    loginAdoptTimeoutMs: 12000,
    loginRetryIntervalMs: 350,
    loginObserverIdleMs: 1200,

    // ✅ Your Wix Members Login Bar element id (from your outerHTML)
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
  --parlor-text:#fff;
  --parlor-bg:rgba(10,10,16,0.96);
  --parlor-line:rgba(255,255,255,0.22);
  --parlor-focus:rgba(255,255,255,0.35);

  --header-h:64px;
  --fade-h:26px;
  --btn-size:44px;
}

/* Prevent sideways peeking/scroll */
html, body{ overflow-x:hidden !important; }

/* Reserve space so content doesn't sit under fixed header */
body{ padding-top:var(--header-h)!important; }

/* Sticky header wrapper: NO padding (prevents side gaps) */
#${CONFIG.ids.header}{
  position:fixed;
  top:0; left:0; right:0;
  height:var(--header-h);
  z-index:99999;
  padding:0 !important;
  margin:0 !important;
  display:block;
  pointer-events:none;
}

/* Full-width black strip (always visible) */
#${CONFIG.ids.header} .bg{
  position:absolute;
  inset:0;
  background:var(--parlor-bg) !important;
  opacity:1 !important;
  pointer-events:none;
}

/* Feather below header */
#${CONFIG.ids.header} .bg::after{
  content:"";
  position:absolute;
  left:0; right:0;
  top:var(--header-h);
  height:var(--fade-h);
  background:linear-gradient(to bottom,
    rgba(10,10,16,0.96) 0%,
    rgba(10,10,16,0.90) 75%,
    rgba(10,10,16,0.00) 100%
  );
}

/* Clickable inner row (padding belongs here) */
#${CONFIG.ids.header} .inner{
  position:relative;
  height:100%;
  width:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 14px;
  pointer-events:auto;
}

/* Force everything in header to white (Wix theme overrides) */
#${CONFIG.ids.header},
#${CONFIG.ids.header} *{
  color:#fff !important;
}
#${CONFIG.ids.header} svg,
#${CONFIG.ids.header} svg *{
  fill:#fff !important;
  stroke:#fff !important;
}

/* Hamburger */
#${CONFIG.ids.hamburger}{
  width:var(--btn-size);
  height:var(--btn-size);
  display:grid;
  place-items:center;
  border:0;
  background:transparent !important;
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
  background:#fff !important; /* force white */
  border-radius:2px;
  transition:transform .22s ease, top .22s ease, opacity .18s ease;
}
#${CONFIG.ids.hamburger} .bars span:nth-child(1){ top:0; }
#${CONFIG.ids.hamburger} .bars span:nth-child(2){ top:8px; }
#${CONFIG.ids.hamburger} .bars span:nth-child(3){ top:16px; }
#${CONFIG.ids.hamburger}.is-open .bars span:nth-child(1){ top:8px; transform:rotate(45deg); }
#${CONFIG.ids.hamburger}.is-open .bars span:nth-child(2){ opacity:0; }
#${CONFIG.ids.hamburger}.is-open .bars span:nth-child(3){ top:8px; transform:rotate(-45deg); }

/* Login slot (adopted Wix members bar lives here) */
#${CONFIG.ids.loginSlot}{
  display:flex;
  align-items:center;
  gap:10px;
  z-index:2;
  font-family:var(--parlor-font);
  color:#fff !important;
  position:relative;
}

/* Prevent adopted Wix bar from bringing margins/padding */
#${CONFIG.ids.loginSlot} .wixui-login-social-bar,
#${CONFIG.ids.loginSlot} .login-social-bar{
  margin:0 !important;
  padding:0 !important;
  background:transparent !important;
}

/* Overlay */
#${CONFIG.ids.overlay}{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.35);
  opacity:0;
  pointer-events:none;
  transition:opacity .22s ease;
  z-index:99970;
}
#${CONFIG.ids.overlay}.show{
  opacity:1;
  pointer-events:auto;
}

/* Drawer: FULL SCREEN */
#${CONFIG.ids.drawer}{
  position:fixed;
  top:0; left:0;
  height:100%;
  width:100vw !important;
  max-width:100vw !important;

  background:var(--parlor-bg) !important;
  color:#fff !important;

  transform:translateX(-102%);
  transition:transform .25s ease;
  z-index:99980;

  padding:0 16px 24px;
  overflow-y:auto;
  overflow-x:hidden;
  border-right:none;
  font-family:var(--parlor-font);
}
#${CONFIG.ids.drawer}.open{ transform:translateX(0); }

/* Force everything in drawer to white */
#${CONFIG.ids.drawer},
#${CONFIG.ids.drawer} *{
  color:#fff !important;
}
#${CONFIG.ids.drawer} svg,
#${CONFIG.ids.drawer} svg *{
  fill:#fff !important;
  stroke:#fff !important;
}

/* Top cap inside drawer (so items fade under X area) */
#${CONFIG.ids.drawerTop}{
  position:sticky;
  top:0;
  height:var(--header-h);
  z-index:5;
  background:var(--parlor-bg) !important;
  margin:0 -16px;
}
#${CONFIG.ids.drawerTop}::after{
  content:"";
  position:absolute;
  left:0; right:0;
  top:var(--header-h);
  height:var(--fade-h);
  background:linear-gradient(to bottom,
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
  text-decoration:none;
  display:block;
  width:100%;
  padding:14px 6px;
  font-size:18px;
  letter-spacing:.01em;
  color:#fff !important;
}

#${CONFIG.ids.drawer} .toggle{
  border:0;
  background:transparent !important;
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
  border-right:2px solid #fff !important;
  border-bottom:2px solid #fff !important;
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
  color:rgba(255,255,255,0.78) !important;
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

    // ✅ bg is a DIRECT child of header so it spans edge-to-edge
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
  // Menu open/close + accordions
  // -------------------------
  const wireMenu = ({ overlay, drawer }) => {
    const hamburger = document.getElementById(CONFIG.ids.hamburger);

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeMenu();
    };

    const openMenu = () => {
      hamburger.classList.add("is-open");
      drawer.classList.add("open");
      overlay.classList.add("show");
      hamburger.setAttribute("aria-expanded", "true");
      document.addEventListener("keydown", onKeyDown);
    };

    const closeMenu = () => {
      hamburger.classList.remove("is-open");
      drawer.classList.remove("open");
      overlay.classList.remove("show");
      hamburger.setAttribute("aria-expanded", "false");
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
  };

  // -------------------------
  // Scroll handler (kept, but bg is always opaque)
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
  // ✅ Adopt Wix Members bar by ID (deterministic)
  // -------------------------
  const findWixMembersBar = () => {
    const byId = document.getElementById(CONFIG.wixMembersRootId);
    if (byId) return byId;

    const anyBar = document.querySelector(".wixui-login-social-bar.login-social-bar");
    if (anyBar) return anyBar;

    const handle = document.querySelector('[data-testid="handle-button"][role="button"]');
    if (handle) return handle.closest(".wixui-login-social-bar.login-social-bar") || handle;

    return null;
  };

  const adoptMembersBarIntoSlot = (loginSlotEl) => {
    const bar = findWixMembersBar();
    if (!bar) return false;

    if (bar.id === CONFIG.ids.header || bar.id === CONFIG.ids.drawer) return false;

    bar.style.margin = "0";
    bar.style.padding = "0";
    bar.style.background = "transparent";
    bar.style.position = "static";
    bar.style.zIndex = "2";

    loginSlotEl.innerHTML = "";
    loginSlotEl.appendChild(bar);

    return true;
  };

  const ensureMembersBar = (loginSlotEl) => {
    const start = Date.now();
    let adopted = false;
    let pollTimer = null;
    let mo = null;
    let idleTimer = null;

    const stopAll = () => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
      if (mo) mo.disconnect();
      mo = null;
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = null;
    };

    const failSilently = () => {
      loginSlotEl.style.display = "none";
    };

    const tryAdopt = () => {
      if (adopted) return true;

      if (Date.now() - start > CONFIG.loginAdoptTimeoutMs) {
        stopAll();
        if (!adopted) failSilently();
        return false;
      }

      adopted = adoptMembersBarIntoSlot(loginSlotEl);
      if (adopted) {
        stopAll();
        return true;
      }
      return false;
    };

    tryAdopt();

    mo = new MutationObserver(() => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (!adopted) tryAdopt();
        if (!adopted) stopAll();
      }, CONFIG.loginObserverIdleMs);

      tryAdopt();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    pollTimer = setInterval(tryAdopt, CONFIG.loginRetryIntervalMs);

    setTimeout(() => {
      if (!adopted) {
        stopAll();
        failSilently();
      }
    }, CONFIG.loginAdoptTimeoutMs + 250);
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
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  // Wix SPA-like navigation
  const _pushState = history.pushState;
  history.pushState = function () {
    _pushState.apply(this, arguments);
    setTimeout(init, 60);
  };
  window.addEventListener("popstate", () => setTimeout(init, 60));
})();
