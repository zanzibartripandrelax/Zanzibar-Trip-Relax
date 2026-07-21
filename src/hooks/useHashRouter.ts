import { useState, useEffect, useCallback } from 'react';

export type Page =
  | 'home' | 'about' | 'tours' | 'booking' | 'gallery'
  | 'contact' | 'packages' | 'safaris' | 'transfers' | 'blog'
  | 'reviews' | 'trip-builder' | 'blog-detail' | 'kilimanjaro'
  | 'faq' | 'tour-detail' | 'policies' | 'admin' | 'trip-results' | 'manage-booking'
  | 'careers' | 'sustainability' | 'admin/login' | 'owner/setup' | 'owner/login' | 'owner' | 'dashboard' | 'admin/dashboard' | 'my-account' | 'best-time-to-visit' | 'destinations' | 'hotels'
  | 'owner-login' | 'admin-login' | 'create-owner';

const VALID_PAGES: Page[] = [
  'home', 'about', 'tours', 'booking', 'gallery',
  'contact', 'packages', 'safaris', 'transfers', 'blog',
  'reviews', 'trip-builder', 'blog-detail', 'kilimanjaro',
  'faq', 'tour-detail', 'policies', 'admin', 'trip-results', 'manage-booking',
  'careers', 'sustainability', 'admin/login', 'owner/setup', 'owner/login', 'owner', 'dashboard', 'admin/dashboard', 'my-account', 'best-time-to-visit', 'destinations', 'hotels',
  'owner-login', 'admin-login', 'create-owner'
];

interface RouteState {
  page: Page;
  blogId: string | null;
  queryParams: Record<string, string>;
}

