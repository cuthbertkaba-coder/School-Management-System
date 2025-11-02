

import React from 'react';
import { Page, Role, User } from '../types';

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-8 h-8 mx-auto mb-2 text-blue-500">{children}</div>
);

const DASHBOARD_ITEMS = [
    { page: Page.Students, title: 'Manage Students', roles: [Role.Admin, Role.Teacher, Role.Headteacher], icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg> },
    { page: Page.Staff, title: 'Manage Staff', roles: [Role.Admin, Role.Headteacher], icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { page: Page.Examinations, title: 'Enter Exam Scores', roles: [Role.Admin, Role.Teacher, Role.Headteacher], icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg> },
    { page: Page.Examinations, title: 'Generate Reports', roles: [Role.Admin, Role.Teacher, Role.Headteacher], icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
    { page: Page.ClassRecords, title: 'View Class Records', roles: [Role.Admin, Role.Teacher, Role.Headteacher], icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg> },
    { page: Page.Financials, title: 'Manage Financials', roles: [Role.Admin, Role.Headteacher], icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v.75A.75.75 0 014.5 8.25h-.75m0 0h.75A.75.75 0 016 8.25v.75m0 0v.75A.75.75 0 015.25 10.5h-.75m0 0h.75A.75.75 0 017.5 10.5v.75m0 0v.75A.75.75 0 016.75 12h-.75m0 0h.75A.75.75 0 019 12v.75m0 0v.75a.75.75 0 01-.75.75h-.75m0 0H9m0 0h.75a.75.75 0 01.75.75v.75m0 0v.75a.75.75 0 01-.75.75h-.75M12 15V3.75m0 11.25L10.5 12.75m1.5 2.25L13.5 12.75" /></svg> },
    { page: Page.Notifications, title: 'Send Notifications', roles: [Role.Admin, Role.Teacher, Role.Headteacher, Role.SMCChair], icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg> },
    { page: Page.Backup, title: 'Backup & Restore', roles: [Role.Admin, Role.Headteacher], icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg> },
    { page: Page.Settings, title: 'School Settings', roles: [Role.Admin, Role.Headteacher], icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-.962a8.977 8.977 0 015.057 1.787 9.01 9.01 0 013.239 5.961c.043.552-.398 1.05-.962 1.11a8.977 8.977 0 01-1.787 5.057 9.01 9.01 0 01-5.961 3.239c-.552.043-1.05-.398-1.11-.962a8.977 8.977 0 01-5.057-1.787 9.01 9.01 0 01-3.239-5.961c-.043-.552.398-1.05.962-1.11a8.977 8.977 0 011.787-5.057 9.01 9.01 0 015.961-3.239zM12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg> },
];

const DashboardCard: React.FC<{ title: string, icon: React.ReactNode, onClick: () => void }> = ({ title, icon, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center text-center font-semibold text-slate-700 hover:shadow-xl hover:bg-blue-50 transition-all duration-300 cursor-pointer aspect-square"
    >
        <IconWrapper>{icon}</IconWrapper>
        <span className="text-sm">{title}</span>
    </div>
);

export const Dashboard: React.FC<{ user: User, setCurrentPage: (page: Page) => void, academicYear: string, currentTerm: string }> = ({ user, setCurrentPage, academicYear, currentTerm }) => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 h-full relative">
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-10" 
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2832&auto=format&fit=crop)' }}
            ></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start flex-wrap gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Welcome, {user.name}!</h1>
                        <p className="text-slate-600">This is your main control panel. Select an option to begin.</p>
                    </div>
                    <div className="text-right bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border">
                        <p className="font-semibold text-slate-700">{academicYear}</p>
                        <p className="text-sm text-blue-600 font-medium">{currentTerm}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
                    {DASHBOARD_ITEMS
                        .filter(item => item.roles.includes(user.role))
                        .map(item => (
                            <DashboardCard 
                                key={item.title}
                                title={item.title} 
                                icon={item.icon}
                                onClick={() => setCurrentPage(item.page)}
                            />
                    ))}
                </div>
            </div>
        </div>
    );
};