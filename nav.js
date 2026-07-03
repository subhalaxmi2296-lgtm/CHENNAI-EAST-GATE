(function () {
  function toggle(menu, button, open) {
    if (!menu || !button) return;
    if (open) {
      menu.classList.add("open");
      menu.setAttribute("aria-hidden", "false");
      button.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    } else {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
      button.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  }

  function wire(hamburgerId, menuId, closeId) {
    var btn = document.getElementById(hamburgerId);
    var menu = document.getElementById(menuId);
    var closeBtn = document.getElementById(closeId);
    if (!btn || !menu) return;
    btn.addEventListener("click", function () {
      var open = !menu.classList.contains("open");
      toggle(menu, btn, open);
    });
    if (closeBtn) closeBtn.addEventListener("click", function () { toggle(menu, btn, false); });
    menu.addEventListener("click", function (e) {
      if (e.target === menu) toggle(menu, btn, false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") toggle(menu, btn, false);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wire("hamburgerButton", "mobileMenu", "mobileMenuClose");
    wire("adminHamburger", "adminMobileMenu", "adminMobileMenuClose");
  });
})();
