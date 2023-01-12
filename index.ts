function findRecipeEl(): Element | null {
  return document.querySelector("[class^='recipe']");
}

function init() {
  const recipeEl = findRecipeEl();
  let children: HTMLCollection;
  if (recipeEl) {
    children = recipeEl.children;
  }

  document.addEventListener("load", () => {
    console.log("loaded");
  });
}

init();

// old code

// const noScrollNodeList = ["html", "body"].map((sel) =>
//   document.querySelector(sel)
// );
// const observables = ["#app", "main"].map((sel) => document.querySelector(sel));

// const classNames = ["noScroll", "no-scroll"];

// const config: MutationObserverInit = {
//   attributes: true,
//   attributeFilter: ["class"],
// };

// function removeByQuery(string: keyof HTMLElementTagNameMap | string) {
//   console.debug(`🍳 removing ${string}`);
//   Array.from(document.querySelectorAll(string)).forEach((el) => el.remove());
// }

// function removeElements() {
//   removeByQuery('[role="dialog"]');
//   removeByQuery('[class*="modal"]');
//   removeByQuery("iframe");
//   removeByQuery("[aria-live]");
//   removeEmptyDiv();
//   overrideFixedPosition();
// }

// /**
//  * an empty div is typically some sort of overlay
//  */
// function removeEmptyDiv() {
//   console.debug(`🍳 removing empty divs`);
//   Array.from(document.querySelectorAll("div"))
//     .filter((el) => !el.hasChildNodes())
//     .forEach((el) => el.remove());
// }

// function overrideFixedPosition() {
//   let selectors: string[] = [];

//   Array.from(document.styleSheets).forEach((styleSheet) => {
//     try {
//       return Array.from(styleSheet.cssRules).forEach(({ cssText }) => {
//         if (/position: fixed/.test(cssText)) {
//           selectors = selectors.concat(cssText.match(/\..+?\s/g) ?? []);
//         }
//         return false;
//       });
//     } catch (e) {}
//   });

//   console.debug(`🍳 inlining styles for ${selectors.length} elements`);

//   selectors.forEach((sel) => {
//     try {
//       document.querySelector(sel)?.setAttribute("style", "position: relative;");
//     } catch (error) {}
//   });
// }

// function removeNoScrollClass(node: Element) {
//   Array.from(node.classList)
//     .filter((cl) => classNames.some((c) => cl.includes(c)))
//     .forEach((cl) => node.classList.remove(cl));
// }

// function init() {
//   window.onload = function () {
//     removeElements();
//     classNames
//       .map((cl) => document.querySelectorAll(`[class*="${cl}"]`))
//       .map((nodeList) => Array.from(nodeList))
//       .flat()
//       .forEach((node) => removeNoScrollClass(node));
//   };

//   const observer = new MutationObserver((mutationsList) => {
//     mutationsList.forEach((mutation) =>
//       removeNoScrollClass(mutation.target as HTMLElement)
//     );
//     removeElements();
//   });

//   [...noScrollNodeList, ...observables].forEach((el) => {
//     if (el) observer.observe(el, config);
//   });
// }

// init();
