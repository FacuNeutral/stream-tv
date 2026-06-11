import { Controller } from '@hotwired/stimulus';
import AdsService from '../services/player-ads_service.js';
import ComscoreService from '../services/player-comscore_service.js';

const PLAYER_ERROR_HANDLERS = {
  232403: 'geo',
  232401: 'geo',
  232402: 'unavailable',
  232404: 'unavailable'
};

/* stimulusFetch: 'lazy' */
export default class extends Controller {
  static targets = ['video'];
  static values = {
    token: String,
    muted: Boolean,
    autoplay: Boolean,

    // availability
    since: String,
    until: String,
    image: String,

    // ads
    ad: String
  };

  async connect() {
    if (!this.isAvailable()) return;

    const globalToken =
        this.tokenValue ||
        document
          .querySelector('meta[name="jwplayer-token"]')
          ?.getAttribute('content');

      if (window.jwplayer && !jwplayer.key && globalToken) {
        jwplayer.key = globalToken;
      }

    // Tabs mode
    const activeTab = this.element.querySelector('.nav-link.active[data-player-url]');
    if (activeTab) {
      return this.loadFromElement(activeTab);
    }

    // Single video mode
    const url = this.videoTarget.dataset.videoUrlValue;
    if (url) {
      const autoplay = this.parseAutoplay(
        this.autoplayValue,
        true
      );
      await this.loadVideo(url, autoplay, this.mutedValue);
    }
  }

  async changeTab(event) {
    event.preventDefault();
    const el = event.currentTarget;
    await this.loadFromElement(el);
    this.updateActiveTab(el);
  }

  async loadFromElement(el) {
    const url = el.dataset.playerUrl;
    if (!url) return;

    // Tab video
    const autoplay = this.parseAutoplay(el.dataset.playerAutoplay);
    const muted =
      this.parseAutoplay(el.dataset.playerMuted) ?? this.mutedValue;

    await this.loadVideo(url, autoplay, muted);
  }

