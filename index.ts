type PageEls = {
	header: Element;
	body: Element;
	footer: Element;
};

function getNode(selector: string, clone = true) {
	const el = document.querySelector(selector);

	if (el === null) {
		throw Error(`🍳 Unable to find element: ${selector}`);
	}

	if (!clone) return el;

	const cloneEl = el.cloneNode(true);

	const returnEl = document.createElement("section");
	returnEl.append(cloneEl);
	return returnEl;
}

function getPageEls(): PageEls {
	return {
		header: getNode('[data-testid="RecipePageLedBackground"]'),
		body: getNode("[class^='recipe']"),
		footer: getNode('[data-testid="RecipePagContentBackground"]'),
	};
}

function getRootEl() {
	return getNode("#app-root");
}

/**
 * an empty div is typically some sort of overlay
 */
function removeEmptyDiv() {
	console.debug(`🍳 removing empty divs`);
	Array.from(document.querySelectorAll("div"))
		.filter((el) => !el.hasChildNodes())
		.forEach((el) => el.remove());
}

function removeByQuery(string: keyof HTMLElementTagNameMap | string) {
	console.debug(`🍳 removing ${string}`);
	Array.from(document.querySelectorAll(string)).forEach((el) => el.remove());
}

const removableQueries = [
	'[role*="dialog"]', // includes `alertdialog` as well
	"iframe",
	'[aria-live="assertive"]',
	'[class*="Modal"]',
	'[class*="modal"]',
	'[class*="InterstitialWrapper"]',
	'[class*="Paywall"]',
	'[class*="PersistentBottom"]',
];

function removeElements() {
	console.debug(`🍳 removing nodes`);
	removeEmptyDiv();
	removableQueries.forEach(removeByQuery);
}

function instantiateMutation() {
	const mutationCallback: MutationCallback = (mutations) => {
		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				if (node instanceof Element) {
					removableQueries.forEach((query) => {
						if (node.matches(query) || node.querySelectorAll(query).length) {
							console.debug(`🍳 removing ${node.childElementCount} node`);
							try {
								node.remove();
							} catch (error) {
								console.debug(`🍳 error removing node: `, error);
							}
						}
					});
				}
			});
		});
	};

	const observer = new MutationObserver(mutationCallback);

	const mutationTarget = getRootEl();
	const config: MutationObserverInit = { subtree: true, childList: true };
	if (mutationTarget) {
		console.debug(`🍳 instantiating observer`);
		observer.observe(mutationTarget, config);
	}

	return observer;
}

/** @see https://stackoverflow.com/a/67243723 */
function kebabize(str: string) {
	return str.replace(
		/[A-Z]+(?![a-z])|[A-Z]/g,
		($, ofs) => (ofs ? "-" : "") + $.toLowerCase()
	);
}

function generateCssText(css: Partial<CSSStyleDeclaration>) {
	return Object.keys(css)
		.map((key) => `${kebabize(key)}:${css[key as keyof typeof css]}`)
		.join(";");
}

function appendRecipe() {
	// fetch target elements
	const documentBody = getNode("body", false);
	const { header, body, footer } = getPageEls();

	// create insertion node
	const insertion = document.createElement("section");
	insertion.style.cssText = generateCssText({
		padding: "1em",
		position: "absolute",
		top: "0",
		border: "1em solid salmon",
		background: "white",
		zIndex: "1000",
	});

	// create header elements
	const heading = document.createElement("div");
	heading.style.cssText = generateCssText({
		display: "flex",
		justifyContent: "space-between",
	});

	// h1 element
	const h1 = document.createElement("h1");
	h1.textContent = "Recipe:";
	h1.style.cssText = generateCssText({ margin: "0" });
	heading.append(h1);

	// toggle button
	const button = document.createElement("button");
	button.textContent = "-";
	button.classList.add("toggle-button");
	button.style.cssText = generateCssText({
		background: "salmon",
		height: "2em",
		width: "2em",
		borderRadius: "90px",
	});
	var css = ".toggle-button:hover{ background-color: rgb(250 128 114 / 70%) }";
	var style = document.createElement("style");
	style.appendChild(document.createTextNode(css));
	document.getElementsByTagName("head")[0].appendChild(style);

	let collapse = false;
	function handleCollapse() {
		if (collapse) {
			collapse = !collapse;
		} else {
			collapse = false;
		}
	}

	button.addEventListener("click", handleCollapse);
	addEventListener("beforeunload", () => {
		button.removeEventListener("click", handleCollapse);
	});

	heading.append(button);

	// DOM mutations
	documentBody.prepend(insertion);
	insertion.append(heading);
	insertion.append(header);
	insertion.append(body);
	insertion.append(footer);
}

function init() {
	// instantiate observers
	const observer = instantiateMutation();

	window.onload = function () {
		// remove troublesome nodes
		removeElements();
		// append recipe to top of doom
		appendRecipe();
	};

	// clean up
	addEventListener("beforeunload", () => {
		console.debug("🍳 disconnecting");
		observer.disconnect();
	});
}

try {
	init();
} catch (error) {
	console.debug(`🍳 failed 😢: `, error);
}
