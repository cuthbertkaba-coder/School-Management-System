
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
// Fix: Import `GradeScore` to be used for type casting.
import { Student, StudentNote, User, Role, FeeItem, Discount, DiscountType, DISCOUNT_TYPES, SchoolDocument, GradeScore } from '../types';
import { mockStudents } from '../data/mockData';
// Fix: Remove duplicate `SCHOOL_MOTTO` import and add `SCHOOL_NAME`.
import { CLASSES, SCHOOL_LOGO_URL, SCHOOL_MOTTO, SUBJECTS, SUBJECTS_JUNIOR, SCHOOL_NAME } from '../constants';
import { calculateFinancials, getGradeInfo } from '../utils/auth';
import { AdminManageAccountModal } from './Settings';

const DEFAULT_AVATAR_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NkZDZlMyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTguNjg1IDE5LjA5N0E5LjcyMyA5LjcyMyAwIDAwMjEuNzUgMTJjMC01LjM4NS00LjM2NS05Ljc1LTkuNzUtOS43NVM S5MjUgNi42MTUgMi4yNSAxMmE5LjcyMyA5LjcyMyAwIDAwMy4wNjUgNy4wOTdBOTcxNiA5LjcxNiAwIDAwMTIgMjEuNzVhOS4xMTYgOS43MTYgMCAwMDYuNjg1LTIuNjUzem0tMTIuNTQtMS4yODVBNy40ODYgNy40ODYgMCAwMTEyIDE1YTcuNDg2IDcuNDg2IDAgMDE1Ljg1NSAyLjgxMkE4LjIyNCA4LjIyNCAwIDAxMTIgMjAuMjVhOC4yMjQgOC4yMjQgMCAwMS01Ljg1NS0yLjQzOHpNM TcuNzUgOWEzLjc1IDMuNzUgMCAxMS03LjUgMCAzLjc1IDMuNzUgMCAwMTcuNSAwem0iIGNsaXAtcnVsZT0iZXZlbm9kZCIgLz48L3N2Zz4=";

declare global {
    interface Window {
      jspdf: any;
      html2canvas: any;
    }
}

