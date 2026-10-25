import { Suspense } from "react";
import { Link, Outlet } from "react-router-dom";
import { topics } from "../content";
import site from "../content/site.json";
import { Breadcrumbs } from "./Breadcrumbs";

export function Layout() {
  return (
    <div className="frame">
      <a className="skip" href="#main">
        SKIP TO CONTENT
      </a>
      <header className="hd">
        <Link className="logo" to="/">
          <i aria-hidden="true" />
          {site.title.toUpperCase()}
        </Link>
        <Breadcrumbs />
      </header>
      <main id="main" tabIndex={-1}>
        <Suspense
          fallback={
            <p className="l" role="status">
              LOADING...
            </p>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <footer className="ft l">
        <span>
          FIG. A: HOME INDEX
          {topics.map((t) => (
            <span key={t.id}>
              <span className={`sw accent-${t.accent}`} style={{ background: "var(--a)" }} aria-hidden="true" />
              {t.title.toUpperCase()}
            </span>
          ))}
        </span>
        <span>{site.sources}</span>
        <span>{site.scale}</span>
      </footer>
    </div>
  );
}
