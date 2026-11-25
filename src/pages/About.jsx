import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionTransition from '../components/SectionTransition'

// ── Video config ────────────────────────────────────────────────────────────
// Drop the final film into /public/videos/ and set `src` (e.g. '/videos/about.mp4').
// While `src` is null the block shows the poster with a "coming soon" state.
const ABOUT_VIDEO = {
  src: null,
  poster: '/images/team/founders-duo.webp',
}

const ACCENT = '#d1bbfb'

const copy = {
  en: {
    metaTitle: 'About Us - AutoFlow Studio',
    badge: 'About us',
    heroTitleA: 'Custom software.',
    heroTitleB: 'One obsession: killing busywork.',
    heroSub:
      "AutoFlow Studio is a hands-on automation studio. We build custom CRMs, reporting systems and workflows that take repetitive work off your team's plate, so you can spend your time on the parts of the business that actually need you.",
    heroCta: 'Book a free audit',
    heroSecondary: 'See our work',
    videoLabel: 'Meet the studio',
    videoTitle: 'The people behind your automations',
    videoSoon: 'Film coming soon',
    videoPlay: 'Play video',
    storyLabel: 'Our story',
    storyTitle: 'We started where most businesses are stuck.',
    story: [
      "Before AutoFlow, we saw the same pattern over and over: talented teams losing hours every week to copy-pasting between tools, chasing leads in spreadsheets and building the same report by hand every Monday.",
      "So we started fixing it. One workflow at a time, for real businesses, with real deadlines. That's still how we work today: we sit down with you, learn how your operation actually runs, and build systems around it, not the other way around.",
      "No bloated agency layers and no hand-offs to people you've never met. When you work with AutoFlow, you work directly with the people writing your code.",
    ],
    principlesLabel: 'How we work',
    principlesTitle: 'What you can expect from us',
    principles: [
      { n: '01', title: 'Fast, focused delivery', desc: 'Most projects go live in under 7 days. We scope tightly and ship what moves the needle first.' },
      { n: '02', title: 'Built around your business', desc: 'No templates forced onto your process. Every system is designed for the way your team actually works.' },
      { n: '03', title: 'Plain language, no jargon', desc: "You'll always know what we're building, why, and what it will save you, explained in normal words." },
      { n: '04', title: 'Partners for the long run', desc: 'We monitor, improve and grow your automations as your business scales. Go-live is where it starts.' },
    ],
    ctaTitle: 'Ready to get your time back?',
    ctaSub: 'Book a free audit and we will show you exactly what we would automate first.',
    ctaBtn: 'Book a free audit',
  },
  nl: {
    metaTitle: 'Over Ons - AutoFlow Studio',
    badge: 'Over ons',
    heroTitleA: 'Maatwerk software.',
    heroTitleB: 'Eén obsessie: weg met saai werk.',
    heroSub:
      'AutoFlow Studio is een hands-on automatiseringsstudio. We bouwen maatwerk CRM\'s, rapportages en workflows die repetitief werk van je team overnemen, zodat jij je tijd kunt besteden aan de onderdelen van je bedrijf die jou écht nodig hebben.',
    heroCta: 'Boek een gratis audit',
    heroSecondary: 'Bekijk ons werk',
    videoLabel: 'Maak kennis met de studio',
    videoTitle: 'De mensen achter jouw automatiseringen',
    videoSoon: 'Video volgt binnenkort',
    videoPlay: 'Video afspelen',
    storyLabel: 'Ons verhaal',
    storyTitle: 'We begonnen waar de meeste bedrijven vastlopen.',
    story: [
      'Voordat AutoFlow bestond, zagen we steeds hetzelfde patroon: getalenteerde teams die elke week uren verliezen aan kopiëren en plakken tussen tools, leads najagen in spreadsheets en elke maandag hetzelfde rapport met de hand maken.',
      'Dus zijn we het gaan oplossen. Workflow voor workflow, voor echte bedrijven met echte deadlines. Zo werken we nog steeds: we gaan met je om tafel, leren hoe je bedrijf écht draait en bouwen systemen daaromheen, niet andersom.',
      'Geen logge bureaulagen en geen overdrachten aan mensen die je nooit hebt gesproken. Bij AutoFlow werk je direct met de mensen die jouw code schrijven.',
    ],
    principlesLabel: 'Hoe we werken',
    principlesTitle: 'Wat je van ons mag verwachten',
    principles: [
      { n: '01', title: 'Snel en gefocust opleveren', desc: 'De meeste projecten staan binnen 7 dagen live. We bakenen scherp af en leveren eerst wat het meeste oplevert.' },
      { n: '02', title: 'Gebouwd rond jouw bedrijf', desc: 'Geen templates die je proces in een keurslijf duwen. Elk systeem is ontworpen voor hoe jouw team écht werkt.' },
      { n: '03', title: 'Heldere taal, geen jargon', desc: 'Je weet altijd wat we bouwen, waarom, en wat het je oplevert. Uitgelegd in gewone woorden.' },
      { n: '04', title: 'Partners voor de lange termijn', desc: 'We monitoren, verbeteren en laten je automatiseringen meegroeien. Livegang is pas het begin.' },
    ],
    ctaTitle: 'Klaar om je tijd terug te winnen?',
    ctaSub: 'Boek een gratis audit en we laten je precies zien wat we als eerste zouden automatiseren.',
    ctaBtn: 'Boek een gratis audit',
  },
}

