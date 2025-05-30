"use strict";
/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("uv-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("uv-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("uv-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("uv-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("uv-error-code");

async function registerSW() {
  if (!navigator.serviceWorker.controller) {
    await navigator.serviceWorker.register('/uv/uv.sw.js', {
      scope: __uv$config.prefix,
    });
  }
}

function isUrl(val = "") {
  if (
    /^http(s?):\/\//.test(val) ||
    (val.includes(".") && val.substr(0, 1) !== " ")
  )
    return true;
  return false;
}

function search(query) {
  if (!isUrl(query)) return "https://duckduckgo.com/?q=" + encodeURIComponent(query);
  if (!(query.startsWith("https://") || query.startsWith("http://")))
    return "http://" + query;
  return query;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await registerSW();
  } catch (err) {
    error.textContent = "Failed to register service worker.";
    errorCode.textContent = err.toString();
    throw err;
  }

  const url = search(address.value, searchEngine.value);
  location.href = __uv$config.prefix + __uv$config.encodeUrl(url);
});

// Optional: If you want to trigger submit on Enter in a custom input
address.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('uv-form');
  const address = document.getElementById('uv-address');
  if (!form || !address) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const val = address.value.trim();
    if (!val) return;
    // Redirect to search.html with the url as a query param
    window.location.href = `search.html?url=${encodeURIComponent(val)}`;
  });
});