function getPageFromHash(): RouteState {
  let hashAndQuery = window.location.hash.replace('#', '');
  const pathname = window.location.pathname.toLowerCase();

  const mapPackageSlug = (slug: string): string => {
    const s = slug.toLowerCase();
    if (s === 'zanzibar-holiday-package' || s === 'family-zanzibar-package' || s === '5-day-zanzibar-package') {
      return '5-day-beach-adventure';
    }
    if (s === 'luxury-zanzibar-package' || s === '7-day-zanzibar-trip' || s === 'zanzibar-all-inclusive' || s === '7-day-zanzibar-holiday') {
      return '7-day-zanzibar-combo';
    }
    if (s === 'honeymoon-zanzibar' || s === 'honeymoon-zanzibar-package' || s === '3-day-zanzibar-package') {
      return '3-day-escape';
    }
    return slug;
  };

  const mapTourSlug = (slug: string): string => {
    const s = slug.toLowerCase();
    if (s === 'safari-blue-zanzibar' || s === 'safari-blue') return 'safari-blue';
    if (s === 'mnemba-island-snorkeling' || s === 'mnemba-island' || s === 'mnemba-snorkeling') return 'mnemba-snorkeling';
    if (s === 'stone-town-tour' || s === 'stone-town') return 'stone-town';
    if (s === 'prison-island') return 'prison-island';
    if (s === 'spice-farm') return 'spice-farm';
    if (s === 'jozani-forest') return 'jozani-forest';
    if (s === 'dolphin-tour' || s === 'dolphin-kizimkazi') return 'dolphin-kizimkazi';
    if (s === 'nakupenda-island' || s === 'nakupenda-sandbank') return 'nakupenda-sandbank';
    if (s === 'fishing-charter-zanzibar' || s === 'fishing-experience') return 'fishing-experience';
    if (s === 'blue-lagoon-starfish' || s === 'blue-lagoon') return 'blue-lagoon';
    if (s === 'kuza-cave-jambiani' || s === 'cave-experience') return 'cave-experience';
    return s;
  };

  // Map clean pathname to hash if there is no hash
  if (!hashAndQuery && pathname && pathname !== '/' && pathname !== '/index.html') {
    const cleanPath = pathname.replace(/\/$/, ''); // remove trailing slash
    
    // Exact match mappings
    if (cleanPath === '/about') {
      window.location.hash = 'about';
    } else if (cleanPath === '/contact') {
      window.location.hash = 'contact';
    } else if (cleanPath === '/tours' || cleanPath === '/zanzibar-tours' || cleanPath === '/zanzibar-excursions') {
      window.location.hash = 'tours';
    } else if (cleanPath === '/booking') {
      window.location.hash = 'booking';
    } else if (cleanPath === '/gallery') {
      window.location.hash = 'gallery';
    } else if (cleanPath === '/packages' || cleanPath === '/zanzibar-holiday-packages') {
      window.location.hash = 'packages';
    } else if (cleanPath === '/tanzania-safaris' || cleanPath === '/safaris') {
      window.location.hash = 'safaris';
    } else if (cleanPath === '/airport-transfer' || cleanPath === '/transfers' || cleanPath === '/zanzibar-airport-transfer' || cleanPath === '/private-transfer' || cleanPath === '/luxury-transfer') {
      window.location.hash = 'transfers';
    } else if (cleanPath === '/blog') {
      window.location.hash = 'blog';
    } else if (cleanPath === '/reviews') {
      window.location.hash = 'reviews';
    } else if (cleanPath === '/trip-builder') {
      window.location.hash = 'trip-builder';
    } else if (cleanPath === '/faq') {
      window.location.hash = 'faq';
    } else if (cleanPath === '/policies') {
      window.location.hash = 'policies';
    } else if (cleanPath === '/careers') {
      window.location.hash = 'careers';
    } else if (cleanPath === '/sustainability') {
      window.location.hash = 'sustainability';
    } else if (cleanPath === '/best-time-to-visit') {
      window.location.hash = 'best-time-to-visit';
    } else if (cleanPath === '/destinations') {
      window.location.hash = 'destinations';
    } else if (cleanPath === '/hotels') {
      window.location.hash = 'hotels';
    } else if (cleanPath === '/kilimanjaro' || cleanPath === '/kilimanjaro-climbing') {
      window.location.hash = 'kilimanjaro';
    } else if (cleanPath === '/admin' || cleanPath === '/admin/dashboard' || cleanPath === '/dashboard') {
      window.location.hash = 'admin';
    } else if (cleanPath === '/admin/login' || cleanPath === '/admin-login') {
      window.location.hash = 'admin-login';
    } else if (cleanPath === '/owner/login' || cleanPath === '/owner-login') {
      window.location.hash = 'owner-login';
    } else if (cleanPath === '/create-owner' || cleanPath === '/owner/setup') {
      window.location.hash = 'create-owner';
    } else if (cleanPath === '/my-account') {
      window.location.hash = 'my-account';
    } else if (cleanPath === '/manage-booking') {
      window.location.hash = 'manage-booking';
    } else if (cleanPath.startsWith('/tours/')) {
      const id = cleanPath.substring('/tours/'.length);
      const mappedId = mapTourSlug(id);
      window.location.hash = `tours/${mappedId}`;
    } else if (cleanPath.startsWith('/tour-detail/')) {
      const id = cleanPath.substring('/tour-detail/'.length);
      const mappedId = mapTourSlug(id);
      window.location.hash = `tours/${mappedId}`;
    } else if (cleanPath.startsWith('/blog/')) {
      const id = cleanPath.substring('/blog/'.length);
      window.location.hash = `blog/${id}`;
    } else if (cleanPath.startsWith('/destinations/')) {
      const id = cleanPath.substring('/destinations/'.length);
      window.location.hash = `destinations/${id}`;
    } else if (cleanPath.startsWith('/safaris/')) {
      const id = cleanPath.substring('/safaris/'.length);
      window.location.hash = `booking?package=${id}`;
    } else if (cleanPath.startsWith('/packages/')) {
      const id = cleanPath.substring('/packages/'.length);
      const mappedPkgId = mapPackageSlug(id);
      window.location.hash = `packages?package=${mappedPkgId}`;
    } else if (cleanPath.startsWith('/kilimanjaro/')) {
      const id = cleanPath.substring('/kilimanjaro/'.length);
      window.location.hash = `booking?package=${id}`;
    }
    
    hashAndQuery = window.location.hash.replace('#', '');
  }

  const [hash, queryString] = hashAndQuery.split('?');
  const lowerHash = hash.toLowerCase();

  const queryParams: Record<string, string> = {};
  if (queryString) {
    const pairs = queryString.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key) {
        queryParams[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    }
  }

  // Handle blog detail pages: #blog/1, #blog/2, etc.
  if (lowerHash.startsWith('blog/')) {
    const blogId = lowerHash.split('/')[1];
    return { page: 'blog-detail', blogId: blogId || null, queryParams };
  }

  // Handle destinations pages: #destinations/some-destination
  if (lowerHash.startsWith('destinations/')) {
    return { page: 'destinations', blogId: null, queryParams };
  }

  // Handle tour detail pages: #tour-detail/tour-name or #tours/tour-name
  if (lowerHash.startsWith('tour-detail/') || (lowerHash.startsWith('tours/') && lowerHash !== 'tours')) {
    return { page: 'tour-detail', blogId: null, queryParams };
  }

  const mappedHash = 
    lowerHash === 'owner/setup' ? 'create-owner' :
    lowerHash === 'owner/login' ? 'owner-login' :
    lowerHash === 'admin/login' ? 'admin-login' :
    lowerHash === 'admin/dashboard' || lowerHash === 'dashboard' ? 'admin' :
    lowerHash;

  const matchedPage = VALID_PAGES.includes(mappedHash as Page) ? mappedHash : 'home';
  return { page: matchedPage as Page, blogId: null, queryParams };
}

export function useHashRouter() {
  const [currentPage, setCurrentPage] = useState<Page>(() => getPageFromHash().page);
  const [blogId, setBlogId] = useState<string | null>(() => getPageFromHash().blogId);
  const [queryParams, setQueryParams] = useState<Record<string, string>>(() => getPageFromHash().queryParams);

  useEffect(() => {
    const handleHashChange = () => {
      const { page, blogId, queryParams: qParams } = getPageFromHash();
      setCurrentPage(page);
      setBlogId(blogId);
      setQueryParams(qParams);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((page: Page, id?: string) => {
    let isSamePage = page === currentPage;
    let targetSectionId = id;



    if (isSamePage) {
      const targetElement = targetSectionId ? document.getElementById(targetSectionId) : null;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (page === 'blog-detail' && id) {
      window.location.hash = `blog/${id}`;
    } else if (page === 'tour-detail' && id) {
      window.location.hash = `tours/${id}`;
    } else if (page === 'destinations' && id) {
      window.location.hash = `destinations/${id}`;
    } else if (id) {
      // General support for other pages with extra ID or query parameters
      window.location.hash = `${page}?${id}`;
    } else {
      window.location.hash = page;
    }
  }, [currentPage]);

  return { currentPage, navigate, blogId, queryParams };
}
