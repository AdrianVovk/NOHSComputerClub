$(() => (async () => {
  ///////////////////////////////////////////
  // Error handling
  // NOTE: Always keep this up at the top, otherwise it might miss errors
  ///////////////////////////////////////////

  window.onerror = (message) => {
    alert("Something has gone wrong on this page. Reloading...\n\n" + message)
    location.reload()
  }

  ///////////////////////////////////////////
  // Compensate for TinyURL adding on #featured (it just bothers me)
  ///////////////////////////////////////////

  window.location = "#"

  ///////////////////////////////////////////
  // Loading
  ///////////////////////////////////////////

  await loadSettings()
  await loadIncludes() // NOTE: Make sure this happens before sect handling
  colorGen() // Generates the background attribute for each section
  await sectSetup() // Configures the section
  loadSmoothScroll() // Enable smooth scrolling
  animateStartup() // NOTE: Always keep last

  ///////////////////////////////////////////
  // Extras
  ///////////////////////////////////////////

  try {
    if (settings.beta) $("#onpage-title")[0].innerText += " (Beta)"
    if (settings.debug) debug()
  } catch (e) {}

  $(document).on("keyup", handleEscape)
  $("sidebar").children(".ico").ripple()

})())
