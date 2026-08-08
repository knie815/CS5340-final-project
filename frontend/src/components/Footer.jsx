import { useApp } from '../AppContext'

export default function Footer() {
  const { go } = useApp()
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>BorrowIt from the Library of Things · CS5340 · Katherine Nie</span>
        <span className="footer-links">
          <button className="footer-link" onClick={() => go('help')}>
            Help &amp; FAQ
          </button>
          <span>Illustrative data. Availability and libraries are simulated for demo purposes.</span>
        </span>
      </div>
    </footer>
  )
}
