let loadSettings = async () => {
  window.settings = await $.ajax(`pages/settings.json`)

  // Work with settings
  $("title").text(settings.title)
  if (settings.favicon) setFavicon(settings.favicon)

  for (icon of settings.sidebar_icons.split(" ")) {
    let elem = document.createElement("i")
    $(elem).addClass("mdi").addClass("mdi-" + icon)
    $("sidebar .ico").append(elem).append(" ")
  }

  $("include").attr("sect", settings.default_sect)

  if (!settings.top_color || !settings.bottom_color) throw Error("No colors defined in settings.json")
  startColor = one.color(settings.top_color)
  endColor = one.color(settings.bottom_color)
}

let loadIncludes = async () => {
  while ($("include").length) await (async () => {
    let elem = $("include").first()
    let sect = elem.attr("sect")
    if (!sect) throw Error("No sect specified for include statement")

    let page = await $.ajax(`pages/${sect}.html`)
    if (!page.includes("Error response")) {
      elem.replaceWith($.parseHTML(page, document, true));
    } else throw Error(`Sect \'${sect}\' does not exist.`)
  })()
}

let loadSmoothScroll = () => $('a[href^="#"]').on("click", evt => {
  evt.preventDefault();
  let elem = $($.attr(evt.target, "href"))
  if (elem.children("sect").length != 0) elem.click(); else {
    $('html, body').animate({
        scrollTop: elem.offset().top
    }, 500, "easeInOutQuart");
  }
})

let animateStartup = () => {
  { // Preps the sidebar for the anim
    sidebar = $("sidebar")
    sidebar.css("transition-duration", "0")
    hideSidebar(/* slow unhide */ true)
    sidebar.css({"transition-duration": "", "left": ""})
  }

  $("sect").not("sect sect").each((index, item) => {
      let elem = $(item);
    if (elem.parent()[0].tagName.toLowerCase() == "sect") return;

    elem.animate({
       opacity: 1,
       top: 0
    }, 700 + (200 * index), "easeInOutQuart")
  })
  showSidebar()
}
