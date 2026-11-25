'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction, registerAction } from '@/lib/actions';

const INITIAL_STATE = { error: '' };

export default function AuthForm({ mode }) {
  const isLogin = mode === 'login';
  const action = isLogin ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="mt-8 grid gap-5">
      {!isLogin && (
        <>
          <div>
            <label className="label">Full name</label>
            <input
              name="name"
              required
              className="input"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="label">I want to join as</label>
            <select name="role" className="input">
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
        </>
      )}

      <div>
        <label className="label">Email address</label>
        <input
          name="email"
          type="email"
          required
          className="input"
          placeholder="name@example.com"
        />
      </div>

      <div>
        <label className="label">Password</label>
        <input
          name="password"
          type="password"
          minLength={8}
          required
          className="input"
          placeholder="Minimum 8 characters"
        />
      </div>

      {state?.error && (
        <p className="rounded-xl bg-red-500/10 p-3 text-xs text-red-500">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full disabled:opacity-50"
      >
        {pending ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
      </button>

      <p className="muted text-center text-xs">
        {isLogin ? (
          <>
            New to NEXA?{' '}
            <Link className="font-semibold underline" href="/register">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link className="font-semibold underline" href="/login">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}