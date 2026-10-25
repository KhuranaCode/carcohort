// Licensed 3D vehicle models (all CC BY 4.0, via Sketchfab). Each entry maps a
// catalogue vehicle id to its optimized GLB and the attribution shown next to
// the stage and on the /credits page. Sources: public/models/vehicles/.
// NOTE: the five larger GLBs carry upload-session name prefixes (17-, 18-, 19-, 20-, 21-).
// GitHub's web upload prefixes staged binary filenames, and its edit page cannot
// rename binaries over ~2MB without corrupting them. Rename to clean names the next
// time someone has real git push access; the content is byte-verified either way.
const BY4 = 'CC BY 4.0';
const sk = (slug) => `https://sketchfab.com/3d-models/${slug}`;

export const MODELS3D = {
  creta:      { file: 'creta.glb',      title: 'Hyundai Creta',            author: 'MattDoesBlender',       license: BY4, page: sk('hyundai-creta-67645b6f549441a786e2b4050dc0268b'), display: 'Hyundai Creta' },
  punch:      { file: '18-punch.glb',      title: 'Tata Punch',               author: 'rahuld',                license: BY4, page: sk('tata-punch-1a85da7678ba4f708cfbee0d9303c5d7'), display: 'Tata Punch' },
  thar:       { file: '17-thar.glb',       title: 'THAR 4X4',                 author: 'MB_Mahesh',             license: BY4, page: sk('thar-4x4-66ee970b18014c98a1750064b65657b0'), display: 'Mahindra Thar' },
  swift:      { file: 'swift.glb',      title: 'Swift 2024',               author: 'shreyanshchaurasia13',  license: BY4, page: sk('swift-2024-07cf082bab4d430a8a764a23590e35fa'), display: 'Maruti Swift' },
  baleno:     { file: '19-baleno.glb',     title: 'Baleno 2025',              author: 'playmode280513',        license: BY4, page: sk('baleno-2025-b1be858407d3473692580e4291e0627a'), display: 'Maruti Baleno' },
  seltos:     { file: 'seltos.glb',     title: 'Kia Seltos',               author: 'reblevins',             license: BY4, page: sk('kia-seltos-f7786a462a7b4a189e7e2cf436ec06cc'), display: 'Kia Seltos' },
  venue:      { file: '20-venue.glb',      title: 'Hyundai Venue 2025',       author: 'teenlin3',              license: BY4, page: sk('hyundai-venue-2025-8c35967cadbd4a55a94aad9e743ce0f7'), display: 'Hyundai Venue' },
  city:       { file: 'city.glb',       title: 'Honda City RS',            author: 'howtodrwcars',          license: BY4, page: sk('honda-city-rs-1d5a7dc0b3674e779bf88afdd2f4fd46'), display: 'Honda City' },
  classic350: { file: '21-classic350.glb', title: 'Royal enfield classic 350', author: 'mansoorman',           license: BY4, page: sk('royal-enfield-classic-350-f6495bfbffe443e89c499a2ba8766c88'), display: 'Royal Enfield Classic 350' },
  // Sketchfab's own title says 'Activa' but the mesh is the OLA-branded S1-style electric scooter - we present it as the Ola S1-style scooter and quote the exact source title for attribution.
  'ola-s1':   { file: 'ola-s1.glb',     title: 'OLA Electric Activa',      author: 'nijjarcreative',      license: BY4, page: sk('ola-electric-activa-e1f193f3097344df851db30d07332257'), display: 'Ola S1-style electric scooter' },
};

export const modelUrl = (id) => {
  const m = MODELS3D[id];
  return m ? `./models/vehicles/${m.file}` : null;
};
