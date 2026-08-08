import { useState } from 'react'
import { useApp } from '../AppContext'

export default function SignIn() {
  const { login, register, libraries, go } = useApp()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ card_number: '', password: '', name: '', lib: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const libEntries = Object.entries(libraries)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await login(form.card_number.trim(), form.password)
      } else {
        await register({
          name: form.name.trim(),
          lib: form.lib,
          card_number: form.card_number.trim(),
          password: form.password,
        })
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
      setBusy(false)
    }
  }

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
          <p className="lede">Sign in with your library card to reserve items</p>
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
        <div style={{ fontSize: 13, opacity: 0.75 }}>Any partner library card works</div>
      </div>

      <div className="signin-form">
        <form className="signin-card" onSubmit={submit}>
          <h1 style={{ fontSize: 28 }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="sub">
            {mode === 'login'
              ? 'Sign in with your library card'
              : 'You need a card from any partner library. Enter its number to register.'}
          </p>

          {mode === 'register' && (
            <>
              <input className="field" placeholder="Full name" value={form.name} onChange={set('name')} />
              <select className="field" value={form.lib} onChange={set('lib')} aria-label="Library">
                <option value="">Which library issued your card?</option>
                {libEntries.map(([key, l]) => (
                  <option key={key} value={key}>
                    {l.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <input
            className="field"
            placeholder="Library card number"
            value={form.card_number}
            onChange={set('card_number')}
            autoComplete="username"
          />
          <input
            className="field"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={set('password')}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {error && <div className="auth-error">{error}</div>}

          <button className="btn" style={{ width: '100%' }} type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          {mode === 'login' && (
            <div className="no-card-note">Demo card — number 1001, password borrow123</div>
          )}

          <button
            type="button"
            className="link"
            style={{ display: 'block', margin: '18px auto 0' }}
            onClick={() => {
              setError('')
              setMode(mode === 'login' ? 'register' : 'login')
            }}
          >
            {mode === 'login' ? 'New here? Register a library card' : 'Already registered? Sign in'}
          </button>
          <button
            type="button"
            className="link"
            style={{ display: 'block', margin: '10px auto 0' }}
            onClick={() => go('home')}
          >
            ← Keep browsing without an account
          </button>
        </form>
      </div>
    </div>
  )
}
