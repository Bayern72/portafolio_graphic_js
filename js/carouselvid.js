const ITEMS = [
  {
    id: "1",
    title: "La Amapola",
    category: "Spot",
    meta: "2025 · 3 min",
    image: "./img/frames/PosterAmapola.jpg",
    href: "./videos/audiovisuales/LA AMAPOLA (1).mp4",
  },
  {
    id: "2",
    title: "El Arte de Cuidarte",
    category: "Spot",
    meta: "2026 · 60s",
    image: "./img/frames/PostElArteDeCuidarte.jpg",
    href: "./videos/audiovisuales/SPOT EL ARTE DE CUIDARTE.mp4",
  },
  {
    id: "3",
    title: "Glitched",
    category: "Mini Documental",
    meta: "2026 · 6 min",
    image: "./img/frames/PostGlitched.jpg",
    href: "./videos/audiovisuales/DOCUMENTAL REDES.mp4",
  },
  {
    id: "4",
    title: "El Hurto",
    category: "Filminuto",
    meta: "2026 · 1:15 min",
    image: "",
    href: "./videos/audiovisuales/EL HURTO.mp4",
  },
  {
    id: "5",
    title: "Glitched",
    category: "Mini Documental",
    meta: "2026 · 6 min",
    image: "./img/frames/PostGlitched.jpg",
    href: "./videos/audiovisuales/DOCUMENTAL REDES.mp4",
  },
  {
    id: "6",
    title: "El Arte de Cuidarte",
    category: "Spot",
    meta: "2026 · 60s",
    image: "./img/frames/PostElArteDeCuidarte.jpg",
    href: "./videos/audiovisuales/SPOT EL ARTE DE CUIDARTE.mp4",
  },
  
];

const PLAY_ICON =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

/**
 * Renderiza las tarjetas dentro de la pista.
 * Estructura generada (útil si la escribes a mano en HTML):
 *   <a class="cf-card"><div class="cf-media">
 *      <img><span class="cf-scrim"></span><span class="cf-play"></span>
 *      <div class="cf-meta">…</div>
 *   </div></a>
 */
function renderCards(track, items) {
  track.innerHTML = items
    .map(
      (item, i) => `
      <a class="cf-card" href="${item.href || "#"}"
         aria-label="${item.title} — ${item.category}">
        <div class="cf-media">
          <img src="${item.image}" alt="${item.title}" width="1280" height="800"
               loading="${i === 0 ? "eager" : "lazy"}" />
          <span class="cf-scrim"></span>
          <span class="cf-play">${PLAY_ICON}</span>
          <div class="cf-meta">
            <span class="cf-cat">${item.category}</span>
            <h3 class="cf-name">${item.title}</h3>
            <p class="cf-sub">${item.meta}</p>
          </div>
        </div>
      </a>`
    )
    .join("");
}

function renderDots(dots, items, goTo) {
  dots.innerHTML = items
    .map(
      (item) =>
        `<button class="cf-dot" type="button" aria-label="Ir a ${item.title}"></button>`
    )
    .join("");
  Array.from(dots.children).forEach((dot, i) => {
    dot.addEventListener("click", () => goTo(i));
  });
}

function initCoverflow({ track, dots, items }) {
  renderCards(track, items);

  const goTo = (i) =>
    track.children[i]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });

  renderDots(dots, items, goTo);

  /** Mide cada tarjeta y escribe --d / --dir. */
  const update = () => {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;

    Array.from(track.children).forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const delta = cardCenter - center;
      const dist = Math.abs(delta);
      const d = Math.min(dist / (card.offsetWidth || 1), 1);
      card.style.setProperty("--d", d.toFixed(3));
      card.style.setProperty("--dir", delta > 0 ? "-1" : "1");
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });

    Array.from(track.children).forEach((card, i) =>
      card.setAttribute("data-active", String(i === best))
    );
    Array.from(dots.children).forEach((dot, i) =>
      dot.setAttribute("aria-current", String(i === best))
    );
  };

  // Scroll throttled con requestAnimationFrame: un solo cálculo por frame.
  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };

  update();
  track.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  // Recalcula cuando las imágenes terminan de cargar (cambia el layout).
  track.querySelectorAll("img").forEach((img) => {
    img.addEventListener("load", onScroll, { once: true });
  });

  // Navegación con teclado sobre la pista.
  track.addEventListener("keydown", (e) => {
    const current = Array.from(track.children).findIndex(
      (c) => c.getAttribute("data-active") === "true"
    );
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(Math.min(current + 1, items.length - 1));
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(Math.max(current - 1, 0));
    }
  });
}

initCoverflow({
  track: document.getElementById("cfTrack"),
  dots: document.getElementById("cfDots"),
  items: ITEMS,
});