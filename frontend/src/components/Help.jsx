import { useApp } from '../AppContext'

const STEPS = [
  {
    n: 1,
    title: 'Search the catalog',
    body: 'Browse or search across all partner libraries. No account to look around.',
  },
  {
    n: 2,
    title: 'See item details',
    body: 'Open an item to see item’s description, photos, max loan length, availability by library, and any deposit needed. Any deposit is refunded when you return the item on time.',
  },
  {
    n: 3,
    title: 'Sign in with your library card',
    body: 'Reserving requires a card from any partner library. Sign in (or register your card) when you’re ready.',
  },
  {
    n: 4,
    title: 'Reserve item',
    body: 'Choose a pickup library and a date range (or a same-day loan) up to the item’s maximum loan length.',
  },
  {
    n: 5,
    title: 'Show your code at pickup',
    body: 'You get a reservation code. Show it at the library desk to collect your item, and return it by the return-by date.',
  },
]

const FAQS = [
  {
    q: 'Do I need an account to use BorrowIt?',
    a: 'No account need for searching and browsing. Account required to place a reservation.',
  },
  {
    q: 'What do I use to sign in?',
    a: 'Your library card number and a password. If you have a card from any partner library, choose “Register a library card” on the sign-in screen to set up your login.',
  },
  {
    q: 'Can I reserve something that’s checked out right now?',
    a: 'Yes. Availability is date-based: if every copy is out today but one comes back next week, you can reserve it for a date range starting then. Fully-booked days are greyed out on the calendar.',
  },
  {
    q: 'How long can I borrow an item?',
    a: 'Each item lists its maximum loan length on its page (for example, “Max 7-day loan”). You can also choose a same-day return if you only need it briefly.',
  },
  {
    q: 'Is there a deposit or fee?',
    a: 'Some items require a refundable deposit, shown on the item’s page (for example, “$20 deposit”). Many items have no deposit at all.',
  },
  {
    q: 'How do I pick up and return my item?',
    a: 'Bring your reservation code to the pickup library you selected. Return the item to that same library on or before the return-by date.',
  },
  {
    q: 'Can I change or cancel a reservation?',
    a: 'You can cancel any reservation from My Reservations, which immediately frees those dates for other borrowers. To change dates, cancel and book again.',
  },
  {
    q: 'Where can I see my reservations?',
    a: 'Once signed in, open “Reservations” in the top bar. They’re grouped into currently borrowed, upcoming, and past & cancelled.',
  },
]

export default function Help() {
  const { go, authed } = useApp()

  return (
    <div className="screen active" id="help">
      <div className="wrap resv">
        <h1>Help &amp; support</h1>
        <p className="sub">Everything you need to borrow with confidence.</p>

        <div className="section-head" style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 20 }}>How it works</h2>
        </div>
        <ol className="help-steps">
          {STEPS.map((s) => (
            <li key={s.n} className="help-step">
              <span className="help-step-n">{s.n}</span>
              <div>
                <div className="help-step-title">{s.title}</div>
                <div className="help-step-body">{s.body}</div>
              </div>
            </li>
          ))}
        </ol>

        <div className="section-head" style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20 }}>Frequently asked questions</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <div className="section-head" style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20 }}>Still need help?</h2>
        </div>
        <div className="panel help-contact">
          <p>
            Reach the BorrowIt support team at{' '}
            <a href="mailto:support@borrowit.example">support@borrowit.example</a> or call your local
            partner library during opening hours. We’re happy to help with cards, reservations, and returns.
          </p>
          <div className="help-cta">
            <button className="btn" onClick={() => go('home')}>
              Start browsing
            </button>
            {authed && (
              <button className="btn btn-ghost" onClick={() => go('reservations')}>
                My reservations
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
