const HOSTNAME =
  globalThis.window?.location?.hostname || "localhost";

export const API_URL =
  HOSTNAME === "localhost"
    ? "http://localhost:3001"
    : "https://ingsoftadoptme.onrender.com";

export const buildImgUrl = (imgRef) => {
  if (!imgRef) return "";
  if (/^https?:\/\//i.test(imgRef)) return imgRef;     // ya viene completa
  if (imgRef.startsWith("/")) return `${API_URL}${imgRef}`; // empieza con /
  return `${API_URL}/${imgRef}`;                       // ruta relativa
};