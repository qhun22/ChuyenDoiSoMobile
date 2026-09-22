"use client";

import type { Variant } from "@/types/product";

export default function VariantSelector({ variants }: { variants: Variant[] }) {
  return <fieldset><legend>Cau hinh</legend><div className="variant-list">{variants.map((variant) => <button type="button" key={variant.id}>{variant.ram} / {variant.storage} / {variant.color}</button>)}</div></fieldset>;
}
