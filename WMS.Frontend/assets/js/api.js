const API_BASE_URL = "https://localhost:44327/api";

async function fetchData(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}
