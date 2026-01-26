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
