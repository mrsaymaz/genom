// The install guide. On a phone, Genom plays as an installed web app: full screen and sideways,
// with no browser bars. In a phone browser the guide shows how to install it, in English or
// Turkish. The Turkish names of iPhone buttons are the ones iOS shows (Paylaş, Ana Ekrana Ekle,
// Ekle), so students can find them on their own screens.
// Android can also play straight away in full screen without installing.

const ICON = {
  share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 10H6a1 1 0 00-1 1v9a1 1 0 001 1h12a1 1 0 001-1v-9a1 1 0 00-1-1h-2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/></svg>',
  add: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 8.5v7M8.5 12h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
};
const ico = k => `<span class="ico">${ICON[k]}</span>`;

const TEXT = {
  en: {
    lead: 'On a phone, Genom plays as an app: full screen and sideways.',
    title: 'Add Genom to your Home Screen',
    ios: [
      `Tap the <b>Share</b> button ${ico('share')}. If you can't see it, tap ${ico('more')} first.`,
      `Scroll down and tap <b>Add to Home Screen</b> ${ico('add')}.`,
      'Tap <b>Add</b>. Then open <b>Genom</b> from your Home Screen.',
    ],
    android: [
      `Tap the menu ${ico('menu')} at the top right.`,
      'Tap <b>Install app</b> or <b>Add to Home screen</b>.',
      'Open <b>Genom</b> from your Home Screen.',
    ],
    installBtn: 'Install the app',
    fullscreenBtn: 'Play full screen without installing',
    noteIos: 'Use Safari for these steps. Your progress is saved in the app.',
    noteAndroid: 'Use Chrome for these steps. Your progress is saved on this phone.',
  },
  tr: {
    lead: 'Telefonda Genom bir uygulama olarak oynanır: tam ekran ve yatay.',
    title: "Genom'u Ana Ekranınıza ekleyin",
    ios: [
      `<b>Paylaş</b> düğmesine ${ico('share')} dokunun. Göremiyorsanız önce ${ico('more')} düğmesine dokunun.`,
      `Aşağı kaydırın ve <b>Ana Ekrana Ekle</b> ${ico('add')} seçeneğine dokunun.`,
      "<b>Ekle</b>'ye dokunun. Sonra <b>Genom</b>'u Ana Ekran'dan açın.",
    ],
    android: [
      `Sağ üstteki menüye ${ico('menu')} dokunun.`,
      '<b>Uygulamayı yükle</b> ya da <b>Ana ekrana ekle</b> seçeneğine dokunun.',
      "<b>Genom</b>'u Ana ekrandan açın.",
    ],
    installBtn: 'Uygulamayı yükle',
    fullscreenBtn: 'Yüklemeden tam ekran oyna',
    noteIos: 'Bu adımlar için Safari kullanın. İlerlemeniz uygulamada kaydedilir.',
    noteAndroid: 'Bu adımlar için Chrome kullanın. İlerlemeniz bu telefonda kaydedilir.',
  },
};

const isIOS = () => /iPhone|iPod/.test(navigator.userAgent);
const isAndroid = () => /Android/.test(navigator.userAgent);
export const standalone = () => navigator.standalone === true || matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches;
// A phone (not a tablet or a computer): a touch screen whose shorter side is small.
export const isPhone = () => matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 600;

const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } } };

let deferred = null; // Android's install prompt, kept until the student taps Install
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; document.getElementById('install-btn')?.classList.remove('hidden'); });

// Shows the guide when needed; calls play() once the game may start. Returns true if shown.
export function installGate(play) {
  let skip = false;
  try { skip = sessionStorage.getItem('genom.noGate') === '1'; } catch { /* storage blocked */ }
  if (skip || !isPhone() || standalone()) return false;
  const el = document.getElementById('install'), android = isAndroid() && !isIOS();
  let lang = store.get('genom.lang') || 'en';
  const paint = () => {
    const t = TEXT[lang];
    el.setAttribute('lang', lang);
    for (const n of el.querySelectorAll('[data-t]')) {
      const k = n.dataset.t === 'note' ? (android ? 'noteAndroid' : 'noteIos') : n.dataset.t;
      n.textContent = t[k];
    }
    document.getElementById('steps').innerHTML = (android ? t.android : t.ios).map(x => `<li><span>${x}</span></li>`).join('');
  };
  document.getElementById('lang').onclick = () => { lang = lang === 'en' ? 'tr' : 'en'; store.set('genom.lang', lang); paint(); };
  const installBtn = document.getElementById('install-btn'), fsBtn = document.getElementById('fullscreen-btn');
  installBtn.classList.toggle('hidden', !deferred);
  installBtn.onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice.catch(() => null); deferred = null; installBtn.classList.add('hidden'); };
  // Android (and other browsers with the Fullscreen API): play now, full screen and sideways.
  const canFull = !isIOS() && !!document.documentElement.requestFullscreen;
  fsBtn.classList.toggle('hidden', !canFull);
  fsBtn.onclick = async () => {
    try { await document.documentElement.requestFullscreen({ navigationUI: 'hide' }); await screen.orientation?.lock?.('landscape').catch(() => {}); } catch { /* the browser said no */ }
    close();
    play();
    // Leaving full screen in the browser brings the guide back, with the game paused.
    const onExit = () => { if (!document.fullscreenElement) { document.removeEventListener('fullscreenchange', onExit); window.__genom?.togglePause?.(true); open(); } };
    document.addEventListener('fullscreenchange', onExit);
  };
  const open = () => { paint(); el.classList.remove('hidden'); document.body.classList.add('installing'); };
  const close = () => { el.classList.add('hidden'); document.body.classList.remove('installing'); };
  open();
  return true;
}
