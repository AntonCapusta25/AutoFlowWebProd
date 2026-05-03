import BookingForm from './BookingForm'
import { getT } from '../i18n/translations'

export default function CTASection({ lang = 'en' }) {
  const t = getT(lang)

  return (
    <section id="booking" className="booking-section">
      <div className="booking-bg-decoration">
        <div className="booking-circle-1" />
        <div className="booking-circle-2" />
        <div className="booking-noise" />
      </div>
      
      <div className="booking-container">
        <div className="booking-flex">
          <div className="booking-text">
            <h2 className="booking-title" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
              {t.booking.title} <br />
              <span className="text-gradient">{t.booking.highlight}</span>
            </h2>
            <p className="booking-description" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {t.booking.sub}
            </p>
            <div className="booking-features">
              <div className="feature-pill">
                <div className="pill-icon">⭐</div>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.booking.feat1}</span>
              </div>
              <div className="feature-pill">
                <div className="pill-icon">⚡</div>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.booking.feat2}</span>
              </div>
            </div>
          </div>

          <div className="booking-form-wrapper">
            <div className="form-glass-container">
              <div className="form-inner">
                <BookingForm lang={lang} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
