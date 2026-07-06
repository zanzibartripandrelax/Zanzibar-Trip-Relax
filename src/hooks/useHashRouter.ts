import { useState, useEffect, useCallback } from 'react';

export type Page =
  | 'home' | 'about' | 'tours' | 'booking' | 'gallery'
  | 'contact' | 'packages' | 'safaris' | 'transfers' | 'blog'
  | 'reviews' | 'trip-builder' | 'blog-detail' | 'kilimanjaro'
  | 'faq' | 'tour-detail' | 'policies' | 'admin' | 'trip-results' | 'manage-booking'
  | 'careers' | 'sustainability' | 'admin/login' | 'dashboard' | 'admin/dashboard' | 'my-account';

const VALID_PAGES: Page[] = [
  'home', 'about', 'tours', 'booking', 'gallery',
  'contact', 'packages', 'safaris', 'transfers', 'blog',
  'reviews', 'trip-builder', 'blog-detail', 'kilimanjaro',
  'faq', 'tour-detail', 'policies', 'admin', 'trip-results', 'manage-booking',
  'careers', 'sustainability', 'admin/login', 'dashboard', 'admin/dashboard', 'my-account'
];

interface RouteState {
  page: Page;
  blogId: string | null;
  queryParams: Record<string, string>;
}

function getPageFromHash(): RouteState {
  const hashAndQuery = window.location.hash.replace('#', '');
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

  // Handle tour detail pages: #tour-detail/tour-name or #tours/tour-name
  if (lowerHash.startsWith('tour-detail/') || (lowerHash.startsWith('tours/') && lowerHash !== 'tours')) {
    return { page: 'tour-detail', blogId: null, queryParams };
  }

  const matchedPage = VALID_PAGES.includes(lowerHash as Page) ? lowerHash : 'home';
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
    } else if (id) {
      // General support for other pages with extra ID or query parameters
      window.location.hash = `${page}?${id}`;
    } else {
      window.location.hash = page;
    }
  }, [currentPage]);

  return { currentPage, navigate, blogId, queryParams };
}
