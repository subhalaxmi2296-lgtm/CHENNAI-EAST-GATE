const api = window.EastgateStore;

const form = document.getElementById("adminLoginForm");
const email = document.getElementById("adminEmail");
const password = document.getElementById("adminPassword");

function unlockAdmin(next) {
  api.saveAdminAuth({ authed: true, at: new Date().toISOString() });
  window.location.href = next || "./admin.html";
}

if (api.getAdminAuth()?.authed) {
  window.location.href = "./admin.html";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const ok =
    email.value.trim().toLowerCase() === "admin@chennaieastgate.com" &&
    password.value.trim() === "Eastgate@2026";

  if (!ok) {
    alert("Invalid admin credentials.");
    return;
  }

  unlockAdmin("./admin.html");
});