const exportToPdf = (element: HTMLElement, fileName: string) => {
    if (!element) {
        console.error("Export failed: element not found");
        return;
    }
    const { jsPDF } = window.jspdf;
    window.html2canvas(element, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        const pdfHeight = pdfWidth / ratio;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${fileName}.pdf`);
    });
};

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

const PromoteStudentModal: React.FC<{
    student: Student;
    onClose: () => void;
    onSave: (studentId: string, newClass: string, isRepeating: boolean) => void;
}> = ({ student, onClose, onSave }) => {
    const [action, setAction] = useState<'promote' | 'repeat'>('promote');
    const currentIndex = CLASSES.indexOf(student.currentClass);
    const promotableClasses = currentIndex < CLASSES.length - 1 ? CLASSES.slice(currentIndex + 1) : [];
    const [selectedClass, setSelectedClass] = useState(promotableClasses.length > 0 ? promotableClasses[0] : '');
    
    const handleSave = () => {
        const newClass = action === 'promote' ? selectedClass : student.currentClass;
        if (action === 'promote' && !newClass) {
            alert("Please select a class to promote the student to.");
            return;
        }
        onSave(student.id, newClass, action === 'repeat');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Promote or Repeat Student</h2>
                <p className="mb-4 text-slate-600">Managing academic progression for <strong>{student.name}</strong> from class <strong>{student.currentClass}</strong>.</p>
                <div className="space-y-4">
                    <select value={action} onChange={(e) => setAction(e.target.value as 'promote' | 'repeat')} className="w-full p-2 border border-slate-300 rounded-lg">
                        <option value="promote">Promote to a new class</option>
                        <option value="repeat">Repeat current class</option>
                    </select>
                    {action === 'promote' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Promote to Class</label>
                            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" disabled={promotableClasses.length === 0}>
                                {promotableClasses.length > 0 ? (
                                    promotableClasses.map(c => <option key={c} value={c}>{c}</option>)
                                ) : (
                                    <option>No higher class available</option>
                                )}
                            </select>
                        </div>
                    )}
                </div>
                 <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirm Action</button>
                </div>
            </div>
        </div>
    );
};


const generateNewStudentId = (enrolmentDate: string, allStudents: Student[]): string => {
    if (!enrolmentDate) return "Invalid Date";
    try {
        const year = new Date(enrolmentDate).getFullYear();
        if (isNaN(year)) return "Invalid Date";
        
        const studentsInYear = allStudents.filter(s => {
            try {
                return new Date(s.enrolmentDate).getFullYear() === year;
            } catch (e) {
                return false;
            }
        }).length;
        const sequence = (studentsInYear + 1).toString().padStart(3, '0');
        return `CCS${year}${sequence}`;
    } catch (e) {
        return "Invalid Date";
    }
};


const AddStudentModal: React.FC<{
  onClose: () => void;
  onSave: (newStudentData: Omit<Student, 'id' | 'classHistory' | 'positionsHeld' | 'interests' | 'awards' | 'financials' | 'attendance' | 'grades' | 'privateNotes' | 'status' | 'documents'>) => void;
  students: Student[];
}> = ({ onClose, onSave, students }) => {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [guardianName, setGuardianName] = useState('');
  const [guardianContact, setGuardianContact] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [currentClass, setCurrentClass] = useState(CLASSES[0]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [enrolmentDate, setEnrolmentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const studentId = useMemo(() => generateNewStudentId(enrolmentDate, students), [enrolmentDate, students]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setPhotoUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dateOfBirth || !guardianName || !guardianContact || !currentClass || !enrolmentDate) {
        alert("Please fill all required fields.");
        return;
    }
    // Default parent password is 'Password@123'
    const parentPassword = 'Password@123';
    onSave({ name, dateOfBirth, gender, guardianName, guardianContact, guardianEmail, enrolmentDate, currentClass, photoUrl: photoUrl || DEFAULT_AVATAR_URL, parentPassword });
  };
  
  const animationStyle = { animation: 'fade-in-up 0.3s ease-out forwards' };
  const keyframes = `
      @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
      }
  `;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
        <style>{keyframes}</style>
        <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl" style={animationStyle}>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Add New Student</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="md:col-span-2 flex flex-col items-center gap-2 mb-2 p-4 bg-slate-50 rounded-lg">
                        <img 
                            src={photoUrl || DEFAULT_AVATAR_URL} 
                            alt="Student" 
                            className="w-24 h-24 rounded-full object-cover bg-slate-200 shadow-inner" 
                        />
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={handlePhotoUpload} 
                            className="hidden" 
                        />
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()} 
                            className="text-sm bg-slate-200 text-slate-700 px-3 py-1 rounded-md hover:bg-slate-300 transition-colors"
                        >
                            Upload Photo
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Enrolment Date*</label>
                        <input type="date" value={enrolmentDate} onChange={e => setEnrolmentDate(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Generated Student ID</label>
                        <input type="text" value={studentId} readOnly className="mt-1 w-full p-2 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Full Name*</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Date of Birth*</label>
                        <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Gender*</label>
                        <select value={gender} onChange={e => setGender(e.target.value as 'Male' | 'Female')} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Current Class*</label>
                        <select value={currentClass} onChange={e => setCurrentClass(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                      <hr className="my-2"/>
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Guardian's Full Name*</label>
                        <input type="text" value={guardianName} onChange={e => setGuardianName(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Guardian's Contact Number*</label>
                        <input type="tel" placeholder='e.g. 024-123-4567' value={guardianContact} onChange={e => setGuardianContact(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Guardian's Email</label>
                        <input type="email" placeholder='e.g. guardian@example.com' value={guardianEmail} onChange={e => setGuardianEmail(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Save Student</button>
                </div>
            </form>
        </div>
    </div>
  );
};

const StudentCard: React.FC<{ student: Student, onSelect: (student: Student) => void, onDeleteRequest: (student: Student) => void }> = ({ student, onSelect, onDeleteRequest }) => (
    <div onClick={() => onSelect(student)} className="relative bg-white p-4 rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer flex items-center space-x-4">
        <img src={student.photoUrl} alt={student.name} className="w-16 h-16 rounded-full object-cover" />
        <div>
            <p className="font-bold text-slate-800">{student.name}</p>
            <p className="text-sm text-slate-500">{student.id}</p>
            <p className="text-sm text-slate-500">{student.currentClass}</p>
        </div>
        <button
            onClick={(e) => {
                e.stopPropagation();
                onDeleteRequest(student);
            }}
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors no-print"
            aria-label={`Delete ${student.name}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
    </div>
);

