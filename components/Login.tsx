import React, { useState } from 'react';
import { SCHOOL_LOGO_URL, SCHOOL_NAME, SCHOOL_MOTTO } from '../constants';
import { Role, User, Student, LoggedInUser } from '../types';
import { ForgotPasswordModal } from './Settings';

interface LoginProps {
  onLogin: (user: LoggedInUser) => void;
  students: Student[];
  users: (User & { password?: string })[];
}

export const Login: React.FC<LoginProps> = ({ onLogin, students, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError('Please enter a username and password.');
      setIsLoading(false);
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Attempt to find a staff user first.
    const userAccount = users.find(u => u.username.toLowerCase() === trimmedUsername.toLowerCase());

    if (userAccount) {
      if (trimmedPassword === userAccount.password) {
        // Correct password for staff user
        const { password, ...userToLogin } = userAccount;
        onLogin(userToLogin as User);
        return;
      } else {
        // Incorrect password for staff user. Fail immediately.
        setError('Invalid username or password.');
        setIsLoading(false);
        return;
      }
    }

    // If no staff user was found, now check for a parent (student) login.
    const studentAccount = students.find(s => s.id.toLowerCase() === trimmedUsername.toLowerCase());
    if (studentAccount && studentAccount.parentPassword) {
      if (trimmedPassword === studentAccount.parentPassword) {
          onLogin({ ...studentAccount, role: Role.Parent });
          return;
      }
    }

    // If we reach this point, no user was found with the given credentials.
    setError('Invalid username or password.');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center">
        <img src={SCHOOL_LOGO_URL} alt="School Logo" className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg" />
        <h1 className="text-2xl font-bold text-slate-800">{SCHOOL_NAME}</h1>
        <p className="text-sm text-slate-500 italic mb-6">"{SCHOOL_MOTTO}"</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username / Student ID"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoCapitalize="none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm text-left pt-1">{error}</p>}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-wait"
            >
              {isLoading ? 'Signing In...' : 'Login'}
            </button>
          </div>
        </form>
         <div className="text-center mt-4">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setForgotPasswordOpen(true); }}
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </a>
        </div>
      </div>
      {isForgotPasswordOpen && <ForgotPasswordModal onClose={() => setForgotPasswordOpen(false)} />}
    </div>
  );
};