import { useTheme } from '../../../context/ThemeContext'
import { Link } from 'react-router-dom'
import styles from './LandingPage.module.css'

export function LandingPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.navBrand}>
            <div className={styles.logoCircles}>
              <span className={styles.circle} />
              <span className={`${styles.circle} ${styles.circle2}`} />
              <span className={`${styles.circle} ${styles.circle3}`} />
            </div>
            <span className={styles.navTitle}>Telefe Stream</span>
          </div>

          <div className={styles.navRight}>
            <button
              className={styles.themeToggle}
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <a
              href="https://github.com/FacuNeutral"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.poweredBy}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>by FacuNeutral</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className={styles.heroSection}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Señal en Vivo
          </div>

          <h1 className={styles.heroTitle}>
            <span className={styles.heroLine1}>Telefe en vivo,</span>
            <span className={styles.heroLine2}>simple y accesible.</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Un acceso directo para ver la señal pública de Telefe de forma rápida y sin complicaciones.
          </p>

          {/* Two Options */}
          <div className={styles.ctaGroup}>
            <Link to="/watch" state={{ fromLanding: true }} className={styles.ctaPrimary}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Ver Telefe en Vivo
            </Link>

            <button className={styles.ctaSecondary} disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar App
              <span className={styles.comingSoon}>Próximamente</span>
            </button>
          </div>
        </div>

        {/* Floating elements decorativos */}
        <div className={styles.floatingOrbs}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.orb3} />
        </div>
      </main>

      {/* Disclaimer */}
      <section className={styles.disclaimer}>
        <div className={styles.disclaimerContent}>
          <svg className={styles.disclaimerIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p>
            Este sitio no ofrece ni distribuye contenido audiovisual propio.
            Funciona exclusivamente como un <strong>acceso directo a la señal pública</strong> que
            <a href="https://mitelefe.com/" target="_blank" rel="noopener noreferrer"> Telefe </a>
            emite de forma abierta y gratuita en sus páginas oficiales.
            El objetivo es facilitar la accesibilidad a dicha señal.
            Para la experiencia completa del canal, recomendamos visitar
            <a href="https://mitelefe.com/" target="_blank" rel="noopener noreferrer"> mitelefe.com</a>.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>
          Telefe Stream — Solo un acceso directo a la señal pública de
          <a href="https://mitelefe.com/" target="_blank" rel="noopener noreferrer"> mitelefe.com</a>
        </p>
      </footer>
    </div>
  )
}
