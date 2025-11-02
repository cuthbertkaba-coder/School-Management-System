import React, { useState } from 'react';
import { User, Student, Role, LoggedInUser, Settings, PasswordChangeRequest } from '../types';
import { CLASSES } from '../constants';

const FEE_CATEGORIES = ['Tuition', 'Uniform', 'Stationery & Toiletries', 'Snack and Lunch', 'Afterschool Care'];

const ConfirmationModal: React.FC<{
    title: string;
    message: React.ReactNode;
    confirmText: string;
    confirmClass: string;
    onConfirm: () => void;
    onClose: () => void;
}> = ({ title, message, onConfirm, onClose, confirmText, confirmClass }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm animate-fade-in-up">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
            <div className="text-slate-600 mb-6">{message}</div>
            <div className="flex justify-end space-x-4">
                <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
                <button onClick={onConfirm} className={`px-4 py-2 text-white rounded-lg transition-colors ${confirmClass}`}>{confirmText}</button>
            </div>
        </div>
    </div>
);


const PasswordRequests: React.FC<{
    requests: PasswordChangeRequest[];
    onProcessRequest: (requestId: string, approved: boolean) => void;
}> = ({ requests, onProcessRequest }) => {
    if (requests.length === 0) {
        return <p className="text-slate-500 italic">No pending password change requests.</p>
    }
    return (
        <div className="space-y-2">
            {requests.map(req => (
                <div key={req.id} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center border">
                    <div>
                        <p className="font-semibold text-slate-800">{req.userName}</p>
                        <p className="text-sm text-slate-600">{req.userRole}</p>
                    </div>
                    <div className="space-x-2">
                        <button onClick={() => onProcessRequest(req.id, true)} className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600">Approve</button>
                        <button onClick={() => onProcessRequest(req.id, false)} className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600">Reject</button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export const SchoolSettings: React.FC<{ 
    settings: Settings, 
    onUpdateSettings: (settings: Settings) => void,
    requests: PasswordChangeRequest[],
    onProcessRequest: (requestId: string, approved: boolean) => void;
}> = ({ settings, onUpdateSettings, requests, onProcessRequest }) => {
    const [academicYear, setAcademicYear] = useState(settings.academicYear);
    const [currentTerm, setCurrentTerm] = useState(settings.currentTerm);
    const [feeStructure, setFeeStructure] = useState(settings.feeStructure);
    const [schoolSubjects, setSchoolSubjects] = useState(settings.schoolSubjects);
    const [classSubjects, setClassSubjects] = useState(settings.classSubjects);
    const [newSubject, setNewSubject] = useState('');


    const handleFeeChange = (className: string, category: string, value: string) => {
        const amount = parseInt(value, 10) || 0;
        setFeeStructure(prev => ({
            ...prev,
            [className]: {
                ...prev[className],
                [category]: amount
            }
        }));
    };

    const handleAddSubject = () => {
        if (newSubject.trim() && !schoolSubjects.includes(newSubject.trim())) {
            setSchoolSubjects(prev => [...prev, newSubject.trim()].sort());
            setNewSubject('');
        }
    };
    
    const handleRemoveSubject = (subjectToRemove: string) => {
        setSchoolSubjects(prev => prev.filter(s => s !== subjectToRemove));
        // Also remove from all classes
        const updatedClassSubjects = { ...classSubjects };
        for (const className in updatedClassSubjects) {
            updatedClassSubjects[className] = updatedClassSubjects[className].filter(s => s !== subjectToRemove);
        }
        setClassSubjects(updatedClassSubjects);
    };

    const handleClassSubjectChange = (className: string, subject: string, isChecked: boolean) => {
        setClassSubjects(prev => {
            const currentSubjects = prev[className] || [];
            const newSubjects = isChecked 
                ? [...currentSubjects, subject]
                : currentSubjects.filter(s => s !== subject);
            return { ...prev, [className]: newSubjects.sort() };
        });
    };
    
    const handleSaveChanges = () => {
        onUpdateSettings({ academicYear, currentTerm, feeStructure, schoolSubjects, classSubjects });
        alert("Settings saved successfully!");
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-slate-800">School Settings</h1>
                 <button onClick={handleSaveChanges} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Save All Changes</button>
            </div>
           
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-slate-700 mb-4">Password Change Requests</h2>
                    <PasswordRequests requests={requests} onProcessRequest={onProcessRequest} />
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-slate-700 mb-4">Academic Calendar</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Academic Year</label>
                            <input 
                                type="text" 
                                value={academicYear}
                                onChange={e => setAcademicYear(e.target.value)}
                                placeholder="e.g. 2024/2025 Academic Year"
                                className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Current Term</label>
                             <select value={currentTerm} onChange={e => setCurrentTerm(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>First Term</option>
                                <option>Second Term</option>
                                <option>Third Term</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                     <h2 className="text-xl font-bold text-slate-700 mb-4">Subject Management</h2>
                    <details className="border rounded-lg p-2 group mb-4">
                        <summary className="font-medium text-slate-800 cursor-pointer p-2 hover:bg-slate-50 rounded">Master Subject List</summary>
                        <div className="p-4 border-t mt-2">
                            <div className="flex gap-2 mb-4">
                                <input 
                                    type="text" 
                                    value={newSubject}
                                    onChange={e => setNewSubject(e.target.value)}
                                    placeholder="Enter new subject name"
                                    className="flex-grow p-2 border border-slate-300 rounded-lg"
                                />
                                <button onClick={handleAddSubject} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {schoolSubjects.map(subject => (
                                    <div key={subject} className="flex items-center gap-2 bg-yellow-200 text-yellow-900 rounded-full px-3 py-1 text-sm font-medium">
                                        <span>{subject}</span>
                                        <button onClick={() => handleRemoveSubject(subject)} className="text-yellow-700 hover:text-red-600 font-bold">&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </details>
                     <details className="border rounded-lg p-2 group">
                        <summary className="font-medium text-slate-800 cursor-pointer p-2 hover:bg-slate-50 rounded">Assign Subjects to Classes</summary>
                        <div className="p-4 border-t mt-2 space-y-3">
                            {CLASSES.map(className => (
                                <div key={className}>
                                    <p className="font-semibold text-slate-700">{className}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-1">
                                        {schoolSubjects.map(subject => (
                                            <label key={subject} className="flex items-center text-sm p-1 rounded hover:bg-slate-50 text-slate-800">
                                                <input 
                                                    type="checkbox"
                                                    checked={classSubjects[className]?.includes(subject) || false}
                                                    onChange={(e) => handleClassSubjectChange(className, subject, e.target.checked)}
                                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"
                                                />
                                                {subject}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </details>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                     <h2 className="text-xl font-bold text-slate-700 mb-4">Class Fee Structure</h2>
                     <div className="space-y-4">
                        {CLASSES.map(className => (
                             <details key={className} className="border rounded-lg p-2 group">
                                <summary className="font-medium text-slate-800 cursor-pointer p-2 hover:bg-slate-50 rounded">
                                    {className}
                                </summary>
                                <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 border-t mt-2">
                                    {FEE_CATEGORIES.map(category => (
                                        <div key={category}>
                                            <label className="block text-sm font-medium text-slate-600">{category}</label>
                                             <input
                                                type="number"
                                                value={feeStructure[className]?.[category] || ''}
                                                onChange={e => handleFeeChange(className, category, e.target.value)}
                                                placeholder="0.00"
                                                className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </details>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};

interface ChangePasswordModalProps {
  onClose: () => void;
  onSave: (userId: string, newPassword: string) => void;
  onSaveRequest: (request: Omit<PasswordChangeRequest, 'id' | 'status'>) => void;
  user: LoggedInUser;
  users: (User & { password?: string })[];
  students: Student[];
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, onSave, onSaveRequest, user, users, students }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user.role === Role.Admin || user.role === Role.Headteacher;
  
  const animationStyle = { animation: 'fade-in-up 0.3s ease-out forwards' };
  const keyframes = `
      @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
      }
  `;

  const handleSave = (e: React.FormEvent) => {
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

    let isPasswordCorrect = false;

    if (user.role === Role.Parent) {
        const studentAccount = students.find(s => s.id === user.id);
        if(studentAccount && studentAccount.parentPassword === currentPassword) {
            isPasswordCorrect = true;
        }
    } else {
        const userAccount = users.find(u => u.id === user.id);
        if (userAccount && userAccount.password === currentPassword) {
            isPasswordCorrect = true;
        }
    }

    if (!isPasswordCorrect) {
        setError("Incorrect current password.");
        setIsLoading(false);
        return;
    }

    if(isAdmin) {
        onSave(user.id, newPassword);
    } else {
        const request: Omit<PasswordChangeRequest, 'id' | 'status'> = {
            userId: user.id,
            userName: user.role === Role.Parent ? user.guardianName : user.name,
            userRole: user.role,
            newPassword,
        };
        onSaveRequest(request);
    }
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
                        className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">New Password</label>
                    <input 
                        type="password" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400"
                    >
                      {isLoading ? 'Saving...' : (isAdmin ? 'Save Changes' : 'Request Change')}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export const AdminManageAccountModal: React.FC<{
  userToUpdate: { id: string; name: string; username: string };
  isParent: boolean;
  onClose: () => void;
  onSave: (userId: string, newUsername: string, newPassword?: string) => void;
}> = ({ userToUpdate, isParent, onClose, onSave }) => {
  const [username, setUsername] = useState(userToUpdate.username);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!username.trim()){
      setError("Username/ID cannot be empty.");
      return;
    }
    
    setIsLoading(true);
    onSave(userToUpdate.id, username, newPassword || undefined);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Manage Account for {userToUpdate.name}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">{isParent ? 'Student ID (Parent Login)' : 'Username'}</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-lg" />
          </div>
          <p className="text-xs text-slate-500">Leave password fields blank to keep the current password.</p>
          <div>
            <label className="block text-sm font-medium text-slate-700">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-lg" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-slate-400">
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
              <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Close</button>
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
                className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Send Reset Link</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};