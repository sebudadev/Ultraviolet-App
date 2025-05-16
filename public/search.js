"use strict";
/**
 *
 * @param {string} input
 * @param {string} template Template for a search query.
 * @returns {string} Fully qualified URL
 */
function search(input, template) {
  try {
    // input is a valid URL:
    // eg: https://example.com, https://example.com/test?q=param
    return new URL(input).toString();
  } catch (err) {
    // input was not a valid URL
  }

  try {
    // input is a valid URL when http:// is added to the start:
    // eg: example.com, https://example.com/test?q=param
    const url = new URL(`http://${input}`);
    // only if the hostname has a TLD/subdomain
    if (url.hostname.includes(".")) return url.toString();
  } catch (err) {
    // input was not valid URL
  }

  // input may have been a valid URL, however the hostname was invalid

  // Attempts to convert the input to a fully qualified URL have failed
  // Treat the input as a search query
  return template.replace("%s", encodeURIComponent(input));
}

// Add this after your other scripts
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInputt');
  const iframe = document.getElementById('cool-iframe');
  if (searchInput && iframe && window.__uv$config && typeof window.__uv$config.encodeUrl === 'function') {
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        let val = searchInput.value.trim();
        if (!val) return;
        // If not a URL, treat as search
        if (!/^https?:\/\//.test(val) && !val.includes('.')) {
          val = 'https://www.google.com/search?q=' + encodeURIComponent(val);
        } else if (!/^https?:\/\//.test(val)) {
          val = 'https://' + val;
        }
        iframe.src = window.__uv$config.prefix + window.__uv$config.encodeUrl(val);
      }
    });
  }
});
