document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".footer-list__toggle").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      let expanded = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", !expanded);
    });
  });
});
