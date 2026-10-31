export function Toast({ message }) {
  return (
    <div className="pf-toast-region" role="status" aria-live="polite">
      {message && <div className="pf-toast">{message}</div>}
    </div>
  );
}