  async loadVideo(url, autoplay, muted) {
    if (this.isYouTube(url)) {
      this.renderYouTube(url, autoplay, muted);
    } else {
      await this.loadJW(url, autoplay, muted);
    }
  }
  /* -------------------- YouTube -------------------- */
  renderYouTube(url, autoplay, muted) {
    this.teardownPlayer();

    const id = this.extractYouTubeId(url);
    this.videoTarget.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}"
        frameborder="0"
        allowfullscreen
        style="width:100%;height:100%;display:block">
      </iframe>
    `;
  }

  /* -------------------- JW -------------------- */

  async loadJW(url, autoplay, muted) {
    await this.ensureJWLoaded();

    const tokenizedUrl = await this.tokenize(url);

    const playlistItem = {
      file: tokenizedUrl,
      type: tokenizedUrl.includes('.m3u8') ? 'hls' : undefined,
      image: this.imageValue,
      title: this.getMeta('og:title'),
      programTitle: this.getMeta('og:site_name') ?? '*null',
      genre: this.getMeta('og:type') ?? 'website',
      isLive: this.getMeta('LivePlayer') ? true : null,
      isFullEpisode: false
    };

    const playerVast = document
          .querySelector('meta[name="jwplayer-vast"]')
          ?.getAttribute('content');

    if (playerVast) {
      playlistItem.adschedule = AdsService.buildSchedule({
        tags: {
          pre: playerVast,
          post: playerVast
        }
      });
    }

    if (this.player) {
      this.player.load([playlistItem]);
      autoplay && this.player.play();
      return;
    }

    this.player = jwplayer(this.videoTarget).setup({
      aboutlink: "https://mitelefe.com",
      abouttext: "TELEFE",
      width: '100%',
      aspectratio: '16:9',
      autostart: autoplay ? 'viewable' : false,
      mute: true,
      floating: {
        mode: 'never'
      },
      generateSEOMetadata: true,
      intl: {
        es: {}
      },
      preload: 'metadata',
      playlist: [playlistItem],
      advertising: AdsService.getBaseAdvertising({
        localization: window.playerLocalization
      })
    });

    // this.player.on('error', (e) => {
    this.player.on('play', (e) => {
      const type = PLAYER_ERROR_HANDLERS[e?.code];

      if (type === 'geo') {
        this.showGeoBlocked();
      }

      if (type === 'unavailable') {
        this.showUnavailable('Contenido no disponible');
      }
    });

    ComscoreService.initComscore(this.player, {
      contentType: this.getMeta('og:type') ?? 'website',
      publisherId: this.getMeta('ComscoreId'),
      metadata: playlistItem,
      // firstParty: opcional
    });

    if (autoplay && muted === false) {
      const tryEnableSound = () => {
        if (this.player && this.player.getMute()) {
          this.player.setMute(false);
        }
      };

      document.addEventListener('click', tryEnableSound, { once: true });
      document.addEventListener('touchstart', tryEnableSound, { once: true });
    }

    this.bindPlayerEvents();
  }

  async tokenize(url) {
    const res = await fetch('/vidya/tokenize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    return typeof data === 'string' ? data : (data.url || data.file);
  }

  /* -------------------- Availability -------------------- */

  isAvailable() {
    if (!this.sinceValue && !this.untilValue) return true;

    const now = new Date();
    const since = this.parseDMY(this.sinceValue, 0);
    const until = this.parseDMY(this.untilValue, 23);

    if (since && now < since) {
      this.showUnavailable(`Disponible desde ${since.toLocaleDateString('es-AR')}`);
      return false;
    }

    if (until && now > until) {
      this.showUnavailable(`Expirado el ${until.toLocaleDateString('es-AR')}`);
      return false;
    }

    return true;
  }

  showUnavailable(text) {
    this.teardownPlayer();
    const div = document.createElement('div');
    div.className = 'video-unavailable';

    div.innerHTML = `
      <span class="video-unavailable__content">
        ${text}
      </span>
    `;

    if (this.imageValue) {
      div.style.backgroundImage = `url('${this.imageValue}')`;
    }
    this.videoTarget.appendChild(div);
  }

  showGeoBlocked() {
    this.teardownPlayer();

    const div = document.createElement('div');
    div.className = 'video-unavailable';

    div.innerHTML = `
      <span class="video-unavailable__content">
        Contenido restringido
      </span>
    `;

    if (this.imageValue) {
      div.style.backgroundImage = `url('${this.imageValue}')`;
    }

    this.videoTarget.appendChild(div);
  }

  /* -------------------- Utils -------------------- */

  teardownPlayer() {
    try { this.player?.remove(); } catch {}
    this.player = null;
    this.videoTarget.innerHTML = '';
  }

  updateActiveTab(tab) {
    this.element.querySelectorAll('.nav-link').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  }

  parseAutoplay(val, def = false) {
    if (val == null) return def;
    return ['true','1','yes','on'].includes(String(val).toLowerCase());
  }

  parseDMY(str, endHour) {
    if (!str) return null;
    const [d,m,y] = str.split('/').map(Number);
    const date = new Date(y, m-1, d);
    date.setHours(endHour, endHour ? 59 : 0, endHour ? 59 : 0);
    return date;
  }

  isYouTube(url) {
    return /youtube\.com|youtu\.be/i.test(url);
  }

  extractYouTubeId(url) {
    return (
      url.match(/youtu\.be\/([^?&]+)/)?.[1] ||
      url.match(/[?&]v=([^?&]+)/)?.[1] ||
      url
    );
  }

  getMeta(property) {
    return document
      .querySelector(`meta[property="${property}"]`)
      ?.getAttribute('content');
  }

  loadJWScript() {
    if (window.jwplayer) return Promise.resolve();

    const playerID = document
      .querySelector('meta[name="jwplayer-id"]')
      ?.getAttribute('content');

    if (!playerID) {
      console.warn('[JW] Missing jwplayer-id meta tag');
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://cdn.jwplayer.com/libraries/${playerID}.js`;
      script.async = true;
      script.onload = resolve;
      document.body.appendChild(script);
    });
  }

  async ensureJWLoaded() {
    await this.loadJWScript();
  }

  bindPlayerEvents() {
    if (!this.player || !window.__PLAYER_DEBUG__) return;

    this.player
      .on('ready', () => console.log('[JW] ready'))
      .on('play', () => console.log('[JW] play'))
      .on('pause', () => console.log('[JW] pause'))
      .on('complete', () => console.log('[JW] complete'))
      .on('error', e => console.warn('[JW] error', e))
      .on('adRequest', e => console.log('[ADS] request', e))
      .on('adImpression', e => console.log('[ADS] impression', e))
      .on('adStarted', e => console.log('[ADS] started', e))
      .on('adComplete', e => console.log('[ADS] complete', e))
      .on('adError', e => console.warn('[ADS] error', e));
  }
}

