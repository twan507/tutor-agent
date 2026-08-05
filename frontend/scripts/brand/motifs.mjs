// Shared brand motifs: dashed firefly flight path + amber spark.
// Pure string generators — deterministic, no I/O.

const AMBER = "#F5A623";

export function flightPathD({ from, to, curve }) {
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2 - curve;
  return `M ${from[0]} ${from[1]} Q ${mx} ${my}, ${to[0]} ${to[1]}`;
}

export function flightPathEl({
  from,
  to,
  curve,
  stroke = "currentColor",
  width = 2,
  dash = "1 7",
  id = null,
}) {
  const idAttr = id ? ` id="${id}"` : "";
  return (
    `<path${idAttr} d="${flightPathD({ from, to, curve })}" fill="none" stroke="${stroke}" ` +
    `stroke-width="${width}" stroke-linecap="round" stroke-dasharray="${dash}"/>`
  );
}

export function sparkEl({
  cx,
  cy,
  r,
  haloR,
  haloOp,
  color = AMBER,
  id = "flight-spark",
}) {
  return (
    `<g id="${id}">` +
    `<circle cx="${cx}" cy="${cy}" r="${haloR}" fill="${color}" opacity="${haloOp}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>` +
    `</g>`
  );
}
