function getRecipeEl() {
    return document.querySelector("[class^='recipe']");
}
/**
 * an empty div is typically some sort of overlay
 */
function removeEmptyDiv() {
    console.debug("\uD83C\uDF73 removing empty divs");
    Array.from(document.querySelectorAll("div"))
        .filter(function (el) { return !el.hasChildNodes(); })
        .forEach(function (el) { return el.remove(); });
}
function removeByQuery(string) {
    console.debug("\uD83C\uDF73 removing ".concat(string));
    Array.from(document.querySelectorAll(string)).forEach(function (el) { return el.remove(); });
}
var removableQueries = [
    '[role*="dialog"]',
    "iframe",
    '[aria-live="assertive"]',
];
function removeElements() {
    removeEmptyDiv();
    removableQueries.forEach(removeByQuery);
}
function instantiateMutation() {
    var mutationTarget = document.querySelector("#app-root");
    var mutationCallback = function (mutations) {
        // simple flag to indicate we need a refresh
        var refresh = false;
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node instanceof Element) {
                    removableQueries.forEach(function (query) {
                        if (node.matches(query) || node.querySelectorAll(query).length) {
                            console.debug("\uD83C\uDF73 removing ".concat(node.childElementCount, " node"));
                            refresh = true;
                            try {
                                node.remove();
                            }
                            catch (error) {
                                refresh = false;
                                console.debug("\uD83C\uDF73 error removing node: ", error);
                            }
                        }
                    });
                }
            });
        });
    };
    var config = { subtree: true, childList: true };
    var observer = new MutationObserver(mutationCallback);
    if (mutationTarget) {
        observer.observe(mutationTarget, config);
    }
    return observer;
}
function instantiateNetworkIdleHandler(handle, recipeNodes) {
    var options = { timeout: 3000 };
    var idleRequestCallback = function (deadline) {
        if (deadline.didTimeout) {
            console.debug("\uD83C\uDF73 refreshing DOM");
            var recipeTarget = getRecipeEl();
            recipeTarget === null || recipeTarget === void 0 ? void 0 : recipeTarget.replaceChildren.apply(recipeTarget, Array.from(recipeNodes !== null && recipeNodes !== void 0 ? recipeNodes : []));
        }
        else {
            console.debug("\uD83C\uDF73 restart idle request");
            handle = requestIdleCallback(idleRequestCallback, options);
        }
    };
    handle = requestIdleCallback(idleRequestCallback, options);
}
function init() {
    // closure over recipe nodes
    var recipeEl = getRecipeEl();
    // remove troublesome nodes
    window.onload = function () {
        removeElements();
    };
    var handle = 0;
    // instantiate observers
    var observer = instantiateMutation();
    instantiateNetworkIdleHandler(handle, recipeEl === null || recipeEl === void 0 ? void 0 : recipeEl.children);
    // clean up
    addEventListener("beforeunload", function () {
        observer.disconnect();
        window.cancelIdleCallback(handle);
    });
}
init();
