// Create loading overlay
const loadingOverlay = document.createElement('div');
loadingOverlay.id = 'loading-overlay';
loadingOverlay.style.position = 'fixed';
loadingOverlay.style.top = 0;
loadingOverlay.style.left = 0;
loadingOverlay.style.width = '100vw';
loadingOverlay.style.height = '100vh';
loadingOverlay.style.background = 'rgba(20,24,32,0.97)';
loadingOverlay.style.display = 'flex';
loadingOverlay.style.alignItems = 'center';
loadingOverlay.style.justifyContent = 'center';
loadingOverlay.style.zIndex = 99999;
loadingOverlay.style.transition = 'opacity 0.5s';

// Simple spinner
loadingOverlay.innerHTML = `
  <div style="display:flex;flex-direction:column;align-items:center;">
    <div style="border:6px solid #2563eb;border-top:6px solid #fff;border-radius:50%;width:60px;height:60px;animation:spin 1s linear infinite;"></div>
    <div style="margin-top:1.5rem;color:#fff;font-size:1.2rem;font-weight:600;letter-spacing:0.05em;">Loading...</div>
  </div>
  <style>
    @keyframes spin { 100% { transform: rotate(360deg); } }
  </style>
`;

// Show overlay on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(loadingOverlay);
});

// Hide overlay when page is fully loaded
window.addEventListener('load', () => {
  loadingOverlay.style.opacity = '0';
  setTimeout(() => {
    if (loadingOverlay.parentNode) loadingOverlay.parentNode.removeChild(loadingOverlay);
  }, 500);
});