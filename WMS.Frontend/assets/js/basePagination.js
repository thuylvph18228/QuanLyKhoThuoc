/*************************************************
 * BASE PAGINATION – REUSABLE
 *************************************************/

/**
 * renderBasePagination({
 *   totalItems,
 *   currentPage,
 *   pageSize,
 *   containerId,
 *   onPageChange,
 *   maxVisiblePages = 5
 * })
 */
function renderBasePagination({
  totalItems,
  currentPage,
  pageSize,
  containerId,
  onPageChange,
  maxVisiblePages = 5,
}) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const container = document.getElementById(containerId);
  if (!container || totalPages < 1) {
    if (container) container.innerHTML = "";
    return;
  }

  container.innerHTML = "";

  const createBtn = (text, page, disabled = false, active = false) => {
    const btn = document.createElement("button");
    btn.innerHTML = text;
    btn.className = "btn btn-light";
    if (active) btn.classList.add("btn-primary");
    btn.disabled = disabled;
    btn.onclick = () => onPageChange(page);
    return btn;
  };

  // ⏮ First
  container.appendChild(createBtn("⏮", 1, currentPage === 1));

  // ◀ Prev
  container.appendChild(createBtn("◀", currentPage - 1, currentPage === 1));

  // ===== TÍNH RANGE HIỂN THỊ =====
  let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let end = start + maxVisiblePages - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  if (start > 1) {
    container.appendChild(createBtn("1", 1));
    if (start > 2) {
      const dots = document.createElement("span");
      dots.innerText = "...";
      dots.style.padding = "0 6px";
      container.appendChild(dots);
    }
  }

  for (let i = start; i <= end; i++) {
    container.appendChild(createBtn(i, i, false, i === currentPage));
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      const dots = document.createElement("span");
      dots.innerText = "...";
      dots.style.padding = "0 6px";
      container.appendChild(dots);
    }
    container.appendChild(createBtn(totalPages, totalPages));
  }

  // ▶ Next
  container.appendChild(
    createBtn("▶", currentPage + 1, currentPage === totalPages)
  );

  // ⏭ Last
  container.appendChild(createBtn("⏭", totalPages, currentPage === totalPages));
}
