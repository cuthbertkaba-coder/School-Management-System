

import React from 'react';
import { Page, Role, User } from '../types';

interface DashboardProps {
  user: User;
  setCurrentPage: (page: Page) => void;
  academicYear: string;
  currentTerm: string;
}

const DASHBOARD_ITEMS = [
    { page: Page.Students, title: 'Add/View Student', roles: [Role.Admin, Role.Teacher, Role.Headteacher] },
    { page: Page.Staff, title: 'Add/View Staff', roles: [Role.Admin, Role.Headteacher] },
    { page: Page.Examinations, title: 'Enter Exam Scores', roles: [Role.Admin, Role.Teacher, Role.Headteacher] },
    // { page: Page.PromoteStudent, title: 'Promote Student', roles: [Role.Admin, Role.Headteacher] }, // TODO
    { page: Page.Examinations, title: 'Print Report Card', roles: [Role.Admin, Role.Teacher, Role.Headteacher] },
    { page: Page.ClassRecords, title: 'View Class Records', roles: [Role.Admin, Role.Teacher, Role.Headteacher] },
    { page: Page.Financials, title: 'Print Financial Receipt', roles: [Role.Admin, Role.Headteacher] },
    { page: Page.ClassRecords, title: 'View Attendance', roles: [Role.Admin, Role.Teacher, Role.Headteacher] },
    { page: Page.Notifications, title: 'Access Notifications', roles: [Role.Admin, Role.Teacher, Role.Headteacher, Role.SMCChair] },
    { page: Page.Backup, title: 'Backup/Restore System', roles: [Role.Admin, Role.Headteacher] },
    { page: Page.Settings, title: 'School Settings', roles: [Role.Admin, Role.Headteacher] },
];

const DashboardCard: React.FC<{ title: string, onClick: () => void }> = ({ title, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center text-center font-semibold text-slate-700 hover:shadow-xl hover:bg-blue-50 transition-all duration-300 cursor-pointer"
    >
        {title}
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ user, setCurrentPage, academicYear, currentTerm }) => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-start flex-wrap gap-4 mb-2">
                 <div>
                    <h1 className="text-3xl font-bold text-slate-800">Welcome, {user.name}!</h1>
                    <p className="text-slate-600">This is your main control panel. Select an option to begin.</p>
                </div>
                <div className="text-right bg-white p-3 rounded-lg shadow-sm border">
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
                            onClick={() => setCurrentPage(item.page)}
                        />
                ))}
            </div>
        </div>
    );
};