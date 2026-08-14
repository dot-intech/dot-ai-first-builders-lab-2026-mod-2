import type { NutrientBreakdown } from "@/lib/types";
import styles from "./NutrientBreakdownBar.module.css";

const CATEGORIES: { key: keyof NutrientBreakdown; label: string }[] = [
  { key: "carbohidratos", label: "Carbohidratos" },
  { key: "proteinas", label: "Proteínas" },
  { key: "grasas", label: "Grasas" },
  { key: "otrosNutrientes", label: "Otros nutrientes" },
];

export function NutrientBreakdownBar({
  breakdown,
}: {
  breakdown: NutrientBreakdown;
}) {
  const visibleSegments = CATEGORIES.filter((c) => breakdown[c.key] > 0);
  const summary = CATEGORIES.map(
    (c) => `${c.label} ${breakdown[c.key]}%`,
  ).join(", ");

  return (
    <div className={styles.root}>
      <div className={styles.bar} role="img" aria-label={summary}>
        {visibleSegments.map((c) => (
          <span
            key={c.key}
            className={styles.segment}
            data-slot={CATEGORIES.indexOf(c) + 1}
            style={{
              flexGrow: breakdown[c.key],
              flexShrink: 0,
              flexBasis: 0,
            }}
          />
        ))}
      </div>

      <ul className={styles.legend}>
        {CATEGORIES.map((c, i) => (
          <li key={c.key} className={styles.legendItem}>
            <span className={styles.swatch} data-slot={i + 1} />
            <span className={styles.legendLabel}>{c.label}</span>
            <span className={styles.legendValue}>{breakdown[c.key]}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
