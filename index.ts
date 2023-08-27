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
];

function removeElements() {
	console.debug(`🍳 removing nodes`);
	removeEmptyDiv();
	removableQueries.forEach(removeByQuery);
}

function instantiateMutation({ header, body, footer }: PageEls) {
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

	console.debug(`🍳 instantiating observer`);
	const observer = new MutationObserver(mutationCallback);

	const mutationTarget = getRootEl();
	const config: MutationObserverInit = { subtree: true, childList: true };
	if (mutationTarget) {
		observer.observe(mutationTarget, config);
	}

	// prepend recipe to start of document
	console.debug(`🍳 appending nodes to top of document`);
	console.debug(body, header, footer);
	const documentBody = getNode("body", false);

	const insertion = document.createElement("section");
	documentBody.prepend(insertion);
	insertion.append(header);
	insertion.append(body);
	insertion.append(footer);

	return observer;
}

function init() {
	// closure over main elements
	const kiddos = getPageEls();

	window.onload = function () {
		// remove troublesome nodes
		removeElements();
	};

	// instantiate observers
	const observer = instantiateMutation(kiddos);

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
