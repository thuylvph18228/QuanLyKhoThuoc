/*************************************************
 * PRODUCT MODULE – WMS
 *************************************************/
(function () {
  let products = [];
  let selectedProduct = null;
  let page = 1;
  let pageSize = 10;

  /* ================= INIT ================= */
  async function initProductPage() {
    if (!document.getElementById("product-body")) return;
    await loadProducts();
  }

  window.pageRegistry["product"] = initProductPage;

  /* ================= LOAD ================= */
  async function loadProducts() {
    const res = await fetch(`${API_BASE_URL}/products`);
    products = await res.json();
    page = 1;
    renderProducts();
  }

  /* ================= RENDER ================= */
  function renderProducts() {
    const keyword =
      document.getElementById("searchInput")?.value.toLowerCase() || "";

    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(keyword),
    );

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const tbody = document.getElementById("product-body");
    tbody.innerHTML = "";
    selectedProduct = null;
    updateToolbarState();

    data.forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.unitName || ""}</td>
        <td>${(p.price || 0).toLocaleString()}</td>
      `;
      tr.onclick = () => selectRow(tr, p);
      tr.ondblclick = () => openEditProduct(p);
      tbody.appendChild(tr);
    });

    renderBasePagination({
      totalItems: filtered.length,
      currentPage: page,
      pageSize,
      containerId: "pagination",
      onPageChange: (p) => {
        page = p;
        renderProducts();
      },
    });
  }

  /* ================= SELECT ================= */
  function selectRow(row, product) {
    document
      .querySelectorAll("#product-body tr")
      .forEach((tr) => tr.classList.remove("selected"));

    row.classList.add("selected");
    selectedProduct = product;
    updateToolbarState();
  }

  function updateToolbarState() {
    btnEdit.disabled = !selectedProduct;
    btnDelete.disabled = !selectedProduct;
  }

  /* ================= SEARCH ================= */
  window.searchProducts = function () {
    page = 1;
    renderProducts();
  };

  window.changePageSize = function () {
    pageSize = Number(pageSizeSelect.value);
    page = 1;
    renderProducts();
  };

  /* ================= MODAL ================= */
  window.openProductForm = async function () {
    resetForm();
    modalTitle.innerText = "Thêm sản phẩm";
    await loadUnits();
    productModal.classList.remove("hidden");
  };

  async function openEditProduct(p) {
    resetForm();
    modalTitle.innerText = "Sửa sản phẩm";

    productId.value = p.id;
    productName.value = p.name;
    productPrice.value = p.price;
    productCode.value = p.code || "";
    manufacturer.value = p.manufacturer || "";
    packing.value = p.packing || "";
    description.value = p.description || "";

    await loadUnits();
    productUnit.value = p.unitId;

    productModal.classList.remove("hidden");
  }

  window.editSelectedProduct = function () {
    if (!selectedProduct) return;
    openEditProduct(selectedProduct);
  };

  window.closeProductForm = function () {
    productModal.classList.add("hidden");
  };

  function resetForm() {
    document.querySelectorAll(".tab-btn").forEach((b, i) => {
      b.classList.toggle("active", i === 0);
    });
    document.querySelectorAll(".tab-content").forEach((c, i) => {
      c.classList.toggle("active", i === 0);
    });

    productId.value = "";
    productName.value = "";
    productPrice.value = "";
    productCode.value = "";
    manufacturer.value = "";
    packing.value = "";
    description.value = "";
  }

  /* ================= SAVE ================= */
  window.saveProduct = async function () {
    const payload = {
      name: productName.value.trim(),
      unitId: Number(productUnit.value),
      price: Number(productPrice.value),
      code: productCode.value,
      manufacturer: manufacturer.value,
      packing: packing.value,
      description: description.value,
    };

    if (!payload.name || !payload.unitId || payload.price <= 0) {
      return showToast("Dữ liệu không hợp lệ", "error");
    }

    const id = productId.value;
    await fetch(`${API_BASE_URL}/products${id ? "/" + id : ""}`, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    closeProductForm();
    loadProducts();
    showToast("Lưu thành công", "success");
  };

  /* ================= DELETE ================= */
  window.deleteSelectedProduct = async function () {
    if (!selectedProduct) return;
    if (!confirm(`Xóa "${selectedProduct.name}" ?`)) return;

    await fetch(`${API_BASE_URL}/products/${selectedProduct.id}`, {
      method: "DELETE",
    });

    loadProducts();
    showToast("Đã xóa", "success");
  };

  /* ================= UNITS ================= */
  async function loadUnits() {
    const res = await fetch(`${API_BASE_URL}/units`);
    const data = await res.json();

    productUnit.innerHTML = `<option value="">-- Chọn đơn vị --</option>`;
    data.forEach((u) => {
      productUnit.innerHTML += `<option value="${u.id}">${u.name}</option>`;
    });
  }

  /* ================= TABS ================= */
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("tab-btn")) return;

    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));

    e.target.classList.add("active");
    document.getElementById(e.target.dataset.tab).classList.add("active");
  });
})();
