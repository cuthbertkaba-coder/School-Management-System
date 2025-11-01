import React, { useState } from 'react';
import { SCHOOL_LOGO_URL, SCHOOL_NAME, SCHOOL_MOTTO } from '../constants';
import { Role, User, Student, LoggedInUser } from '../types';
import { hashPassword } from '../utils/auth';
import { ForgotPasswordModal } from './Settings';

interface LoginProps {
  onLogin: (user: LoggedInUser) => void;
  users: { [username: string]: User & { passwordHash: string } };
  students: Student[];
}

export const Login: React.FC<LoginProps> = ({ onLogin, users, students }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Please enter a username and password.');
      setIsLoading(false);
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));

    const enteredPasswordHash = await hashPassword(password);
    
    // Check for staff user first
    const userAccount = users[username.toLowerCase()];
    if (userAccount) {
      if (enteredPasswordHash === userAccount.passwordHash) {
        const { passwordHash, ...userToLogin } = userAccount;
        onLogin(userToLogin);
        return;
      }
    }

    // If not a staff user, check for parent (student ID) login
    const studentAccount = students.find(s => s.id.toLowerCase() === username.toLowerCase());
    if (studentAccount && studentAccount.parentPasswordHash) {
      if (enteredPasswordHash === studentAccount.parentPasswordHash) {
          onLogin({ ...studentAccount, role: Role.Parent });
          return;
      }
    }

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
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            autoCapitalize="none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {error && <p className="text-red-500 text-sm text-left pt-1">{error}</p>}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-sky-600 text-white py-2.5 rounded-lg hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-wait"
            >
              {isLoading ? 'Signing In...' : 'Login'}
            </button>
          </div>
        </form>
         <div className="text-center mt-4">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setForgotPasswordOpen(true); }}
            className="text-sm text-sky-600 hover:underline"
          >
            Forgot Password?
          </a>
        </div>
      </div>
      {isForgotPasswordOpen && <ForgotPasswordModal onClose={() => setForgotPasswordOpen(false)} />}
    </div>
  );
};
