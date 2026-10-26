const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export function workshopImageUrl(imagePath: string) {
  return `${basePath}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
}
