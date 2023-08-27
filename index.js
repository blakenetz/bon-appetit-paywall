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
];
function removeElements() {
    console.debug(`🍳 removing nodes`);
    removeEmptyDiv();
    removableQueries.forEach(removeByQuery);
}
function instantiateMutation({ header, body, footer }) {
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
    console.debug(`🍳 instantiating observer`);
    const observer = new MutationObserver(mutationCallback);
    const mutationTarget = getRootEl();
    const config = { subtree: true, childList: true };
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
    console.log(kiddos);
    window.onload = function () {
        // remove troublesome nodes
        removeElements();
    };
    // instantiate observers
    const observer = instantiateMutation(kiddos);
    // clean up
    addEventListener("beforeunload", () => {
        console.log("disconnect");
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
