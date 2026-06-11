import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const { width } = Dimensions.get('window');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const DEFAULT_STREAM_URL = 'https://telefeappmitelefe1.akamaized.net/hls/live/2037985/appmitelefe/TOK/master.m3u8';

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'player'>('landing');
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup video player with an empty source initially
  const player = useVideoPlayer(streamUrl || '', (p) => {
    p.loop = false;
    p.play();
  });

  const fetchStreamToken = async () => {
    setIsLoading(true);
    setError(null);
    let targetUrl = DEFAULT_STREAM_URL;

    try {
      // 1. Scrape the live page to find the current player URL
      const pageResponse = await fetch('https://www.mitelefe.com/vivo', {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });

      if (pageResponse.ok) {
        const html = await pageResponse.text();
        const match = html.match(/data-player-url="([^"]+)"/);
        if (match) {
          targetUrl = match[1];
        }
      }
    } catch (scrapeError) {
      console.warn('Failed to scrape vivo page, using default:', scrapeError);
    }

    try {
      // 2. Tokenize the URL
      const isWeb = Platform.OS === 'web';
      
      // In web browsers, fetch via the proxy api to bypass CORS.
      // On native platforms, fetch directly from Telefe's endpoint.
      let tokenizeEndpoint = 'https://www.mitelefe.com/vidya/tokenize';
      if (isWeb) {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        tokenizeEndpoint = isLocalhost ? 'http://localhost:5173/api/tokenize' : '/api/tokenize';
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Only set secure headers on Native (ignored or blocked by browsers)
      if (!isWeb) {
        headers['Referer'] = 'https://www.mitelefe.com/vivo';
        headers['Origin'] = 'https://www.mitelefe.com';
        headers['User-Agent'] = USER_AGENT;
      }

      const response = await fetch(tokenizeEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }

      const data = await response.json();
      const tokenizedUrl = data.url || data;

      if (!tokenizedUrl) {
        throw new Error('Tokenized URL was empty');
      }

      setStreamUrl(tokenizedUrl);
      player.replace(tokenizedUrl);
      player.play();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con la señal';
      setError(msg);
      console.error('Tokenization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (screen === 'player') {
      fetchStreamToken();
    } else {
      player.pause();
      setStreamUrl(null);
    }
  }, [screen]);

  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/FacuNeutral');
  };

  const handleOpenTelefe = () => {
    Linking.openURL('https://mitelefe.com/');
  };

  if (screen === 'player') {
    return (
      <View style={styles.playerContainer}>
        <StatusBar hidden={true} />
        {isLoading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#00a0e1" />
            <Text style={styles.loaderText}>Conectando con la señal...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchStreamToken}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.retryButton, { marginTop: 12, backgroundColor: '#333' }]} onPress={() => setScreen('landing')}>
              <Text style={styles.retryButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        )}

        {streamUrl && (
          <VideoView
            style={styles.videoView}
            player={player}
            allowsFullscreen={true}
            allowsPictureInPicture={true}
          />
        )}

        {/* Top Control Bar overlay */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => setScreen('landing')}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EN VIVO — Telefe</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0c" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <View style={styles.navBrand}>
            <View style={styles.logoCircles}>
              <View style={[styles.circle, styles.circle1]} />
              <View style={[styles.circle, styles.circle2]} />
              <View style={[styles.circle, styles.circle3]} />
            </View>
            <Text style={styles.navTitle}>Telefe Stream</Text>
          </View>
          <TouchableOpacity onPress={handleOpenGitHub} style={styles.poweredBy}>
            <Text style={styles.poweredByText}>by FacuNeutral</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.statusBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Señal en Vivo</Text>
          </View>

          <Text style={styles.heroTitle}>
            Telefe en vivo, {'\n'}
            <Text style={styles.heroTitleAccent}>simple y accesible.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Un acceso directo para ver la señal pública de Telefe de forma rápida y sin complicaciones desde tu celular.
          </Text>

          <TouchableOpacity style={styles.ctaPrimary} onPress={() => setScreen('player')}>
            <Text style={styles.ctaPrimaryText}>▶ Ver Telefe en Vivo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ctaSecondary} onPress={handleOpenTelefe}>
            <Text style={styles.ctaSecondaryText}>Visitar Web Oficial</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>⚠️ Información Importante</Text>
          <Text style={styles.disclaimerText}>
            Esta aplicación no ofrece ni distribuye contenido audiovisual propio. Funciona exclusivamente como un acceso directo a la señal pública que Telefe emite de forma abierta y gratuita en sus páginas oficiales.
            El objetivo es facilitar el acceso a personas con problemas de accesibilidad a dicho contenido web oficial.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Telefe Stream — Solo un acceso directo a la señal pública de mitelefe.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  navbar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a24',
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircles: {
    flexDirection: 'row',
    marginRight: 10,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 2,
  },
  circle1: {
    backgroundColor: '#10a37f',
  },
  circle2: {
    backgroundColor: '#8e8ea0',
  },
  circle3: {
    backgroundColor: '#ef4146',
  },
  navTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  poweredBy: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#16161e',
    borderWidth: 1,
    borderColor: '#242432',
  },
  poweredByText: {
    color: '#8e8ea0',
    fontSize: 12,
    fontWeight: '500',
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 65, 70, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 65, 70, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4146',
    marginRight: 8,
  },
  badgeText: {
    color: '#ef4146',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  heroTitleAccent: {
    color: '#00a0e1',
  },
  heroSubtitle: {
    color: '#8e8ea0',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  ctaPrimary: {
    width: width - 48,
    maxWidth: 340,
    backgroundColor: '#00a0e1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00a0e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  ctaPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  ctaSecondary: {
    width: width - 48,
    maxWidth: 340,
    backgroundColor: '#16161e',
    borderWidth: 1,
    borderColor: '#242432',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaSecondaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    backgroundColor: '#121218',
    borderColor: '#1a1a24',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  disclaimerTitle: {
    color: '#8e8ea0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  disclaimerText: {
    color: '#5c5c70',
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1a1a24',
    marginHorizontal: 24,
  },
  footerText: {
    color: '#5c5c70',
    fontSize: 11,
    textAlign: 'center',
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loaderText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 16,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0c',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 11,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  errorText: {
    color: '#8e8ea0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#00a0e1',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4146',
    marginRight: 6,
  },
  liveText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
