// registry cho các page
window.pageRegistry = {};

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
