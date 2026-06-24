import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function RevealField({ icon, label, value, href }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      /* clipboard unavailable; ignore silently */
    }
  };

  if (!revealed) {
    return (
      <button type="button" className="pf-reveal-field" onClick={() => setRevealed(true)}>
        <span className="pf-reveal-icon">{icon}</span>
        <span>Show {label.toLowerCase()}</span>
      </button>
    );
  }

  return (
    <span className="pf-reveal-field pf-reveal-field-open">
      <span className="pf-reveal-icon">{icon}</span>
      <a href={href} className="pf-reveal-link">
        {value}
      </a>
      <button type="button" className="pf-copy-btn" onClick={handleCopy} aria-label={`Copy ${label}`}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </span>
  );
}
