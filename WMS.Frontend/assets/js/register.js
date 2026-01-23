async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const fullName = document.getElementById("fullName").value;

  if (!username || !password) {
    alert("Vui lòng nhập username và password");
    return;
  }

  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password,
      fullName,
    }),
  });

  const text = await res.text();

  if (res.ok) {
    alert("Đăng ký thành công");
  } else {
    alert(text);
  }
}
