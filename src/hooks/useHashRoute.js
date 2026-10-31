import { useState, useEffect, useRef, useCallback } from "react";

const ROUTE = /^#\/(work|projects)\/([\w-]+)$/;

export function parseRoute(hash) {
  const m = ROUTE.exec(hash);
  return m ? { section: m[1], slug: m[2] } : null;
}

/**
 * Hash routes (#/work/trinamix, #/projects/munch) layer detail pages on top of the one-page site.
 * Hash URLs keep the site a plain static page and keep the 3D scene mounted across navigation.
 */
export function useHashRoute() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  const routeRef = useRef(route);
  const savedScroll = useRef(0);
  const internal = useRef(false);

  useEffect(() => {
    const onChange = () => {
      const next = parseRoute(window.location.hash);
      if (!routeRef.current && next) {
        savedScroll.current = window.scrollY;
        internal.current = true;
      }
      if (!next) internal.current = false;
      routeRef.current = next;
      setRoute(next);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const goHome = useCallback(() => {
    if (internal.current) {
      window.history.back();
      return;
    }
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    routeRef.current = null;
    setRoute(null);
  }, []);

  return { route, savedScroll, goHome };
}
