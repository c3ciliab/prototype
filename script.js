// /* OPEN/CLOSE MENU */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;

  const item = btn.closest(".menu-filter");
  const list = item.querySelector(".filter-list");

  const willOpen = !item.classList.contains("is-open");
  item.classList.toggle("is-open", willOpen);

  btn.setAttribute("aria-expanded", String(willOpen));
  if (list) list.hidden = !willOpen;
});

// search inside panel
document.addEventListener("input", (e) => {
  const input = e.target.closest(".filter-search__input");
  if (!input) return;

  const panel = input.closest(".filter-panel");
  const q = input.value.trim().toLowerCase();

  panel.querySelectorAll(".checklist__item").forEach(li => {
    if (li.classList.contains("checklist__item--selectall")) return;

    const label = li.innerText.trim().toLowerCase();
    li.style.display = label.includes(q) ? "" : "none";
  });

  // recalc dropdown height after filtering
  const wrap = input.closest(".menu-filter")?.querySelector(".filter-list");
  if (wrap && wrap.closest(".menu-filter").classList.contains("is-open")) {
    setMaxHeight(wrap, true);
  }

  // update select-all state after filtering
  updateSelectAll(panel);
});

// select all + indeterminate
function updateSelectAll(panel) {
  const selectAll = panel.querySelector(".select-all");
  const items = [...panel.querySelectorAll(".check__input.item")]
    .filter(cb => cb.closest(".checklist__item").style.display !== "none");

  const checked = items.filter(cb => cb.checked).length;

  if (!selectAll) return;
  selectAll.indeterminate = checked > 0 && checked < items.length;
  selectAll.checked = items.length > 0 && checked === items.length;
}

document.addEventListener("change", (e) => {
  const panel = e.target.closest(".filter-panel");
  if (!panel) return;

  // click select-all
  if (e.target.classList.contains("select-all")) {
    const checked = e.target.checked;
    panel.querySelectorAll(".check__input.item").forEach(cb => {
      // option: ne coche que les visibles
      if (cb.closest(".checklist__item").style.display === "none") return;
      cb.checked = checked;
    });
    updateSelectAll(panel);
    return;
  }

  // click a single item -> update select-all state
  if (e.target.classList.contains("item")) {
    updateSelectAll(panel);
  }
});

document.addEventListener("click", (e) => {
  const clearBtn = e.target.closest(".filter-search__clear");
  if (!clearBtn) return;

  const panel = clearBtn.closest(".filter-panel");
  const input = panel.querySelector(".filter-search__input");
  const wrap = panel.closest(".menu-filter")?.querySelector(".filter-list");

  // 1) reset search
  if (input) input.value = "";

  // 2) show all rows
  panel.querySelectorAll(".checklist__item").forEach(li => {
    li.style.display = "";
  });

  // 3) uncheck all items
  panel.querySelectorAll(".check__input.item").forEach(cb => cb.checked = false);

  // 4) reset select all state
  const selectAll = panel.querySelector(".select-all");
  if (selectAll) {
    selectAll.checked = false;
    selectAll.indeterminate = false;
  }

  // 5) recalc dropdown height if open
  if (wrap && wrap.closest(".menu-filter").classList.contains("is-open")) {
    wrap.style.maxHeight = wrap.scrollHeight + "px";
  }
});

// /* POPUP TOGGLE */
const GAP = 12;

function closeAllPopups(exceptPopup = null) {
  document.querySelectorAll(".popup.is-open").forEach(p => {
    if (p !== exceptPopup) {
      p.classList.remove("is-open");
      p.setAttribute("aria-hidden", "true");
    }
  });

  document.querySelectorAll(".trigger[aria-expanded='true']").forEach(b => {
    const id = b.getAttribute("aria-controls");
    const p = id ? document.getElementById(id) : null;
    if (!exceptPopup || p !== exceptPopup) b.setAttribute("aria-expanded", "false");
  });
}

function positionPopup(trigger, popup) {
  const r = trigger.getBoundingClientRect();
  const pos = trigger.dataset.popupPos || "center";

  popup.style.position = "absolute";
  //popup.style.top = `${window.scrollY + r.bottom + 8}px`; // 8px btn bottom
  //popup.style.left = `${window.scrollX + r.right - popup.offsetWidth}px`; // align right
  popup.style.top = `${window.scrollY + r.bottom + GAP}px`;

  if (pos === "right") {
    // calée à droite de l’écran
    popup.style.left = "auto";
    popup.style.right = "1rem";
  } else {
    // centrée sous le bouton
    popup.style.right = "auto";
    const left = window.scrollX + (r.left + r.width / 2) - (popup.offsetWidth / 2);
    popup.style.left = `${Math.max(window.scrollX + 12, left)}px`; // évite de sortir à gauche
  }
}

document.addEventListener("click", (e) => {
  const trigger = e.target.closest(".trigger");

  // click on trigger
  if (trigger) {
    const popupId = trigger.getAttribute("aria-controls");
    const popup = popupId ? document.getElementById(popupId) : null;
    if (!popup) return;

    const willOpen = !popup.classList.contains("is-open");
    closeAllPopups(popup);

    if (willOpen) {
      popup.classList.add("is-open");
      popup.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");

      // placer après ouverture pour que offsetWidth soit correct
      requestAnimationFrame(() => positionPopup(trigger, popup));
    } else {
      popup.classList.remove("is-open");
      popup.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");
    }

    return;
  }

  // click inside popup => don't close
  if (e.target.closest(".popup")) return;
  // click outside => close everything
  closeAllPopups();
});

// "esc" => close everything
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllPopups();
});

// Si on scroll/resize, on repositionne les popups ouvertes
window.addEventListener("resize", () => {
  document.querySelectorAll(".trigger[aria-expanded='true']").forEach(btn => {
    const id = btn.getAttribute("aria-controls");
    const p = id ? document.getElementById(id) : null;
    if (p && p.classList.contains("is-open")) positionPopup(btn, p);
  });
});
window.addEventListener("scroll", () => {
  document.querySelectorAll(".trigger[aria-expanded='true']").forEach(btn => {
    const id = btn.getAttribute("aria-controls");
    const p = id ? document.getElementById(id) : null;
    if (p && p.classList.contains("is-open")) positionPopup(btn, p);
  });
}, { passive: true });

// /* DELETE */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-delete");
  if (!btn) return;

  btn.closest("p")?.remove();
});

// /* CLOCK */
function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatClock(now) {
  const day = pad2(now.getDate());
  const month = pad2(now.getMonth() + 1);

  let hours = now.getHours();
  const minutes = pad2(now.getMinutes());
  const seconds = pad2(now.getSeconds());

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  return `${day}/${month} - ${hours}:${minutes}:${seconds} ${ampm}`;
}

function formatDay(now) {
  // JJ/Mmm/AAAA
  const day = pad2(now.getDate());
  const month = pad2(now.getMonth() + 1);
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
  //const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  //const mon = months[now.getMonth()];
  //return `${day}, ${mon} ${year}`;
}

function tick() {
  const now = new Date();

  const clockEl = document.getElementById("clock");
  if (clockEl) clockEl.textContent = formatClock(now);

  const dayEl = document.getElementById("dayOnly");
  if (dayEl) dayEl.textContent = formatDay(now);
}

tick();
setInterval(tick, 1000);

// /* CLOCK */
