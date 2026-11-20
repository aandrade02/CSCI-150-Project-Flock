import { useState } from 'react';                                    // NEW
import Modal from './Modal';                                         // same
import { loginUser, signupUser } from '../services/accountService';  // NEW (the file from step 9)

const MIN_PASSWORD_LENGTH = 8;                                       // NEW

export default function AccountModal({ currentUser, onLogin, onLogout, onClose }) { // same props as before

  // NEW: the modal now keeps its own state
  const [mode, setMode] = useState('login');   // 'login' or 'signup'
  const [error, setError] = useState('');      // message shown under the form
  const [busy, setBusy] = useState(false);     // disables the button while waiting on the backend
  const isSignup = mode === 'signup';

  // NEW: switch between Log In and Sign Up
  const switchMode = () => {
    setMode(isSignup ? 'login' : 'signup');
    setError('');
  };

  // NEW: replaces onSubmit={onLogin}. Reads the form (this used to happen in App.jsx),
  //      sends it to the backend, then shows an error or logs the user in.
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email')?.trim();
    const password = formData.get('password') || '';
    const role = formData.get('role') || 'student';

    if (isSignup && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setBusy(true);
    setError('');
    try {
      const account = isSignup
        ? await signupUser(email, password, role)
        : await loginUser(email, password);
      onLogin(account);            // calls handleUserLogin in App.jsx (step 11)
    } catch (err) {
      setError(err.message);       // e.g. "Invalid email or password."
    } finally {
      setBusy(false);
    }
  };

  // EDIT: before, "signed in as" and the Log Out button sat inside the login form.
  //       Now a signed-in user sees only this short view.
  if (currentUser) {
    return (
      <Modal title="Account" onClose={onClose}>
        <div className="form-stack">
          <p className="muted" style={{ color: '#4ade80' }}>
            Currently signed in as <strong>{currentUser.username}</strong>
            {currentUser.role && <> ({currentUser.role})</>}
          </p>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onLogout}>
              Log Out
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    // EDIT: title changes with the mode (was always "User Login")
    <Modal title={isSignup ? 'Create Account' : 'User Login'} onClose={onClose}>

      {/* EDIT: onSubmit={onLogin} -> onSubmit={handleSubmit}; NEW: key={mode} clears the fields when switching */}
      <form key={mode} onSubmit={handleSubmit} className="form-stack">

        {/* REMOVED: <p>Full account features will be implemented later.</p> */}
        {/* REMOVED: "Currently signed in as" (moved into the if (currentUser) block above) */}

        {/* EDIT: label "Username or Email" -> "Email"; name="username" -> "email"; type="text" -> "email";
                  removed defaultValue */}
        <label>
          Email
          <input name="email" type="email" required placeholder="you@mail.fresnostate.edu" />
        </label>

        {/* EDIT: added minLength and a sign-up placeholder */}
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={isSignup ? MIN_PASSWORD_LENGTH : undefined}
            placeholder={isSignup ? `At least ${MIN_PASSWORD_LENGTH} characters` : '••••••••'}
          />
        </label>

        {/* NEW: role picker, only shown when signing up */}
        {isSignup && (
          <label>
            Role
            <select name="role" defaultValue="student">
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
          </label>
        )}

        {/* NEW: error message from the backend or the length check */}
        {error && (
          <p className="muted" role="alert" style={{ color: '#f87171' }}>
            {error}
          </p>
        )}

        <div className="form-actions">
          {/* NEW: switch button (the Log Out button that used to be here moved to the signed-in view) */}
          <button type="button" className="btn btn-outline" onClick={switchMode}>
            {isSignup ? 'I already have an account' : 'Create an account'}
          </button>

          {/* EDIT: text changes with the mode; NEW: disabled while waiting */}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </form>
    </Modal>
  );
}