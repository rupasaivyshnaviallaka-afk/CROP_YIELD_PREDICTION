'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isSignUp = mode === 'sign-up'

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const requestedCallback = new URLSearchParams(window.location.search).get('callbackURL')
      const callbackURL = requestedCallback?.startsWith('/') && !requestedCallback.startsWith('//') ? requestedCallback : '/dashboard'
      const result = isSignUp
        ? await authClient.signUp.email({ name, email, password, callbackURL })
        : await authClient.signIn.email({ email, password, callbackURL })
      if (result.error) throw new Error('Unable to authenticate with those details.')
      router.push(callbackURL)
      router.refresh()
    } catch {
      setError('We could not complete sign in. Check your details and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/dashboard" className="auth-brand"><span className="brand-mark"><Leaf size={20}/></span><strong>CropYield <i>AI</i></strong></Link>
        <p className="auth-eyebrow">RESEARCH WORKSPACE</p>
        <h1>{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-copy">{isSignUp ? 'Save crop predictions and revisit your research history.' : 'Sign in to continue to your crop research workspace.'}</p>
        <form className="auth-form" onSubmit={submit}>
          {isSignUp && <label className="form-field"><span>Full name</span><input autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} maxLength={120}/></label>}
          <label className="form-field"><span>Email address</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254}/></label>
          <label className="form-field"><span>Password</span><input type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} maxLength={128}/></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}</button>
        </form>
        <p className="auth-switch">{isSignUp ? 'Already have an account?' : 'New to CropYield AI?'} <Link href={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? 'Sign in' : 'Create an account'}</Link></p>
      </section>
    </main>
  )
}
