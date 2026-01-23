const API_BASE_URL = "https://localhost:44327/api";

async function fetchData(url, options = {}) {
  const token = localStorage.getItem("token");

  options.headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: "Bearer " + token }),
    ...options.headers,
  };

  const res = await fetch(url, options);

  if (res.status === 401) {
    localStorage.clear();
    location.href = "pages/login.html";
    return;
  }

  return res.json();
}
