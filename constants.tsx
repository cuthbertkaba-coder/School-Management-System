import React from 'react';
import { Page, Role } from './types';

export const SCHOOL_NAME = "Christ Community School";
export const SCHOOL_MOTTO = "Training the Head, Hands and Heart";
export const SCHOOL_LOGO_URL = "https://lh3.googleusercontent.com/a-/ALV-UjWb9M45eXazpG0OpZQ-JLExx9zHJH_YyesKnYQDiOKPPu4skqj0=s265-w265-h265";

export const CLASSES = [
  "Creche", "Nursery 1", "Nursery 2", "Kindergarten 1", "Kindergarten 2",
  "Basic 1", "Basic 2", "Basic 3", "Basic 4", "Basic 5", "Basic 6",
  "Basic 7", "Basic 8", "Basic 9"
];

// Classes for primary/junior level teachers
export const CLASSES_JUNIOR = CLASSES.slice(0, 11); // Creche to Basic 6

// Subjects for junior level
export const SUBJECTS_JUNIOR = [
    "English Language", "Mathematics", "Natural Science", "Social Studies", 
    "French", "Computing", "Religious & Moral Education", "Our World Our People", 
    "Creative Arts", "Ghanaian Language"
];

// Subjects for senior level teachers
export const SUBJECTS = [
  "English Language", "Mathematics", "Integrated Science", "Social Studies",
  "French", "Computing", "Religious & Moral Education", "Career Technology", "Ghanaian Language"
];

export const SCHOOL_ROLES = [
    "Teacher on Duty",
    "First Aid Teacher",
    "SMC Representative",
    "Headteacher",
    "Sports Lead",
    "Worship Lead",
    "French Club Lead",
    "Music and Art Lead",
    "Debating Club Lead"
];

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="w-6 h-6 mr-3 text-slate-500 group-hover:text-sky-500 transition-colors duration-200">
    {children}
  </span>
);

// Fix: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
export const ICONS: { [key: string]: React.ReactElement } = {
  Dashboard: <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg></IconWrapper>,
  Students: <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg></IconWrapper>,
  Teachers: <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg></IconWrapper>,
  ClassRecords: <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" ><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></IconWrapper>,
  Examinations: <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg></IconWrapper>,
  Financials: <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v.75A.75.75 0 014.5 8.25h-.75m0 0h.75A.75.75 0 016 8.25v.75m0 0v.75A.75.75 0 015.25 10.5h-.75m0 0h.75A.75.75 0 017.5 10.5v.75m0 0v.75A.75.75 0 016.75 12h-.75m0 0h.75A.75.75 0 019 12v.75m0 0v.75a.75.75 0 01-.75.75h-.75m0 0H9m0 0h.75a.75.75 0 01.75.75v.75m0 0v.75a.75.75 0 01-.75.75h-.75M12 15V3.75m0 11.25L10.5 12.75m1.5 2.25L13.5 12.75" /></svg></IconWrapper>,
  Notifications: <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg></IconWrapper>,
  Backup: <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg></IconWrapper>,
  Logout: <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg></IconWrapper>,
};

export const NAV_ITEMS = [
  { label: Page.Dashboard, icon: ICONS.Dashboard, roles: [Role.Admin, Role.Teacher, Role.Headteacher, Role.SMCChair] },
  { label: Page.Students, icon: ICONS.Students, roles: [Role.Admin, Role.Teacher, Role.Headteacher, Role.SMCChair] },
  { label: Page.Teachers, icon: ICONS.Teachers, roles: [Role.Admin, Role.Headteacher] },
  { label: Page.ClassRecords, icon: ICONS.ClassRecords, roles: [Role.Admin, Role.Teacher, Role.Headteacher, Role.SMCChair] },
  { label: Page.Examinations, icon: ICONS.Examinations, roles: [Role.Admin, Role.Teacher, Role.Headteacher, Role.SMCChair] },
  { label: Page.Financials, icon: ICONS.Financials, roles: [Role.Admin, Role.Headteacher] },
  { label: Page.Notifications, icon: ICONS.Notifications, roles: [Role.Admin, Role.Teacher, Role.Headteacher, Role.SMCChair] },
  { label: Page.Backup, icon: ICONS.Backup, roles: [Role.Admin, Role.Headteacher] },
];
