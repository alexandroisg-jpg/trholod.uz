export const pendingPhotoPath = '/products/photo-pending.svg';
const rejectedPhotos = new Set(["/products/real-trgas-r410a.webp", "/products/real-trgas-r32.webp", "/products/real-trgas-r404a.webp", "/products/real-trgas-r407c.webp"]);
export function rejectedProductPhoto(path: string) { return rejectedPhotos.has(path.replace(/-full(?=\.webp$)/, '')); }
