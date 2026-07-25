import { useApp } from '../AppContext'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export default function SignIn() {
  const { signIn, go } = useApp()
  return (
    <div className="screen active" id="signin">
      <div className="signin-art">
        <div className="art-glow" />
        <div>
          <div className="brand" style={{ gap: 12 }} onClick={() => go('home')}>
            <div
              className="brand-mark"
              style={{ width: 40, height: 40, fontSize: 22, background: 'rgba(255,255,255,.14)' }}
            >
              B
            </div>
            <div className="brand-name" style={{ color: 'inherit', fontSize: 22 }}>
              BorrowIt
            </div>
          </div>
        </div>
        <div>
          <h1>Borrowing made simple</h1>
          <p className="lede">Search and reserve from any Library of Things near you</p>
          <div className="art-tiles">
            <div className="art-tile">
              <div className="lbl">Tools & DIY</div>
            </div>
            <div className="art-tile">
              <div className="lbl">Craft & home</div>
            </div>
            <div className="art-tile">
              <div className="lbl">Electronics</div>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 13, opacity: 0.75 }}>XX+ partner libraries</div>
      </div>
      <div className="signin-form">
        <div className="signin-card">
          <h1 style={{ fontSize: 28 }}>Welcome</h1>
          <p className="sub">Sign in to reserve items. Searching is always free — no account needed.</p>
          <button className="google-btn" onClick={() => signIn('Signed in with Google')}>
            <span className="google-icon">
              <GoogleIcon />
            </span>
            Continue with Google
          </button>
          <div className="or">or</div>
          <input className="field" type="email" placeholder="Email address" />
          <input className="field" type="password" placeholder="Password" />
          <button className="btn" style={{ width: '100%' }} onClick={() => signIn()}>
            Sign in
          </button>
          <div className="no-card-note">No library card needed</div>
          <button className="link" style={{ display: 'block', margin: '18px auto 0' }} onClick={() => go('home')}>
            ← Keep browsing without an account
          </button>
        </div>
      </div>
    </div>
  )
}
