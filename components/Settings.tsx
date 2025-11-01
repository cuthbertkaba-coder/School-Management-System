import React, { useState } from 'react';
import { User, Student, Role, LoggedInUser } from '../types';
import { hashPassword } from '../utils/auth';

interface ChangePasswordModalProps {
  onClose: () => void;
  onSave: (userId: string, newPasswordHash: string) => void;
  user: LoggedInUser;
  users: { [key: string]: User & { passwordHash: string } };
  students: Student[];
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, onSave, user, users, students }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const animationStyle = { animation: 'fade-in-up 0.3s ease-out forwards' };
  const keyframes = `
      @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
      }
  `;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      setIsLoading(false);
      return;
    }

    const currentPasswordHash = await hashPassword(currentPassword);
    let isPasswordCorrect = false;

    if (user.role === Role.Parent) {
        const studentAccount = students.find(s => s.id === user.id);
        if(studentAccount && studentAccount.parentPasswordHash === currentPasswordHash) {
            isPasswordCorrect = true;
        }
    } else {
        const userAccount = Object.values(users).find(u => u.id === user.id);
        if (userAccount && userAccount.passwordHash === currentPasswordHash) {
            isPasswordCorrect = true;
        }
    }

    if (!isPasswordCorrect) {
        setError("Incorrect current password.");
        setIsLoading(false);
        return;
    }

    const newPasswordHash = await hashPassword(newPassword);
    onSave(user.id, newPasswordHash);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <style>{keyframes}</style>
        <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md" style={animationStyle}>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Change Password</h2>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Current Password</label>
                    <input 
                        type="password" 
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">New Password</label>
                    <input 
                        type="password" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                    />
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-400"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export const ForgotPasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };
  
  const animationStyle = { animation: 'fade-in-up 0.3s ease-out forwards' };
  const keyframes = `
      @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
      }
  `;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <style>{keyframes}</style>
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md" style={animationStyle}>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Reset Password</h2>
        {submitted ? (
          <div>
            <p className="text-slate-700">If an account with that email exists, a password reset link has been sent. Please check your inbox.</p>
            <div className="flex justify-end mt-6">
              <button onClick={onClose} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">Close</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-slate-600">Enter your account's email address and we will send you a link to reset your password.</p>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
              />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">Send Reset Link</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
