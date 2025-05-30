// Add a fade-in overlay animation to every page

;(() => {
  // Create overlay
  const overlay = document.createElement("div")
  overlay.id = "intro-anim-overlay"
  overlay.style.position = "fixed"
  overlay.style.top = 0
  overlay.style.left = 0
  overlay.style.width = "100vw"
  overlay.style.height = "100vh"
  overlay.style.background = "linear-gradient(135deg,rgb(53, 53, 53) 0%,rgb(36, 36, 36) 100%)"
  overlay.style.zIndex = 99999
  overlay.style.display = "flex"
  overlay.style.alignItems = "center"
  overlay.style.justifyContent = "center"
  overlay.style.transition = "opacity 0.7s cubic-bezier(.4,0,.2,1)"
  overlay.style.opacity = "1"

  // Add a logo or text in the center with loading spinner and pulsing progress bar
  overlay.innerHTML = `
  <div style="text-align:center;">
    <div style="position:relative;display:inline-block;margin-bottom:1.5em;">
      <img src="globe-with-meridians-emoji-1024x1024-nntfxojt (1).png" alt="logo" style="width:64px;height:64px;border-radius:1em;box-shadow:0 4px 24px #2563eb44;">
      <div style="position:absolute;top:-8px;left:-8px;width:80px;height:80px;border:3px solid transparent;border-top:3px solid #fff;border-radius:50%;animation:spin 1.5s linear infinite;"></div>
    </div>
    <div style="margin-top:0.5em;font-size:2rem;font-weight:800;color:#fff;letter-spacing:-1px;text-shadow:0 2px 16px #2563eb88;">sebudaca</div>
    <div style="margin-top:0.8em;font-size:0.9rem;color:#e5e7eb;opacity:0.8;animation:pulse 2s ease-in-out infinite;">Loading...</div>
    
    <!-- Progress Bar Container -->
    <div style="margin-top:1.5em;width:200px;height:6px;background:rgba(255,255,255,0.15);border-radius:3px;overflow:hidden;margin-left:auto;margin-right:auto;position:relative;box-shadow:0 0 5px rgba(0,0,0,0.2) inset;">
      <!-- Glow Effect -->
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);background-size:200% 100%;animation:shimmer 1.5s infinite;"></div>
      
      <!-- Progress Fill -->
      <div id="progress-fill" style="height:100%;background:linear-gradient(90deg,#3b82f6,#8b5cf6);border-radius:3px;width:0%;transition:width 0.3s ease;position:relative;animation:glow 1.5s infinite alternate;">
        <!-- Leading Edge Glow -->
        <div style="position:absolute;right:-5px;top:-3px;bottom:-3px;width:10px;background:white;border-radius:50%;filter:blur(5px);opacity:0.7;"></div>
      </div>
    </div>
    
    <!-- Progress Percentage -->
    <div id="progress-text" style="margin-top:0.5em;font-size:0.8rem;color:#d1d5db;opacity:0.7;">0%</div>
  </div>
  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    @keyframes glow {
      0% { box-shadow: 0 0 5px rgba(59,130,246,0.5); }
      100% { box-shadow: 0 0 15px rgba(139,92,246,0.8); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  </style>
`

  document.body.appendChild(overlay)

  // Progress bar animation
  const progressFill = overlay.querySelector("#progress-fill")
  const progressText = overlay.querySelector("#progress-text")
  let progress = 0

  // Simulate loading progress
  const progressInterval = setInterval(() => {
    progress += Math.random() * 15 + 5 // Random increment between 5-20
    if (progress > 100) progress = 100

    progressFill.style.width = progress + "%"
    progressText.textContent = Math.round(progress) + "%"

    // Increase glow intensity as progress increases
    const glowIntensity = 0.5 + (progress / 100) * 0.5
    progressFill.style.animation = `glow 1.5s infinite alternate`
    
    if (progress >= 100) {
      clearInterval(progressInterval)
      // Enhance glow effect at 100%
      progressFill.style.boxShadow = "0 0 20px rgba(139,92,246,0.9)"
      // Small delay after reaching 100% before fade out
      setTimeout(() => {
        fadeOutOverlay()
      }, 800)
    }
  }, 150) // Update every 150ms

  // Fade out after DOM is ready and page is loaded
  function fadeOutOverlay() {
    overlay.style.opacity = "0"
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
    }, 700)
  }

  // Also fade out on window load as fallback (in case progress doesn't reach 100%)
  window.addEventListener("load", () => {
    setTimeout(() => {
      if (overlay.parentNode) {
        clearInterval(progressInterval)
        fadeOutOverlay()
      }
    }, 1000)
  })
})()
