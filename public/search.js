"use strict";

/**
 * Convert input to a fully qualified URL or search query.
 * @param {string} input
 * @param {string} template - Template for search query (e.g., "https://www.google.com/search?q=%s")
 * @returns {string} URL or search string
 */
function search(input, template) {
  try {
    return new URL(input).toString(); // Already a valid URL
  } catch (err) {}

  try {
    const url = new URL(`http://${input}`);
    if (url.hostname.includes(".")) return url.toString();
  } catch (err) {}

  // Not a URL, treat as search query
  return template.replace("%s", encodeURIComponent(input));
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInputt");
  const iframe = document.getElementById("cool-iframe");

  if (
    searchInput &&
    iframe &&
    window.__uv$config &&
    typeof window.__uv$config.encodeUrl === "function"
  ) {
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;

        const destination = search(query, "https://www.google.com/search?q=%s");
        iframe.src =
          window.__uv$config.prefix + window.__uv$config.encodeUrl(destination);
      }
    });
  }
});
