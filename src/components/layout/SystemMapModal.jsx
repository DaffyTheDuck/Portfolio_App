import { X } from "lucide-react";
import { MiniSystemMap } from "../visuals/MiniSystemMap";

export function SystemMapModal({ activeId, onNavigate, onClose }) {
  return (
    <div className="pf-map-modal-backdrop" onClick={onClose}>
      <div className="pf-map-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="pf-map-modal-close" onClick={onClose} aria-label="Close map">
          <X size={18} />
        </button>
        <MiniSystemMap
          activeId={activeId}
          onNavigate={(id) => {
            onNavigate(id);
            onClose();
          }}
        />
      </div>
    </div>
  );
}