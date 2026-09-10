export function makeSolved(size) {
  return Array.from({ length: size * size }, (_, i) => i);
}

export function idxToRC(i, size) {
  return { r: Math.floor(i / size), c: i % size };
}

export function isNeighbor(i, j, size) {
  const a = idxToRC(i, size);
  const b = idxToRC(j, size);
  const dr = Math.abs(a.r - b.r);
  const dc = Math.abs(a.c - b.c);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

export function isSolved(arr, size) {
  for (let i = 0; i < size * size; i++) if (arr[i] !== i) return false;
  return true;
}

export function countInversions(arr) {
  let inv = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) inv++;
    }
  }
  return inv;
}

export function isSolvable(permutation, size) {
  const arr = permutation.filter(v => v !== permutation.length - 1);
  const inversions = countInversions(arr);
  if (size % 2 === 1) return inversions % 2 === 0;
  const blankPos = permutation.indexOf(permutation.length - 1);
  const r = Math.floor(blankPos / size);
  const blankRowFromBottom = size - r;
  return blankRowFromBottom % 2 === 0 ? inversions % 2 === 1 : inversions % 2 === 0;
}

export function bgPositionForValue(value, size) {
  const r = Math.floor(value / size);
  const c = value % size;
  const step = 100 / (size - 1 || 1);
  return `${c * step}% ${r * step}%`;
}
