export enum Role {
  Admin = 'Admin',
  Teacher = 'Teacher',
  Headteacher = 'Headteacher',
  SMCChair = 'SMC Chair',
  Parent = 'Parent',
}

export enum StaffCategory {
  Teaching = 'Teaching',
  Administration = 'Administration',
  ProfessionalSupport = 'Professional Support',
  MaintenanceOperations = 'Maintenance/Operations',
}

export enum Page {
  Dashboard = 'Dashboard',
  Students = 'Students',
  Staff = 'Staff',
  ClassRecords = 'Class Records',
  Examinations = 'Examinations & Grades',
  Financials = 'Fees & Financials',
  Notifications = 'Notifications',
  Documents = 'Documents Manager',
  PTA = 'PTA, Inventory & Discipline',
  Backup = 'Backup & Restore',
  Settings = 'School Settings',
}

export interface Settings {
  academicYear: string;
  currentTerm: string;
  feeStructure: {
    [className: string]: {
      [category:string]: number;
    };
  };
  schoolSubjects: string[];
  classSubjects: {
    [className: string]: string[];
  };
}

export const DISCOUNT_TYPES = ['Sibling', 'Staff', 'Referral', 'New Pupil', 'Other'] as const;
export type DiscountType = typeof DISCOUNT_TYPES[number];

export interface Discount {
  type: DiscountType;
  amount: number;
  description?: string;
}

export interface FeeItem {
  category: string;
  amount: number;
  date: string;
}

export interface SchoolDocument {
  name: string;
  url: string; // In a real app, this would be a URL to the stored file
  date: string;
}

export interface PasswordChangeRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  newPassword: string;
  status: 'pending';
}

export interface User {
  id: string;
  username: string;
  name: string;
  // Fix: Exclude 'Parent' from the user's role to make `role` a discriminant property for discriminated unions involving User.
  role: Exclude<Role, Role.Parent>;
  staffId?: string; // Link user account to staff profile
}

export interface StudentNote {
  date: string;
  author: string;
  content: string;
}

export interface GradeScore {
  classAssignments?: number;
  project?: number;
  midterm?: number;
  endOfTerm?: number;
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
    payments: { date: string; amount: number; receipt: string }[];
    feeItems: FeeItem[];
    discounts: Discount[];
  };
  attendance: { date: string; status: 'Present' | 'Absent' | 'Late' }[];
  grades: {
    term: string;
    subjects: { [subject: string]: GradeScore };
    average: number;
    position: number;
  }[];
  privateNotes: StudentNote[];
  documents: SchoolDocument[];
  status: 'active' | 'archived';
  parentPassword?: string;
}

export interface Staff {
  id: string;
  photoUrl: string;
  name: string;
  staffNumber: string;
  employmentYear: number;
  employmentType: 'Full-time' | 'Part-time' | 'Volunteer';
  qualifications: string[];
  contact: string;
  email: string;
  emergencyContact: { name: string; phone: string };
  assignedClass?: string;
  assignedSubjects?: string[];
  schoolRoles?: string[];
  documents: SchoolDocument[];
  status: 'active' | 'archived';
  category: StaffCategory;
}

export interface Notification {
  id: number;
  user: string;
  date: string;
  content: string;
  priority: boolean;
}

export type ParentUser = Student & { role: Role.Parent };
export type LoggedInUser = User | ParentUser;