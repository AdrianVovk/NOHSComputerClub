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
  // Include handling
  // NOTE: Make sure this happens before sect handling, since these need to be resolved first
  ///////////////////////////////////////////

  while ($("include").length) await (async () => {
    let elem = $("include").first()
    let sect = elem.attr("sect")
    if (!sect) throw Error("No sect specified for include statement")

    let page = await $.ajax(`pages/${sect}.html`)
    if (!page.includes("Error response")) {
      elem.replaceWith($.parseHTML(page, document, true));
    } else throw Error(`Sect \'${sect}\' does not exist.`)
  })()

  ///////////////////////////////////////////
  // Process all of the sections
  ///////////////////////////////////////////

  $("sect").each(function(index, item) {
    let elem = $(item);
    isSub = (elem.parent()[0].tagName.toLowerCase() == "sect")

    ///////////////////////////////////////////
    // Color Theming
    ///////////////////////////////////////////

    // Fetch colors
    let background;
    let foreground = "#fff";

    {
      colorElem = (isSub ? elem.parent() : elem)
      attr = colorElem.attr("background")
      forceDark = (colorElem.attr("force-dark-text") != undefined)
      forceLight = (colorElem.attr("force-light-text") != undefined)

      background = (attr != undefined) ? attr : "#000";
      foreground = (isLight(background) || forceDark) && !forceLight ? "#000" : "#fff";
    }
    if (isSub) background = "transparent" // TODO

    // Set background and text colors
    elem.css({
      backgroundColor: background,
      color: foreground
    });
    elem.children().css("color", foreground);

    // TODO: Buttons, links, etc

    ///////////////////////////////////////////
    // Animations
    ///////////////////////////////////////////

    if (!isSub) { // Ripples
      let obj = { adaptPos: false }
      if (!isLight(foreground)) obj.callback = darkRipple
      elem.ripple(obj)
    }

    if (!isSub) elem.css({
      opacity: 0,
      top: "200px"
    })

    ///////////////////////////////////////////
    // Attributes
    ///////////////////////////////////////////

    {
      // Specify the href attribute on any sect to make it a link
      let href = elem.attr("href")
      if (href) elem.click(() => window.location = href)

      // Specify the icon attribute on any sect to embed an icon into it
      let icon = elem.attr("icon")
      if (icon) {
        let icn = $(document.createElement("icn"))
        icn.text(icon)
        icn.addClass("material-icons")
        elem.prepend(icn)
      }

      let img = elem.attr("img")
      if (img) {
        // TODO
      }

      let noNav = elem.attr("no-nav")
      if (noNav != undefined) {
        return; // Skip to the next sect
      }

      // Generate a random ID for sections lacking it
      let id = elem.attr("id");
      if (!id) elem.attr("id", genID())
    }

    ///////////////////////////////////////////
    // Expanding handling
    ///////////////////////////////////////////

    if (isSub) elem.hide()

    if (isSub) {
      sect = elem.parent()
      if (sect.data("expanding-handled")) return;

      let icn;
      icn = $(document.createElement("icn"))
      icn.text("fullscreen")
      icn.addClass("material-icons")
      sect.prepend(icn)

      let sectClick = e => {
        let item = findSect(e)
        item.off("click")
        setTimeout(() => item.children("icn").click(icnClick), 100)
        fillScreen(item.attr("id"))
      }

      let icnClick = e => {
        let item = findSect(e)
        item.children("icn").off("click")
        setTimeout(() => item.click(sectClick), 100)
        unfillScreen(item.attr("id"))
      }
      sect.click(sectClick)

      sect.data("expanding-handled", true)
      elem.data("expand-background", background)
      return
    }

    ///////////////////////////////////////////
    // Navigation Setup
    ///////////////////////////////////////////

    {
      let navItem = document.createElement("li")
      let a = document.createElement("a")
      navItem.append(a)

      a.innerText = elem.find("h1")[0].innerText
      $(a).attr("href", `#${elem.attr("id")}`)

      // TODO: Fix the hover
      $(a).hover(function(event) {
        $(this).css({
          backgroundColor: background,
          color: foreground
        })
      }, function(event) {
        $(this).css({
          backgroundColor: "transparent",
          color: "white"
        });
      })

      //$(a).click(() => false)

      // TODO: disable in css once rippleOnHover works
      //$(a).css("backgroundColor", "black")
      //$(a).css("color", "white")

      $(a).ripple({
        rippleOnHover: true,
        callback: (_, ripple) => {
          //TODO: Activate once rippleOnHover works
          //ripple.css("backgroundColor", background)
        }
      })

      $("#nav").append(navItem)
    }

  });

  ///////////////////////////////////////////
  // Enable smooth scrolling on all generated links
  ///////////////////////////////////////////

  $('a[href^="#"]').on("click", evt => {
  	evt.preventDefault();
  	let elem = $($.attr(evt.target, "href"))
  	if (elem.children("sect").length != 0) elem.click(); else {
  	  $('html, body').animate({
          scrollTop: elem.offset().top
      }, 500, "easeInOutQuart");
  	}
  })

  ///////////////////////////////////////////
  // Startup animations
  // NOTE: Always keep last, so all loading terminates before this fires
  ///////////////////////////////////////////

  hideSidebar(/*slowly =*/ true)
  $("sect").not("sect sect").each((index, item) => {
      let elem = $(item);
    if (elem.parent()[0].tagName.toLowerCase() == "sect") return;

    elem.animate({
       opacity: 1,
       top: 0
    }, 700 + (200 * index), "easeInOutQuart")
  })
  showSidebar()

  ///////////////////////////////////////////
  // Extras
  ///////////////////////////////////////////

  $(document).on("keyup", handleEscape)
  $("sidebar").children(".ico").ripple()

})())
