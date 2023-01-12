function getRecipeEl() {
	return document.querySelector("[class^='recipe']");
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
];

function removeElements() {
	removeEmptyDiv();
	removableQueries.forEach(removeByQuery);
}

function instantiateMutation() {
	const mutationTarget = document.querySelector("#app-root");
	const mutationCallback: MutationCallback = (mutations) => {
		// simple flag to indicate we need a refresh
		let refresh = false;

		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				if (node instanceof Element) {
					removableQueries.forEach((query) => {
						if (node.matches(query) || node.querySelectorAll(query).length) {
							console.debug(`🍳 removing ${node.childElementCount} node`);
							refresh = true;
							try {
								node.remove();
							} catch (error) {
								refresh = false;
								console.debug(`🍳 error removing node: `, error);
							}
						}
					});
				}
			});
		});
	};
	const config: MutationObserverInit = { subtree: true, childList: true };

	const observer = new MutationObserver(mutationCallback);
	if (mutationTarget) {
		observer.observe(mutationTarget, config);
	}

	return observer;
}

function init() {
	// closure over recipe nodes
	const recipeEl = getRecipeEl();

	// remove troublesome nodes
	window.onload = function () {
		removeElements();
	};

	// instantiate observers
	const observer = instantiateMutation();

	// clean up
	addEventListener("beforeunload", () => {
		observer.disconnect();
	});
}

init();
