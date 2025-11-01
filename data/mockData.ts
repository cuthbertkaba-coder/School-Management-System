import { Student, Teacher, Notification, StudentNote, User, Role } from '../types';
import { CLASSES } from '../constants';

const generateStudent = (id: number, studentClass: string): Student => {
    const firstName = ['John', 'Jane', 'Peter', 'Mary', 'David', 'Sarah', 'Michael', 'Emily', 'Chris', 'Jessica'][id % 10];
    const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'][id % 10];
    const gender = id % 2 === 0 ? 'Male' : 'Female';
    const totalFees = 500 + Math.floor(Math.random() * 200);
    const paid = Math.floor(Math.random() * totalFees);
    
    return {
        id: `CCS2024${id.toString().padStart(3, '0')}`,
        photoUrl: `https://picsum.photos/seed/${id}/200`,
        name: `${firstName} ${lastName}`,
        dateOfBirth: `${2010 + (id % 10)}-${(id % 12) + 1}-${(id % 28) + 1}`,
        gender,
        guardianName: `Guardian of ${firstName}`,
        guardianContact: `024-123-456${id % 10}`,
        guardianEmail: `guardian.of.${firstName.toLowerCase()}${id}@example.com`,
        enrolmentDate: `2020-09-01`,
        currentClass: studentClass,
        classHistory: ['Creche', 'Nursery 1'],
        positionsHeld: id % 5 === 0 ? ['Class Prefect'] : [],
        interests: ['Football', 'Music'],
        awards: [],
        financials: {
            totalFees,
            paid,
            balance: totalFees - paid,
            payments: [{ date: '2024-01-15', amount: paid, receipt: 'RCPT001' }],
        },
        attendance: [
            { date: '2024-07-15', status: 'Present' },
            { date: '2024-07-16', status: 'Present' },
            { date: '2024-07-17', status: 'Absent' },
        ],
        grades: [
            {
                term: 'First Term 2023',
                subjects: {
                    'English': { ca: 25, exam: 60, total: 85 },
                    'Math': { ca: 28, exam: 65, total: 93 },
                },
                average: 89,
                position: 2,
            }
        ],
        privateNotes: id === 0 ? [
            { date: '2024-07-21', author: 'Admin', content: 'Met with guardian to discuss recent performance. Guardian is supportive.' }
        ] : [],
        status: 'active',
        // Default parent password is 'password'
        parentPasswordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    };
};

export const mockStudents: Student[] = CLASSES.flatMap(c => 
    Array.from({ length: 15 }, (_, i) => generateStudent(CLASSES.indexOf(c) * 15 + i, c))
);


export const mockTeachers: Teacher[] = [
    {
        id: 'T001',
        photoUrl: 'https://picsum.photos/seed/t1/200',
        name: 'Mr. Emmanuel Asante',
        staffNumber: 'CCS/T/001',
        employmentYear: 2015,
        qualifications: ['B.Ed. Basic Education', 'M.Phil Educational Studies'],
        contact: '020-111-2222',
        email: 'e.asante@ccschool.edu.gh',
        emergencyContact: { name: 'Mrs. Asante', phone: '020-222-3333' },
        assignedClass: 'Basic 6',
        schoolRoles: ['Sports Lead', 'Headteacher'],
        documents: [{ name: 'Appointment Letter', url: '#', date: '2015-08-01' }],
        status: 'active',
    },
    {
        id: 'T002',
        photoUrl: 'https://picsum.photos/seed/t2/200',
        name: 'Mrs. Grace Mensah',
        staffNumber: 'CCS/T/002',
        employmentYear: 2018,
        qualifications: ['Diploma in Early Childhood'],
        contact: '055-444-5555',
        email: 'g.mensah@ccschool.edu.gh',
        emergencyContact: { name: 'Mr. Mensah', phone: '055-555-6666' },
        assignedClass: 'Nursery 2',
        documents: [{ name: 'CV', url: '#', date: '2018-01-10' }],
        status: 'active',
    },
    {
        id: 'T003',
        photoUrl: 'https://picsum.photos/seed/t3/200',
        name: 'Mr. David Ofori',
        staffNumber: 'CCS/T/003',
        employmentYear: 2020,
        qualifications: ['BSc. Mathematics'],
        contact: '027-777-8888',
        email: 'd.ofori@ccschool.edu.gh',
        emergencyContact: { name: 'Mr. Ofori Snr', phone: '027-888-9999' },
        assignedSubjects: ['Mathematics', 'Integrated Science'],
        schoolRoles: ['Teacher on Duty'],
        documents: [{ name: 'SSSCE Certificate', url: '#', date: '2020-07-21' }],
        status: 'active',
    }
];

// Note: Passwords are 'admin', 'teacher', 'head', 'smc' respectively.
// Hashes generated using SHA-256 for demonstration.
export const mockUsers: { [username: string]: User & { passwordHash: string } } = {
    'admin': {
        id: 'U001',
        username: 'admin',
        name: 'Admin User',
        role: Role.Admin,
        passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    },
    'teacher1': {
        id: 'U002',
        username: 'teacher1',
        name: 'Emmanuel Asante',
        role: Role.Teacher,
        // Password: 'teacher'
        passwordHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    },
    'headteacher': {
        id: 'U003',
        username: 'headteacher',
        name: 'Head Teacher',
        role: Role.Headteacher,
        passwordHash: '7a53c35b881308696b251a3a6eb365287b47b489e2be131557877297e6822a48',
    },
    'smc_chair': {
        id: 'U004',
        username: 'smc_chair',
        name: 'SMC Chair',
        role: Role.SMCChair,
        passwordHash: '836f33887259045a1651586751240c11f7dc0415a77b50875600c6f5d81b846e',
    }
};


export const mockNotifications: Notification[] = [
    {
        id: 1,
        user: 'admin',
        date: '2024-07-20',
        content: 'Mid-term break begins on the 25th of July. School resumes on the 1st of August.'
    },
    {
        id: 2,
        user: 'headteacher',
        date: '2024-07-18',
        content: 'All teachers are to submit their terminal report comments by Friday, 22nd July.'
    },
];
