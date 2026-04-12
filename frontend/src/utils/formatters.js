export const compactNumber = (val) => {
  if (typeof val !== 'number') return val;
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(val);
};
