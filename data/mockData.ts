import { Student, Staff, Notification, User, Role, StaffCategory, Settings, FeeItem, Discount, PasswordChangeRequest } from '../types';
import { CLASSES, SUBJECTS, SUBJECTS_JUNIOR } from '../constants';

const allSubjects = [...new Set([...SUBJECTS, ...SUBJECTS_JUNIOR])];

export const mockSettings: Settings = {
  academicYear: '2024/2025 Academic Year',
  currentTerm: 'First Term',
  feeStructure: {
    "Creche": { "Tuition": 300, "Snack and Lunch": 100 },
    "Nursery 1": { "Tuition": 350, "Snack and Lunch": 120, "Stationery & Toiletries": 50 },
    "Nursery 2": { "Tuition": 350, "Snack and Lunch": 120, "Stationery & Toiletries": 50 },
    "Kindergarten 1": { "Tuition": 400, "Snack and Lunch": 150, "Stationery & Toiletries": 60 },
    "Kindergarten 2": { "Tuition": 400, "Snack and Lunch": 150, "Stationery & Toiletries": 60 },
    "Basic 1": { "Tuition": 450, "Snack and Lunch": 180, "Stationery & Toiletries": 75 },
    "Basic 2": { "Tuition": 450, "Snack and Lunch": 180, "Stationery & Toiletries": 75 },
    "Basic 3": { "Tuition": 450, "Snack and Lunch": 180, "Stationery & Toiletries": 75 },
    "Basic 4": { "Tuition": 500, "Snack and Lunch": 200, "Stationery & Toiletries": 80 },
    "Basic 5": { "Tuition": 500, "Snack and Lunch": 200, "Stationery & Toiletries": 80 },
    "Basic 6": { "Tuition": 500, "Snack and Lunch": 200, "Stationery & Toiletries": 80 },
    "Basic 7": { "Tuition": 550, "Snack and Lunch": 220, "Stationery & Toiletries": 90 },
    "Basic 8": { "Tuition": 550, "Snack and Lunch": 220, "Stationery & Toiletries": 90 },
    "Basic 9": { "Tuition": 550, "Snack and Lunch": 220, "Stationery & Toiletries": 90 },
  },
  schoolSubjects: allSubjects,
  classSubjects: {
    ...Object.fromEntries(CLASSES.slice(0, 5).map(c => [c, SUBJECTS_JUNIOR.slice(0, 4)])), // Pre-school
    ...Object.fromEntries(CLASSES.slice(5, 11).map(c => [c, SUBJECTS_JUNIOR])), // Primary
    ...Object.fromEntries(CLASSES.slice(11).map(c => [c, SUBJECTS])), // JHS
  }
};


const generateStudent = (id: number, studentClass: string): Student => {
    const firstName = ['John', 'Jane', 'Peter', 'Mary', 'David', 'Sarah', 'Michael', 'Emily', 'Chris', 'Jessica'][id % 10];
    const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'][id % 10];
    const gender = id % 2 === 0 ? 'Male' : 'Female';
    
    const classFees = mockSettings.feeStructure[studentClass as keyof typeof mockSettings.feeStructure] || { "Tuition": 500 };
    const feeItems: FeeItem[] = Object.entries(classFees).map(([category, amount]) => ({
        category,
        amount,
        date: '2024-09-01',
    }));

    const totalFees = feeItems.reduce((sum, item) => sum + item.amount, 0);
    const paid = Math.floor(Math.random() * (totalFees * 0.8));

    return {
        id: `CCS2024${id.toString().padStart(3, '0')}`,
        photoUrl: `https://picsum.photos/seed/${id}/200`,
        name: `${firstName} ${lastName}`,
        dateOfBirth: `${2010 + (id % 10)}-${(id % 12) + 1}-${(id % 28) + 1}`,
        gender,
        guardianName: `Guardian of ${firstName}`,
        guardianContact: `024-123-456${id % 10}`,
        guardianEmail: `guardian.of.${firstName.toLowerCase()}${id}@example.com`,
        enrolmentDate: `2024-01-15`,
        currentClass: studentClass,
        classHistory: ['Creche', 'Nursery 1'],
        positionsHeld: id % 5 === 0 ? ['Class Prefect'] : [],
        interests: ['Football', 'Music'],
        awards: [],
        financials: {
            feeItems,
            discounts: id === 1 ? [{ type: 'Sibling', amount: 50, description: '2nd child discount' }] : [],
            payments: [{ date: '2024-09-15', amount: paid, receipt: `RCPT001-${id}` }],
        },
        attendance: [
            { date: '2024-07-15', status: 'Present' },
            { date: '2024-07-16', status: 'Present' },
            { date: '2024-07-17', status: 'Absent' },
        ],
        grades: [
            {
                term: 'First Term',
                subjects: {
                    'English Language': { classAssignments: 18, project: 8, midterm: 18, endOfTerm: 42 },
                    'Mathematics': { classAssignments: 19, project: 9, midterm: 19, endOfTerm: 46 },
                },
                average: 89,
                position: 2,
            }
        ],
        privateNotes: id === 0 ? [
            { date: '2024-07-21', author: 'Admin', content: 'Met with guardian to discuss recent performance. Guardian is supportive.' }
        ] : [],
        documents: [],
        status: 'active',
        parentPassword: 'parent',
    };
};

export const mockStudents: Student[] = CLASSES.flatMap(c => 
    Array.from({ length: 15 }, (_, i) => generateStudent(CLASSES.indexOf(c) * 15 + i, c))
);


