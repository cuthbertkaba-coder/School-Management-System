import React, { useState, useMemo } from 'react';
import { Notification, User, Page, Role, LoggedInUser } from '../types';
import { mockNotifications } from '../data/mockData';

export const Notifications: React.FC<{ user: LoggedInUser }> = ({ user }) => {
    const [notifications, setNotifications] = useState(mockNotifications);
    const [newNotification, setNewNotification] = useState('');
    const canPost = useMemo(() => user.role !== Role.SMCChair && user.role !== Role.Parent, [user.role]);

    const addNotification = () => {
        if(newNotification.trim() === '') return;
        const newEntry: Notification = {
            id: notifications.length + 1,
            user: user.name, // Use display name instead of username
            date: new Date().toISOString().split('T')[0],
            content: newNotification,
        };
        setNotifications([newEntry, ...notifications]);
        setNewNotification('');
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Notifications</h1>
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Announcement Board</h2>
                {canPost && (
                    <div className="mb-4">
                        <textarea 
                            value={newNotification}
                            onChange={(e) => setNewNotification(e.target.value)}
                            placeholder="Type your announcement here..."
                            className="w-full p-2 border border-slate-300 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                        <div className="flex justify-end mt-2">
                            <button onClick={addNotification} className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors">Post Notification</button>
                        </div>
                    </div>
                )}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {notifications.map(notif => (
                        <div key={notif.id} className="p-4 border border-slate-200 rounded-md bg-slate-50">
                            <p className="text-slate-800">{notif.content}</p>
                            <p className="text-xs text-slate-500 mt-2 text-right">Posted by {notif.user} on {notif.date}</p>
                        </div>
                    ))}
                </div>
            </div>
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