const fadeUp = {
  hidden: { opacity: 0.001, y: 44 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      duration: 1.4,
      bounce: 0,
    },
  },
}

const Label = ({ children }) => (
  <span className="about-label">{children}</span>
)

const openBooking = () => window.dispatchEvent(new CustomEvent('open-booking'))

function VideoBlock({ t }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const hasVideo = Boolean(ABOUT_VIDEO.src)

  const handlePlay = () => {
    if (!hasVideo || !videoRef.current) return
    setPlaying(true)
    videoRef.current.play().catch(() => setPlaying(false))
  }

  return (
    <motion.div
      className="about-video"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      <div className="about-video-frame">
        {hasVideo ? (
          <video
            ref={videoRef}
            src={ABOUT_VIDEO.src}
            poster={ABOUT_VIDEO.poster}
            controls={playing}
            playsInline
            preload="metadata"
            onPause={() => { if (videoRef.current?.ended) setPlaying(false) }}
            onEnded={() => setPlaying(false)}
          />
        ) : (
          <img src={ABOUT_VIDEO.poster} alt="" loading="lazy" />
        )}

        {!playing && (
          <div className="about-video-overlay">
            <div className="about-video-caption">
              <Label>{t.videoLabel}</Label>
              <h2>{t.videoTitle}</h2>
            </div>
            <button
              type="button"
              className={`about-play ${hasVideo ? '' : 'is-disabled'}`}
              onClick={handlePlay}
              aria-label={t.videoPlay}
              disabled={!hasVideo}
            >
              <span className="about-play-ring" />
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13a1 1 0 0 0 1.52.85l10.5-6.5a1 1 0 0 0 0-1.7L9.52 4.65A1 1 0 0 0 8 5.5z" />
              </svg>
            </button>
            {!hasVideo && <span className="about-video-soon">{t.videoSoon}</span>}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function About({ lang = 'en' }) {
  const t = copy[lang] || copy.en
  const prefix = lang === 'nl' ? '/nl' : ''

  useEffect(() => {
    document.title = t.metaTitle
    window.scrollTo(0, 0)
  }, [lang, t.metaTitle])

  return (
    <main className="main-content about-page">
      <style>{styles}</style>

      {/* ── Hero ── */}
      <SectionTransition zIndex={1} isSticky={true} enableExitDepth={true} bg="#050505">
        <section className="about-hero">
          <div className="about-glow about-glow-a" />
          <div className="about-glow about-glow-b" />
          <div className="about-container about-hero-grid">
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <Label>{t.badge}</Label>
              <h1 className="about-h1">
                {t.heroTitleA}
                <br />
                <span className="about-h1-accent">{t.heroTitleB}</span>
              </h1>
              <p className="about-lead">{t.heroSub}</p>
              <div className="about-actions">
                <button type="button" className="about-btn-primary" onClick={openBooking}>
                  {t.heroCta}
                </button>
                <Link to={prefix + '/portfolio'} className="about-btn-ghost">
                  {t.heroSecondary} →
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="about-hero-media"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              <div className="about-hero-media-back" />
              <div className="about-hero-media-front">
                <img src="/images/team/founders-standing.webp" alt="AutoFlow Studio founders" />
              </div>
            </motion.div>
          </div>
        </section>
      </SectionTransition>

      {/* ── Video ── */}
      <SectionTransition zIndex={2} bg="#07070a">
        <section className="about-section about-section-tight">
          <div className="about-container">
            <VideoBlock t={t} />
          </div>
        </section>
      </SectionTransition>

      {/* ── Story ── */}
      <SectionTransition zIndex={3} bg="#050505">
        <section className="about-section">
          <div className="about-container about-story-grid">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              <Label>{t.storyLabel}</Label>
              <h2 className="about-h2">{t.storyTitle}</h2>
              {t.story.map((p, i) => (
                <p key={i} className="about-body">{p}</p>
              ))}
            </motion.div>

            <motion.div
              className="about-collage"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="about-collage-tall">
                <img src="/images/team/founder-talking.webp" alt="" loading="lazy" style={{ objectPosition: '30% center' }} />
              </div>
              <div className="about-collage-tall about-collage-offset">
                <img src="/images/team/founder-sitting.webp" alt="" loading="lazy" style={{ objectPosition: '52% center' }} />
              </div>
            </motion.div>
          </div>
        </section>
      </SectionTransition>

      {/* ── Principles ── */}
      <SectionTransition zIndex={4} bg="#07070b">
        <section className="about-section about-principles-section">
          <div className="about-container about-principles-grid">
            <div className="about-principles-left">
              <Label>{t.principlesLabel}</Label>
              <h2 className="about-h2">{t.principlesTitle}</h2>
              <p className="about-lead">
                {lang === 'nl'
                  ? 'Vier kernbeloftes die we in elk systeem en elke regel code meenemen.'
                  : 'Four core commitments built into every system and automation we deliver.'}
              </p>
            </div>
            <div className="about-principles-stack">
              {t.principles.map((p, i) => (
                <motion.div
                  key={p.n}
                  className="about-stack-card"
                  style={{
                    top: `calc(130px + ${i * 26}px)`,
                    zIndex: i + 1,
                  }}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.15 }}
                >
                  <div className="about-stack-card-inner">
                    <div className="about-stack-card-head">
                      <span className="about-principle-n">{p.n}</span>
                      <span className="about-stack-tag">STANDARD 0{i + 1}</span>
                    </div>
                    <h3>{p.title}</h3>
                    <p>{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </SectionTransition>

      {/* ── CTA ── */}
      <SectionTransition zIndex={5} bg="#050505">
        <section className="about-section about-cta-section">
          <div className="about-container">
            <motion.div
              className="about-cta"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
            >
              <div className="about-cta-img">
                <img src="/images/team/founders-duo.webp" alt="" loading="lazy" />
              </div>
              <div className="about-cta-text">
                <h2 className="about-h2">{t.ctaTitle}</h2>
                <p className="about-body">{t.ctaSub}</p>
                <button type="button" className="about-btn-primary" onClick={openBooking}>
                  {t.ctaBtn}
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </SectionTransition>
    </main>
  )
}

const styles = `
  .about-page { background: #050505; color: #fff; overflow: clip; }
  .about-container { max-width: 1240px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }
  .about-section { padding: 120px 0; position: relative; }
  .about-section-tight { padding: 40px 0 80px; }

  .about-label {
    display: inline-block; font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; font-weight: 700;
    letter-spacing: 0.16em; text-transform: uppercase; color: ${ACCENT};
    padding: 6px 16px; border-radius: 999px; background: rgba(209,187,251,0.1);
    border: 1px solid rgba(209,187,251,0.28); margin-bottom: 24px;
  }
  .about-h1 {
    font-family: 'Inter', sans-serif; font-weight: 800; letter-spacing: -0.035em; line-height: 1.02;
    font-size: clamp(2.6rem, 5.4vw, 4.6rem); margin: 0 0 28px;
  }
  .about-h1-accent {
    background: linear-gradient(120deg, #ffffff 0%, ${ACCENT} 55%, #a78bfa 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .about-h2 {
    font-family: 'Inter', sans-serif; font-weight: 800; letter-spacing: -0.025em; line-height: 1.08;
    font-size: clamp(2rem, 3.6vw, 3.1rem); margin: 0 0 28px; max-width: 18ch;
  }
  .about-lead { font-family: 'Space Grotesk', sans-serif; font-size: 1.15rem; line-height: 1.7; color: #a3acbd; max-width: 54ch; margin: 0 0 40px; }
  .about-body { font-family: 'Space Grotesk', sans-serif; font-size: 1.05rem; line-height: 1.75; color: #94a3b8; max-width: 58ch; margin: 0 0 20px; }

  .about-actions { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
  .about-btn-primary {
    font-family: 'Inter', sans-serif; font-weight: 700; font-size: 1rem; color: #0b0b10; cursor: pointer;
    background: linear-gradient(135deg, #ffffff, ${ACCENT}); border: none; border-radius: 999px; padding: 16px 30px;
    box-shadow: 0 10px 30px -10px rgba(209,187,251,0.55); transition: transform .25s ease, box-shadow .25s ease;
  }
  .about-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px -12px rgba(209,187,251,0.7); }
  .about-btn-ghost {
    font-family: 'Inter', sans-serif; font-weight: 600; color: #e2e8f0; text-decoration: none; padding: 16px 24px;
    border-radius: 999px; border: 1px solid rgba(255,255,255,0.14); transition: background .25s ease, border-color .25s ease;
  }
  .about-btn-ghost:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.28); }

  /* Hero */
  .about-hero { padding: 170px 0 100px; position: relative; }
  .about-glow { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(10px); }
  .about-glow-a { width: 520px; height: 520px; top: 40px; right: -120px; background: radial-gradient(circle, rgba(156,39,176,0.22) 0%, transparent 70%); }
  .about-glow-b { width: 420px; height: 420px; bottom: -80px; left: -140px; background: radial-gradient(circle, rgba(209,187,251,0.12) 0%, transparent 70%); }
  .about-hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 72px; align-items: center; }
  .about-hero-media { position: relative; height: 620px; }
  .about-hero-media-back {
    position: absolute; inset: 24px -24px -24px 24px; border-radius: 40px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
  }
  .about-hero-media-front {
    position: absolute; inset: 0; border-radius: 40px; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 50px 100px -30px rgba(0,0,0,0.85);
  }
  .about-hero-media-front img { width: 100%; height: 100%; object-fit: cover; object-position: 60% 60%; display: block; }

  /* Video */
  .about-video-frame {
    position: relative; aspect-ratio: 16 / 9; border-radius: 36px; overflow: hidden; background: #0a0a0a;
    border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 60px 120px -40px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03) inset;
  }
  .about-video-frame video, .about-video-frame img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .about-video-frame img { object-position: center 30%; }
  .about-video-overlay {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(180deg, rgba(5,5,5,0.15) 0%, rgba(5,5,5,0.25) 45%, rgba(5,5,5,0.85) 100%);
  }
  .about-video-caption { position: absolute; left: 48px; bottom: 44px; right: 48px; }
  .about-video-caption .about-label { margin-bottom: 14px; backdrop-filter: blur(8px); }
  .about-video-caption h2 {
    font-family: 'Inter', sans-serif; font-weight: 800; letter-spacing: -0.025em; line-height: 1.08;
    font-size: clamp(1.6rem, 3vw, 2.6rem); margin: 0; max-width: 20ch;
  }
  .about-play {
    position: relative; width: 96px; height: 96px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.14); color: #fff; display: grid; place-items: center; cursor: pointer;
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); transition: transform .3s ease, background .3s ease;
  }
  .about-play svg { margin-left: 4px; }
  .about-play:hover:not(:disabled) { transform: scale(1.06); background: rgba(255,255,255,0.22); }
  .about-play-ring {
    position: absolute; inset: -10px; border-radius: 50%; border: 1px solid rgba(209,187,251,0.45);
    animation: aboutPulse 2.4s ease-out infinite;
  }
  .about-play.is-disabled { cursor: default; opacity: 0.85; }
  .about-video-soon {
    position: absolute; top: 28px; right: 28px; font-family: 'Space Grotesk', sans-serif; font-size: 0.8rem; font-weight: 600;
    color: #e2e8f0; padding: 8px 14px; border-radius: 999px; background: rgba(5,5,5,0.55); border: 1px solid rgba(255,255,255,0.12);
    backdrop-filter: blur(8px);
  }
  @keyframes aboutPulse { 0% { transform: scale(0.9); opacity: 0.9; } 100% { transform: scale(1.35); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .about-play-ring { animation: none; } }

  /* Story */
  .about-story-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .about-collage { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; height: 600px; }
  .about-collage > div {
    border-radius: 28px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #0a0a0a;
  }
  .about-collage-offset { margin-top: 56px; margin-bottom: -56px; }
  .about-collage img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* Principles - Sticky Stacking Deck */
  .about-principles-section { position: relative; padding: 120px 0 160px; }
  .about-principles-grid { display: grid; grid-template-columns: 1fr 1.15fr; gap: 72px; align-items: start; position: relative; }
  .about-principles-left { position: sticky; top: 130px; }
  .about-principles-left .about-h2 { margin-bottom: 20px; }
  .about-principles-stack { display: flex; flex-direction: column; gap: 40px; position: relative; }
  .about-stack-card {
    position: sticky;
    border-radius: 32px;
    background: #0c0d12;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 -16px 40px -10px rgba(0, 0, 0, 0.7), 0 30px 60px -15px rgba(0, 0, 0, 0.9);
    transition: transform 0.3s ease, border-color 0.3s ease;
  }
  .about-stack-card:hover {
    border-color: rgba(209, 187, 251, 0.35);
  }
  .about-stack-card-inner {
    padding: 44px 40px 48px;
  }
  .about-stack-card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }
  .about-stack-tag {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #64748b;
    padding: 4px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
  .about-principle-n {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    color: ${ACCENT};
    font-size: 1.1rem;
    display: inline-block;
  }
  .about-stack-card h3 {
    font-family: 'Inter', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 16px;
    letter-spacing: -0.015em;
    color: #fff;
  }
  .about-stack-card p {
    font-family: 'Space Grotesk', sans-serif;
    color: #94a3b8;
    line-height: 1.7;
    margin: 0;
    font-size: 1.05rem;
    max-width: 48ch;
  }

  /* CTA */
  .about-cta-section { padding-bottom: 140px; }
  .about-cta {
    display: grid; grid-template-columns: 1fr 1fr; border-radius: 40px; overflow: hidden;
    background: linear-gradient(135deg, rgba(209,187,251,0.08), rgba(156,39,176,0.06));
    border: 1px solid rgba(209,187,251,0.18);
  }
  .about-cta-img { min-height: 420px; }
  .about-cta-img img { width: 100%; height: 100%; object-fit: cover; object-position: center 25%; display: block; }
  .about-cta-text { padding: 64px 56px; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; }

  @media (max-width: 991px) {
    .about-hero { padding: 130px 0 60px; }
    .about-hero-grid, .about-story-grid, .about-cta { grid-template-columns: 1fr; gap: 48px; }
    .about-principles-grid { grid-template-columns: 1fr; gap: 36px; }
    .about-principles-left { position: static; }
    .about-stack-card { position: static; }
    .about-collage { height: 460px; }
    .about-hero-media { height: 460px; }
    .about-hero-media-back { inset: 16px -12px -16px 12px; }
    .about-section { padding: 80px 0; }
    .about-section-tight { padding: 20px 0 40px; }
    .about-cta { gap: 0; }
    .about-cta-img { min-height: 300px; }
    .about-cta-text { padding: 40px 28px 48px; }
  }
  @media (max-width: 600px) {
    .about-stack-card-inner { padding: 28px 24px; }
    .about-collage { height: 380px; }
    .about-video-frame { aspect-ratio: 4 / 5; border-radius: 28px; }
    .about-video-caption { left: 24px; right: 24px; bottom: 28px; }
    .about-play { width: 76px; height: 76px; }
    .about-video-soon { top: 18px; right: 18px; }
  }
`

