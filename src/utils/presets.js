// Lorem Picsum serves stable, numeric-ID photos, so these never break.
// `thumb` is a small request so the picker grid loads fast; `url` is the
// full-resolution image used as the puzzle's texture.
function preset(id, label) {
  return {
    id,
    label,
    thumb: `https://picsum.photos/id/${id}/240/240`,
    url: `https://picsum.photos/id/${id}/1200/1200`,
  };
}

export const PRESET_IMAGES = [
  preset("1018", "Mountain lake"),
  preset("1015", "River valley"),
  preset("1016", "Red canyon"),
  preset("1043", "Forest lake"),
  preset("1025", "Cozy pup"),
  preset("237", "Good boy"),
];
