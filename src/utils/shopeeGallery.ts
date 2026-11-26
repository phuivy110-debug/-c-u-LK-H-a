let galleryManifestPromise: Promise<Record<string, string[]>> | null = null;

function loadGalleryManifest(): Promise<Record<string, string[]>> {
  if (!galleryManifestPromise) {
    galleryManifestPromise = fetch('/data/shopee-galleries.json', { cache: 'force-cache' })
      .then((response) => {
        if (!response.ok) throw new Error(`Gallery manifest returned ${response.status}`);
        return response.json() as Promise<Record<string, string[]>>;
      })
      .catch(() => ({}));
  }
  return galleryManifestPromise;
}

export async function loadVerifiedShopeeGallery(shopeeUrl?: string): Promise<string[]> {
  if (!shopeeUrl) return [];
  const manifest = await loadGalleryManifest();
  return manifest[shopeeUrl] || [];
}

