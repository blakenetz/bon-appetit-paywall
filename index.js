(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
function getNode(selector) {
    const el = document.querySelector(selector);
    if (el === null) {
        throw Error(`🍳 Unable to find element: ${selector}`);
    }
    return el;
}
function cloneNode(selector) {
    const el = getNode(selector);
    const cloneEl = el.cloneNode(true);
    const returnEl = document.createElement("section");
    returnEl.append(cloneEl);
    return returnEl;
}
function getPageEls() {
    return {
        header: cloneNode('[data-testid="RecipePageLedBackground"]'),
        body: cloneNode("[class^='recipe']"),
        footer: cloneNode('[data-testid="RecipePagContentBackground"]'),
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
function createEl(tag, css, content = "", attr = {}) {
    const el = document.createElement(tag);
    el.style.cssText = generateCssText(css);
    if (content) {
        el.textContent = content;
    }
    if (attr) {
        Object.keys(attr).forEach((name) => el.setAttribute(name, attr[name]));
    }
    return el;
}
function appendRecipe() {
    // fetch target elements
    const documentBody = getNode("body");
    const { header, body, footer } = getPageEls();
    const insertion = createEl("section", {
        padding: "1em",
        position: "absolute",
        top: "0",
        border: "1em solid salmon",
        background: "white",
        zIndex: "1000",
    }, undefined, { id: "insert" });
    const heading = createEl("div", {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "1em",
    });
    const h1 = createEl("h1", { margin: "0" }, "Recipe:");
    heading.append(h1);
    const collapseBtn = createEl("button", { display: "block" }, "-", {
        class: "toggle-button",
        id: "collapse",
    });
    heading.append(collapseBtn);
    const expandBtn = createEl("button", {
        position: "fixed",
        bottom: "1em",
        right: "1.5em",
        display: "none",
    }, "+", { class: "toggle-button", id: "expand" });
    // button styles
    const style = document.createElement("style");
    const buttonCss = {
        base: {
            height: "2em",
            width: "2em",
            borderRadius: "90px",
            background: "salmon",
        },
        hover: {
            backgroundColor: "rgb(250 128 114 / 70%)",
            textDecoration: "none",
        },
    };
    const buttonCssText = `.toggle-button{ ${generateCssText(buttonCss.base)} }
	.toggle-button:hover, .toggle-button:focus{ ${generateCssText(buttonCss.hover)} }`;
    style.appendChild(document.createTextNode(buttonCssText));
    document.getElementsByTagName("head")[0].appendChild(style);
    // button logic
    function handleClick(e) {
        const target = e.target;
        const expandBtn = getNode("#expand");
        const main = getNode("#insert");
        if (target.id === "collapse") {
            expandBtn.style.display = "block";
            main.style.display = "none";
        }
        else {
            expandBtn.style.display = "none";
            main.style.display = "block";
        }
    }
    collapseBtn.addEventListener("click", handleClick);
    expandBtn.addEventListener("click", handleClick);
    addEventListener("beforeunload", () => {
        collapseBtn.removeEventListener("click", handleClick);
        expandBtn.removeEventListener("click", handleClick);
    });
    // DOM mutations
    documentBody.prepend(insertion);
    insertion.append(heading);
    insertion.append(header);
    insertion.append(body);
    insertion.append(footer);
    documentBody.append(expandBtn);
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
