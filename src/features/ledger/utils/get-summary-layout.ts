const maxFontSize = 20;
const minFontSize = 12;
const glyphWidth = 0.62;
const tileGap = 8;
const tileInset = 24;
const stackedLabelWidth = 96;

export type SummaryLayout = {
  stacked: boolean;
  fontSize: number;
};

export function getSummaryLayout(stripWidth: number, values: string[], fontScale: number): SummaryLayout {
  const count = Math.max(1, values.length);
  const longest = Math.max(1, ...values.map(value => value.length));
  const fit = (valueWidth: number) => Math.min(maxFontSize, Math.floor(valueWidth / (longest * glyphWidth * fontScale)));
  const inline = fit((stripWidth - tileGap * (count - 1)) / count - tileInset);
  if (fontScale <= 1 && inline >= minFontSize)
    return { stacked: false, fontSize: inline };
  return { stacked: true, fontSize: Math.max(minFontSize, fit(stripWidth - tileInset - stackedLabelWidth * fontScale)) };
}
