/* ==========================================================================
   Develop & Hack_With_Ai — front-end behaviour
   Vanilla ES2020. No dependencies, no build step.
   Every block guards for its own elements so one file can serve every page.
   ========================================================================== */

(function () {
  "use strict";

  /* ── Config ────────────────────────────────────────────────────────────── */

  // Fixed display rate. Swap for a live rate endpoint when a backend exists.
  var IDR_PER_USD = 16000;

  var STORAGE = {
    theme: "conduit.theme",
    currency: "conduit.currency",
  };

  /* ── Helpers ───────────────────────────────────────────────────────────── */

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) {
      return null;
    }
    return null;
  }

  // 1200 → "1.200" in both currencies: the site follows the reference, which
  // groups thousands with a dot even in USD. Cents only appear when non-zero.
  function group(value) {
    var digits = Math.abs(value) % 1 === 0 ? 0 : 2;
    var parts = value.toFixed(digits).split(".");
    var whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts[1] ? whole + "," + parts[1] : whole;
  }

  function formatPrice(amount, currency) {
    var value = Number(String(amount).replace(/[^0-9.-]/g, ""));
    if (!isFinite(value)) return String(amount);
    if (currency === "IDR") return "Rp " + group(Math.round(value * IDR_PER_USD));
    return "$" + group(value);
  }

  /* ── Theme ─────────────────────────────────────────────────────────────── */

  function initTheme() {
    var buttons = $$("[data-theme-toggle]");
    var root = document.documentElement;

    function current() {
      return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    }

    function paint() {
      var theme = current();
      var next = theme === "dark" ? "light" : "dark";
      buttons.forEach(function (btn) {
        btn.setAttribute("aria-pressed", String(theme === "dark"));
        btn.setAttribute("aria-label", "Switch to " + next + " theme");
        btn.setAttribute("title", "Switch to " + next + " theme");
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = current() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        store(STORAGE.theme, next);
        paint();
      });
    });

    paint();
  }

  /* ── Currency ──────────────────────────────────────────────────────────── */

  function initCurrency() {
    var buttons = $$("[data-currency-toggle]");
    if (!buttons.length) return;

    var prices = $$("[data-price]");
    var currency = store(STORAGE.currency) === "IDR" ? "IDR" : "USD";

    function render() {
      prices.forEach(function (el) {
        var value = el.getAttribute("data-price");
        var suffix = el.getAttribute("data-price-suffix");
        el.textContent = formatPrice(value, currency) + (suffix || "");
      });

      $$("[data-currency-label]").forEach(function (el) {
        el.textContent = currency;
      });

      buttons.forEach(function (btn) {
        var next = currency === "IDR" ? "USD" : "IDR";
        btn.setAttribute("aria-label", "Show prices in " + next);
        btn.setAttribute("title", "Show prices in " + next);
        btn.setAttribute("data-currency", currency);
      });

      window.conduitCurrency = currency;
      document.dispatchEvent(
        new CustomEvent("conduit:currency", { detail: { currency: currency } })
      );
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        currency = currency === "IDR" ? "USD" : "IDR";
        store(STORAGE.currency, currency);
        render();
      });
    });

    // A live rate would call render() again on its own schedule.
    window.conduitFormatPrice = formatPrice;
    render();
  }

  /* ── Mobile navigation ─────────────────────────────────────────────────── */

  function initNav() {
    var toggle = $("[data-nav-toggle]");
    if (!toggle) return;

    var nav = toggle.closest(".nav") || toggle.parentNode;

    function setOpen(open) {
      nav.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    toggle.addEventListener("click", function () {
      setOpen(nav.getAttribute("data-open") !== "true");
    });

    // Any navigation closes the drawer, and so does Escape or a wider window.
    $$(".nav-links a", nav).forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.getAttribute("data-open") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) setOpen(false);
    });
  }

  /* ── Tabs ──────────────────────────────────────────────────────────────── */

  function initTabs() {
    var groups = $$("[data-tabs]");
    if (!groups.length) return;

    groups.forEach(function (group) {
      var tabs = $$('[role="tab"]', group);
      if (!tabs.length) return;

      var panelFor = {};

      function select(tab, focus) {
        tabs.forEach(function (other) {
          var selected = other === tab;
          other.setAttribute("aria-selected", String(selected));
          other.tabIndex = selected ? 0 : -1;
          var panel = panelFor[other.id];
          if (panel) panel.hidden = !selected;
        });
        if (focus) tab.focus();
      }

      tabs.forEach(function (tab) {
        var id = tab.getAttribute("aria-controls");
        panelFor[tab.id] = id ? document.getElementById(id) : null;
        tab.addEventListener("click", function () {
          select(tab, false);
        });
      });

      group.addEventListener("keydown", function (event) {
        var index = tabs.indexOf(document.activeElement);
        if (index === -1) return;

        var next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next === null) return;

        event.preventDefault();
        select(tabs[next], true);
      });

      // A deep link like pricing.html#compare opens that panel.
      var hash = window.location.hash.replace("#", "");
      if (hash) {
        var wanted = tabs.filter(function (tab) {
          var panel = panelFor[tab.id];
          return (
            tab.getAttribute("data-tab") === hash ||
            tab.id === "tab-" + hash ||
            (panel && panel.id === hash)
          );
        })[0];
        if (wanted) select(wanted, false);
      }
    });
  }

  /* ── Copy buttons ──────────────────────────────────────────────────────── */

  function initCopy() {
    var buttons = $$("[data-copy]");
    if (!buttons.length) return;

    function write(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function (resolve, reject) {
        var area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        try {
          document.execCommand("copy");
          resolve();
        } catch (error) {
          reject(error);
        }
        document.body.removeChild(area);
      });
    }

    buttons.forEach(function (button) {
      var target = document.getElementById(button.getAttribute("data-copy"));
      var label = $("[data-copy-text]", button);
      var idle = button.getAttribute("data-copy-label") || "Copy";
      var done = button.getAttribute("data-copied-label") || "Copied";
      var timer = null;

      button.addEventListener("click", function () {
        if (!target) return;
        write(target.innerText.trim()).then(
          function () {
            button.setAttribute("data-copied", "true");
            if (label) label.textContent = done;
            window.clearTimeout(timer);
            timer = window.setTimeout(function () {
              button.removeAttribute("data-copied");
              if (label) label.textContent = idle;
            }, 1800);
          },
          function () {
            if (label) label.textContent = "Press ⌘C";
          }
        );
      });
    });
  }

  /* ── Reveal on scroll ──────────────────────────────────────────────────── */

  function initReveal() {
    var items = $$("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Model catalogue: search and access-tier filters ───────────────────── */

  function initCatalogue() {
    var grid = $("[data-model-grid]");
    if (!grid) return;

    var cards = $$("[data-model-card]", grid);
    var search = $("[data-model-search]");
    var chips = $$("[data-model-filter]");
    var count = $("[data-model-count]");
    var empty = $("[data-model-empty]");
    var active = "all";

    function matches(card, query) {
      if (active !== "all" && card.getAttribute("data-tier") !== active) return false;
      if (!query) return true;
      var haystack = (
        card.getAttribute("data-name") +
        " " +
        card.getAttribute("data-id") +
        " " +
        card.getAttribute("data-provider")
      ).toLowerCase();
      return haystack.indexOf(query) > -1;
    }

    function render() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var shown = 0;

      cards.forEach(function (card) {
        var visible = matches(card, query);
        card.hidden = !visible;
        if (visible) shown++;
      });

      if (count) {
        count.textContent =
          shown + " of " + cards.length + " model" + (cards.length === 1 ? "" : "s") + " shown";
      }
      if (empty) empty.hidden = shown !== 0;
    }

    // ?access=ultron preselects a tier, so the home chips and plan cards can
    // deep-link. ?provider= is still honoured for old links, dropped if unknown.
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get("access") || params.get("provider");
    if (
      wanted &&
      chips.some(function (chip) {
        return chip.getAttribute("data-model-filter") === wanted;
      })
    ) {
      active = wanted;
      chips.forEach(function (chip) {
        chip.setAttribute(
          "aria-pressed",
          String(chip.getAttribute("data-model-filter") === active)
        );
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        active = chip.getAttribute("data-model-filter");
        chips.forEach(function (other) {
          other.setAttribute("aria-pressed", String(other === chip));
        });
        render();
      });
    });

    if (search) {
      search.addEventListener("input", render);

      // "/" jumps to the search box, Escape clears it — both only while the
      // keystroke is not already going into a field.
      document.addEventListener("keydown", function (event) {
        var tag = (event.target.tagName || "").toLowerCase();
        var typing = tag === "input" || tag === "textarea" || event.target.isContentEditable;

        if (event.key === "/" && !typing) {
          event.preventDefault();
          search.focus();
        }
        if (event.key === "Escape" && event.target === search && search.value) {
          search.value = "";
          render();
        }
      });
    }

    render();
  }

  /* ── Checkout: product picker with live order summary ──────────────────── */

  function initCheckout() {
    var form = $("[data-checkout]");
    if (!form) return;

    var products = $$('input[name="product"]', form);
    var fields = {
      name: $("[data-summary-name]", form),
      models: $("[data-summary-models]", form),
      parallel: $("[data-summary-parallel]", form),
      validity: $("[data-summary-validity]", form),
      total: $("[data-summary-total]", form),
    };

    function currency() {
      return window.conduitCurrency || (store(STORAGE.currency) === "IDR" ? "IDR" : "USD");
    }

    function render() {
      var product = products.filter(function (input) {
        return input.checked;
      })[0];
      if (!product) return;

      var data = product.dataset;
      if (fields.name) fields.name.textContent = data.name || "";
      if (fields.models) fields.models.textContent = data.models || "";
      if (fields.parallel) fields.parallel.textContent = data.parallel || "";
      if (fields.validity) fields.validity.textContent = data.validity || "";
      if (fields.total) {
        // The total carries data-price so the currency toggle can find it too.
        fields.total.setAttribute("data-price", data.amount || "0");
        fields.total.textContent = formatPrice(data.amount, currency());
      }
      form.setAttribute("data-selected", product.value);
    }

    products.forEach(function (radio) {
      radio.addEventListener("change", render);
    });

    // checkout.html#ultron (linked from the plan cards) picks that product.
    var hash = window.location.hash.replace("#", "");
    if (hash) {
      var chosen = products.filter(function (input) {
        var label = input.closest(".checkout-option");
        return label && label.id === hash;
      })[0];
      if (chosen) chosen.checked = true;
    }

    document.addEventListener("conduit:currency", render);
    render();
  }

  /* ── Docs: scroll spy ──────────────────────────────────────────────────── */

  function initScrollSpy() {
    var nav = $("[data-spy]");
    if (!nav || !("IntersectionObserver" in window)) return;

    var links = $$('a[href^="#"]', nav);
    var sections = links
      .map(function (link) {
        return document.getElementById(link.getAttribute("href").slice(1));
      })
      .filter(Boolean);
    if (!sections.length) return;

    function mark(id) {
      links.forEach(function (link) {
        var on = link.getAttribute("href") === "#" + id;
        if (on) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        var visible = entries
          .filter(function (entry) {
            return entry.isIntersecting;
          })
          .sort(function (a, b) {
            return a.boundingClientRect.top - b.boundingClientRect.top;
          });
        if (visible.length) mark(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ── Footer year ───────────────────────────────────────────────────────── */

  function initYear() {
    var year = String(new Date().getFullYear());
    $$("[data-year]").forEach(function (el) {
      el.textContent = year;
    });
  }

  /* ── Boot ──────────────────────────────────────────────────────────────── */

  function boot() {
    initTheme();
    initCurrency();
    initNav();
    initTabs();
    initCopy();
    initReveal();
    initCatalogue();
    initCheckout();
    initScrollSpy();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
