import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import cameraImage from '../assets/fotokurs/camera.png'
import homeIcon from '../assets/fotokurs/home.svg'
import starsImage from '../assets/fotokurs/stars.svg'
import './fotokurs.css'

const dates = ['14 November 2026', '21 November 2026', '28 November 2026']

export const Route = createFileRoute('/fotokurs')({
  component: FotokursPage,
  head: () => ({ meta: [{ title: 'Fotokurs · Fotoworkshopen' }] }),
})

export function FotokursPage() {
  const [screen, setScreen] = useState('home')
  const [selectedDate, setSelectedDate] = useState(dates[0])
  const [booking, setBooking] = useState({
    fullName: 'Alex Holm',
    date: '21 November 2026',
    time: '10',
    meetingPlace: 'Huvudentré',
  })

  function submitBooking(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    setBooking({
      fullName: formData.get('fullName'),
      date: selectedDate,
      time: '10',
      meetingPlace: 'Huvudentré',
    })
    setScreen('success')
  }

  return (
    <div className="course-page">
      {screen === 'home' && (
        <main className="course-hero" style={{ '--camera-image': `url("${cameraImage}")` }}>
          <Link className="course-admin-link" to="/admin">Arrangör <span aria-hidden="true">↗</span></Link>
          <div className="course-hero-copy">
            <h1>Ta kontroll<br />över din kamera</h1>
            <p>
              Ta kontroll över din kamera är en workshop för vuxna nybörjare som vill komma vidare
              från autoläget. Dagen innehåller korta genomgångar och praktiska fotoövningar, både
              inne och ute.
            </p>
          </div>
          <p className="course-wordmark">Foto Workshop</p>
          <div className="course-hero-actions" aria-label="Kursval">
            <button className="course-button course-button--overview" onClick={() => setScreen('overview')}>
              Kursen översikt
            </button>
            <button className="course-button course-button--book" onClick={() => setScreen('overview')}>
              Boka din plats
            </button>
            <button className="course-button course-button--cancel" onClick={() => setScreen('booking')}>
              Avboka
            </button>
          </div>
        </main>
      )}

      {screen === 'overview' && (
        <main className="course-overview">
          <header className="overview-heading">
            <h1>Kursen översikt</h1>
          </header>
          <div className="overview-content">
            <ul className="overview-topics">
              <li>Deltagarna får öva på bländare:</li>
              <li>slutartid.</li>
              <li>ISO.</li>
              <li>Fokus.</li>
              <li>ljus och komposition.</li>
            </ul>
            <p className="overview-note">Inga tidigare fotokunskaper behövs.</p>
            <ul className="overview-details">
              <li>Tid: Kl. 10–15.</li>
              <li>Plats: Ljusrum fotostudio på Södermalm i Stockholm och utomhus i närheten.</li>
              <li>Pris: 1 200 kr inklusive moms.</li>
              <li>Ingår: Handledning, övningsmaterial och fika. Lunch ingår inte.</li>
            </ul>
          </div>
          <div className="overview-dates" aria-label="Välj kurstillfälle">
            {dates.map((date) => (
              <button
                key={date}
                className={`overview-date${selectedDate === date ? ' is-selected' : ''}`}
                aria-pressed={selectedDate === date}
                onClick={() => setSelectedDate(date)}
              >
                {date}
              </button>
            ))}
          </div>
          <div className="overview-actions">
            <button className="course-button course-button--overview-book" onClick={() => setScreen('form')}>
              Boka din plats
            </button>
            <button className="course-text-link" onClick={() => setScreen('home')}>Tillbaka</button>
          </div>
        </main>
      )}

      {screen === 'form' && (
        <main className="course-form-screen">
          <form className="course-form" onSubmit={submitBooking}>
            <h1>Personuppgifter</h1>
            <div className="course-fields">
              <label>
                <span className="visually-hidden">Fullständigt namn</span>
                <input name="fullName" placeholder="Fullständigt namn" autoComplete="name" required />
              </label>
              <label>
                <span className="visually-hidden">E-postadress</span>
                <input name="email" type="email" placeholder="E-postadress" autoComplete="email" required />
              </label>
              <label>
                <span className="visually-hidden">Mobilnummer</span>
                <input name="phone" type="tel" placeholder="Mobilnummer" autoComplete="tel" required />
              </label>
              <label>
                <span className="visually-hidden">Adress</span>
                <input name="address" placeholder="Adress" autoComplete="street-address" required />
              </label>
            </div>
            <button className="course-button course-button--confirm" type="submit">
              Bekräfta din bokning
            </button>
          </form>
        </main>
      )}

      {screen === 'success' && (
        <main className="course-result">
          <div className="course-stars" aria-hidden="true">
            <img className="course-star course-star--one" src={starsImage} alt="" />
            <img className="course-star course-star--two" src={starsImage} alt="" />
            <img className="course-star course-star--three" src={starsImage} alt="" />
          </div>
          <p className="course-result-message">Tack för din bokning</p>
          <Link className="course-home-link" to="/">
            <img src={homeIcon} alt="" />
            Tillbaka till startsidan
          </Link>
        </main>
      )}

      {screen === 'booking' && (
        <main className="course-booking">
          <div className="course-booking-details">
            <p>Dina bokningsuppgifter</p>
            <p>Namn: {booking.fullName}</p>
            <p>Tillfället: {booking.date}</p>
            <p>Kl. {booking.time}</p>
            <p>Mötesplats: {booking.meetingPlace}</p>
          </div>
          <div className="course-booking-actions">
            <button className="course-button course-button--cancel-booking" onClick={() => setScreen('cancelled')}>
              Avboka
            </button>
            <button className="course-text-link course-text-link--muted" onClick={() => setScreen('home')}>
              Avbryt
            </button>
          </div>
        </main>
      )}

      {screen === 'cancelled' && (
        <main className="course-cancelled">
          <h1>Din bokning är avbokad<br />Välkommen tillbaka vid ett annat tillfälle</h1>
          <Link className="course-home-link" to="/">
            <img src={homeIcon} alt="" />
            Tillbaka till startsidan
          </Link>
        </main>
      )}
    </div>
  )
}
