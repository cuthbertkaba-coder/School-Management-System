import React, { useState, useMemo } from 'react';
import { Notification, User, Page, Role, LoggedInUser } from '../types';

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


export const Notifications: React.FC<{ user: LoggedInUser, notifications: Notification[], onUpdateNotifications: (notifs: Notification[]) => void }> = ({ user, notifications, onUpdateNotifications }) => {
    const [newNotification, setNewNotification] = useState('');
    const [isPriority, setIsPriority] = useState(false);
    const [view, setView] = useState<'all' | 'priority'>('all');
    const [notifToDelete, setNotifToDelete] = useState<Notification | null>(null);
    
    const canPost = useMemo(() => user.role !== Role.SMCChair && user.role !== Role.Parent, [user.role]);

    const addNotification = () => {
        if(newNotification.trim() === '') return;
        const newEntry: Notification = {
            id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
            user: user.name, // Use display name instead of username
            date: new Date().toISOString().split('T')[0],
            content: newNotification,
            priority: isPriority,
        };
        onUpdateNotifications([newEntry, ...notifications]);
        setNewNotification('');
        setIsPriority(false);
    };

    const handleDelete = () => {
        if (notifToDelete) {
            onUpdateNotifications(notifications.filter(n => n.id !== notifToDelete.id));
            setNotifToDelete(null);
        }
    };

    const filteredNotifications = useMemo(() => {
        if (view === 'priority') {
            return notifications.filter(n => n.priority);
        }
        return notifications;
    }, [notifications, view]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Notifications</h1>
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="border-b mb-4">
                    <nav className="flex space-x-4">
                        <button onClick={() => setView('all')} className={`py-2 px-1 font-medium ${view === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500'}`}>All Announcements</button>
                        <button onClick={() => setView('priority')} className={`py-2 px-1 font-medium ${view === 'priority' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-slate-500'}`}>Priority</button>
                    </nav>
                </div>

                {canPost && (
                    <div className="mb-4 p-4 border rounded-lg bg-slate-50">
                        <textarea 
                            value={newNotification}
                            onChange={(e) => setNewNotification(e.target.value)}
                            placeholder="Type your announcement here..."
                            className="w-full p-2 border border-slate-300 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex justify-between items-center mt-2">
                             <label className="flex items-center text-sm text-slate-600">
                                <input type="checkbox" checked={isPriority} onChange={e => setIsPriority(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-yellow-600 focus:ring-yellow-500 mr-2"/>
                                Mark as priority
                            </label>
                            <button onClick={addNotification} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Post Notification</button>
                        </div>
                    </div>
                )}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {filteredNotifications.map(notif => (
                        <div key={notif.id} className={`relative p-4 border rounded-md ${notif.priority ? 'border-yellow-300 bg-yellow-100' : 'border-slate-200 bg-slate-50'}`}>
                           {notif.priority && <span className="font-bold text-yellow-800 text-xs">PRIORITY</span>}
                           <p className="text-slate-800 mt-1">{notif.content}</p>
                           <p className="text-xs text-slate-500 mt-2 text-right">Posted by {notif.user} on {notif.date}</p>
                           {canPost && (
                               <button onClick={() => setNotifToDelete(notif)} className="absolute top-2 right-2 text-slate-400 hover:text-red-600">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                               </button>
                           )}
                        </div>
                    ))}
                    {filteredNotifications.length === 0 && <p className="text-center text-slate-500 p-8">No notifications to display.</p>}
                </div>
            </div>
            {notifToDelete && (
                 <ConfirmationModal
                    title="Delete Notification"
                    message="Are you sure you want to delete this notification? This action cannot be undone."
                    confirmText="Delete"
                    confirmClass="bg-red-600 hover:bg-red-700"
                    onConfirm={handleDelete}
                    onClose={() => setNotifToDelete(null)}
                />
            )}
        </div>
    );
};

export const ComingSoon: React.FC<{ page: Page }> = ({ page }) => (
    <div className="p-4 sm:p-6 lg:p-8 text-center">
        <div className="bg-white p-12 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">{page}</h1>
            <p className="text-slate-600 text-lg">This feature is currently under development.</p>
            <p className="text-slate-500 mt-2">Please check back later!</p>
        </div>
    </div>
);