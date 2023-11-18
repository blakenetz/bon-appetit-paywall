(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
function getNode(selector, clone = true) {
    const el = document.querySelector(selector);
    if (el === null) {
        throw Error(`🍳 Unable to find element: ${selector}`);
    }
    if (!clone)
        return el;
    const cloneEl = el.cloneNode(true);
    const returnEl = document.createElement("section");
    returnEl.append(cloneEl);
    return returnEl;
}
function getPageEls() {
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
function removeByQuery(string) {
    console.debug(`🍳 removing ${string}`);
    Array.from(document.querySelectorAll(string)).forEach((el) => el.remove());
}
const removableQueries = [
    '[role*="dialog"]',
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
    const mutationCallback = (mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node instanceof Element) {
                    removableQueries.forEach((query) => {
                        if (node.matches(query) || node.querySelectorAll(query).length) {
                            console.debug(`🍳 removing ${node.childElementCount} node`);
                            try {
                                node.remove();
                            }
                            catch (error) {
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
    const config = { subtree: true, childList: true };
    if (mutationTarget) {
        console.debug(`🍳 instantiating observer`);
        observer.observe(mutationTarget, config);
    }
    return observer;
}
/** @see https://stackoverflow.com/a/67243723 */
function kebabize(str) {
    return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());
}
function generateCssText(css) {
    return Object.keys(css)
        .map((key) => `${kebabize(key)}:${css[key]}`)
        .join(";");
}
function appendRecipe() {
    // fetch target elements
    const documentBody = getNode("body", false);
    const { header, body, footer } = getPageEls();
    // create insertion node
    const insertion = document.createElement("section");
    const insertionCss = {
        padding: "8px",
        position: "absolute",
        top: "0",
        border: "8px solid salmon",
        background: "white",
        zIndex: "1000",
    };
    insertion.style.cssText = generateCssText(insertionCss);
    // create header elements
    const heading = document.createElement("div");
    const headingCss = {
        display: "flex",
    };
    heading.style.cssText = generateCssText(headingCss);
    const h1 = document.createElement("h1");
    h1.textContent = "Recipe:";
    heading.append(h1);
    const collapseToggle = document.createElement("button");
    collapseToggle.textContent = "-";
    let collapse = false;
    function handleCollapse() {
        if (collapse) {
            collapse = !collapse;
        }
        else {
            collapse = false;
        }
    }
    collapseToggle.addEventListener("click", handleCollapse);
    addEventListener("beforeunload", () => {
        collapseToggle.removeEventListener("click", handleCollapse);
    });
    heading.append(collapseToggle);
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
}
catch (error) {
    console.debug(`🍳 failed 😢: `, error);
}

},{}]},{},[1]);
