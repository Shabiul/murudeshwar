import { useEffect } from 'react';

const SITE_NAME = 'Murudeshwara Beach Resort';
const BASE_URL = 'https://murudeshwara.com';
const DEFAULT_IMAGE = '/Photos/DSC_3974.JPG';

/**
 * Lightweight per-page SEO head manager.
 * Updates document title, meta description, canonical, OG, and Twitter tags.
 *
 * @param {string} title     – Page-specific title (site name is appended automatically)
 * @param {string} description – Meta description (max ~155 chars recommended)
 * @param {string} path      – Route path, e.g. "/courses"
 * @param {string} [image]   – OG image path (relative or absolute)
 * @param {string} [type]    – og:type, defaults to "website"
 */
export default function SEOHead({
  title,
  description,
  path = '/',
  image,
  type = 'website',
}) {
  useEffect(() => {
    // 1. Document title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    // 2. Helper to create-or-update a <meta> tag
    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 3. Helper to create-or-update a <link> tag
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    const fullUrl = `${BASE_URL}${path}`;
    const imageUrl = image
      ? (image.startsWith('http') ? image : `${BASE_URL}${image}`)
      : `${BASE_URL}${DEFAULT_IMAGE}`;

    // Standard meta
    setMeta('name', 'description', description);

    // Canonical
    setLink('canonical', fullUrl);

    // Open Graph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', fullUrl);
    setMeta('property', 'og:image', imageUrl);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', SITE_NAME);

    // Twitter
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', imageUrl);

    // Cleanup: reset title on unmount so next page can set its own
    return () => {
      document.title = SITE_NAME;
    };
  }, [title, description, path, image, type]);

  return null; // Renders nothing to the DOM
}
