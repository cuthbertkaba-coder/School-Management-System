export enum Role {
  Admin = 'Admin',
  Teacher = 'Teacher',
  Headteacher = 'Headteacher',
  SMCChair = 'SMC Chair',
  Parent = 'Parent',
}

export enum Page {
  Dashboard = 'Dashboard',
  Students = 'Students',
  Teachers = 'Teachers',
  ClassRecords = 'Class Records',
  Examinations = 'Examinations & Grades',
  Financials = 'Fees & Financials',
  Notifications = 'Notifications',
  Documents = 'Documents Manager',
  PTA = 'PTA, Inventory & Discipline',
  Backup = 'Backup & Restore',
}

export interface User {
  id: string;
  username: string;
  name: string;
  // Fix: Exclude 'Parent' from the user's role to make `role` a discriminant property for discriminated unions involving User.
  role: Exclude<Role, Role.Parent>;
}

export interface StudentNote {
  date: string;
  author: string;
  content: string;
}

export interface Student {
  id: string;
  photoUrl: string;
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  guardianName: string;
  guardianContact: string;
  guardianEmail: string;
  enrolmentDate: string;
  currentClass: string;
  classHistory: string[];
  positionsHeld: string[];
  interests: string[];
  awards: string[];
  financials: {
    totalFees: number;
    paid: number;
    balance: number;
    payments: { date: string; amount: number; receipt: string }[];
  };
  attendance: { date: string; status: 'Present' | 'Absent' | 'Late' }[];
  grades: {
    term: string;
    subjects: { [subject: string]: { ca: number; exam: number; total: number } };
    average: number;
    position: number;
  }[];
  privateNotes: StudentNote[];
  status: 'active' | 'archived';
  parentPasswordHash?: string;
}

export interface Teacher {
  id: string;
  photoUrl: string;
  name: string;
  staffNumber: string;
  employmentYear: number;
  qualifications: string[];
  contact: string;
  email: string;
  emergencyContact: { name: string; phone: string };
  assignedClass?: string;
  assignedSubjects?: string[];
  schoolRoles?: string[];
  documents: { name: string; url: string; date: string }[];
  status: 'active' | 'archived';
}

export interface Notification {
  id: number;
  user: string;
  date: string;
  content: string;
}

export type ParentUser = Student & { role: Role.Parent };
export type LoggedInUser = User | ParentUser;
