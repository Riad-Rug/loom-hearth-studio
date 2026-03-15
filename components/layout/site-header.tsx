import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link className="site-header__brand" href="/">
          Loom & Hearth Studio
        </Link>
        <p className="site-header__meta">
          App Router scaffold with unresolved integrations isolated behind typed
          boundaries.
        </p>
      </div>
    </header>
  );
}
