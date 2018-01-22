$(() => { // Run on page load

  ///////////////////////////////////////////
  // Error handling
  // NOTE: Always keep this up at the top, otherwise it might miss errors
  ///////////////////////////////////////////

  window.onerror = () => {
    let startup = $("startup")
    startup.text("An error has occured. Try reloading  the page")
    startup.slideDown(1000, "easeInOutQuart")
  }

  ///////////////////////////////////////////
  // Smooth scrolling/auto expanding for navigation
  ///////////////////////////////////////////

  setTimeout(() => $('a[href^="#"]').on("click", evt => {
  	evt.preventDefault();
  	let elem = $($.attr(evt.target, "href"))
  	if (elem.children("sect").length != 0) elem.click(); else {
  	  $('html, body').animate({
          scrollTop: elem.offset().top
      }, 500, "easeInOutQuart");
  	}
  }), 10)

  /*// Enables smooth scrolling on links
// Adapted from https://stackoverflow.com/a/7717572
$(document).on('click', 'a[href^="#"]', function(event) {
    event.preventDefault();

    let elem = $($.attr(this, "href"))

    if (elem.children("sect").length != 0) elem.click(); else {
    }
});*/


  ///////////////////////////////////////////
  // Include handling
  // NOTE: Make sure this happens before sect handling, since these need to be resolved before then
  ///////////////////////////////////////////

  while ($("include").length) {
	  $("include").each(function(index, item) {
	    let elem = $(item)

	    let sect = elem.attr("sect")
	    if (!sect) {
	      throw Error("No sect specified for include statement")
	    }

	    let data = $.ajax({type: "GET", url: `pages/${sect}.html`, async: false}).responseText
	    if (!data.includes("Error response")) {
	      elem.replaceWith($.parseHTML(data));
	    } else console.error("Failed to include section \'" + sect + "\':\n", data)

	  })
  }

  ///////////////////////////////////////////
  // Main section handling
  ///////////////////////////////////////////

  $("sect").each(function(index, item) {

    let elem = $(item);

    isSub = (elem.parent()[0].tagName.toLowerCase() == "sect")
    isLong = elem.data("long")
    expanding = isSub || isLong

    ///////////////////////////////////////////
    // Color Theming
    ///////////////////////////////////////////

    // Fetch colors
    let background;
    let foreground = "#fff";

//    if (!isSub) {
	{
	  colorElem = (isSub ? elem.parent() : elem)
      attr = colorElem.attr("background")
      forceDark = (colorElem.attr("force-dark-text") != undefined)
      forceLight = (colorElem.attr("force-light-text") != undefined)

      background = (attr != undefined) ? attr : "#000";
      foreground = (isLight(background) || forceDark) && !forceLight ? "#000" : "#fff";
    }
    if (isSub) background = "transparent" // TODO

//    } else {
//      attr = elem.parent().attr("background")
//      forceDark = (elem.parent().attr("force-dark-text") != undefined)
//      forceLight = (elem.parent().attr("force-light-text") != undefined)

//      background = (attr != undefined) ? attr : getNextColor(true)
//      foreground = (isLight(background) || forceDark) && !forceLight ? "#000" : "#fff"

//      background = "transparent" //TODO: Fix eventually with color shift once css is cleaner
//    }

    // Set background and text colors

    elem.css({
      backgroundColor: background,
      color: foreground
    });
    elem.children().css("color", foreground);

    // TODO: Buttons, links, etc

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

	  // Generate a random ID for sections lacking it
	  let id = elem.attr("id");
	  if (!id) elem.attr("id", genID())
    }

    ///////////////////////////////////////////
    // Height handling
    ///////////////////////////////////////////

    if (isSub) elem.hide(); else setTimeout(() => {
      //elem.css("height", elem.height())
      //elem.children("sect").show().css("opacity", 0)
    }, 1)

    ///////////////////////////////////////////
    // Expanding handling
    ///////////////////////////////////////////

    if (expanding) {
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
      console.log("sub-back: #" + elem.attr("id"))
      return
    }



    ///////////////////////////////////////////
    // Animations
    ///////////////////////////////////////////

    { // Ripples
      let obj = { adaptPos: false }
      if (!isLight(foreground)) obj.callback = darkRipple
      elem.ripple(obj)
    }

	if (!isSub) elem.css({
       opacity: 0,
       top: "200px"
	})

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
  // Startup animations
  // NOTE: Always keep last, so all loading terminates before this fires
  ///////////////////////////////////////////

  hideSidebar(/*slowly =*/ true)
  setTimeout(() => {
    $("startup").slideUp(/*1*/000, "easeInOutQuart", () => {
    	$("sect").not("sect sect").each((index, item) => {
    	    let elem = $(item);
    		if (elem.parent()[0].tagName.toLowerCase() == "sect") return;

    		elem.animate({
    		   opacity: 1,
    		   top: 0
    		}, 700 + (200 * index), "easeInOutQuart")
    	})
    })
    showSidebar()
  }, /*5*/00)

})