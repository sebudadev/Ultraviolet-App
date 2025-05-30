// Make sure your iframe has id="cool-iframe" and your eruda icon has id="erudaIcon"
// Add a div with id="erudaLoadingScreen" for loading/error messages

const erudaIcon = document.getElementById('erudaIcon');
const iframe = document.getElementById('cool-iframe');
const erudaLoadingScreen = document.getElementById('erudaLoadingScreen');

let erudaLoaded = false;
let loadingTimeout;
let errorMessageDisplayed = false;

if (erudaIcon && iframe && erudaLoadingScreen) {
  erudaIcon.addEventListener('click', () => {
    if (!iframe.contentDocument || !iframe.contentWindow) {
      erudaLoadingScreen.textContent = 'Iframe is not available.';
      erudaLoadingScreen.style.display = 'block';
      return;
    }

    erudaLoadingScreen.textContent = 'Eruda is loading...';
    erudaLoadingScreen.style.display = 'block';
    errorMessageDisplayed = false;
    clearTimeout(loadingTimeout);

    loadingTimeout = setTimeout(() => {
      if (!errorMessageDisplayed) {
        erudaLoadingScreen.textContent = 'Error: Eruda is taking too long to load.';
        errorMessageDisplayed = true;
      }
      erudaLoadingScreen.style.display = 'none';
    }, 10000);

    if (erudaLoaded && iframe.contentWindow.eruda) {
      iframe.contentWindow.eruda.destroy();
      erudaLoaded = false;
      clearTimeout(loadingTimeout);
      erudaLoadingScreen.style.display = 'none';
    } else if (!erudaLoaded) {
      const script = iframe.contentDocument.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/eruda';
      script.async = true;

      script.onload = () => {
        clearTimeout(loadingTimeout);
        if (iframe.contentWindow.eruda) {
          iframe.contentWindow.eruda.init();
          iframe.contentWindow.eruda.show();
          erudaLoaded = true;
        }
        erudaLoadingScreen.style.display = 'none';
      };

      script.onerror = () => {
        clearTimeout(loadingTimeout);
        if (!errorMessageDisplayed) {
          erudaLoadingScreen.textContent = 'Error loading Eruda. Please try again later.';
          errorMessageDisplayed = true;
        }
        erudaLoadingScreen.style.display = 'none';
      };

      iframe.contentDocument.head.appendChild(script);
    }
  });
}