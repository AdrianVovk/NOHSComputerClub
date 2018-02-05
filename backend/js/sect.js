async function sectSetup(reload = false) {
	for (sect of $("sect")) await processSect($(sect), reload)
}

async function processSect(item, reload = false) {
	let elem = $(item);

	let props = await sect_attrs(elem, reload); // Parse the sections properties
	let colors = await sect_color(elem, props.isSub);
	if (!props.isSub && !reload) await sect_animations(elem, colors.f);
	if (props.simple) return;
	if (props.isSub) await sect_expanding(elem, colors.b);
	if (!props.isSub) await sect_navi(elem, colors.b, colors.f);
}

async function sect_attrs(elem, reload = false) {
  // Specify the href attribute on any sect to make it a link
  let href = elem.attr("href")
  if (href && !reload) elem.click(() => window.location = href)

  // Specify the icon attribute on any sect to embed an icon into it
  let icon = elem.attr("icon")
  if (icon && !(elem.children("sect").length) && !reload) {
    let icn = $(document.createElement("icn"))
    icn.addClass("mdi")
    icn.addClass("mdi-" + icon)
    elem.prepend(icn)
  }

  let img = elem.attr("img")
  if (img && !reload) {
    // TODO
  }

  // Generate a random ID for sections lacking it
  let id = elem.attr("id");
  if (!id && !reload) elem.attr("id", genID())

  return {
  	href: href,
  	icon: icon,
  	img: img,
  	simple: elem.attr("no-nav") != undefined,
  	id: id,
  	isSub: (elem.parent().prop("tagName") == "SECT")
  }
}

async function sect_color(elem, isSub) {
		// Fetch colors
    let background = getNearestBackground(elem) || "#ffffff";
	  let forceDark = false//getNearestAttr(elem, "force-dark-text") != undefined
    let forceLight = false//getNearestAttr(elem, "force-light-text") != undefined

    let foreground = (isLight(background) || forceDark) && !forceLight ? "#000" : "#fff";
    if (isSub) background = "transparent"// TODO

    // Set background and text colors
    elem.css({
      backgroundColor: background,
      color: foreground
    });
    elem.find("*").css("color", foreground);

    // TODO: Buttons, links, etc

	return {b: background, f: foreground};
}

async function sect_animations(elem, foreground) {
	let obj = { adaptPos: false }
	if (!isLight(foreground)) obj.callback = darkRipple
	elem.ripple(obj)

	elem.css({
     opacity: 0,
     top: "200px"
	})
}

async function sect_expanding(elem, background) {
  elem.hide()
  sect = elem.parent()
  if (sect.data("expanding-handled")) return;

  let icn;
  icn = $(document.createElement("icn"))
  //icn.text(sect.attr("icon") ? sect.attr("icon") : "fullscreen")
  //icn.addClass("material-icons")
  icn.addClass("mdi")
  icn.addClass("mdi-" + (sect.attr("icon") ? sect.attr("icon") : "fullscreen"))
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

async function sect_navi(elem, background, foreground) {
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
