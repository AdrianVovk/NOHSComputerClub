///////////////////////////////////////////////////////////////////////////////

let startColor = one.color("#fff")
let endColor = one.color("#000")
function colorGen(forceReplace = false) {
	let numSects = $("sect").not("sect sect").length - 2;
	colorForSect = (pos) => { // Emulating design from: https://git.io/vNA8b
    calc = (prop) => {
        let start = startColor[prop]();
        let end = endColor[prop]();
        let weight = pos / numSects;
        return start * (1 - weight) + end * weight
    };
		return new one.color.RGB(calc("red"), calc("green"), calc("blue")).hex()
	}
	$("sect").not("sect sect").each((index, item) => {
		if (index == 0 || index == (numSects + 1)) return;

		if (!$(item).attr("background") || forceReplace) $(item).attr("background", colorForSect(index - 1).toUpperCase())
	})
}

///////////////////////////////////////////////////////////////////////////////

async function debug() { // Enables debug functions
	let debugScript = document.createElement("script")
	$(debugScript).attr("src", "backend/js/debug.js")
	$("deps").append(debugScript)
	$("#onpage-title")[0].innerText += " [DEBUG]"
	window.debug = null;
}

function getNearestAttr(elem, attr) { // Loops through the hierarchy until it finds an element with attr set
	elem = $(elem)
	result = elem.attr(attr)
	while (!result && (elem.prop("tagName") != undefined)) {
		elem = elem.parent()
		result = elem.attr(attr)
	}
	return result
}
function getNearestBackground(elem) {
	return getNearestAttr(elem, "background")
}

function setFavicon(url) {
	$("link[rel*='icon']").prop("href", url)
}

//https://css-tricks.com/snippets/javascript/lighten-darken-color/
function adjustColor1(col, amt) {

    var usePound = false;

    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col,16);

    var r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if  (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if (b > 255) b = 255;
    else if  (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

//https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function genID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// Adapted from https://stackoverflow.com/a/36888120
function isLight(col) {
  if (col[0] == "#") col = col.slice(1);
  if (col == "fff") col = "ffffff"
  let num = parseInt(col, 16)
  var r = (num >> 16)
  var g = ((num >> 8) & 0x00FF)
  var b = (num & 0x0000FF)

  //  calculate "perceptive luminance"
  // NOTE: human eye favors green
  let luma = ((0.299 * r) + (0.587 * g) + (0.114 * b)) / 255;
  return luma > 0.5
}

function darkRipple(_, ripple) {
	ripple.css("backgroundColor", "rgba(0,0,0,0.26)")
}

function hideSidebar(slowly) {
     let sidebar = $("sidebar")
     sidebar.addClass("hidden")
     if (sidebar.width() == 180) sidebar.addClass("cssLacksAMaxFunction")
     if (slowly) sidebar.addClass("slowUnhide")
}

function showSidebar() {
	let sidebar = $("sidebar")
	sidebar.removeClass("hidden").removeClass("cssLacksAMaxFunction")
    setTimeout(() => sidebar.removeClass("slowUnhide"), 1000)
}

function findSect(event) {
	item = $(event.target)
    while (item.parent()[0].tagName.toLowerCase() == "sect" && $(item.parent()[0]).attr("id") == undefined) item = item.parent()
	if (item.attr("id") == undefined) item = item.parent()
	return item
}
