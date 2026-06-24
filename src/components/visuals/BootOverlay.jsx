export function BootOverlay({ exiting }) {
  return (
    <div className={`pf-boot ${exiting ? "pf-boot-exit" : ""}`} aria-hidden="true">
      <span className="pf-boot-text">Entering orbit</span>
      <span className="pf-boot-bar">
        <span className="pf-boot-bar-fill" />
      </span>
    </div>
  );
}
