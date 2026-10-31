import { useState, useRef, useEffect } from "react";
import { Copy, Check } from "lucide-react";

export function RevealField({ icon, label, value, href, onCopied }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const linkRef = useRef(null);

  useEffect(() => {
    if (revealed && linkRef.current) linkRef.current.focus();
  }, [revealed]);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (onCopied) onCopied(`${label} copied`);
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
      <a ref={linkRef} href={href} className="pf-reveal-link">
        {value}
      </a>
      <button type="button" className="pf-copy-btn" onClick={handleCopy} aria-label={`Copy ${label}`}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </span>
  );
}
