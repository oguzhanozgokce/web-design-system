export interface ChartTokens {
  light: string[];
  dark: string[];
}

function chartBlock(selector: string, colors: string[]) {
  const declarations = colors.map((color, index) => `  --chart-${index + 1}: ${color};`);
  return `:where(${selector}) {\n${declarations.join('\n')}\n}`;
}

export function chartCss(chart: ChartTokens) {
  return [
    chartBlock(":root, .light, [data-theme='light']", chart.light),
    '',
    chartBlock(".dark, [data-theme='dark']", chart.dark),
  ].join('\n');
}
