/*************************************************
 * PRODUCT MODULE – WMS
 *************************************************/
(function () {
  let products = [];
  let selectedProduct = null;
  let productPage = 1;
  let productPageSize = 5;

  /* ================= LOAD ================= */
  async function initProductPage() {
    if (!document.getElementById("product-body")) return;
    await loadProducts();
  }

  // 👉 ĐĂNG KÝ VỚI ROUTER
  window.pageRegistry["product"] = initProductPage;

  /* ================= Products ================= */
  async function loadProducts() {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      products = await res.json();

      productPage = 1;
      renderProducts();
    } catch (err) {
      console.error(err);
      showToast("Không tải được danh sách sản phẩm", "error");
    }
  }

  /* ================= RENDER TABLE ================= */
  function renderProducts() {
    const keyword =
      document.getElementById("searchInput")?.value.toLowerCase() || "";

    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(keyword),
    );

    const start = (productPage - 1) * productPageSize;
    const pageData = filtered.slice(start, start + productPageSize);

    const tbody = document.getElementById("product-body");
    if (!tbody) return;

    tbody.innerHTML = "";
    selectedProduct = null;
    updateToolbarState();

    pageData.forEach((p) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.unitName}</td>
      <td>${p.price.toLocaleString()}</td>
    `;

      tr.addEventListener("click", () => selectProduct(tr, p));
      tr.addEventListener("dblclick", () => openEditProduct(p));

      tbody.appendChild(tr);
    });

    renderBasePagination({
      totalItems: filtered.length,
      currentPage: productPage,
      pageSize: productPageSize,
      containerId: "pagination",
      onPageChange: (page) => {
        productPage = page;
        renderProducts();
      },
    });
  }

  /* ================= SELECT ROW ================= */
  function selectProduct(row, product) {
    const isSelected = row.classList.contains("selected");

    document
      .querySelectorAll("#product-body tr")
      .forEach((tr) => tr.classList.remove("selected"));

    if (isSelected) {
      selectedProduct = null;
    } else {
      row.classList.add("selected");
      selectedProduct = product;
    }

    updateToolbarState();
  }

  /* ================= TOOLBAR ================= */
  function updateToolbarState() {
    const btnEdit = document.getElementById("btnEdit");
    const btnDelete = document.getElementById("btnDelete");

    if (btnEdit) btnEdit.disabled = !selectedProduct;
    if (btnDelete) btnDelete.disabled = !selectedProduct;
  }

  /* ================= SEARCH ================= */
  function searchProducts() {
    productPage = 1;
    renderProducts();
  }

  /* ================= PAGE SIZE ================= */
  function changePageSize() {
    productPageSize = Number(document.getElementById("pageSizeSelect").value);
    productPage = 1;
    renderProducts();
  }

  /* ================= ADD ================= */
  async function openProductForm() {
    selectedProduct = null;
    updateToolbarState();

    document.getElementById("modalTitle").innerText = "Thêm sản phẩm";
    document.getElementById("productId").value = "";
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";

    const modal = document.getElementById("productModal");
    modal.classList.remove("hidden");

    await loadUnitOptions();
    document.getElementById("productUnit").value = "";
  }

  /* ================= EDIT ================= */
  async function openEditProduct(product) {
    selectedProduct = product;
    updateToolbarState();

    document.getElementById("modalTitle").innerText = "Sửa sản phẩm";
    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    await loadUnitOptions();
    document.getElementById("productUnit").value = product.unitId;
    document.getElementById("productPrice").value = product.price;

    document.getElementById("productModal").classList.remove("hidden");
  }

  function editSelectedProduct() {
    if (!selectedProduct) {
      showToast("Vui lòng chọn sản phẩm để sửa", "error");
      return;
    }
    openEditProduct(selectedProduct);
  }

  /* ================= SAVE ================= */
  async function saveProduct() {
    const name = document.getElementById("productName").value.trim();
    const unitId = Number(document.getElementById("productUnit").value);
    const price = Number(document.getElementById("productPrice").value);

    if (!name) return showToast("Tên sản phẩm không được để trống", "error");
    if (!unitId) return showToast("Vui lòng chọn đơn vị tính", "error");
    if (isNaN(price) || price <= 0)
      return showToast("Giá phải lớn hơn 0", "error");

    const payload = { name, unitId, price };
    const id = document.getElementById("productId").value;

    await fetch(`${API_BASE_URL}/products${id ? "/" + id : ""}`, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    closeProductForm();
    loadProducts();
    showToast("Lưu sản phẩm thành công", "success");
  }

  /* ================= DELETE ================= */
  async function deleteSelectedProduct() {
    if (!selectedProduct)
      return showToast("Vui lòng chọn sản phẩm để xóa", "error");

    if (!confirm(`Xóa sản phẩm "${selectedProduct.name}" ?`)) return;

    await fetch(`${API_BASE_URL}/products/${selectedProduct.id}`, {
      method: "DELETE",
    });

    loadProducts();
    showToast("Đã xóa sản phẩm", "success");
  }

  /* ================= MODAL ================= */
  function closeProductForm() {
    document.getElementById("productModal").classList.add("hidden");
  }

  /* ================= Units ================= */
  async function loadUnitOptions() {
    const select = document.getElementById("productUnit");
    if (!select) return;

    const res = await fetch(`${API_BASE_URL}/units`);
    const data = await res.json();

    select.innerHTML = `<option value="">-- Chọn đơn vị --</option>`;
    data.forEach((u) => {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = u.name;
      select.appendChild(opt);
    });
  }
  // EXPORT
  window.searchProducts = searchProducts;
  window.changePageSize = changePageSize;
  window.openProductForm = openProductForm;
  window.closeProductForm = closeProductForm;
  window.editSelectedProduct = editSelectedProduct;
  window.saveProduct = saveProduct;
  window.deleteSelectedProduct = deleteSelectedProduct;
})();
