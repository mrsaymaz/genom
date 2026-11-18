// Drawn icons (no emoji anywhere in the game outside language tasks). 24 x 24 SVG, filled shapes.
const svg = (body, vb = '0 0 24 24') => `<svg viewBox="${vb}" aria-hidden="true" focusable="false">${body}</svg>`;

export const ICONS = {
  food: svg('<path d="M12 21V8" stroke="#8a5a1a" stroke-width="1.6" fill="none"/><g fill="#f2c040" stroke="#a87a18" stroke-width=".8"><ellipse cx="9" cy="8" rx="2" ry="3.2" transform="rotate(-25 9 8)"/><ellipse cx="15" cy="8" rx="2" ry="3.2" transform="rotate(25 15 8)"/><ellipse cx="8.6" cy="13" rx="2" ry="3" transform="rotate(-30 8.6 13)"/><ellipse cx="15.4" cy="13" rx="2" ry="3" transform="rotate(30 15.4 13)"/><ellipse cx="12" cy="4.6" rx="1.8" ry="3"/></g>'),
  lumber: svg('<g stroke="#5a3a1c" stroke-width="1"><rect x="3" y="12" width="17" height="5.5" rx="2.7" fill="#a8743e"/><rect x="5" y="6.5" width="15" height="5.5" rx="2.7" fill="#c08850"/></g><circle cx="19.5" cy="14.7" r="2.3" fill="#e8c890" stroke="#5a3a1c"/><circle cx="19.5" cy="9.2" r="2.3" fill="#e8c890" stroke="#5a3a1c"/>'),
  gold: svg('<path d="M3 18l3-6h6l3 6z" fill="#f2c040" stroke="#a87a18"/><path d="M9 12l3-6h6l3 6z" fill="#f7d466" stroke="#a87a18"/><path d="M12 18l3-6h6l-1 6z" fill="#e6b030" stroke="#a87a18"/>'),
  pop: svg('<circle cx="12" cy="7" r="3.6" fill="#e8dcc8"/><path d="M5 21c0-5 3-8 7-8s7 3 7 8z" fill="#e8dcc8"/>'),
  worker: svg('<circle cx="10" cy="6.5" r="3.2" fill="currentColor"/><path d="M4 21c0-5 2.5-8.5 6-8.5s6 3.5 6 8.5z" fill="currentColor"/><path d="M15 4l5 5M18 3l-4 4 3 3 4-4" stroke="currentColor" stroke-width="1.8" fill="none"/>'),
  spearman: svg('<circle cx="10" cy="7" r="3.2" fill="currentColor"/><path d="M4 21c0-5 2.5-8.5 6-8.5s6 3.5 6 8.5z" fill="currentColor"/><path d="M19 2v20" stroke="currentColor" stroke-width="1.8"/><path d="M19 1l2 4h-4z" fill="currentColor"/>'),
  archer: svg('<circle cx="9" cy="7" r="3.2" fill="currentColor"/><path d="M3 21c0-5 2.5-8.5 6-8.5s6 3.5 6 8.5z" fill="currentColor"/><path d="M16 3c5 4 5 14 0 18" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M16 3v18" stroke="currentColor" stroke-width=".9"/>'),
  // The four element specials.
  scout: svg('<circle cx="8" cy="9" r="2.8" fill="currentColor"/><path d="M4 21l2.5-6 3 1.5L8 21zM6.5 14.5l3-2.5 3 2-1.5 2zM10 13l3.5-4" stroke="currentColor" stroke-width="1.6" fill="currentColor" stroke-linejoin="round"/><path d="M18 2l4 4-4 4-4-4z" fill="currentColor"/><path d="M13.5 9.5l3-2" stroke="currentColor" stroke-width="1"/>'),
  healer: svg('<path d="M12 2.5C9 7 6 10.5 6 14a6 6 0 0012 0c0-3.5-3-7-6-11.5z" fill="currentColor"/><path d="M12 11v6M9 14h6" stroke="#1b2128" stroke-width="2" stroke-linecap="round" opacity=".55"/>'),
  charger: svg('<circle cx="11" cy="4.5" r="2.3" fill="currentColor"/><path d="M8 11l2-4h3l1 4z" fill="currentColor"/><path d="M3 13c0-2 2-3 5-3h7c3 0 5 1.5 6 3.5l1 1.5-2 .5-1.5-1H19v5h-2v-4H8v4H6v-4H4.5z" fill="currentColor"/><path d="M20.5 15l1.5 2" stroke="currentColor" stroke-width="1.4"/><path d="M14 9l8-5" stroke="currentColor" stroke-width="1.6"/>'),
  guardian: svg('<path d="M5 4h14l1 5-1 9-7 4-7-4-1-9z" fill="currentColor"/><path d="M12 8c-2 2-2 5 0 8 2-3 2-6 0-8z" fill="#1b2128" opacity=".5"/>'),
  towncenter: svg('<path d="M3 11l9-7 9 7" fill="currentColor"/><rect x="5" y="11" width="14" height="10" fill="currentColor"/><rect x="10" y="15" width="4" height="6" fill="#1b2128"/>'),
  house: svg('<path d="M4 12l8-7 8 7z" fill="currentColor"/><rect x="6" y="12" width="12" height="8" fill="currentColor"/><rect x="10.5" y="15" width="3" height="5" fill="#1b2128"/>'),
  farm: svg('<path d="M3 20h18" stroke="currentColor" stroke-width="1.6"/><g fill="currentColor"><path d="M6 20v-7l1.5-3 1.5 3v7z"/><path d="M11 20v-9l1.5-3 1.5 3v9z"/><path d="M16 20v-7l1.5-3 1.5 3v7z"/></g>'),
  storehouse: svg('<rect x="3" y="9" width="18" height="12" rx="1" fill="currentColor"/><path d="M2 10l10-6 10 6" fill="currentColor"/><path d="M6 13h5v5H6zM13 13h5v5h-5z" fill="#1b2128"/>'),
  barracks: svg('<path d="M2 20h20v-9l-3-2-3 2-4-3-4 3-3-2-3 2z" fill="currentColor"/><path d="M10 20v-5h4v5z" fill="#1b2128"/><path d="M12 6V2l4 1.5-4 1.5" fill="currentColor"/>'),
  watchtower: svg('<path d="M7 21l2-11h6l2 11z" fill="currentColor"/><rect x="6" y="6" width="12" height="4" fill="currentColor"/><path d="M6 6V3h2v2h2V3h4v2h2V3h2v3z" fill="currentColor"/>'),
  cancel: svg('<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>'),
  check: svg('<path d="M4 12.5l5 5L20 6" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  stop: svg('<rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/>'),
  pause: svg('<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>'),
  idle: svg('<circle cx="10" cy="7" r="3.2" fill="currentColor"/><path d="M4 21c0-5 2.5-8.5 6-8.5s6 3.5 6 8.5z" fill="currentColor"/><path d="M16 3h6l-6 6h6" stroke="currentColor" stroke-width="1.6" fill="none"/>'),
  army: svg('<circle cx="7" cy="8" r="2.6" fill="currentColor"/><circle cx="17" cy="8" r="2.6" fill="currentColor"/><path d="M2 20c0-4 2-6.5 5-6.5s5 2.5 5 6.5zM12 20c0-4 2-6.5 5-6.5s5 2.5 5 6.5z" fill="currentColor"/><path d="M12 2v9" stroke="currentColor" stroke-width="1.6"/>'),
  objectives: svg('<rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.8"/>'),
  build: svg('<path d="M3 20l9-9 2 2-9 9a1.4 1.4 0 01-2-2z" fill="currentColor"/><path d="M10 6l4-4 3 1 4 4-2 2-2-1-3 3-4-4 1-1z" fill="currentColor"/>'),
  amove: svg('<path d="M4 20l2-2M6 18l9-9 1-5 4-1-1 4-5 1-9 9z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M5 14l5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),
  hold: svg('<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" fill="currentColor"/><path d="M12 5.5v13" stroke="#1b2128" stroke-width="1.6" opacity=".5"/>'),
  bell: svg('<path d="M12 3a1.5 1.5 0 011.5 1.5v.6A6 6 0 0118 11v4l2 2.5H4L6 15v-4a6 6 0 014.5-5.9v-.6A1.5 1.5 0 0112 3z" fill="currentColor"/><path d="M9.5 19.5a2.5 2.5 0 005 0z" fill="currentColor"/>'),
  clear: svg('<path d="M12 3a1.5 1.5 0 011.5 1.5v.6A6 6 0 0118 11v4l2 2.5H4L6 15v-4a6 6 0 014.5-5.9v-.6A1.5 1.5 0 0112 3z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 11.5l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  sound: svg('<path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>'),
  soundOff: svg('<path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  pointer: svg('<defs><linearGradient id="pg" x1="0" x2="1"><stop offset="0" stop-color="#c9a2ff"/><stop offset=".5" stop-color="#9b5cff"/><stop offset="1" stop-color="#6a2fd6"/></linearGradient></defs><path d="M12 23L3.5 12H8.5V2.5h7V12h5z" fill="url(#pg)" stroke="#2c0f66" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 23L3.5 12H8.5V2.5H12z" fill="#fff" opacity=".22"/><path d="M8.5 12h7" stroke="#e7d7ff" stroke-width="1.2"/>'),
  scroll: svg('<path d="M6 4h11a3 3 0 013 3v1h-3V7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 4a3 3 0 00-3 3v1h3" fill="currentColor"/><path d="M6 4v13a3 3 0 003 3h9a3 3 0 003-3v-1H9v1a3 3 0 01-3 3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 9h6M9 12.5h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'),
  age: svg('<path d="M12 2l2.6 5.6 6.1.6-4.6 4.1 1.3 6L12 15.2 6.6 18.3l1.3-6L3.3 8.2l6.1-.6z" fill="currentColor"/><path d="M5 22h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  back: svg('<path d="M14 5l-7 7 7 7" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  rally: svg('<path d="M6 21V3" stroke="currentColor" stroke-width="2"/><path d="M6 3h12l-3 4 3 4H6z" fill="currentColor"/>'),
};

// Element emblems for the four teams: our own symbols, never the film crests.
export const EMBLEMS = {
  air: svg('<path d="M3 9c5 0 8-3 12-3a3 3 0 010 6H5M3 15h12a3 3 0 110 6c-2 0-3-1-3-2M5 12h14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>'),
  water: svg('<path d="M12 2C9 7 5 11 5 15a7 7 0 0014 0c0-4-4-8-7-13z" fill="currentColor"/><path d="M8.5 15a3.5 3.5 0 003.5 3.5" stroke="#fff" stroke-width="1.5" fill="none" opacity=".7"/>'),
  fire: svg('<path d="M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-5 3-6 0 3 1 4 2.5 4.5C11 10 10 6 12 2z" fill="currentColor"/>'),
  earth: svg('<path d="M12 21V11" stroke="currentColor" stroke-width="2"/><path d="M12 12C6 12 4 7 4 4c5 0 8 3 8 8zM12 15c5 0 8-3 8-8-4 0-8 2-8 8z" fill="currentColor"/>'),
};

// The icon for a unit type of a team (the special has one icon per kind).
export const unitIcon = def => ICONS[def.type === 'special' ? def.kind : def.type] || ICONS.army;
