// Hand-tuned so every "band" below (however it groups) fills a whole number of
// rows with zero leftover cells at both grid-cols-2 (mobile) and grid-cols-4
// (sm+) — each band's tile shapes were checked to tile the row perfectly at
// both column counts, so dense packing never leaves an empty gap.
export type Size = "big" | "wide" | "tall" | "normal";

export const SIZE_CLASSES: Record<Size, string> = {
  big: "col-span-2 row-span-2",
  wide: "col-span-2 row-span-1",
  tall: "col-span-1 row-span-2",
  normal: "col-span-1 row-span-1",
};

export const PATTERN_20: Size[] = [
  "wide", "wide", "normal", "normal", "normal", "normal",
  "big", "normal", "normal", "normal", "normal",
  "normal", "normal", "normal", "normal",
  "big", "normal", "normal", "normal", "normal",
];

// 12 photos, irregular: tall tiles staggered across rows, the big tile on the
// right. Checked against CSS grid dense packing: zero empty cells at both
// 4 columns (5 rows) and 2 columns (10 rows).
//   4 cols:  0  1  2  3 | 4  5  7  3 | 8  5  6  6 | 9 10  6  6 | 9 10 11 11
export const PATTERN_12: Size[] = [
  "normal", "normal", "normal", "tall",
  "normal", "tall", "big", "normal",
  "normal", "tall", "tall", "wide",
];
