(function () {
  "use strict";
  document.addEventListener("keydown", function (event) {
    if (event.defaultPrevented || event.repeat || event.altKey || event.shiftKey || !event.ctrlKey) return;
    if (event.key.toLowerCase() !== "o") return;
    const button = document.getElementById("choose-file-button");
    if (!button || button.disabled || button.hidden) return;
    event.preventDefault();
    button.click();
  });
})();
