import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Remy — courses & recettes',
    short_name: 'Remy',
    description: 'Stock, recettes, planning des repas et liste de courses.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f5ead8',
    theme_color: '#c67139',
    lang: 'fr',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
