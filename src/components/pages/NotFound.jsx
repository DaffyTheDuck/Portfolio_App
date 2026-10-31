import { ArrowLeft } from "lucide-react";

export function NotFound({ onBack }) {
  return (
    <main id="main" tabIndex={-1} className="pf-detail">
      <section data-sec="contact" className="pf-section pf-side-left" aria-labelledby="nf-title">
        <p className="pf-eyebrow">Lost in space</p>
        <h1 className="pf-h2 pf-detail-title" id="nf-title">
          That page doesn&apos;t exist
        </h1>
        <p className="pf-detail-sub">The link may be old or mistyped. Everything is on the home page.</p>
        <p style={{ marginTop: 28 }}>
          <button type="button" className="pf-btn pf-btn-primary" onClick={onBack}>
            <ArrowLeft size={16} /> Back to home
          </button>
        </p>
      </section>
    </main>
  );
}
