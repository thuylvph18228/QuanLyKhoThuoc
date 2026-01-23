async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    document.getElementById("login-error").innerText =
      "Vui lòng nhập đầy đủ thông tin";
    return;
  }

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    document.getElementById("login-error").innerText =
      "Sai tài khoản hoặc mật khẩu";
    return;
  }

  const data = await res.json();

  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("fullName", data.fullName);

  window.location.href = "../index.html";
}
