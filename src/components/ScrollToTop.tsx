import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrolls to the top when the topic or subject changes, but not when switching material tabs. */
export function ScrollToTop() {
  const page = useLocation().pathname.split("/").slice(0, 3).join("/");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);
  return null;
}
