import React from "react";

type BrandBackdropProps = { photo?: boolean };

export default function BrandBackdrop({ photo = true }: BrandBackdropProps) {
  return (
    <div className="brand-backdrop" aria-hidden="true">
      {photo && <div className="brand-backdrop-photo" />}
      <div className="brand-backdrop-rail">
        <span className="brand-backdrop-title">PROVAS</span>
        <span className="brand-backdrop-subtitle">CASA INTELIGENTE</span>
      </div>
    </div>
  );
}
