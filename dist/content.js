/* EDIT THIS FILE to change the website. Empty contact fields stay non-clickable.
   Replace an image's src with 'assets/your-file.jpg' and write accurate alt text.
   studio.html provides a visual editor and exports a ready-to-copy content pack. */
window.VACAY_CONTENT = {
  brand: { name: 'Vacay Homes', location: 'Bangalore, India', logo: '', logoAlt: 'Vacay Homes' },
  contact: { phone: '', email: '', heading: 'Your next get-together starts here.', note: 'For stays, gatherings and a little time away, get in touch directly.' },
  intro: { eyebrow: 'PRIVATE STAYS · PURE-VEGETARIAN DINING', title: 'Room to slow down.\nSpace to come together.', text: 'A farmhouse outside the city. A terrace within it. Two ways to make time for the people you love, with good food at the heart of it all.' },
  story: [
    { id: 'arrive', number: '01', label: 'A CHANGE OF SCENERY', heading: 'A little away.\nA lot together.', text: 'Private stays in Bangalore, made for gathering. Bring your favourite people. Make the place your own.', cta: 'Explore the stays', href: '#stays', image: 'hero', caption: 'VACAY 002 · THE FARMHOUSE', footnote: 'Your own space. Your own pace.' },
    { id: 'gather', number: '02', label: 'THE HEART OF THE STAY', heading: 'Good food.\nYour favourite people.', text: 'Pure-vegetarian dining brings everyone to the table. At the farmhouse, Jain food is available on request.', cta: 'Discover the experience', href: '#experience', image: 'kitchen', caption: 'THE VACAY KITCHEN · COME TOGETHER', footnote: 'The best plans begin around a table.' },
    { id: 'terrace', number: '03', label: 'A DIFFERENT KIND OF ESCAPE', heading: 'Out of the everyday.\nStill in the city.', text: 'A private terrace in Banashankari, with room for slow evenings, shared meals and a stay a little closer to home.', cta: 'Find your kind of stay', href: '#stays', image: 'terrace', caption: 'VACAY 003 · THE CITY TERRACE', footnote: 'A change of pace, without going far.' }
  ],
  images: {
    hero: { src: '', alt: '', label: 'Farmhouse · your wide photograph', hint: 'A poolside view, a garden arrival, a little breathing room.', ratio: 'Landscape · 16:10', tone: 'olive', kind: 'landscape' },
    kitchen: { src: '', alt: '', label: 'The kitchen · your photograph', hint: 'A generous spread. The people who make it.', ratio: 'Landscape · 16:10', tone: 'clay', kind: 'table' },
    terrace: { src: '', alt: '', label: 'City terrace · your photograph', hint: 'An evening above the everyday.', ratio: 'Landscape · 16:10', tone: 'dusk', kind: 'arch' },
    farmhouse: { src: '', alt: '', label: 'Vacay 002 · property photograph', hint: 'Your farmhouse, in its best light.', ratio: 'Landscape · 4:3', tone: 'olive', kind: 'landscape' },
    city: { src: '', alt: '', label: 'Vacay 003 · property photograph', hint: 'A closer look at your city escape.', ratio: 'Landscape · 4:3', tone: 'dusk', kind: 'arch' },
    pool: { src: '', alt: '', label: 'The pool area · your photograph', hint: 'Poolside afternoons at Vacay 002.', ratio: 'Landscape · 16:9', tone: 'water', kind: 'pool' },
    dining: { src: '', alt: '', label: 'At the table · your photograph', hint: 'Food deserves the spotlight.', ratio: 'Portrait · 4:5', tone: 'clay', kind: 'table' },
    moments: { src: '', alt: '', label: 'Together · your photograph', hint: 'Make room for the moments that matter.', ratio: 'Landscape · 16:10', tone: 'sand', kind: 'sun' }
  },
  stays: [
    { id: '002', name: 'The Farmhouse', location: 'OUTSIDE BANGALORE', image: 'farmhouse', description: 'A whole-property escape for longer tables and bigger gatherings. Pool afternoons, open lawns and evenings with nowhere else to be.', facts: ['7 bedrooms', 'Up to 25 overnight', 'Private pool'], amenities: ['Open lawns & gazebo', 'Outdoor cinema seating', 'Pure-veg food · Jain on request'], note: 'Food is arranged and paid for separately with the catering partner.', cta: 'Discover the farmhouse', details: 'A private farmhouse about 50 minutes from central Bangalore, depending on traffic. Seven bedrooms and six bathrooms, with space for up to 25 overnight guests. Day events and larger gatherings need a separate discussion with the team.' },
    { id: '003', name: 'The City Terrace', location: 'BANASHANKARI 2ND STAGE', image: 'city', description: 'An intimate city stay with a terrace to linger on. Settle in for billiards, shared meals and a different view of your everyday.', facts: ['3 bedrooms + sofa-bed area', 'Up to 15 overnight', 'Jacuzzi'], amenities: ['Terrace & large living area', 'Billiards', 'Vegetarian dining'], note: 'Ask the team about your stay and dining arrangements.', cta: 'Discover the terrace', details: 'A private city terrace in Banashankari 2nd Stage, Bangalore. Three bedrooms plus a large sofa-bed area accommodate up to 15 overnight guests. A jacuzzi, billiards and generous shared space make room for time together.' }
  ],
  pool: { label: 'VACAY 002 · THE POOL AREA', heading: 'A whole afternoon.\nNothing on the clock.', text: 'A dip, a poolside conversation, then another dip. The farmhouse pool area gives your group a place to slow down together.', caption: 'THE FARMHOUSE · SPACE TO UNWIND' },
  experience: { label: 'AT THE HEART OF VACAY', heading: 'Come for the stay.\nLinger at the table.', text: 'A good gathering has its own rhythm. A leisurely meal. One more conversation. A whole afternoon that belongs to you.', features: [
    { title: 'Pure veg. Full of flavour.', text: 'Vegetarian dining is central to both stays. The farmhouse offers North Indian favourites and Jain food on request.' },
    { title: 'A space for your people.', text: 'Choose the farmhouse for larger groups or the city terrace for a smaller get-together.' },
    { title: 'Make time for doing less.', text: 'A swim at 002. A game of billiards at 003. Sometimes the best itinerary leaves a little room.' }
  ] },
  moments: { heading: 'For no occasion.\nAnd every occasion.', text: 'Family time, a reunion of friends, or a celebration worth slowing down for. Find the space that feels right for your gathering.', tags: ['Friends & family', 'Small celebrations', 'Time away together'] },
  faq: [
    { q: 'Do we have the place to ourselves?', a: 'Both Vacay stays are private, whole-property stays. Choose the farmhouse or the city terrace to suit your group.' },
    { q: 'How many guests can stay overnight?', a: 'Vacay 002 accommodates up to 25 overnight guests across seven bedrooms. Vacay 003 accommodates up to 15 across three bedrooms and a large sofa-bed area. Please discuss day events separately with the team.' },
    { q: 'What are the food arrangements?', a: 'Both properties focus on vegetarian dining. Jain food is available on request at the farmhouse. Food is arranged and paid for separately with the catering partner; speak to the team about menus and your group’s needs.' },
    { q: 'Can we host a celebration?', a: 'Get in touch to discuss your group size, preferred property and plans. Event arrangements are confirmed separately. Loud music is not permitted after 10 pm; any event-specific arrangements must be agreed with the team.' },
    { q: 'Where are the two stays?', a: 'Vacay 002 is a farmhouse about 50 minutes from central Bangalore, depending on traffic. Vacay 003 is in Banashankari 2nd Stage. Ask the team for the exact location and directions.' }
  ],
  footer: 'Private spaces. Shared memories.'
};
