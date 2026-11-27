import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import defaultCommentAvatar from '../assets/fotokurs/admin-comments/avatar-default.svg'
import alternateCommentAvatar from '../assets/fotokurs/admin-comments/avatar-alt.svg'
import './admin.css'

const initialWorkshops = [
  {
    id: 1,
    title: 'Fotografera i kvällsljus',
    date: '2026-12-12',
    time: '15:00–17:00',
    booked: 5,
    capacity: 8,
    attendees: ['Alex Holm', 'Mira Lind', 'Sam Eriksson', 'Kim Berg', 'Noah Ali'],
  },
  {
    id: 2,
    title: 'Ta kontroll över din kamera',
    date: '2026-12-19',
    time: '10:00–15:00',
    booked: 8,
    capacity: 8,
    attendees: ['Amina Saleh', 'Erik Lund', 'Linnea Svensson', 'Olle Nyström', 'Lea Karlsson', 'Max Andersson', 'Nora Ek', 'Johan Persson'],
  },
  {
    id: 3,
    title: 'Porträtt med naturligt ljus',
    date: '2027-01-09',
    time: '11:00–13:00',
    booked: 2,
    capacity: 6,
    attendees: ['Ella Nordin', 'Viktor Sjöberg'],
  },
]

const initialBookings = [
  {
    id: 'alex-holm',
    initials: 'AH',
    name: 'Alex Holm',
    workshop: 'Fotografera i kvällsljus',
    date: 'Idag, 09:42',
    comments: [{
      id: 'alex-comment',
      text: 'Jag har bokat den 28:e men vet inte var vi ska träffas.',
      avatar: defaultCommentAvatar,
    }],
  },
  {
    id: 'mira-lind',
    initials: 'ML',
    name: 'Mira Lind',
    workshop: 'Fotografera i kvällsljus',
    date: 'Igår, 16:18',
    comments: [{
      id: 'mira-comment',
      text: 'Det låter spännande att lära sig grunderna för att använda kamera.',
      avatar: alternateCommentAvatar,
    }],
  },
  {
    id: 'amina-saleh',
    initials: 'AS',
    name: 'Amina Saleh',
    workshop: 'Ta kontroll över din kamera',
    date: 'Igår, 11:06',
    comments: [{
      id: 'amina-comment',
      text: 'Kan man använda en gammal kameramodell eller behöver man en uppdaterad modell?',
      avatar: defaultCommentAvatar,
    }],
  },
]

export const Route = createFileRoute('/admin')({
  component: Admin,
  head: () => ({ meta: [{ title: 'Admin · Foto Workshop' }] }),
})

function formatDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function BookingComments({ booking, onBack, onDeleteComment, onReply }) {
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')

  function submitReply(event, commentId) {
    event.preventDefault()
    const reply = replyText.trim()
    if (!reply) return

    onReply(commentId, reply)
    setReplyText('')
    setReplyingTo(null)
  }

  return (
    <section className="booking-comments-view" aria-labelledby="booking-comments-title">
      <button className="booking-comments-back" type="button" onClick={onBack}>
        ← Tillbaka till bokningar
      </button>
      <header className="booking-comments-heading">
        <p className="admin-overline">BOKNING</p>
        <h1 id="booking-comments-title">{booking.name}</h1>
        <p>{booking.workshop} <span aria-hidden="true">·</span> {booking.date}</p>
        <h2>Kommentarer <span>{booking.comments.length}</span></h2>
      </header>

      {booking.comments.length > 0 ? (
        <div className="booking-comment-list">
          {booking.comments.map((comment) => (
            <article className="booking-comment-card" key={comment.id}>
              <div className="booking-comment-actions">
                <button
                  type="button"
                  aria-expanded={replyingTo === comment.id}
                  aria-controls={`reply-${comment.id}`}
                  onClick={() => {
                    setReplyingTo((current) => current === comment.id ? null : comment.id)
                    setReplyText('')
                  }}
                >
                  Svara
                </button>
                <button type="button" onClick={() => onDeleteComment(comment.id)}>Radera</button>
              </div>
              <div className="booking-comment-body">
                <img className="booking-comment-avatar" src={comment.avatar} alt="" />
                <p>{comment.text}</p>
              </div>
              {comment.reply && (
                <div className="booking-comment-reply">
                  <strong>Svar från arrangören</strong>
                  <p>{comment.reply}</p>
                </div>
              )}
              {replyingTo === comment.id && (
                <form
                  className="booking-comment-reply-form"
                  id={`reply-${comment.id}`}
                  onSubmit={(event) => submitReply(event, comment.id)}
                >
                  <label>
                    Ditt svar
                    <textarea
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      rows="3"
                      required
                    />
                  </label>
                  <div>
                    <button type="button" onClick={() => setReplyingTo(null)}>Avbryt</button>
                    <button type="submit" disabled={!replyText.trim()}>Skicka svar</button>
                  </div>
                </form>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="booking-comments-empty">Det finns inga kommentarer för den här bokningen.</p>
      )}
    </section>
  )
}

function Admin() {
  const [workshops, setWorkshops] = useState(initialWorkshops)
  const [bookings, setBookings] = useState(initialBookings)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Alla')
  const [expandedId, setExpandedId] = useState(null)
  const [selectedBookingId, setSelectedBookingId] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [notice, setNotice] = useState('')

  const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId)
  const matchingWorkshops = useMemo(() => workshops.filter((workshop) => {
    const matchesQuery = workshop.title.toLowerCase().includes(query.trim().toLowerCase())
    const isFull = workshop.booked >= workshop.capacity
    const isOpen = !isFull && !workshop.bookingClosed
    const matchesFilter = filter === 'Alla'
      || (filter === 'Fullbokade' && isFull)
      || (filter === 'Öppna' && isOpen)
      || (filter === 'Stängda' && workshop.bookingClosed)
    return matchesQuery && matchesFilter
  }), [filter, query, workshops])

  const totalBooked = workshops.reduce((sum, workshop) => sum + workshop.booked, 0)
  const remainingSeats = workshops.reduce((sum, workshop) => sum + Math.max(workshop.capacity - workshop.booked, 0), 0)

  function addWorkshop(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newWorkshop = {
      id: Date.now(),
      title: formData.get('title').trim(),
      date: formData.get('date'),
      time: formData.get('time'),
      booked: 0,
      capacity: Number(formData.get('capacity')),
      attendees: [],
    }
    setWorkshops((current) => [...current, newWorkshop])
    setShowCreateForm(false)
    setNotice(`${newWorkshop.title} har lagts till.`)
  }

  function toggleBooking(workshopId) {
    setWorkshops((current) => current.map((workshop) => (
      workshop.id === workshopId
        ? { ...workshop, bookingClosed: !workshop.bookingClosed }
        : workshop
    )))
  }

  function deleteBookingComment(commentId) {
    if (!window.confirm('Vill du ta bort den här kommentaren?')) return
    setBookings((current) => current.map((booking) => (
      booking.id === selectedBookingId
        ? { ...booking, comments: booking.comments.filter((comment) => comment.id !== commentId) }
        : booking
    )))
  }

  function replyToBookingComment(commentId, reply) {
    setBookings((current) => current.map((booking) => (
      booking.id === selectedBookingId
        ? {
            ...booking,
            comments: booking.comments.map((comment) => (
              comment.id === commentId ? { ...comment, reply } : comment
            )),
          }
        : booking
    )))
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/" aria-label="Foto Workshop, startsida">
          <span className="admin-brand-mark" aria-hidden="true">F</span>
          <span>FOTO<span>WORKSHOP</span></span>
        </Link>
        <p className="sidebar-label">MENY</p>
        <nav className="admin-nav" aria-label="Adminmeny">
          <a className="is-current" href="#overview"><span aria-hidden="true">◫</span> Översikt</a>
          <a href="#workshops"><span aria-hidden="true">▦</span> Workshops</a>
          <a href="#bookings"><span aria-hidden="true">◎</span> Bokningar</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="admin-help">
            <span className="help-mark" aria-hidden="true">?</span>
            <p><strong>Behöver du hjälp?</strong><span>Vi finns här för dig.</span></p>
            <a href="mailto:hej@fotoworkshop.se" aria-label="Kontakta support">↗</a>
          </div>
          <Link className="back-to-site" to="/">← <span>Tillbaka till sajten</span></Link>
          <div className="admin-profile">
            <span className="profile-avatar">AL</span>
            <span><strong>Alex Lind</strong><small>Arrangör</small></span>
            <button type="button" className="profile-menu" aria-label="Profilinställningar">···</button>
          </div>
        </div>
      </aside>

      <main className="admin-main" id="overview">
        <header className="admin-topbar">
          <p>Onsdag, 25 november 2026</p>
          <Link to="/" className="view-site-link">Visa sajten <span aria-hidden="true">↗</span></Link>
        </header>

        <div className="admin-content">
          {selectedBooking ? (
            <BookingComments
              booking={selectedBooking}
              onBack={() => setSelectedBookingId(null)}
              onDeleteComment={deleteBookingComment}
              onReply={replyToBookingComment}
            />
          ) : (
            <>
          <div className="admin-page-heading">
            <div>
              <p className="admin-overline">DIN VERKSAMHET</p>
              <h1>Hej, Alex <span aria-hidden="true">✳</span></h1>
              <p className="admin-subtitle">Här är läget för dina fotoworkshops.</p>
            </div>
            <button className="admin-create-button" type="button" onClick={() => setShowCreateForm(true)}>
              <span aria-hidden="true">＋</span> Skapa workshop
            </button>
          </div>

          {notice && (
            <p className="admin-notice" role="status">
              {notice}
              <button type="button" onClick={() => setNotice('')} aria-label="Stäng meddelande">×</button>
            </p>
          )}

          <section className="stats-grid" aria-label="Sammanfattning">
            <article className="stat-card">
              <div className="stat-card-top"><span>Kommande workshops</span><span className="stat-icon stat-icon--purple" aria-hidden="true">▦</span></div>
              <p className="stat-value">{workshops.length}<span> tillfällen</span></p>
              <p className="stat-note"><span className="status-dot" /> Nästa den 12 december</p>
            </article>
            <article className="stat-card">
              <div className="stat-card-top"><span>Bokade platser</span><span className="stat-icon stat-icon--blue" aria-hidden="true">◎</span></div>
              <p className="stat-value">{totalBooked}<span> deltagare</span></p>
              <p className="stat-note stat-note--positive">↑ 3 nya bokningar senaste veckan</p>
            </article>
            <article className="stat-card stat-card--accent">
              <div className="stat-card-top"><span>Lediga platser</span><span className="stat-icon" aria-hidden="true">↗</span></div>
              <p className="stat-value">{remainingSeats}<span> platser kvar</span></p>
              <p className="stat-note">Fördela uppmärksamheten — grupperna är små.</p>
            </article>
          </section>

          <section className="admin-section" id="workshops" aria-labelledby="admin-workshops-title">
            <div className="admin-section-heading">
              <div>
                <p className="admin-overline">PLANERING</p>
                <h2 id="admin-workshops-title">Dina workshops <span>{workshops.length}</span></h2>
              </div>
              <label className="workshop-search">
                <span aria-hidden="true">⌕</span>
                <span className="visually-hidden">Sök workshops</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sök workshop..." />
              </label>
            </div>
            <div className="filter-tabs" role="group" aria-label="Filtrera workshops">
              {['Alla', 'Öppna', 'Fullbokade', 'Stängda'].map((option) => (
                <button
                  type="button"
                  key={option}
                  className={filter === option ? 'is-selected' : ''}
                  aria-pressed={filter === option}
                  onClick={() => setFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            {matchingWorkshops.length > 0 ? (
              <div className="workshop-list">
                {matchingWorkshops.map((workshop) => {
                  const isFull = workshop.booked >= workshop.capacity
                  const isClosed = workshop.bookingClosed
                  const isExpanded = expandedId === workshop.id
                  return (
                    <article className="admin-workshop" key={workshop.id}>
                      <div className="workshop-date-tile">
                        <span>{new Date(`${workshop.date}T12:00:00`).toLocaleDateString('sv-SE', { month: 'short' }).replace('.', '')}</span>
                        <strong>{new Date(`${workshop.date}T12:00:00`).getDate()}</strong>
                      </div>
                      <div className="admin-workshop-info">
                        <h3>{workshop.title}</h3>
                        <p>{formatDate(workshop.date)} <span aria-hidden="true">·</span> {workshop.time}</p>
                      </div>
                      <div className="workshop-capacity">
                        <div className="capacity-label"><span>Platser</span><strong>{workshop.booked}<span> / {workshop.capacity}</span></strong></div>
                        <div className="capacity-track" role="progressbar" aria-label={`Bokade platser för ${workshop.title}`} aria-valuenow={workshop.booked} aria-valuemin="0" aria-valuemax={workshop.capacity}>
                          <span style={{ width: `${Math.min(workshop.booked / workshop.capacity * 100, 100)}%` }} />
                        </div>
                      </div>
                      <span className={`booking-status${isClosed ? ' booking-status--closed' : isFull ? ' booking-status--full' : ''}`}>
                        <span aria-hidden="true">●</span> {isClosed ? 'Stängd' : isFull ? 'Fullbokad' : 'Öppen'}
                      </span>
                      <button
                        type="button"
                        className="workshop-more"
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? 'Dölj' : 'Visa'} deltagare för ${workshop.title}`}
                        onClick={() => setExpandedId(isExpanded ? null : workshop.id)}
                      >
                        {isExpanded ? 'Dölj' : 'Visa'} <span aria-hidden="true">{isExpanded ? '↑' : '→'}</span>
                      </button>
                      {isExpanded && (
                        <div className="workshop-details">
                          <div>
                            <h4>Deltagare <span>{workshop.attendees.length}</span></h4>
                            {workshop.attendees.length > 0
                              ? <p>{workshop.attendees.join(' · ')}</p>
                              : <p>Inga bokningar ännu — dela workshopen med dina deltagare.</p>}
                          </div>
                          <button type="button" onClick={() => toggleBooking(workshop.id)}>
                            {isClosed ? 'Öppna bokningen' : 'Stäng bokningen'}
                          </button>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="empty-workshops">
                <span aria-hidden="true">⌕</span>
                <p>Inga workshops matchar din sökning.</p>
                <button type="button" onClick={() => { setQuery(''); setFilter('Alla') }}>Rensa filter</button>
              </div>
            )}
          </section>

          <section className="admin-section bookings-section" id="bookings" aria-labelledby="bookings-title">
            <div className="admin-section-heading">
              <div>
                <p className="admin-overline">SENASTE AKTIVITET</p>
                <h2 id="bookings-title">Nya bokningar</h2>
              </div>
              <a className="all-bookings-link" href="#workshops">Visa alla bokningar <span aria-hidden="true">→</span></a>
            </div>
            <div className="recent-bookings">
              {bookings.map((booking) => (
                <button
                  className="recent-booking"
                  key={booking.id}
                  type="button"
                  aria-label={`Öppna bokning för ${booking.name}, ${booking.comments.length} kommentarer`}
                  onClick={() => setSelectedBookingId(booking.id)}
                >
                  <span className="booking-avatar">{booking.initials}</span>
                  <span className="booking-person">
                    <strong>{booking.name}</strong>
                    <small>{booking.workshop} · {booking.comments.length} {booking.comments.length === 1 ? 'kommentar' : 'kommentarer'}</small>
                  </span>
                  <time>{booking.date}</time>
                  <span className="booking-confirmed"><span aria-hidden="true">●</span> Bekräftad</span>
                </button>
              ))}
            </div>
          </section>
          <footer className="admin-footer">Foto Workshop <span>·</span> Arrangörsvy <span>·</span> Byggd för kreativitet</footer>
            </>
          )}
        </div>
      </main>

      {showCreateForm && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCreateForm(false) }}>
          <section className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
            <div className="modal-heading">
              <div><p className="admin-overline">LÄGG TILL</p><h2 id="create-title">Ny workshop</h2></div>
              <button type="button" aria-label="Stäng" onClick={() => setShowCreateForm(false)}>×</button>
            </div>
            <form onSubmit={addWorkshop}>
              <label>Workshopens namn<input name="title" placeholder="Till exempel: Lär dig fota i motljus" required /></label>
              <div className="modal-field-row">
                <label>Datum<input name="date" type="date" min="2026-11-25" required /></label>
                <label>Tid<input name="time" type="text" placeholder="10:00–12:00" required /></label>
              </div>
              <label>Max antal deltagare<input name="capacity" type="number" min="1" max="30" defaultValue="6" required /></label>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowCreateForm(false)}>Avbryt</button>
                <button type="submit" className="admin-create-button">Skapa workshop</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
