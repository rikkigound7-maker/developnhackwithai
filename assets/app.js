/* ==========================================================================
   Develop & Hack_With_Ai — front-end behaviour
   Vanilla ES2020. No dependencies, no build step.
   Every block guards for its own elements so one file can serve every page.
   ========================================================================== */

(function () {
  "use strict";

  /* ── Config ────────────────────────────────────────────────────────────── */

  // Fixed display rate for the USD ⇄ INR toggle. Rupees are a convenience on
  // screen only: every order is still charged in dollars, so swap this for a
  // live rate when a backend exists.
  var INR_PER_USD = 95;

  var STORAGE = {
    theme: "conduit.theme",
    currency: "conduit.currency",
    tos: "conduit.tos",
  };

  // Terms gate version. Bump when the terms change so every visitor sees
  // the gate again. TOS_SECTIONS is the full document shown in the dialog.
  var TOS_VERSION = "4.1";
  var TOS_SECTIONS = [
    {
      h: "1. LICENCE: ONE KEY, ONE PERSON",
      body: [
        ["li", "Every subscription key (Pro, Max, Ultron) is a personal licence for 1 (one) human user."],
        ["li", "A Token Plan and a pay-per-use balance may be shared, because both are metered per token."],
        ["li", "You may use it on your own personal devices (home PC, office PC, laptop, phone) and in any coding client."],
        ["li", "The key is a secret. A leaked key, and every request made with it, remains the key holder responsibility."],
      ],
    },
    {
      h: "2. PERSONAL GATEWAYS ARE FULLY ALLOWED",
      body: [
        ["li", "Running the key through 9Router, LiteLLM, One-API or any similar gateway on your own device or network is 100 percent allowed."],
        ["li", "What is forbidden is running a subscription key on a multi-tenant gateway serving more than one person, sharing it, or reselling it."],
      ],
    },
    {
      h: "3. PROHIBITED CONDUCT",
      body: [
        ["li", "Sharing, renting or reselling access to a subscription key without an official Partner licence."],
        ["li", "Installing a subscription key on a public proxy, a reseller VPS, or any shared service that serves multiple users."],
        ["li", "Mass automation that harms infrastructure stability, including a broken script retrying without end."],
        ["li", "Using the service for unlawful purposes. You are responsible for everything you send and everything the model returns."],
        ["li", "Probing, mapping or reverse engineering our systems, quotas and billing mechanisms."],
        ["li", "Sending data you are not entitled to send, including other people personal data or data under a confidentiality obligation."],
        ["li", "Presenting yourself as Develop & Hack_With_Ai, or implying an official relationship with us, without a Partner licence."],
      ],
    },
    {
      h: "4. THE SERVICE IS PROVIDED AS IS",
      body: [
        ["li", "Develop & Hack_With_Ai is a gateway to third-party model providers. We do not own, control or guarantee the models behind it."],
        ["li", "There is no uptime guarantee, no SLA, no promised speed, and no guarantee that any particular model stays available."],
        ["li", "The model catalogue, routing, capacity and output quality may change at any time without notice, including a model being withdrawn or paused by the upstream provider."],
        ["li", "Outages, errors, queueing, slowness, streams cut mid-answer and maintenance are normal risks of a gateway service."],
        ["li", "Do not rely on this service alone for systems that must not fail, such as life-safety, medical or critical financial systems."],
        ["li", "Your request may be routed to backup capacity at any time so that it still gets answered. No specific path is guaranteed."],
        ["li", "Model output is generated automatically and can be wrong. Verify it yourself before use; the risk of relying on output is yours."],
        ["li", "We may limit, maintain, slow down or discontinue the service at any time, including without notice. Unused remaining time is not converted into money."],
      ],
    },
    {
      h: "5. NO REFUNDS (READ THIS SECTION)",
      body: [
        ["li", "All purchases are FINAL. Cancellation, exchange for money and refunds, whether full, partial or pro rata, do not apply once a key or balance has been delivered."],
        ["li", "DISRUPTIONS ARE NOT REFUNDABLE. Downtime, errors, failed connections, truncated answers, slowness, queueing, timeouts and maintenance create no right to a refund, compensation, credit or extension of time. A service that stops completely or permanently creates no such right either."],
        ["li", "UPSTREAM CHANGES ARE NOT REFUNDABLE. A model being withdrawn, paused, replaced, or changing in quality, speed or capacity is not a ground for a refund."],
        ["li", "FAIR-USE ENFORCEMENT IS NOT REFUNDABLE. RPM pacing, parallel-session queueing and the limits of a trial or legacy key are the published behaviour of the service, not a defective product."],
        ["li", "NOT REFUNDABLE: unused remaining subscription time, leftover tokens, a lapsed Token Plan, Custom Token or Custom Token Premium, an expired key, a key you rarely used, a wrong purchase after the key has been used, and a change of mind."],
        ["li", "A key revoked for breaching these terms receives neither a refund nor a replacement key."],
        ["li", "Partner balance, wholesale key batches and any add-on already activated cannot be converted back into money either."],
        ["li", "ONLY THE THREE CASES BELOW ARE CORRECTED. Two of them are settled with a PRODUCT rather than money, and none of them is compensation for a disruption."],
        ["li", "First, a double payment for the same order: the extra payment is returned."],
        ["li", "Second, payment received but the product was never delivered: we deliver the product. If that product no longer exists, we substitute another product or a credit of equal value."],
        ["li", "Third, the wrong product was delivered and has not been used at all: we swap it for the correct one."],
        ["p", "File any of the three through our Telegram support within 7 days of the payment date, with proof of payment and the order number. After that window a request is not processed."],
        ["li", "The remedy is chosen by Develop & Hack_With_Ai: delivery of the product, a replacement product, or a credit of equal value. Money moves in one case only, the excess of a double payment."],
        ["p", "For the excess of a double payment: payment-gateway fees, transfer costs and exchange-rate differences are not returned; the return is paid to the original payment method."],
        ["p", "A payment sent to the wrong UPI ID or the wrong account, in the wrong amount, or without a verifiable transaction reference cannot be recovered and is not refunded."],
        ["p", "Every request is reviewed manually and the Develop & Hack_With_Ai decision is final."],
        ["p", "Reversing a payment through your bank or payment provider results in permanent revocation without refund and a block from every service."],
      ],
    },
    {
      h: "6. FAIR USE",
      body: [
        ["li", "A subscription has no token limit. Its limits are the RPM, the same for every level, and the parallel sessions, which differ per level (Pro, Max, Ultron); both are published on the Plans page."],
        ["li", "A request past the RPM is held and one past the parallel sessions is queued, and refused only if the wait runs too long. Heavy use never revokes a key."],
        ["li", "RPM and sessions can be added per key through our Telegram until the key's period ends."],
        ["li", "A Token Plan, Custom Token or Custom Token Premium lapses 30 days after delivery; its unused tokens lapse with it. A pay-per-use balance never expires."],
        ["li", "Since version 4.0, the RPM limit applies to every live subscription key; rotating a key does not reset its RPM or sessions."],
      ],
    },
    {
      h: "7. REVOCATION AND APPEALS",
      body: [
        ["li", "We monitor server traffic telemetry to protect honest users. The monitoring method is confidential."],
        ["li", "A key proven to be multi-tenant or resold without a Partner licence is revoked instantly and without refund."],
        ["li", "We may suspend a key while an investigation is under way, without prior notice, where abuse is indicated."],
        ["li", "Believe a revocation was wrong? File an appeal through our Telegram support. An accepted appeal reactivates the key automatically; a rejection is final and states its reason."],
        ["li", "Time lost while a key is suspended or under review is not replaced, not extended and creates no compensation, including where the appeal succeeds."],
      ],
    },
    {
      h: "8. PARTNERS AND RESELLING",
      body: [
        ["li", "Reselling is allowed only as an official Partner through our Telegram. Partner status begins when the first payment clears."],
        ["li", "A Partner is fully responsible for their own customers, including support, billing, any promise the Partner makes, and their compliance with these terms."],
        ["li", "A Partner indemnifies Develop & Hack_With_Ai against claims by the Partner customers. Those customers are not parties to this agreement and have no direct claim against us."],
        ["li", "Wholesale prices, discount levels and partnership conditions may change at any time for subsequent purchases."],
        ["li", "Partner balance can only be spent on Develop & Hack_With_Ai products, bears no interest, is not transferable, and cannot be withdrawn as cash."],
      ],
    },
    {
      h: "9. DATA AND PRIVACY",
      body: [
        ["li", "We store the usage metadata required for billing, quota and abuse prevention, such as timestamps, token counts, model and technical connection signals."],
        ["p", "A purchase asks for billing details: your name, email, phone number and billing address. They are passed to the payment processor to process and verify the payment, stored with the order as the transaction record, and used to contact you about the order. They are never used for advertising."],
        ["p", "Card details are entered on the payment provider's page, never pass through our servers, and are not stored by us."],
        ["p", "Requests to access, correct or delete personal data can be sent through our Telegram support. Data we are still required to keep for billing and compliance is kept for as long as that obligation lasts."],
        ["p", "Conversation content is forwarded to third-party model providers so that your request can be answered, and is subject to those providers policies. We do not guarantee confidentiality on their side."],
        ["p", "The free tier relays requests through upstream infrastructure and accounts that are not ours and not an official provider path. Upstream may treat this pattern as a third-party client, with the risk of disruption, throttling, or seat account bans that affect the service."],
        ["p", "To keep the service free, conversation text is used to pick ads through these three recipients and no others. One, gravity as the ad auction provider. Two, zeroclick.dev as the third-party impression recorder. Three, our first party path at api ads for creatives we serve ourselves."],
        ["p", "Only user and assistant conversation text is sent for the ad auction. System instruction turns are dropped, and tool calls, tool names and images never ride along. Device data in the form of operating system, timezone and locale travels with it, together with the user agent marker."],
        ["p", "Since 2026-10-04 the ad auction also carries client context as categories, never raw numbers. It has seven parts. One, the machine that runs your request, as categories for operating system version, architecture, memory range, uptime range, load level, free memory, core count, processor family and free disk range. Two, the network, as the duration range of the previous ad request and how many of them failed. Three, the application, as process uptime range, install age range, release channel, install method and runtime version. Four, the primary interface language. Five, the session, as the range of your conversation turn number, the range of ads already shown, and the time range since the last ad or click. Six, the agent, as the agent root name, the upstream model, the reasoning level and the mode. Seven, the work, as the range of your queue position, the CATEGORY of the last tool the agent used, the CLASS of the last error, and the range of failed turns in the past hour. Those categories and classes are computed on our side from your own conversation: the tool name and the error text are NEVER sent, only the category. No terminal size, no typing rhythm, no command text and no raw value of any kind is sent. Advertisers use all of it only as ad selection features; it decides nothing about your billing, quota or eligibility."],
        ["p", "The ad auction runs only while the customer portal tab is visible and the ad card is on your screen. A view is recorded once per creative only when the card actually enters the viewport, and a click only when you click the ad. With no visible slot, there is no auction."],
        ["p", "A declined telemetry event is not a declined ad. Inline ad slot events in our telemetry are declined and never sent because they have no trigger here, while the ad auction request on the ads rail is still sent under the trigger above. The two are recorded separately."],
        ["p", "Sponsored runs are never executed. Where an ad carries an advertiser authored procedure, we block its execution on our side until a sandbox and a buyer consent flow exist. Accepting an offer at the protocol level runs nothing on your device or your data."],
        ["p", "We do not sell customer data. Data may be disclosed where required by applicable law, and is retained for as long as billing, abuse prevention and compliance require."],
        ["li", "Develop & Hack_With_Ai server records are the binding evidence of usage, quota, timing and order status in the event of a disagreement."],
      ],
    },
    {
      h: "10. CHANGES, FORCE MAJEURE AND LAW",
      body: [
        ["li", "Prices, plans, the model catalogue and these terms may change at any time. The version shown on the Terms page is the one in force."],
        ["li", "Continuing to use the service after a change means you accept the new terms."],
        ["li", "We are not liable for failures caused by events beyond our control, including upstream provider outages, network failures, power cuts, third-party policy changes, government action and disasters."],
        ["li", "Develop & Hack_With_Ai is not liable for indirect loss of any kind: lost profit, lost data, business interruption, the cost of a substitute service, or loss arising from model output."],
        ["li", "Our maximum liability for all claims combined does not exceed the amount you paid for the product concerned in the last 30 days."],
        ["li", "The buyer confirms they are legally capable of entering this agreement. Any tax or levy on the buyer side is the buyer responsibility."],
        ["li", "A notice sent to the Telegram account used to purchase is deemed received. Keeping access to that account is your responsibility."],
        ["li", "You may not transfer this licence without our written consent. We may assign this agreement if the service changes hands."],
        ["li", "If any provision here is held invalid, the rest remains in full force. Not enforcing a right on one occasion is not a waiver of it."],
        ["li", "These terms are governed by the law of the Republic of Indonesia. Disputes are settled amicably first."],
        ["li", "The Indonesian version is the binding one; any other language is provided for convenience."],
        ["li", "By buying or using a Develop & Hack_With_Ai key you confirm that you have read, understood and accepted all of the above."],
      ],
    },
  ];

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

  // 1200 → "1.200": the site follows the reference, which groups thousands
  // with a dot. Cents only appear when non-zero.
  function group(value) {
    var digits = Math.abs(value) % 1 === 0 ? 0 : 2;
    var parts = value.toFixed(digits).split(".");
    var whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts[1] ? whole + "," + parts[1] : whole;
  }

  // 102000 → "1,02,000": rupees use lakh/crore grouping, not the three-digit
  // grouping the dollar figures use.
  function groupRupees(value) {
    var whole = String(Math.round(Math.abs(value)));
    if (whole.length <= 3) return whole;
    var tail = whole.slice(-3);
    var head = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return head + "," + tail;
  }

  function formatPrice(amount, currency) {
    var value = Number(String(amount).replace(/[^0-9.-]/g, ""));
    if (!isFinite(value)) return String(amount);
    if (currency === "INR") return "₹" + groupRupees(value * INR_PER_USD);
    return "$" + group(value);
  }

  function currentCurrency() {
    return window.conduitCurrency === "INR" ? "INR" : "USD";
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

  // The dollar figure is the real price; switching to rupees only changes how
  // it is displayed. Nothing here touches the order or the Telegram flow.
  function initCurrency() {
    var buttons = $$("[data-currency-toggle]");
    if (!buttons.length) return;

    var prices = $$("[data-price]");
    var currency = store(STORAGE.currency) === "INR" ? "INR" : "USD";

    function render() {
      prices.forEach(function (el) {
        el.textContent = formatPrice(el.getAttribute("data-price"), currency);
      });

      $$("[data-currency-label]").forEach(function (el) {
        el.textContent = currency;
      });

      buttons.forEach(function (btn) {
        var next = currency === "INR" ? "USD" : "INR";
        btn.setAttribute("aria-label", "Show prices in " + next);
        btn.setAttribute("title", "Show prices in " + next);
        btn.setAttribute("aria-pressed", String(currency === "INR"));
      });

      window.conduitCurrency = currency;
      document.dispatchEvent(
        new CustomEvent("conduit:currency", { detail: { currency: currency } })
      );
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        currency = currency === "INR" ? "USD" : "INR";
        store(STORAGE.currency, currency);
        render();
      });
    });

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
        // Keep data-price in sync with the chosen product.
        fields.total.setAttribute("data-price", data.amount || "0");
        fields.total.textContent = formatPrice(data.amount, currentCurrency());
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

  /* ── Terms dialog and checkout consent ────────────────────────────────── */

  // Nothing opens on its own: the document is shown only when the visitor asks
  // for it, from the checkout consent line or any element carrying
  // data-tos-open. Every node is built with createElement and textContent, so
  // the CSP needs no inline-script hash for it.
  var NOTE_TAIL =
    ", with no shipping cost and no extra fee from Develop & Hack_With_Ai. For UPI, credit card and debit card, the payment processor may add a payment-channel fee. That fee is shown on the payment page before you pay.";

  function totalNote(currency) {
    var head =
      currency === "INR"
        ? "Shown in rupees at ₹" + INR_PER_USD + " to the dollar; the order is charged in US dollars"
        : "Total in US dollars";
    return head + NOTE_TAIL;
  }

  var tosDialog = null;
  var tosLastFocus = null;

  function consentGiven() {
    return store(STORAGE.tos) === TOS_VERSION;
  }

  function setConsent(on) {
    store(STORAGE.tos, on ? TOS_VERSION : "");
    var box = $("[data-tos-consent]");
    if (box) box.checked = !!on;
    syncPlaceOrder();
  }

  // The order button stays inert until the consent box is ticked, so a visitor
  // cannot reach the payment step without passing the terms.
  function syncPlaceOrder() {
    var box = $("[data-tos-consent]");
    var button = $("[data-place-order]");
    if (!button) return;
    var ready = !!(box && box.checked);
    button.classList.toggle("is-disabled", !ready);
    button.setAttribute("aria-disabled", ready ? "false" : "true");
    if (ready) {
      button.removeAttribute("tabindex");
    } else {
      button.setAttribute("tabindex", "-1");
    }
  }

  function renderTotalNote() {
    var note = $("[data-total-note]");
    if (!note) return;
    note.textContent = totalNote(currentCurrency());
  }

  function closeTosDialog() {
    if (!tosDialog) return;
    tosDialog.remove();
    tosDialog = null;
    document.body.classList.remove("tos-locked");
    if (tosLastFocus && document.body.contains(tosLastFocus)) {
      tosLastFocus.focus();
    }
    tosLastFocus = null;
  }

  function openTosDialog(trigger) {
    if (tosDialog) return;

    function el(tag, className, text) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    }

    tosLastFocus = trigger || document.activeElement;

    var gate = el("div", "tos-gate");
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-labelledby", "tos-gate-title");

    var card = el("div", "tos-gate-card");

    var head = el("div", "tos-gate-head");
    var headTop = el("div", "tos-gate-head-top");
    var headText = el("div", "tos-gate-head-text");
    headText.appendChild(el("p", "tos-gate-eyebrow", "Develop & Hack_With_Ai"));
    var title = el("h2", "tos-gate-title", "Terms of Service and Refund Policy");
    title.id = "tos-gate-title";
    headText.appendChild(title);
    headText.appendChild(
      el("p", "tos-gate-version", "Version " + TOS_VERSION + " · effective 2026-11-05")
    );
    headTop.appendChild(headText);

    var closeX = el("button", "tos-gate-close", "\u00d7");
    closeX.type = "button";
    closeX.setAttribute("aria-label", "Close the terms");
    headTop.appendChild(closeX);
    head.appendChild(headTop);
    head.appendChild(
      el(
        "p",
        "tos-gate-short",
        "In short: purchases are final and a service disruption is not refundable."
      )
    );

    var scroll = el("div", "tos-gate-scroll");
    TOS_SECTIONS.forEach(function (section) {
      scroll.appendChild(el("h3", "tos-gate-h", section.h));
      section.body.forEach(function (item) {
        var last = scroll.lastElementChild;
        if (item[0] === "li") {
          if (!last || !last.classList.contains("tos-gate-list")) {
            last = el("ul", "tos-gate-list");
            scroll.appendChild(last);
          }
          last.appendChild(el("li", null, item[1]));
        } else {
          scroll.appendChild(el("p", "tos-gate-p", item[1]));
        }
      });
    });

    var foot = el("div", "tos-gate-foot");
    var close = el("button", "btn btn-secondary btn-sm", "Close");
    close.type = "button";
    var agree = el("button", "btn btn-primary btn-sm", "I Agree");
    agree.type = "button";
    foot.appendChild(close);
    foot.appendChild(agree);

    card.appendChild(head);
    card.appendChild(scroll);
    card.appendChild(foot);
    gate.appendChild(card);

    close.addEventListener("click", closeTosDialog);
    closeX.addEventListener("click", closeTosDialog);
    agree.addEventListener("click", function () {
      setConsent(true);
      closeTosDialog();
    });
    gate.addEventListener("click", function (event) {
      if (event.target === gate) closeTosDialog();
    });
    gate.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeTosDialog();
      }
    });

    document.body.appendChild(gate);
    document.body.classList.add("tos-locked");
    tosDialog = gate;
    tosLastFocus = tosLastFocus === document.body ? null : tosLastFocus;
    close.focus();
  }

  function initTosDialog() {
    $$("[data-tos-open]").forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        // stopPropagation keeps a link nested in the consent label from
        // toggling the checkbox on its way up.
        event.preventDefault();
        event.stopPropagation();
        openTosDialog(trigger);
      });
    });
  }

  function initConsent() {
    var box = $("[data-tos-consent]");
    var button = $("[data-place-order]");

    $$("[data-tos-version]").forEach(function (el) {
      el.textContent = TOS_VERSION;
    });

    if (box) {
      box.checked = consentGiven();
      box.addEventListener("change", function () {
        setConsent(box.checked);
      });
    }

    if (button) {
      button.addEventListener("click", function (event) {
        if (!box || !box.checked) {
          event.preventDefault();
          if (box) box.focus();
        }
      });
    }

    document.addEventListener("conduit:currency", renderTotalNote);

    syncPlaceOrder();
    renderTotalNote();
  }

  function boot() {
    initTheme();
    initCurrency();
    initNav();
    initTabs();
    initCopy();
    initReveal();
    initCatalogue();
    initCheckout();
    initConsent();
    initTosDialog();
    initScrollSpy();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
