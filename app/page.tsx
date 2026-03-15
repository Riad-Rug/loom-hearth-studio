import { PlaceholderPanel } from "@/components/ui/placeholder-panel";

export default function HomePage() {
  return (
    <div className="page-stack">
      <section className="hero-block">
        <div className="hero-copy">
          <p className="eyebrow">Loom & Hearth Studio</p>
          <h1>Storefront scaffold in place.</h1>
          <p className="lede">
            This is a foundation build only. Public features, commerce flows, and
            admin tools will be layered onto the existing App Router structure.
          </p>
        </div>
      </section>

      <section className="content-grid">
        <PlaceholderPanel
          title="Product system"
          body="Type-safe foundations exist for rugs and multi-unit products. PDP behavior is not implemented yet."
        />
        <PlaceholderPanel
          title="Checkout"
          body="Guest checkout, Stripe payment, and order creation remain scaffold-only until the integration model is validated."
        />
        <PlaceholderPanel
          title="Admin"
          body="Admin surface has been reserved in the folder structure. No business workflows are implemented yet."
        />
      </section>
    </div>
  );
}
