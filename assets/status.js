/* Status page: reads the gateway health endpoint and renders model health. */
(function () {
  "use strict";

  var root = document.querySelector("[data-status]");
  if (!root) return;

  var banner = document.getElementById("statusBanner");
  var bannerText = document.getElementById("statusBannerText");
  var updated = document.getElementById("statusUpdatedAt");
  var refresh = document.getElementById("statusRefresh");
  var stats = document.getElementById("statusStats");
  var tiers = document.getElementById("statusTiers");
  var total = document.getElementById("statusTotal");
  var ok = document.getElementById("statusOk");
  var bad = document.getElementById("statusBad");

  var endpoints = [];
  var configured = root.getAttribute("data-status-endpoint");
  if (configured) endpoints.push(configured);
  // A same-origin serverless endpoint can be added later without changing this file.
  if (endpoints.indexOf("/api/status/models") === -1) endpoints.push("/api/status/models");

  var allowedAttr = root.getAttribute("data-status-models");
  var allowed = allowedAttr
    ? allowedAttr.split(",").map(function (id) {
        return id.trim();
      }).filter(Boolean)
    : null;

  var TIER_LABELS = {
    base: "Base models",
    pro: "Pro set",
    max: "Extensions",
    ultra: "Frontier",
    Lite: "Pro pool",
    Standard: "Max pool",
    Max: "Ultra pool"
  };
  var TIER_ORDER = ["base", "pro", "max", "ultra", "Lite", "Standard", "Max"];

  var LABELS = {
    operational: "Operational",
    degraded: "Degraded",
    outage: "Maintenance / Issue",
    maintenance: "Maintenance",
    unknown: "Unknown"
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function stateClass(status) {
    if (status === "operational") return "operational";
    if (status === "degraded") return "degraded";
    if (status === "maintenance") return "maintenance";
    if (status === "outage" || status === "error") return "outage";
    return "unknown";
  }

  function setBanner(kind, message, note) {
    banner.className = "status-banner" + (kind ? " " + kind : "");
    bannerText.innerHTML =
      '<span class="sdot ' + esc(kind) + '"></span><strong>' + esc(message) + "</strong>";
    if (note) updated.textContent = note;
  }

  function setLoading() {
    setBanner("", "Loading live status…", "Checking…");
    stats.hidden = true;
    tiers.innerHTML = '<p class="stale-note">Loading model checks…</p>';
  }

  function setUnavailable() {
    setBanner(
      "bad",
      "Status temporarily unavailable",
      "Health endpoint not reachable — retrying in a moment"
    );
    stats.hidden = true;
    tiers.innerHTML =
      '<p class="stale-note">Live model checks will appear here once the gateway health endpoint is connected.</p>';
    root.setAttribute("data-status-state", "unavailable");
  }

  function pickEndpoint() {
    for (var i = 0; i < endpoints.length; i++) {
      if (endpoints[i]) return endpoints[i];
    }
    return null;
  }

  async function fetchStatus() {
    var endpoint = pickEndpoint();
    if (!endpoint) return null;
    var controller = new AbortController();
    var timer = setTimeout(function () {
      controller.abort();
    }, 8000);
    try {
      var response = await fetch(endpoint, { cache: "no-store", signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) return null;
      var data = await response.json();
      if (!data || !Array.isArray(data.models)) return null;
      return data;
    } catch (error) {
      clearTimeout(timer);
      return null;
    }
  }

  function deriveOverall(models) {
    var counts = { operational: 0, degraded: 0, outage: 0, maintenance: 0 };
    models.forEach(function (model) {
      var status = model.status || "unknown";
      if (counts[status] === undefined) counts.outage += 1;
      else counts[status] += 1;
    });
    if (counts.outage || counts.maintenance) return "outage";
    if (counts.degraded) return "degraded";
    if (counts.operational) return "operational";
    return "unknown";
  }

  function render(data) {
    var models = data.models || [];
    var overall = data.overall || deriveOverall(models);
    var kind = overall === "operational" ? "ok" : overall === "degraded" ? "warn" : "bad";
    var message =
      overall === "operational"
        ? "All Systems Operational"
        : overall === "degraded"
          ? "Partial Service Degradation"
          : "Service Disruption / Maintenance";

    var operational = models.filter(function (model) {
      return model.status === "operational";
    }).length;

    setBanner(kind, message, "Updated " + new Date(normalizeTimestamp(data.updated_at)).toLocaleTimeString());
    total.textContent = String(models.length);
    ok.textContent = String(operational);
    bad.textContent = String(models.length - operational);
    stats.hidden = false;

    var groups = {};
    models.forEach(function (model) {
      var tier = model.tier || "Other";
      if (!groups[tier]) groups[tier] = [];
      groups[tier].push(model);
    });

    var order = TIER_ORDER.filter(function (tier) {
      return groups[tier] && groups[tier].length;
    });
    Object.keys(groups).forEach(function (tier) {
      if (order.indexOf(tier) === -1) order.push(tier);
    });

    var html = "";
    order.forEach(function (tier) {
      var title = TIER_LABELS[tier] || tier;
      html +=
        '<section class="tier"><h2 class="tier-title">' + esc(title) + '</h2><div class="tier-card">';
      groups[tier].forEach(function (model) {
        var status = model.status || "unknown";
        var label = LABELS[status] || status;
        html +=
          '<div class="status-row"><div class="m-left"><span class="m-name">' +
          esc(model.name || model.id || "Unknown model") +
          '</span><button type="button" class="m-id" data-copy="' +
          esc(model.id || "") +
          '" title="Copy model id">' +
          esc(model.id || "") +
          '</button></div><div class="m-right"><span class="lat">' +
          (model.latency_ms ? esc(model.latency_ms) + " ms" : "&mdash;") +
          '</span><span class="st ' +
          stateClass(status) +
          '">' +
          esc(label) +
          "</span></div></div>";
      });
      html += "</div></section>";
    });

    tiers.innerHTML = html || '<p class="stale-note">No models reported.</p>';
    tiers.querySelectorAll("[data-copy]").forEach(function (button) {
      button.addEventListener("click", function () {
        var original = button.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(button.getAttribute("data-copy") || "");
        }
        button.textContent = "Copied!";
        setTimeout(function () {
          button.textContent = original;
        }, 900);
      });
    });
    root.setAttribute("data-status-state", "ready");
  }

  function normalizeTimestamp(value) {
    if (typeof value === "string") {
      var parsed = Date.parse(value);
      return isNaN(parsed) ? Date.now() : parsed;
    }
    if (typeof value === "number" && isFinite(value)) {
      return value > 1000000000000 ? value : value * 1000;
    }
    return Date.now();
  }

  async function load() {
    setLoading();
    var data = await fetchStatus();
    if (!data) {
      setUnavailable();
      return;
    }
    if (allowed && allowed.length) {
      data.models = data.models.filter(function (model) {
        return allowed.indexOf(model.id) !== -1;
      });
      data.overall = deriveOverall(data.models);
    }
    render(data);
  }

  if (refresh) refresh.addEventListener("click", load);
  load();
  setInterval(load, 60000);
})();
