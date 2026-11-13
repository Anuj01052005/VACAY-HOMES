export const terracePhotos = [
  ['terrace-at-dusk', 'Open glass doors look into the warmly lit lounge at dusk.'],
  ['lounge-and-games', 'A sectional sofa, pool table and jacuzzi share a lounge with a woven ceiling.'],
  ['jacuzzi', 'A sunken jacuzzi framed by a curved illuminated wall.'],
  ['bedroom-alcove', 'A timber bed beneath a lit alcove and woven pendant lamps.'],
  ['lounge-lighting', 'Woven ceiling panels and illuminated niches surround the television.'],
  ['bedroom-red', 'A timber bed with a red throw and an amber pendant lamp.'],
  ['seating-nook', 'Three seats at a counter below softly lit display shelves.'],
  ['bedroom-neutral', 'A timber bed with a taupe throw beneath framed botanical prints.'],
  ['jacuzzi-detail', 'A close view of the jacuzzi with striped towels and woven lighting.'],
  ['bedroom-art', 'Red botanical prints and sheer curtains beside the bed.'],
].map(([file, alt]) => ({
  url: new URL(`./assets/terrace/${file}.webp`, document.baseURI).href,
  alt,
}));
