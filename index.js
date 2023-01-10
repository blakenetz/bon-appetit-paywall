var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var noScrollNodeList = ["html", "body"].map(function (sel) {
    return document.querySelector(sel);
});
var observables = ["#app", "main"].map(function (sel) { return document.querySelector(sel); });
var classNames = ["noScroll", "no-scroll"];
var config = {
    attributes: true,
    attributeFilter: ["class"]
};
function removeByQuery(string) {
    console.debug("\uD83C\uDF73 removing ".concat(string));
    Array.from(document.querySelectorAll(string)).forEach(function (el) { return el.remove(); });
}
function removeElements() {
    removeByQuery('[role="dialog"]');
    removeByQuery('[class*="modal"]');
    removeByQuery("iframe");
    removeByQuery("[aria-live]");
    removeEmptyDiv();
    overrideFixedPosition();
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
function overrideFixedPosition() {
    var selectors = [];
    Array.from(document.styleSheets).forEach(function (styleSheet) {
        try {
            return Array.from(styleSheet.cssRules).forEach(function (_a) {
                var _b;
                var cssText = _a.cssText;
                if (/position: fixed/.test(cssText)) {
                    selectors = selectors.concat((_b = cssText.match(/\..+?\s/g)) !== null && _b !== void 0 ? _b : []);
                }
                return false;
            });
        }
        catch (e) { }
    });
    console.debug("\uD83C\uDF73 inlining styles for ".concat(selectors.length, " elements"));
    selectors.forEach(function (sel) {
        var _a;
        try {
            (_a = document.querySelector(sel)) === null || _a === void 0 ? void 0 : _a.setAttribute("style", "position: relative;");
        }
        catch (error) { }
    });
}
function removeNoScrollClass(node) {
    Array.from(node.classList)
        .filter(function (cl) { return classNames.some(function (c) { return cl.includes(c); }); })
        .forEach(function (cl) { return node.classList.remove(cl); });
}
function init() {
    window.onload = function () {
        removeElements();
        classNames
            .map(function (cl) { return document.querySelectorAll("[class*=\"".concat(cl, "\"]")); })
            .map(function (nodeList) { return Array.from(nodeList); })
            .flat()
            .forEach(function (node) { return removeNoScrollClass(node); });
    };
    var observer = new MutationObserver(function (mutationsList) {
        mutationsList.forEach(function (mutation) {
            return removeNoScrollClass(mutation.target);
        });
        removeElements();
    });
    __spreadArray(__spreadArray([], noScrollNodeList, true), observables, true).forEach(function (el) {
        if (el)
            observer.observe(el, config);
    });
}
init();
