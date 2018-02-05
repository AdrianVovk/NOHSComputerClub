console.log("DEBUG TOOLS ENABLED")

// Set the overall color scheme of the page
async function testColorScheme(color1, color2) {
	// Overwrite color defenitions
	startColor = one.color(color1)
	endColor = one.color(color2)

	colorGen(true) // This will forcibly replace the old colors
	$("#nav").empty() // Remove the navigation elements
	await sectSetup(true) // Rerun the sections through generation
	loadSmoothScroll() // Fix smooth scrolling
}

function testError() {
  setTimeout(() => {throw Error("This is a test")}, 200)
}
