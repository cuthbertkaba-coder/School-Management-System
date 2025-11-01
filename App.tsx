import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Page, User, Role, Student, Notification, ParentUser, LoggedInUser } from './types';
import { SCHOOL_LOGO_URL, SCHOOL_NAME, SCHOOL_MOTTO, NAV_ITEMS, ICONS } from './constants';
import { mockUsers, mockStudents, mockNotifications } from './data/mockData';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { Teachers } from './components/Teachers';
import { ClassManagement } from './components/ClassManagement';
import { Financials } from './components/Financials';
import { Notifications as NotificationsComponent, ComingSoon } from './components/Utility';
import { ChangePasswordModal } from './components/Settings';

const Sidebar: React.FC<{ user: LoggedInUser, currentPage: string, setCurrentPage: (page: string) => void, onLogout: () => void }> = ({ user, currentPage, setCurrentPage, onLogout }) => {
    const visibleNavItems = useMemo(() => {
        if (user.role === Role.Parent) {
            return [
                { label: 'Academics', icon: ICONS.Examinations },
                { label: 'Attendance', icon: ICONS.ClassRecords },
                { label: 'Financials', icon: ICONS.Financials },
                { label: 'Notifications', icon: ICONS.Notifications },
            ];
        }
        return NAV_ITEMS.filter(item => item.roles.includes(user.role));
    }, [user.role]);

    return (
        <aside className="w-64 bg-white text-slate-800 flex flex-col shadow-lg no-print">
            <div className="p-4 border-b border-slate-200 flex flex-col items-center text-center">
                <img src={user.role === Role.Parent ? user.photoUrl : SCHOOL_LOGO_URL} alt="Logo" className="w-20 h-20 rounded-full mb-2" />
                <h1 className="font-bold text-lg">{user.role === Role.Parent ? 'Parent Portal' : SCHOOL_NAME}</h1>
                 {user.role !== Role.Parent && <p className="text-xs text-slate-500 italic">"{SCHOOL_MOTTO}"</p>}
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {visibleNavItems.map(item => (
                    <a
                        key={item.label}
                        href="#"
                        onClick={(e) => { e.preventDefault(); setCurrentPage(item.label); }}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium group transition-colors duration-200 ${currentPage === item.label ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        {item.icon}
                        {item.label}
                    </a>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-200">
                 <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onLogout(); }}
                    className="flex items-center px-4 py-2 rounded-lg text-sm font-medium group text-slate-600 hover:bg-slate-100 transition-colors duration-200"
                >
                    {ICONS.Logout}
                    Logout
                </a>
            </div>
        </aside>
    );
};

const Header: React.FC<{ user: LoggedInUser, toggleSidebar: () => void, onChangePassword: () => void }> = ({ user, toggleSidebar, onChangePassword }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const displayName = user.role === Role.Parent ? user.guardianName : user.name;
    const displayRole = user.role === Role.Parent ? `Parent of ${user.name}` : user.role;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center no-print">
            <button onClick={toggleSidebar} className="lg:hidden text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <div className="text-right relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="text-right block">
                    <p className="font-semibold text-slate-800">{displayName}</p>
                    <p className="text-sm text-slate-500">{displayRole}</p>
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 animate-fade-in-up" style={{animation: 'fade-in-up 0.2s ease-out forwards'}}>
                        <a href="#" onClick={(e) => { e.preventDefault(); onChangePassword(); setDropdownOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Change Password</a>
                    </div>
                )}
            </div>
        </header>
    );
};

const ParentPortal: React.FC<{ student: ParentUser, page: string }> = ({ student, page }) => {
    const renderContent = () => {
        switch (page) {
            case 'Academics':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Academic Records</h2>
                        {student.grades.length > 0 ? student.grades.map(grade => (
                            <div key={grade.term} className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
                                <p className="font-semibold text-lg">{grade.term}</p>
                                <p>Average: {grade.average}%, Position: {grade.position}</p>
                                <table className="w-full text-sm text-left mt-2">
                                    <thead className="bg-slate-50"><tr><th className="p-2">Subject</th><th className="p-2">Total (100%)</th></tr></thead>
                                    <tbody>
                                        {Object.entries(grade.subjects).map(([subject, scores]) => <tr key={subject} className="border-b"><td className="p-2 font-medium">{subject}</td><td className="p-2">{scores.total}</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        )) : <p>No academic records found.</p>}
                    </div>
                );
            case 'Attendance':
                 return (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Attendance History</h2>
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <ul className="space-y-2">
                                {[...student.attendance].reverse().map((att, i) => (
                                    <li key={i} className="flex justify-between items-center p-2 border-b"><span>{att.date}</span><span>{att.status}</span></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                );
            case 'Financials':
                 return (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Financial Summary</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="bg-white p-4 rounded-lg shadow-sm"><p className="text-slate-500">Total Fees</p><p className="font-bold text-xl">GHS {student.financials.totalFees.toFixed(2)}</p></div>
                            <div className="bg-white p-4 rounded-lg shadow-sm"><p className="text-slate-500">Amount Paid</p><p className="font-bold text-xl">GHS {student.financials.paid.toFixed(2)}</p></div>
                            <div className="bg-white p-4 rounded-lg shadow-sm"><p className="text-slate-500">Balance Due</p><p className="font-bold text-xl text-red-600">GHS {student.financials.balance.toFixed(2)}</p></div>
                        </div>
                    </div>
                );
            case 'Notifications':
                return <NotificationsComponent user={student} />;
            default:
                return null;
        }
    };

    return <div className="p-4 sm:p-6 lg:p-8">{renderContent()}</div>;
};

const App: React.FC = () => {
    const [user, setUser] = useState<LoggedInUser | null>(null);
    const [users, setUsers] = useState(mockUsers);
    const [students, setStudents] = useState(mockStudents);
    const [currentPage, setCurrentPage] = useState<string>(Page.Dashboard);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

    const handleLogin = useCallback((loggedInUser: LoggedInUser) => {
        setUser(loggedInUser);
        setCurrentPage(loggedInUser.role === Role.Parent ? 'Academics' : Page.Dashboard);
    }, []);

    const handleLogout = useCallback(() => {
        setUser(null);
    }, []);
    
    const handlePasswordUpdate = (userId: string, newPasswordHash: string) => {
       if (user?.role === Role.Parent) {
            setStudents(prev => prev.map(s => s.id === userId ? { ...s, parentPasswordHash: newPasswordHash } : s));
       } else {
            const username = Object.keys(users).find(key => users[key].id === userId);
            if (username) {
                setUsers(prevUsers => ({
                    ...prevUsers,
                    [username]: { ...prevUsers[username], passwordHash: newPasswordHash }
                }));
            }
       }
       alert("Password changed successfully!");
       setChangePasswordModalOpen(false);
    };

    const renderPage = () => {
        if (!user || user.role === Role.Parent) return null;

        switch (currentPage) {
            case Page.Dashboard:
                return <Dashboard user={user} setCurrentPage={(p) => setCurrentPage(p)} />;
            case Page.Students:
                return <Students user={user} />;
            case Page.Teachers:
                return <Teachers user={user} />;
            case Page.ClassRecords:
                 return <ClassManagement initialPage={Page.ClassRecords} user={user} />;
            case Page.Examinations:
                return <ClassManagement initialPage={Page.Examinations} user={user} />;
            case Page.Financials:
                return <Financials />;
            case Page.Notifications:
                return <NotificationsComponent user={user} />;
            case Page.Backup:
                return <ComingSoon page={Page.Backup} />;
            default:
                return <Dashboard user={user} setCurrentPage={(p) => setCurrentPage(p)} />;
        }
    };
    
    if (!user) {
        return <Login onLogin={handleLogin} users={users} students={students} />;
    }

    return (
        <div className="flex h-screen bg-slate-100">
            <div className={`fixed inset-y-0 left-0 z-30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
               <Sidebar user={user} currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
            </div>
            
            <div className="flex-1 flex flex-col min-w-0">
                <Header user={user} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} onChangePassword={() => setChangePasswordModalOpen(true)} />
                <main className="flex-1 overflow-y-auto">
                    {user.role === Role.Parent ? <ParentPortal student={user} page={currentPage} /> : renderPage()}
                </main>
            </div>
             {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"></div>}
             {isChangePasswordModalOpen && <ChangePasswordModal user={user} users={users} students={students} onClose={() => setChangePasswordModalOpen(false)} onSave={handlePasswordUpdate} />}
        </div>
    );
};

export default App;
