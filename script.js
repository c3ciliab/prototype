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

// /* FLOCKS LIST */
function createRowLine(cells, flockName, volume, female, male, vfemale, vmale) {
  const row = document.createElement("div");
  row.className = "row-line";
  row.dataset.flock = flockName;
  row.dataset.volume = volume;
  row.dataset.female = female;
  row.dataset.male = male;
  row.dataset.vfemale = vfemale;
  row.dataset.vmale = vmale;

  cells.forEach((cell) => {
    const span = document.createElement("span");
    span.textContent = String(cell);
    row.appendChild(span);
  });

  return row;
}

function renderRowLines(container, rows) {
  const el = typeof container === "string" ? document.querySelector(container) : container;
  if (!el) return;

  el.innerHTML = "";
  const frag = document.createDocumentFragment();

  rows.forEach((r) => {
    const cells = Array.isArray(r) ? r : [
      r.id,
      r.lot,
      r.age,
      r.volume,
      r.female,
      r.male
    ];
    const flockName = Array.isArray(r) ? r[1] : r.lot;
    const volume    = Array.isArray(r) ? r[3] : r.volume;
    const female    = Array.isArray(r) ? r[4] : r.female;
    const male    = Array.isArray(r) ? r[5] : r.male;
    const vfemale   = Array.isArray(r) ? r[6] : r.vfemale;
    const vmale     = Array.isArray(r) ? r[7] : r.vmale;

    frag.appendChild(createRowLine(cells, flockName, volume, female, male, vfemale, vmale));
  });

  el.appendChild(frag);
}

// click update
document.addEventListener("click", (e) => {
  const row = e.target.closest(".row-line");
  if (!row) return;

  const flock = row.dataset.flock;
  const volume = row.dataset.volume;
  const female = row.dataset.female;
  const male = row.dataset.male;
  const vfemale = row.dataset.vfemale;
  const vmale = row.dataset.vmale;

  const flockEl = document.getElementById("ongoingFlock");
  if (flockEl && flock) flockEl.textContent = flock;

  document.querySelectorAll(".sorted-volume").forEach((el) => {
    el.textContent = volume ?? "-";
  });

  document.querySelectorAll(".pctMale").forEach((el) => {
    el.textContent = male ?? "-";
  });
  document.querySelectorAll(".pctFemale").forEach((el) => {
    el.textContent = female ?? "-";
  });

  document.querySelectorAll(".v-male").forEach((el) => {
    el.textContent = vmale ?? "-";
  });
  document.querySelectorAll(".v-female").forEach((el) => {
    el.textContent = vfemale ?? "-";
  });

  // style "selected"
  document.querySelectorAll(".row-line.selected").forEach(r => r.classList.remove("selected"));
  row.classList.add("selected");
});

const rows = [
  { id: 1, lot: "2411CF S51", age: "51 w", volume: "200,000", female: "52,0%", male: "48,0%", vfemale: "102,000", vmale: "98,000" },
  { id: 2, lot: "2411CF S52", age: "52 w", volume: "201,000", female: "50,0%", male: "50,0%", vfemale: "100,500", vmale: "100,500" },
  { id: 3, lot: "2411CF S53", age: "53 w", volume: "203,000", female: "51,0%", male: "49,0%", vfemale: "101,000", vmale: "100,500" },
  { id: 4, lot: "2411CF S54", age: "54 w", volume: "202,000", female: "49,0%", male: "51,0%", vfemale: "100,500", vmale: "101,500" },
  { id: 5, lot: "2411CF S53", age: "53 w", volume: "201,000", female: "50,3%", male: "49,7%", vfemale: "100,800", vmale: "100,200" },
  { id: 6, lot: "2411CF S54", age: "54 w", volume: "202,000", female: "48,0%", male: "52,0%", vfemale: "100,000", vmale: "100,000" },
  { id: 7, lot: "2411CF S55", age: "54 w", volume: "200,000", female: "49,0%", male: "51,0%", vfemale: "100,000", vmale: "100,000" },
  { id: 8, lot: "2411CF S56", age: "54 w", volume: "201,000", female: "49,0%", male: "51,0%", vfemale: "100,000", vmale: "100,000" },
  { id: 9, lot: "2411CF S57", age: "53 w", volume: "200,000", female: "50,0%", male: "50,0%", vfemale: "100,000", vmale: "100,000" },
  { id: 10, lot: "2411CF S58", age: "54 w", volume: "200,000", female: "49,0%", male: "51,0%", vfemale: "100,000", vmale: "100,000" }
];

renderRowLines("#flocksTable", rows);
