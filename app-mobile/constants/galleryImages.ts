// Cafe Locco gallery — 27 bundled images in exact order 01 -> 27.
// Source: user-supplied 'Cafe Locco Images.zip' (definitive gallery source).
// require() needs static literal paths, so each entry is listed explicitly.

export const galleryImages = [
  require('../assets/gallery/01.jpg'),
  require('../assets/gallery/02.jpg'),
  require('../assets/gallery/03.jpg'),
  require('../assets/gallery/04.jpg'),
  require('../assets/gallery/05.jpg'),
  require('../assets/gallery/06.jpg'),
  require('../assets/gallery/07.jpg'),
  require('../assets/gallery/08.jpg'),
  require('../assets/gallery/09.jpg'),
  require('../assets/gallery/10.jpg'),
  require('../assets/gallery/11.jpg'),
  require('../assets/gallery/12.jpg'),
  require('../assets/gallery/13.jpg'),
  require('../assets/gallery/14.jpg'),
  require('../assets/gallery/15.jpg'),
  require('../assets/gallery/16.jpg'),
  require('../assets/gallery/17.jpg'),
  require('../assets/gallery/18.jpg'),
  require('../assets/gallery/19.jpg'),
  require('../assets/gallery/20.jpg'),
  require('../assets/gallery/21.jpg'),
  require('../assets/gallery/22.jpg'),
  require('../assets/gallery/23.jpg'),
  require('../assets/gallery/24.jpg'),
  require('../assets/gallery/25.jpg'),
  require('../assets/gallery/26.jpg'),
  require('../assets/gallery/27.jpg'),
] as const;

export const GALLERY_COUNT = galleryImages.length;