export const PrintableReportCardModal: React.FC<{
    student: Student;
    onClose: () => void;
    academicYear: string;
    currentTerm: string;
}> = ({ student, onClose, academicYear, currentTerm }) => {
    const reportCardRef = useRef<HTMLDivElement>(null);
    const report = student.grades.find(g => g.term === currentTerm);

    const handlePrint = () => {
        if (!reportCardRef.current) return;
        const printContents = `<div class="printable-content-wrapper">${reportCardRef.current.innerHTML}</div><div class="printable-footer">${SCHOOL_MOTTO}</div>`;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    const handleExport = () => {
        if(reportCardRef.current) {
            exportToPdf(reportCardRef.current, `Report_Card_${student.id}_${currentTerm.replace(/\s/g, '_')}`);
        }
    };

    if (!report) {
        return (
             <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
                <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md animate-fade-in-up text-center">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">No Report Data</h2>
                    <p className="text-slate-600 mb-6">No academic records found for {student.name} for the {currentTerm}.</p>
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Close</button>
                </div>
            </div>
        )
    }

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 printing-modal">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl animate-fade-in-up max-h-[90vh] flex flex-col">
                <div ref={reportCardRef} className="p-6 overflow-y-auto text-black">
                    <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                        <img src={SCHOOL_LOGO_URL} alt="School Logo" className="w-20 h-20 mx-auto mb-2" />
                        <h1 className="text-3xl font-bold text-black">{SCHOOL_NAME}</h1>
                        <p className="text-lg font-semibold text-black">Terminal Report Card</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                        <div><strong>Student:</strong> {student.name}</div>
                        <div><strong>Student ID:</strong> {student.id}</div>
                        <div><strong>Class:</strong> {student.currentClass}</div>
                        <div><strong>Academic Year:</strong> {academicYear}</div>
                        <div><strong>Term:</strong> {currentTerm}</div>
                        {currentTerm === 'Third Term' && <div><strong>Status:</strong> <span className="font-bold">{report.promotionStatus || 'N/A'}</span></div>}
                        <div><strong>Position:</strong> {report.position}</div>
                        <div><strong>Average:</strong> {report.average}%</div>
                    </div>
                    <table className="w-full text-sm text-left border-collapse mb-6">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-2 border">Subject</th>
                                <th className="p-2 border text-center">CA (30%)</th>
                                <th className="p-2 border text-center">Exam (70%)</th>
                                <th className="p-2 border text-center">Total (100%)</th>
                                <th className="p-2 border text-center">Grade</th>
                                <th className="p-2 border text-center">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="text-black">
                            {Object.entries(report.subjects).map(([subject, scores]) => {
                                // Fix: Cast scores to GradeScore to access properties without TypeScript errors.
                                const gradeScores = scores as GradeScore;
                                const ca_total = (gradeScores.classAssignments || 0) + (gradeScores.project || 0);
                                const exam_total = (gradeScores.midterm || 0) + (gradeScores.endOfTerm || 0);
                                const final_total = ca_total + exam_total;
                                const gradeInfo = getGradeInfo(final_total);
                                return (
                                <tr key={subject} className="border-b">
                                    <td className="p-2 border font-medium">{subject}</td>
                                    <td className="p-2 border text-center">{ca_total}</td>
                                    <td className="p-2 border text-center">{exam_total}</td>
                                    <td className="p-2 border text-center font-semibold">{final_total}</td>
                                    <td className="p-2 border text-center">{gradeInfo.grade}</td>
                                    <td className="p-2 border text-center">{gradeInfo.remarks}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>

                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                            <h4 className="font-bold mb-2">Attendance Summary</h4>
                            <p>Present: {student.attendance.filter(a => a.status === 'Present').length} days</p>
                            <p>Absent: {student.attendance.filter(a => a.status === 'Absent').length} days</p>
                            <p>Late: {student.attendance.filter(a => a.status === 'Late').length} days</p>
                        </div>
                         <div>
                            <h4 className="font-bold mb-2">General Information</h4>
                            <p><strong>Positions Held:</strong> {student.positionsHeld.join(', ') || 'N/A'}</p>
                            <p><strong>Awards:</strong> {student.awards.join(', ') || 'N/A'}</p>
                            <p><strong>Interests/Clubs:</strong> {student.interests.join(', ') || 'N/A'}</p>
                        </div>
                         <div className="col-span-2">
                            <h4 className="font-bold mb-2">Teacher's Comments</h4>
                            <p className="border p-2 rounded bg-slate-50 min-h-[40px]">{report.teacherComment || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                            <h4 className="font-bold mb-2">Headteacher's Comments</h4>
                            <p className="border p-2 rounded bg-slate-50 min-h-[40px]">{report.headteacherComment || 'N/A'}</p>
                        </div>
                    </div>
                     <div className="mt-12 flex justify-between text-sm">
                        <span>_________________________ <br/> Teacher's Signature</span>
                        <span>_________________________ <br/> Headteacher's Signature</span>
                    </div>
                </div>
                <div className="flex justify-end space-x-4 mt-2 p-4 bg-slate-50 border-t rounded-b-lg no-print">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Close</button>
                    <button onClick={handleExport} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Export PDF</button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Print Report</button>
                </div>
            </div>
        </div>
    )
};


const StudentDetails: React.FC<{ 
    student: Student, 
    user: User,
    onBack: () => void, 
    onUpdateStudent: (student: Student) => void,
    onPromoteStudent: (studentId: string, newClass: string, isRepeating: boolean) => void;
    onArchiveStudent: (studentId: string) => void;
    onDeleteStudent: (studentId: string) => void;
    onAdminAccountChange: (userId: string, newUsername: string, newPassword?: string) => void;
    academicYear: string;
    currentTerm: string;
}> = ({ student, user, onBack, onUpdateStudent, onPromoteStudent, onArchiveStudent, onDeleteStudent, onAdminAccountChange, academicYear, currentTerm }) => {
    const age = new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear();
    const [activeTab, setActiveTab] = useState('profile');
    
    const [isEditing, setIsEditing] = useState(false);
    const [editableStudent, setEditableStudent] = useState<Student>(student);
    const [newNoteContent, setNewNoteContent] = useState('');
    
    const [reportToPrint, setReportToPrint] = useState<any | null>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const [isPromoteModalOpen, setPromoteModalOpen] = useState(false);
    const [isArchiveModalOpen, setArchiveModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isManageAccountModalOpen, setManageAccountModalOpen] = useState(false);
    
    const [docName, setDocName] = useState('');
    const docFileRef = useRef<HTMLInputElement>(null);

// Fix: Corrected typo from `usememo` to `useMemo`.
    const canPerformAdminActions = useMemo(() => user.role === Role.Admin || user.role === Role.Headteacher, [user.role]);
    const canEdit = useMemo(() => canPerformAdminActions || user.role === Role.Teacher, [canPerformAdminActions, user.role]);
    const financialsSummary = useMemo(() => calculateFinancials(student.financials), [student.financials]);

    useEffect(() => {
        setEditableStudent(student);
    }, [student]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditableStudent(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditableStudent(prev => ({...prev, photoUrl: reader.result as string}));
          };
          reader.readAsDataURL(file);
      }
    };

    const handleSaveProfile = () => {
        const interestsArray = typeof editableStudent.interests === 'string'
            ? (editableStudent.interests as string).split(',').map(i => i.trim()).filter(Boolean)
            : editableStudent.interests;
        const awardsArray = typeof editableStudent.awards === 'string'
            ? (editableStudent.awards as string).split(',').map(a => a.trim()).filter(Boolean)
            : editableStudent.awards;
        const positionsHeldArray = typeof editableStudent.positionsHeld === 'string'
            ? (editableStudent.positionsHeld as string).split(',').map(p => p.trim()).filter(Boolean)
            : editableStudent.positionsHeld;

        const finalStudent = { ...editableStudent, interests: interestsArray, awards: awardsArray, positionsHeld: positionsHeldArray };

        if (finalStudent.currentClass !== student.currentClass) {
            if (student.classHistory[student.classHistory.length - 1] !== finalStudent.currentClass) {
                finalStudent.classHistory = [...student.classHistory, finalStudent.currentClass];
            }
        }

        onUpdateStudent(finalStudent);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditableStudent(student);
        setIsEditing(false);
    };

    const handleAddNote = () => {
        if (!newNoteContent.trim()) return;
        const newNote: StudentNote = {
            date: new Date().toISOString().split('T')[0],
            author: user.name,
            content: newNoteContent.trim(),
        };
        onUpdateStudent({ ...student, privateNotes: [...student.privateNotes, newNote] });
        setNewNoteContent('');
    };
    
    const handleAddDocument = (e: React.FormEvent) => {
        e.preventDefault();
        const file = docFileRef.current?.files?.[0];
        if (!docName.trim() || !file) {
            alert("Please provide a document name and select a file.");
            return;
        }
        const newDoc: SchoolDocument = {
            name: docName,
            url: '#', // Placeholder URL
            date: new Date().toISOString().split('T')[0]
        };
        onUpdateStudent({ ...student, documents: [...(student.documents || []), newDoc]});
        setDocName('');
        if(docFileRef.current) docFileRef.current.value = '';
    };

    const renderField = (label: string, value: any, name: string, type = 'text', options: string[] = []) => (
        <div>
            <strong className="block mb-1 text-sm text-slate-600">{label}</strong>
            {isEditing ? (
                type === 'select' ? (
                     <select name={name} value={value} onChange={handleProfileChange} className="w-full p-2 border rounded-md border-slate-300 bg-white focus:ring-2 focus:ring-blue-500">
                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                ) : type === 'textarea' ? (
                     <textarea name={name} value={Array.isArray(value) ? value.join(', ') : value} onChange={handleProfileChange} className="w-full p-2 border rounded-md border-slate-300 bg-white focus:ring-2 focus:ring-blue-500" rows={2}/>
                ) : (
                    <input type={type} name={name} value={value} onChange={handleProfileChange} className="w-full p-2 border rounded-md border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"/>
                )
            ) : (
                <p className="p-2 bg-slate-50 rounded-md">{Array.isArray(value) ? value.join(', ') || 'N/A' : value}</p>
            )}
        </div>
    );

    const handleAddFeeItem = (feeItem: Omit<FeeItem, 'date'>) => {
        const newFeeItem: FeeItem = { ...feeItem, date: new Date().toISOString().split('T')[0] };
        const updatedStudent = {
            ...student,
            financials: {
                ...student.financials,
                feeItems: [...student.financials.feeItems, newFeeItem]
            }
        };
        onUpdateStudent(updatedStudent);
    };

    const handleApplyDiscount = (discount: Discount) => {
        const updatedStudent = {
            ...student,
            financials: {
                ...student.financials,
                discounts: [...student.financials.discounts, discount]
            }
        };
        onUpdateStudent(updatedStudent);
    };

    return (
        <>
        <div className="bg-white p-6 rounded-lg shadow-lg animate-fade-in">
             <div ref={profileRef} className="printable-content-wrapper">
                <button onClick={onBack} className="mb-4 text-blue-600 hover:underline no-print">&larr; Back to Student List</button>
                <div className="flex flex-col md:flex-row items-start md:space-x-8">
                    <div className="text-center mb-6 md:mb-0 relative">
                        <img src={isEditing ? editableStudent.photoUrl : student.photoUrl} alt={student.name} className="w-40 h-40 rounded-full object-cover mx-auto shadow-md" />
                        {isEditing && (
                            <div className="no-print">
                                <input type="file" accept="image/*" ref={photoInputRef} onChange={handlePhotoChange} className="hidden"/>
                                <button onClick={() => photoInputRef.current?.click()} className="mt-2 text-sm bg-slate-200 text-slate-700 px-3 py-1 rounded-md hover:bg-slate-300 transition-colors">Change Photo</button>
                            </div>
                        )}
                        <h2 className="text-2xl font-bold text-slate-800 mt-4">{isEditing ? <input type="text" name="name" value={editableStudent.name} onChange={handleProfileChange} className="w-full text-center p-1 border rounded-md border-slate-300 bg-white"/> : student.name}</h2>
                        <div className="text-slate-600 font-medium mt-1">
                            {isEditing ? 
                                <input type="text" name="id" value={editableStudent.id} onChange={handleProfileChange} className="w-full text-center font-mono p-1 border rounded-md border-slate-300 bg-white"/> 
                                : <span>Student ID: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{student.id}</span></span>
                            }
                        </div>
                        <p className="text-sm bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full inline-block mt-2">{student.currentClass}</p>
                         {student.status === 'archived' && <p className="text-sm bg-yellow-100 text-yellow-800 font-medium px-3 py-1 rounded-full inline-block mt-2 no-print">Archived</p>}
                    </div>
                    <div className="flex-1 w-full">
                        <div className="border-b border-slate-200 mb-4 no-print">
                            <nav className="flex space-x-2 sm:space-x-4 flex-wrap no-print">
                                <button onClick={() => setActiveTab('profile')} className={`py-2 px-1 font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500'}`}>Profile</button>
                                <button onClick={() => setActiveTab('academics')} className={`py-2 px-1 font-medium ${activeTab === 'academics' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500'}`}>Academics</button>
                                <button onClick={() => setActiveTab('financials')} className={`py-2 px-1 font-medium ${activeTab === 'financials' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500'}`}>Financials</button>
                                 <button onClick={() => setActiveTab('documents')} className={`py-2 px-1 font-medium ${activeTab === 'documents' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500'}`}>Documents</button>
                                {canEdit && <button onClick={() => setActiveTab('notes')} className={`py-2 px-1 font-medium ${activeTab === 'notes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500'}`}>Private Notes</button>}
                            </nav>
                        </div>
                        <div className={activeTab === 'profile' ? 'animate-fade-in' : 'hidden'}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-slate-800">Student Information</h3>
                                    <div className="space-x-2 no-print">
                                        {isEditing ? (
                                            <>
                                                <button onClick={handleSaveProfile} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors">Save</button>
                                                <button onClick={handleCancelEdit} className="bg-slate-500 text-white px-3 py-1 rounded-md text-sm hover:bg-slate-600 transition-colors">Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                {canEdit && <button onClick={() => setIsEditing(true)} className="bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm hover:bg-slate-300 transition-colors">Edit Profile</button>}
                                                <button onClick={() => exportToPdf(profileRef.current!, `Student_Profile_${student.id}`)} className="bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm hover:bg-slate-300 transition-colors">Export PDF</button>
                                                <button onClick={() => window.print()} className="bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm hover:bg-slate-300 transition-colors">Print Profile</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-slate-700">
                                    {renderField('Date of Birth', editableStudent.dateOfBirth, 'dateOfBirth', 'date')}
                                    {renderField('Gender', editableStudent.gender, 'gender', 'select', ['Male', 'Female'])}
                                    {renderField('Enrolment Date', editableStudent.enrolmentDate, 'enrolmentDate', 'date')}
                                    {renderField('Current Class', editableStudent.currentClass, 'currentClass', 'select', CLASSES)}
                                    {renderField("Guardian's Name", editableStudent.guardianName, 'guardianName')}
                                    {renderField("Guardian's Email", editableStudent.guardianEmail, 'guardianEmail', 'email')}
                                    {renderField("Guardian's Contact", editableStudent.guardianContact, 'guardianContact', 'tel')}
                                    <div className="sm:col-span-2">{renderField('Positions Held', editableStudent.positionsHeld, 'positionsHeld', 'textarea')}</div>
                                    <div className="sm:col-span-2">{renderField('Interests', editableStudent.interests, 'interests', 'textarea')}</div>
                                    <div className="sm:col-span-2">{renderField('Awards & Recognition', editableStudent.awards, 'awards', 'textarea')}</div>

                                    {!isEditing && (
                                        <div className="sm:col-span-2 no-print">
                                            <strong>Actions:</strong>
                                            <div className="mt-2 space-x-2">
                                                <a href={`sms:${student.guardianContact}`} className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-md hover:bg-slate-300 transition-colors">Send SMS to Guardian</a>
                                                <a href={`mailto:${student.guardianEmail}?subject=Message from ${SCHOOL_NAME}`} className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors">Send Email to Guardian</a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                 {canPerformAdminActions && student.status === 'active' && (
                                    <div className="border-t mt-6 pt-4 no-print">
                                        <h3 className="font-bold text-lg text-slate-800 mb-2">Administrative Actions</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => setPromoteModalOpen(true)} className="text-sm bg-indigo-500 text-white px-3 py-1.5 rounded-md hover:bg-indigo-600 transition-colors">Promote/Repeat Student</button>
                                            <button onClick={() => setManageAccountModalOpen(true)} className="text-sm bg-slate-600 text-white px-3 py-1.5 rounded-md hover:bg-slate-700 transition-colors">Manage Parent Account</button>
                                            <button onClick={() => setArchiveModalOpen(true)} className="text-sm bg-yellow-500 text-white px-3 py-1.5 rounded-md hover:bg-yellow-600 transition-colors">Archive Student</button>
                                            <button onClick={() => setDeleteModalOpen(true)} className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors">Delete Student</button>
                                        </div>
                                    </div>
                                )}
                        </div>

                        <div className={activeTab === 'academics' ? 'animate-fade-in no-print' : 'hidden no-print'}>
                                <h3 className="font-bold text-lg text-slate-800 mb-4">Academic Records</h3>
                                 {student.grades.map(grade => (
                                    <div key={grade.term} className="mb-6">
                                        <div className="flex justify-between items-baseline bg-slate-100 p-3 rounded-t-lg">
                                            <h4 className="font-bold text-slate-800">{grade.term}</h4>
                                            <div>
                                            <span className="text-sm text-black"><span className="font-semibold">Overall Average:</span> {grade.average}% | <span className="font-semibold">Position:</span> {grade.position}</span>
                                            <button onClick={() => setReportToPrint(grade)} className="ml-4 text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 no-print">View Report Card</button>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto border-x border-b rounded-b-lg">
                                            <table className="w-full text-sm">
                                                <thead className="text-left bg-slate-50 text-black">
                                                    <tr>
                                                        <th className="p-2 font-semibold">Subject</th>
                                                        <th className="p-2 font-semibold text-center">CA Total (30)</th>
                                                        <th className="p-2 font-semibold text-center">Exam Total (70)</th>
                                                        <th className="p-2 font-semibold text-center bg-slate-200">Final (100)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-black">
                                                    {Object.entries(grade.subjects).map(([subject, scores]) => {
                                                        // Fix: Cast scores to GradeScore to access properties without TypeScript errors.
                                                        const gradeScores = scores as GradeScore;
                                                        const ca_total = (gradeScores.classAssignments || 0) + (gradeScores.project || 0);
                                                        const exam_total = (gradeScores.midterm || 0) + (gradeScores.endOfTerm || 0);
                                                        const final_total = ca_total + exam_total;
                                                        return (
                                                            <tr key={subject} className="border-t">
                                                                <td className="p-2 font-medium">{subject}</td>
                                                                <td className="p-2 text-center font-semibold">{ca_total}</td>
                                                                <td className="p-2 text-center font-semibold">{exam_total}</td>
                                                                <td className="p-2 text-center font-bold bg-slate-100">{final_total}</td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                 ))}
                                 {student.grades.length === 0 && <p className="p-4 bg-white rounded-lg border text-slate-500">No academic records found for this student.</p>}
                        </div>
                        
                        <div className={activeTab === 'financials' ? 'animate-fade-in no-print' : 'hidden no-print'}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Side: Summary and Actions */}
                                    <div className="bg-slate-50 p-4 rounded-lg border text-black">
                                        <h3 className="font-bold text-lg text-black mb-4">Financial Overview</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-black">Total Bill:</span> <span className="font-semibold text-black">GHS {financialsSummary.totalFees.toFixed(2)}</span></div>
                                            <div className="flex justify-between"><span className="text-black">Discounts:</span> <span className="font-semibold text-black">- GHS {financialsSummary.totalDiscounts.toFixed(2)}</span></div>
                                            <div className="flex justify-between font-bold border-t pt-2"><span className="text-black">Net Bill:</span> <span className="text-black">GHS {(financialsSummary.totalFees - financialsSummary.totalDiscounts).toFixed(2)}</span></div>
                                            <div className="flex justify-between"><span className="text-black">Paid:</span> <span className="font-semibold text-black">GHS {financialsSummary.paid.toFixed(2)}</span></div>
                                            <div className={`flex justify-between font-bold text-lg border-t pt-2 mt-2`}><span className="text-black">Balance:</span> <span className="text-black">GHS {financialsSummary.balance.toFixed(2)}</span></div>
                                        </div>
                                        {canEdit && <div className="mt-6 space-y-2">
                                            <ManageFeeItemModal onSave={handleAddFeeItem} />
                                            <ManageDiscountModal onSave={handleApplyDiscount} />
                                        </div>}
                                    </div>

                                    {/* Right Side: Details */}
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold text-black mb-2">Fee Items</h4>
                                            <ul className="text-sm space-y-1">{student.financials.feeItems.map((item, i) => <li key={i} className="flex justify-between bg-white p-2 border rounded text-black"><span>{item.category}</span><span>{item.amount.toFixed(2)}</span></li>)}</ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-black mb-2">Discounts Applied</h4>
                                            <ul className="text-sm space-y-1">{student.financials.discounts.map((d, i) => <li key={i} className="flex justify-between bg-white p-2 border rounded text-black"><span>{d.type} {d.description ? `(${d.description})` : ''}</span><span className="text-black">- {d.amount.toFixed(2)}</span></li>)}</ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-black mb-2">Payment History</h4>
                                            <ul className="text-sm space-y-1">{student.financials.payments.map((p, i) => <li key={i} className="flex justify-between bg-white p-2 border rounded text-black"><span>{p.date} ({p.receipt})</span><span>{p.amount.toFixed(2)}</span></li>)}</ul>
                                        </div>
                                    </div>
                                </div>
                        </div>
                        
                        <div className={activeTab === 'documents' ? 'animate-fade-in no-print' : 'hidden no-print'}>
                                 <h3 className="font-bold text-lg text-slate-800 mb-4">Student Documents</h3>
                                 {canEdit && (
                                    <form onSubmit={handleAddDocument} className="mb-6 p-4 bg-slate-50 border rounded-lg flex items-end space-x-4">
                                        <div className="flex-grow">
                                            <label className="block text-sm font-medium text-slate-700">Document Name</label>
                                            <input type="text" value={docName} onChange={e => setDocName(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>
                                        </div>
                                         <div className="flex-grow">
                                            <label className="block text-sm font-medium text-slate-700">File</label>
                                            <input type="file" ref={docFileRef} className="mt-1 w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                        </div>
                                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Upload</button>
                                    </form>
                                 )}
                                 <div className="space-y-2">
                                    {student.documents && student.documents.length > 0 ? (
                                        student.documents.map((doc, i) => (
                                            <div key={i} className="flex justify-between items-center p-2 bg-white border rounded">
                                                <span>{doc.name}</span>
                                                <span className="text-sm text-slate-500">{doc.date}</span>
                                            </div>
                                        ))
                                    ) : <p className="text-slate-500">No documents uploaded.</p>}
                                 </div>
                        </div>
                         <div className={activeTab === 'notes' ? 'animate-fade-in no-print' : 'hidden no-print'}>
                            {/* Notes tab content */}
                        </div>

                    </div>
                </div>
            </div>
        </div>
        
        {isPromoteModalOpen && <PromoteStudentModal student={student} onClose={() => setPromoteModalOpen(false)} onSave={onPromoteStudent} />}
        {isArchiveModalOpen && (
            <ConfirmationModal
                title="Archive Student"
                message={<>Are you sure you want to archive <strong>{student.name}</strong>? This will hide them from the main list but their data will be preserved.</>}
                confirmText="Archive"
                confirmClass="bg-yellow-500 hover:bg-yellow-600"
                onConfirm={() => { onArchiveStudent(student.id); setArchiveModalOpen(false); }}
                onClose={() => setArchiveModalOpen(false)}
            />
        )}
        {isDeleteModalOpen && (
            <ConfirmationModal
                title="Delete Student"
                message={<>Are you sure you want to permanently delete <strong>{student.name}</strong>? This action cannot be undone.</>}
                confirmText="Delete"
                confirmClass="bg-red-600 hover:bg-red-700"
                onConfirm={() => { onDeleteStudent(student.id); setDeleteModalOpen(false); }}
                onClose={() => setDeleteModalOpen(false)}
            />
        )}
        {reportToPrint && <PrintableReportCardModal student={student} onClose={() => setReportToPrint(null)} academicYear={academicYear} currentTerm={currentTerm} />}
        {isManageAccountModalOpen && (
            <AdminManageAccountModal
                userToUpdate={{ id: student.id, name: student.guardianName, username: student.id }}
                isParent={true}
                onClose={() => setManageAccountModalOpen(false)}
                onSave={(userId, newUsername, newPassword) => {
                    onAdminAccountChange(userId, newUsername, newPassword);
                    setManageAccountModalOpen(false);
                }}
            />
        )}
        </>
    );
};

const ManageFeeItemModal: React.FC<{onSave: (feeItem: {category: string, amount: number}) => void}> = ({ onSave }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = () => {
        const numAmount = parseFloat(amount);
        if (category.trim() && !isNaN(numAmount) && numAmount > 0) {
            onSave({ category, amount: numAmount });
            setIsOpen(false);
            setCategory('');
            setAmount('');
        } else {
            alert('Please enter a valid category and amount.');
        }
    };

    return <>
        <button onClick={() => setIsOpen(true)} className="w-full text-sm bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition-colors">Add Fee Item</button>
        {isOpen && (
             <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm animate-fade-in-up">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Add Custom Fee Item</h2>
                    <div className="space-y-4">
                        <div><label className="text-sm">Category</label><input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 mt-1 border rounded"/></div>
                        <div><label className="text-sm">Amount</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 mt-1 border rounded"/></div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg">Cancel</button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add Fee</button>
                    </div>
                </div>
            </div>
        )}
    </>
}

const ManageDiscountModal: React.FC<{ onSave: (discount: Discount) => void }> = ({ onSave }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<DiscountType>('Sibling');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        const numAmount = parseFloat(amount);
        if (type && !isNaN(numAmount) && numAmount > 0) {
            onSave({ type, amount: numAmount, description });
            setIsOpen(false);
            setAmount('');
            setDescription('');
        } else {
            alert('Please select a type and enter a valid amount.');
        }
    };
    
    return <>
        <button onClick={() => setIsOpen(true)} className="w-full text-sm bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 transition-colors">Apply Discount</button>
        {isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm animate-fade-in-up">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Apply Discount</h2>
                    <div className="space-y-4">
                        <div><label className="text-sm">Discount Type</label><select value={type} onChange={e => setType(e.target.value as DiscountType)} className="w-full p-2 mt-1 border rounded">{DISCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label className="text-sm">Amount</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 mt-1 border rounded"/></div>
                        <div><label className="text-sm">Description (Optional)</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 mt-1 border rounded"/></div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg">Cancel</button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Apply Discount</button>
                    </div>
                </div>
            </div>
        )}
    </>
}

export const Students: React.FC<{ 
    user: User, 
    students: Student[], 
    onUpdateStudent: (student: Student) => void, 
    onAddStudent: (student: Student) => void, 
    onDeleteStudent: (studentId: string) => void,
    onAdminAccountChange: (userId: string, newUsername: string, newPassword?: string) => void,
    academicYear: string, 
    currentTerm: string 
}> = ({ user, students: allStudents, onUpdateStudent, onAddStudent, onDeleteStudent, onAdminAccountChange, academicYear, currentTerm }) => {
    const [students, setStudents] = useState<Student[]>(allStudents);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('All');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

    useEffect(() => {
        setStudents(allStudents);
    }, [allStudents]);

    const handlePromoteStudent = (studentId: string, newClass: string, isRepeating: boolean) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            const classHistory = isRepeating ? student.classHistory : [...student.classHistory, newClass];
            onUpdateStudent({ ...student, currentClass: newClass, classHistory });
        }
    };
    
    const handleArchiveStudent = (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) onUpdateStudent({ ...student, status: 'archived' });
        setSelectedStudent(null);
    };

    const handleAddStudent = (newStudentData: Omit<Student, 'id' | 'classHistory' | 'positionsHeld' | 'interests' | 'awards' | 'financials' | 'attendance' | 'grades' | 'privateNotes' | 'status' | 'documents'>) => {
        const newStudent: Student = {
            ...newStudentData,
            id: generateNewStudentId(newStudentData.enrolmentDate, students),
            classHistory: [newStudentData.currentClass],
            positionsHeld: [],
            interests: [],
            awards: [],
            financials: { feeItems: [], discounts: [], payments: [] },
            attendance: [],
            grades: [],
            privateNotes: [],
            documents: [],
            status: 'active',
        };
        onAddStudent(newStudent);
        setAddModalOpen(false);
    };
    
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesStatus = student.status === viewMode;
            const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesClass = selectedClass === 'All' || student.currentClass === selectedClass;
            return matchesStatus && matchesSearch && matchesClass;
        });
    }, [students, viewMode, searchTerm, selectedClass]);


    if (selectedStudent) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <StudentDetails 
                    user={user} 
                    student={selectedStudent} 
                    onBack={() => setSelectedStudent(null)} 
                    onUpdateStudent={onUpdateStudent}
                    onPromoteStudent={handlePromoteStudent}
                    onArchiveStudent={handleArchiveStudent}
                    onDeleteStudent={onDeleteStudent}
                    onAdminAccountChange={onAdminAccountChange}
                    academicYear={academicYear}
                    currentTerm={currentTerm}
                />
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Student Management</h1>
                 <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 rounded-lg bg-slate-200 p-1">
                        <button onClick={() => setViewMode('active')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'active' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-slate-300'}`}>Active</button>
                        <button onClick={() => setViewMode('archived')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'archived' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-slate-300'}`}>Archived</button>
                    </div>
                    {user.role !== Role.SMCChair && <button onClick={() => setAddModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Add New Student</button>}
                </div>
            </div>
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <input 
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select 
                    value={selectedClass} 
                    onChange={e => setSelectedClass(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="All">All Classes</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStudents.map(student => (
                    <StudentCard key={student.id} student={student} onSelect={setSelectedStudent} onDeleteRequest={setStudentToDelete} />
                ))}
            </div>
             {filteredStudents.length === 0 && <p className="text-center text-slate-500 mt-8">No {viewMode} students found.</p>}
            {isAddModalOpen && <AddStudentModal onClose={() => setAddModalOpen(false)} onSave={handleAddStudent} students={students} />}
            {studentToDelete && (
                <ConfirmationModal
                    title="Delete Student"
                    message={<>Are you sure you want to permanently delete <strong>{studentToDelete.name}</strong>? This action cannot be undone.</>}
                    confirmText="Delete"
                    confirmClass="bg-red-600 hover:bg-red-700"
                    onConfirm={() => {
                        onDeleteStudent(studentToDelete.id);
                        setStudentToDelete(null);
                    }}
                    onClose={() => setStudentToDelete(null)}
                />
            )}
        </div>
    );
};
