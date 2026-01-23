// registry cho các page
window.pageRegistry = {};
// ===== AUTH CHECK =====
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "pages/login.html";
}
/* ================= MENU TOGGLE ================= */
function toggleMenu(el) {
  el.classList.toggle("open");
}

/* ================= ROUTER ================= */
// load script 1 lần duy nhất
async function loadScriptOnce(src) {
  if (document.querySelector(`script[src="${src}"]`)) return;

  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    s.onload = resolve;
    s.onerror = () => reject(`Không load được ${src}`);
    document.body.appendChild(s);
  });
}

// router
async function navigate(page, el) {
  document
    .querySelectorAll(".menu-item,.submenu-item")
    .forEach((i) => i.classList.remove("active"));
  if (el) el.classList.add("active");

  const content = document.getElementById("content");

  try {
    // load CSS page
    loadPageCss(page);
    // load HTML
    const res = await fetch(`pages/${page}.html`);
    content.innerHTML = await res.text();

    // load JS page
    await loadScriptOnce(`assets/js/${page}.js`);

    // gọi init page
    window.pageRegistry?.[page]?.();
  } catch (err) {
    console.error(err);
    content.innerHTML = "<p>Lỗi tải trang</p>";
  }
}

// load mặc định
navigate("product");

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  navigate("dashboard");
});

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `app-toast ${type}`;
  toast.innerText = message;

  document.getElementById("toast").appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

function loadPageCss(page) {
  const old = document.getElementById("page-css");
  if (old) old.remove();

  const link = document.createElement("link");
  link.id = "page-css";
  link.rel = "stylesheet";
  link.href = `assets/css/${page}.css`;

  document.head.appendChild(link);
}
const fullName = localStorage.getItem("fullName") || "";
const role = localStorage.getItem("role");

const userEl = document.getElementById("userFullName");
if (userEl) userEl.innerText = fullName;

// Ẩn menu admin nếu không phải ADMIN
document.querySelectorAll("[data-role='admin']").forEach((el) => {
  if (role !== "ADMIN") el.style.display = "none";
});

localStorage.setItem("token", res.token);
localStorage.setItem("fullName", res.fullName);

document.getElementById("helloUser").innerText = "Xin chào, " + res.fullName;

function openChangePassword() {
  document.getElementById("changePasswordModal").classList.remove("hidden");
}

async function changePassword() {
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;

  const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      oldPassword,
      newPassword,
    }),
  });

  const text = await res.text();

  if (res.ok) {
    alert("Đổi mật khẩu thành công. Vui lòng đăng nhập lại");
    logout();
  } else {
    alert(text);
  }
}

function closeChangePassword() {
  document.getElementById("changePasswordModal").classList.add("hidden");
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("fullName");

  window.location.href = "pages/login.html";
}
