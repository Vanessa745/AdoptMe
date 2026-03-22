// src/services/MascotaUIService.js
import { buildImgUrl } from "./ApiConfig.js";

export const createMascotaCard = (m) => {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";

  const link = document.createElement("a");
  const mascotaId = encodeURIComponent(m.id || m._id || "");
  link.href = `./UI/detalleMascota.html?id=${mascotaId}`;
  link.style.display = "block";
  link.style.textDecoration = "none";

  const card = document.createElement("div");

  const titulo = document.createElement("h2");
  titulo.textContent = m.nombre || "";

  const p = document.createElement("p");
  p.textContent = m.raza || "";

  const img = document.createElement("img");
  img.src = buildImgUrl(m.img_ref) || "";
  img.alt = `Foto de ${m.nombre || "mascota"}`;

  card.appendChild(titulo);
  card.appendChild(p);
  card.appendChild(img);
  link.appendChild(card);

  const solicitarBtn = document.createElement("button");
  solicitarBtn.type = "button";
  solicitarBtn.className = "adopt-btn";
  solicitarBtn.textContent = "Solicitar adopción";

  solicitarBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    const idParam = encodeURIComponent(m.id || m._id || "");
    globalThis.location.href = `./UI/FormSolicitudAdopcion.html?id=${idParam}`;
  });

  container.appendChild(link);
  container.appendChild(solicitarBtn);

  return container;
};

export const renderMascotas = (div, mascotas) => {
  if (!Array.isArray(mascotas) || mascotas.length === 0) {
    div.innerHTML = "<p>No hay mascotas disponibles por el momento.</p>";
    return;
  }

  const fragment = document.createDocumentFragment();
  mascotas.forEach((m) => {
    fragment.appendChild(createMascotaCard(m));
  });
  div.appendChild(fragment);
};
