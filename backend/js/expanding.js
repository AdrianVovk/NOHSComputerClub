function fillScreen(id) {
  item = $(id.startsWith("#") ? id : "#" + id)
  parentExpanded = item.parent().hasClass("fill")

  // Icon management
  icn = item.children("icn")
  fadeText(icn, "close")
  item.css("height", item.height())
  item.children("sect").fadeIn(600, "easeInOutQuart")

  item.data("initial-offset", $(window).scrollTop()) // Store the initial scroll state
  if (!parentExpanded) hideSidebar() // Hide navigation

  if (parentExpanded) {
  	item.parent().css("minHeight", "200vh")
  //	adjustColor(item.parent().data("expand-background"), -50)
  }
  item.addClass("fill")
  $('html').css("overflow", "hidden")
  $('html, body').animate({ scrollTop: item.offset().top }, 500, "easeInOutQuart") // Move the element up

  // Adjust children
  item.children("h1").addClass("root") // Make h1 larger
  item.children("icn").addClass("close") // Make the expand button into a close button
  item.children("p").slideUp(500, "easeInOutQuart") // Hide the collapsed state description

  pushEsc(id)
}
function unfillScreen(id) {
  item = $(id.startsWith("#") ? id : "#" + id)
  parentExpanded = item.parent().hasClass("fill")

  // Icon management
  icn = item.children("icn")
  fadeText(icn, "fullscreen")
  item.children("sect").fadeOut(500, "easeInOutQuart")

  // Return children to default state
  item.children("h1").removeClass("root") // Make h1 the normal size
  item.children("icn").removeClass("close") // Move the close button into an expand button
  item.children("p").slideDown(500, "easeInOutQuart") // Show collapsed state description

  //$("html, body").scrollTop(item.offset().top)\
  //setTimeout(() => $("body").css("overflow", ""), 500)

  // Restore item size
  if (!parentExpanded) $('html').css("overflow", "")
  item.removeClass("fill")
  item.animate({scrollTop: 0}, 500, "easeInOutQuart")
  $('html, body').animate({ scrollTop: item.data("initial-offset") }, 500, "easeInOutQuart")

  if (!parentExpanded) showSidebar() // Show navigation

  // Finish up
  setTimeout(() => {
  	item.css("height", "")
  	if (parentExpanded) {
  		item.parent().css({
  			minHeight: "",
  			//backgroundColor: adjustColor(item.parent().data("expand-background"), 10)
  		})
  	}
  }, 510)

  popEsc()
}

function fadeText(elem, text) {
  elem.animate({opacity: 0}, 100, "easeInOutQuart", () => {
    elem.text(text)
    elem.animate({opacity: 1}, 100, "easeInOutQuart")
  })
}

///////////////////////////////////////////
// Escape key handling
///////////////////////////////////////////

let escapeStack = [];
let stackPopped = false;
function handleEscape(e) {
  e = e || window.event;
  if (e.keyCode == 27 && escapeStack.length) {
    stackPopped = true;
    $("#" + escapeStack.pop()).children("icn").click()
  }
}
function pushEsc(id) {
  escapeStack.push(id)
}
function popEsc() {
  if (!stackPopped) {
    escapeStack.pop()
  }
  stackPopped = false;
}