export const mockStaff: Staff[] = [
    {
        id: 'S001',
        photoUrl: 'https://picsum.photos/seed/t1/200',
        name: 'Mr. Emmanuel Asante',
        staffNumber: 'CCS/T/001',
        employmentYear: 2015,
        employmentType: 'Full-time',
        qualifications: ['B.Ed. Basic Education', 'M.Phil Educational Studies'],
        contact: '020-111-2222',
        email: 'e.asante@ccschool.edu.gh',
        emergencyContact: { name: 'Mrs. Asante', phone: '020-222-3333' },
        assignedClass: 'Basic 6',
        schoolRoles: ['Sports Lead'],
        documents: [{ name: 'Appointment Letter', url: '#', date: '2015-08-01' }],
        status: 'active',
        category: StaffCategory.Teaching,
    },
    {
        id: 'S002',
        photoUrl: 'https://picsum.photos/seed/t2/200',
        name: 'Mrs. Grace Mensah',
        staffNumber: 'CCS/T/002',
        employmentYear: 2018,
        employmentType: 'Full-time',
        qualifications: ['Diploma in Early Childhood'],
        contact: '055-444-5555',
        email: 'g.mensah@ccschool.edu.gh',
        emergencyContact: { name: 'Mr. Mensah', phone: '055-555-6666' },
        assignedClass: 'Nursery 2',
        documents: [{ name: 'CV', url: '#', date: '2018-01-10' }],
        status: 'active',
        category: StaffCategory.Teaching,
    },
    {
        id: 'S003',
        photoUrl: 'https://picsum.photos/seed/t3/200',
        name: 'Mr. David Ofori',
        staffNumber: 'CCS/T/003',
        employmentYear: 2020,
        employmentType: 'Part-time',
        qualifications: ['BSc. Mathematics'],
        contact: '027-777-8888',
        email: 'd.ofori@ccschool.edu.gh',
        emergencyContact: { name: 'Mr. Ofori Snr', phone: '027-888-9999' },
        assignedSubjects: ['Mathematics', 'Integrated Science'],
        schoolRoles: ['Teacher on Duty'],
        documents: [{ name: 'SSSCE Certificate', url: '#', date: '2020-07-21' }],
        status: 'active',
        category: StaffCategory.Teaching,
    },
    {
        id: 'S004',
        photoUrl: 'https://picsum.photos/seed/a1/200',
        name: 'Ms. Beatrice Clerk',
        staffNumber: 'CCS/A/001',
        employmentYear: 2017,
        employmentType: 'Full-time',
        qualifications: ['HND in Administration'],
        contact: '023-111-2222',
        email: 'b.clerk@ccschool.edu.gh',
        emergencyContact: { name: 'Mr. Clerk', phone: '023-222-3333' },
        schoolRoles: ['Front Desk Admin'],
        documents: [{ name: 'Appointment Letter', url: '#', date: '2017-08-01' }],
        status: 'active',
        category: StaffCategory.Administration,
    },
     {
        id: 'S005',
        photoUrl: 'https://picsum.photos/seed/ht1/200',
        name: 'Mrs. Evelyn Adu',
        staffNumber: 'CCS/A/002',
        employmentYear: 2010,
        employmentType: 'Full-time',
        qualifications: ['M.Ed Leadership'],
        contact: '023-555-4444',
        email: 'head@ccschool.edu.gh',
        emergencyContact: { name: 'Mr. Adu', phone: '023-444-3333' },
        schoolRoles: ['Headteacher'],
        documents: [],
        status: 'active',
        category: StaffCategory.Administration,
    },
    {
        id: 'S006',
        photoUrl: 'https://picsum.photos/seed/m1/200',
        name: 'Mr. Kofi Annan',
        staffNumber: 'CCS/M/001',
        employmentYear: 2019,
        employmentType: 'Full-time',
        qualifications: ['General Maintenance Cert.'],
        contact: '026-999-0000',
        email: 'k.annan@ccschool.edu.gh',
        emergencyContact: { name: 'Mrs. Annan', phone: '026-000-1111' },
        schoolRoles: ['Grounds Keeper'],
        documents: [],
        status: 'active',
        category: StaffCategory.MaintenanceOperations,
    }
];

export const mockUsers: (User & { password: string })[] = [
    {
        id: 'U001',
        username: 'admin',
        name: 'Admin User',
        role: Role.Admin,
        password: 'admin',
    },
    {
        id: 'U002',
        username: 'e.asante',
        name: 'Emmanuel Asante',
        role: Role.Teacher,
        staffId: 'S001',
        password: 'e.asante',
    },
    {
        id: 'U003',
        username: 'headteacher',
        name: 'Evelyn Adu',
        role: Role.Headteacher,
        staffId: 'S005',
        password: 'headteacher',
    },
    {
        id: 'U004',
        username: 'smc_chair',
        name: 'SMC Chair',
        role: Role.SMCChair,
        password: 'smc_chair',
    }
];


export const mockNotifications: Notification[] = [
    {
        id: 1,
        user: 'admin',
        date: '2024-07-20',
        content: 'Mid-term break begins on the 25th of July. School resumes on the 1st of August.',
        priority: true,
    },
    {
        id: 2,
        user: 'headteacher',
        date: '2024-07-18',
        content: 'All teachers are to submit their terminal report comments by Friday, 22nd July.',
        priority: false,
    },
];

export const mockPasswordRequests: PasswordChangeRequest[] = [];