
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Student, StudentNote, User, Role } from '../types';
import { mockStudents } from '../data/mockData';
import { CLASSES, SCHOOL_LOGO_URL, SCHOOL_NAME, SUBJECTS, SUBJECTS_JUNIOR } from '../constants';

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
                    <button onClick={handleSave} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">Confirm Action</button>
                </div>
            </div>
        </div>
    );
};


const AddStudentModal: React.FC<{
  onClose: () => void;
  onSave: (newStudentData: {
    name: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female';
    guardianName: string;
    guardianContact: string;
    guardianEmail: string;
    enrolmentDate: string;
    currentClass: string;
    photoUrl: string | null;
  }) => void;
  nextId: string;
}> = ({ onClose, onSave, nextId }) => {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [guardianName, setGuardianName] = useState('');
  const [guardianContact, setGuardianContact] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [currentClass, setCurrentClass] = useState(CLASSES[0]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const enrolmentDate = new Date().toISOString().split('T')[0];

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
    if (!name || !dateOfBirth || !guardianName || !guardianContact || !currentClass) {
        alert("Please fill all required fields.");
        return;
    }
    onSave({ name, dateOfBirth, gender, guardianName, guardianContact, guardianEmail, enrolmentDate, currentClass, photoUrl });
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
                        <label className="block text-sm font-medium text-slate-700">Student ID</label>
                        <input type="text" value={nextId} readOnly className="mt-1 w-full p-2 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Enrolment Date</label>
                        <input type="date" value={enrolmentDate} readOnly className="mt-1 w-full p-2 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Full Name*</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Date of Birth*</label>
                        <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Gender*</label>
                        <select value={gender} onChange={e => setGender(e.target.value as 'Male' | 'Female')} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Current Class*</label>
                        <select value={currentClass} onChange={e => setCurrentClass(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                      <hr className="my-2"/>
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Guardian's Full Name*</label>
                        <input type="text" value={guardianName} onChange={e => setGuardianName(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Guardian's Contact Number*</label>
                        <input type="tel" placeholder='e.g. 024-123-4567' value={guardianContact} onChange={e => setGuardianContact(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Guardian's Email</label>
                        <input type="email" placeholder='e.g. guardian@example.com' value={guardianEmail} onChange={e => setGuardianEmail(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">Save Student</button>
                </div>
            </form>
        </div>
    </div>
  );
};

const StudentCard: React.FC<{ student: Student, onSelect: (student: Student) => void }> = ({ student, onSelect }) => (
    <div onClick={() => onSelect(student)} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer flex items-center space-x-4">
        <img src={student.photoUrl} alt={student.name} className="w-16 h-16 rounded-full object-cover" />
        <div>
            <p className="font-bold text-slate-800">{student.name}</p>
            <p className="text-sm text-slate-500">{student.id}</p>
            <p className="text-sm text-slate-500">{student.currentClass}</p>
        </div>
    </div>
);

const PrintableReportCardModal: React.FC<{
    report: any;
    student: Student;
    onClose: () => void;
}> = ({ report, student, onClose }) => {
    const reportCardRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        document.body.classList.add('printing-modal');
        const printableContent = reportCardRef.current?.innerHTML;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printableContent || '';
        window.print();
        document.body.innerHTML = originalContent;
        // This is a bit of a hack to re-attach the React app
        window.location.reload();
    };

    const handleExport = () => {
        if(reportCardRef.current) {
            exportToPdf(reportCardRef.current, `Report_Card_${student.id}_${report.term.replace(/\s/g, '_')}`);
        }
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 printing-modal">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl animate-fade-in-up">
                <div ref={reportCardRef} className="p-8">
                     {/* Report Card Content */}
                    <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                        <img src={SCHOOL_LOGO_URL} alt="School Logo" className="w-20 h-20 mx-auto mb-2" />
                        <h1 className="text-3xl font-bold text-slate-800">{SCHOOL_NAME}</h1>
                        <p className="text-lg font-semibold text-slate-600">Terminal Report Card</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                        <div><strong>Student:</strong> {student.name}</div>
                        <div><strong>Student ID:</strong> {student.id}</div>
                        <div><strong>Class:</strong> {student.currentClass}</div>
                        <div><strong>Term:</strong> {report.term}</div>
                        <div><strong>Position:</strong> {report.position}</div>
                        <div><strong>Average:</strong> {report.average}%</div>
                    </div>
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-2 border">Subject</th>
                                <th className="p-2 border text-center">CA (30%)</th>
                                <th className="p-2 border text-center">Exam (70%)</th>
                                <th className="p-2 border text-center">Total (100%)</th>
                                <th className="p-2 border text-center">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(report.subjects).map(([subject, scores]: [string, any]) =>(
                                <tr key={subject} className="border-b">
                                    <td className="p-2 border font-medium">{subject}</td>
                                    <td className="p-2 border text-center">{scores.ca}</td>
                                    <td className="p-2 border text-center">{scores.exam}</td>
                                    <td className="p-2 border text-center font-semibold">{scores.total}</td>
                                    <td className="p-2 border text-center">{scores.total >= 80 ? 'Excellent' : scores.total >= 70 ? 'Very Good' : scores.total >= 60 ? 'Good' : scores.total >= 50 ? 'Credit' : 'Needs Improvement'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-8 text-sm space-y-4">
                        <div><strong>Teacher's Comments:</strong> ________________________________________________________________</div>
                        <div><strong>Headteacher's Comments:</strong> _____________________________________________________________</div>
                    </div>
                     <div className="mt-12 flex justify-between text-sm">
                        <span>_________________________ <br/> Teacher's Signature</span>
                        <span>_________________________ <br/> Headteacher's Signature</span>
                    </div>
                </div>
                <div className="flex justify-end space-x-4 mt-2 p-4 bg-slate-50 border-t rounded-b-lg no-print">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Close</button>
                    <button onClick={handleExport} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Export PDF</button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">Print Report</button>
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
}> = ({ student, user, onBack, onUpdateStudent, onPromoteStudent, onArchiveStudent, onDeleteStudent }) => {
    const age = new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear();
    const [activeTab, setActiveTab] = useState('profile');
    
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [receiptNumber, setReceiptNumber] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [editableStudent, setEditableStudent] = useState<Student>(student);
    const [newNoteContent, setNewNoteContent] = useState('');
    
    const [isAddingScores, setIsAddingScores] = useState(false);
    const [newTermName, setNewTermName] = useState('');
    const [newScores, setNewScores] = useState<{ [subject: string]: { ca: string; exam: string } }>({});
    
    const [reportToPrint, setReportToPrint] = useState<any | null>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const [isPromoteModalOpen, setPromoteModalOpen] = useState(false);
    const [isArchiveModalOpen, setArchiveModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const canPerformAdminActions = useMemo(() => user.role === Role.Admin || user.role === Role.Headteacher, [user.role]);
    const canEdit = useMemo(() => canPerformAdminActions || user.role === Role.Teacher, [canPerformAdminActions, user.role]);
    const isViewOnly = useMemo(() => user.role === Role.SMCChair, [user.role]);


    useEffect(() => {
        setEditableStudent(student);
    }, [student]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditableStudent(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = () => {
        const interestsArray = typeof editableStudent.interests === 'string'
            ? (editableStudent.interests as string).split(',').map(i => i.trim()).filter(Boolean)
            : editableStudent.interests;
        const awardsArray = typeof editableStudent.awards === 'string'
            ? (editableStudent.awards as string).split(',').map(a => a.trim()).filter(Boolean)
            : editableStudent.awards;

        const finalStudent = { ...editableStudent, interests: interestsArray, awards: awardsArray };

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

    const sortedPayments = useMemo(() => 
        [...student.financials.payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [student.financials.payments]);

    const handleAddPayment = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(paymentAmount);
        if (!paymentDate || isNaN(amount) || amount <= 0 || !receiptNumber.trim()) {
            alert('Please fill all fields with valid data.');
            return;
        }

        const newPayment = { date: paymentDate, amount, receipt: receiptNumber.trim() };
        const updatedFinancials = {
            ...student.financials,
            paid: student.financials.paid + amount,
            balance: student.financials.balance - amount,
            payments: [...student.financials.payments, newPayment]
        };
        onUpdateStudent({ ...student, financials: updatedFinancials });
        setPaymentAmount('');
        setReceiptNumber('');
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

    const handleScoreChange = (subject: string, type: 'ca' | 'exam', value: string) => {
        const max = type === 'ca' ? 30 : 70;
        const numValue = parseInt(value, 10);
        if (numValue > max) return;
        
        setNewScores(prev => ({
            ...prev,
            [subject]: {
                ...prev[subject],
                [type]: value,
            },
        }));
    };

    const handleSaveScores = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTermName.trim()) {
            alert('Please enter a term name.');
            return;
        }
        const subjectsWithScores: { [subject: string]: { ca: number; exam: number; total: number } } = {};
        let totalScoreSum = 0;
        let subjectCount = 0;
        Object.keys(newScores).forEach(subject => {
            const ca = parseInt(newScores[subject].ca || '0', 10);
            const exam = parseInt(newScores[subject].exam || '0', 10);
            if (ca > 0 || exam > 0) {
                const total = ca + exam;
                subjectsWithScores[subject] = { ca, exam, total };
                totalScoreSum += total;
                subjectCount++;
            }
        });
        if (subjectCount === 0) {
            alert('Please enter scores for at least one subject.');
            return;
        }
        const average = parseFloat((totalScoreSum / subjectCount).toFixed(2));
        const newGradeEntry = {
            term: newTermName.trim(),
            subjects: subjectsWithScores,
            average,
            position: 0, // Position calculation is complex and requires whole class data
        };
        const updatedGrades = [...student.grades, newGradeEntry];
        onUpdateStudent({ ...student, grades: updatedGrades });
        setIsAddingScores(false);
        setNewTermName('');
        setNewScores({});
    };

    const isJunior = CLASSES.indexOf(student.currentClass) < 11;
    const relevantSubjects = isJunior ? SUBJECTS_JUNIOR : SUBJECTS;

    return (
        <>
        <div ref={profileRef} className="bg-white p-6 rounded-lg shadow-lg animate-fade-in">
            <button onClick={onBack} className="mb-4 text-sky-600 hover:underline no-print">&larr; Back to Student List</button>
            <div className="flex flex-col md:flex-row items-start md:space-x-8">
                <div className="text-center mb-6 md:mb-0">
                    <img src={student.photoUrl} alt={student.name} className="w-40 h-40 rounded-full object-cover mx-auto shadow-md" />
                    <h2 className="text-2xl font-bold text-slate-800 mt-4">{student.name}</h2>
                    <p className="text-slate-600 font-medium mt-1">Student ID: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{student.id}</span></p>
                    <p className="text-sm bg-sky-100 text-sky-800 font-medium px-3 py-1 rounded-full inline-block mt-2">{student.currentClass}</p>
                     {student.status === 'archived' && <p className="text-sm bg-yellow-100 text-yellow-800 font-medium px-3 py-1 rounded-full inline-block mt-2">Archived</p>}
                </div>
                <div className="flex-1 w-full">
                    <div className="border-b border-slate-200 mb-4 no-print">
                        <nav className="flex space-x-4">
                            <button onClick={() => setActiveTab('profile')} className={`py-2 px-1 font-medium ${activeTab === 'profile' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500'}`}>Profile</button>
                            <button onClick={() => setActiveTab('academics')} className={`py-2 px-1 font-medium ${activeTab === 'academics' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500'}`}>Academics</button>
                            <button onClick={() => setActiveTab('attendance')} className={`py-2 px-1 font-medium ${activeTab === 'attendance' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500'}`}>Attendance</button>
                            <button onClick={() => setActiveTab('financials')} className={`py-2 px-1 font-medium ${activeTab === 'financials' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500'}`}>Financials</button>
                            {canEdit && <button onClick={() => setActiveTab('notes')} className={`py-2 px-1 font-medium ${activeTab === 'notes' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500'}`}>Private Notes</button>}
                        </nav>
                    </div>
                    {activeTab === 'profile' && (
                         <div className="animate-fade-in">
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
                                <div><strong>Date of Birth:</strong> {student.dateOfBirth} ({age} years)</div>
                                <div><strong>Gender:</strong> {student.gender}</div>
                                <div><strong>Enrolment Date:</strong> {student.enrolmentDate}</div>
                                <div>
                                    <strong className="block mb-1">Current Class:</strong>
                                    {isEditing ? (
                                        <select name="currentClass" value={editableStudent.currentClass} onChange={handleProfileChange} className="w-full p-1 border rounded-md border-slate-300">
                                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    ) : student.currentClass}
                                </div>
                                <div><strong>Guardian:</strong> {student.guardianName}</div>
                                <div>
                                    <strong className="block mb-1">Guardian Email:</strong>
                                    {isEditing ? <input type="email" name="guardianEmail" value={editableStudent.guardianEmail} onChange={handleProfileChange} className="w-full p-1 border rounded-md border-slate-300"/> : student.guardianEmail}
                                </div>
                                <div>
                                    <strong className="block mb-1">Guardian Contact:</strong>
                                    {isEditing ? <input type="text" name="guardianContact" value={editableStudent.guardianContact} onChange={handleProfileChange} className="w-full p-1 border rounded-md border-slate-300"/> : student.guardianContact}
                                    {!isEditing && (
                                        <div className="mt-2 space-x-2 no-print">
                                            <a href={`sms:${student.guardianContact}`} className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-md hover:bg-slate-300 transition-colors">Send SMS</a>
                                            <a href={`mailto:${student.guardianEmail}?subject=Message from ${SCHOOL_NAME}`} className="text-xs bg-sky-100 text-sky-800 px-3 py-1 rounded-md hover:bg-sky-200 transition-colors">Send Email</a>
                                        </div>
                                    )}
                                </div>
                                <div><strong>Positions Held:</strong> {student.positionsHeld.join(', ') || 'N/A'}</div>
                                <div className="sm:col-span-2">
                                    <strong className="block mb-1">Interests:</strong>
                                    {isEditing ? <textarea name="interests" value={Array.isArray(editableStudent.interests) ? editableStudent.interests.join(', ') : editableStudent.interests} onChange={handleProfileChange} className="w-full p-1 border rounded-md border-slate-300" rows={2}/> : student.interests.join(', ') || 'N/A'}
                                </div>
                                <div className="sm:col-span-2">
                                    <strong className="block mb-1">Awards & Recognition:</strong>
                                    {isEditing ? <textarea name="awards" value={Array.isArray(editableStudent.awards) ? editableStudent.awards.join(', ') : editableStudent.awards} onChange={handleProfileChange} className="w-full p-1 border rounded-md border-slate-300" rows={2}/> : student.awards.join(', ') || 'N/A'}
                                </div>
                            </div>
                             {canPerformAdminActions && student.status === 'active' && (
                                <div className="border-t mt-6 pt-4 no-print">
                                    <h3 className="font-bold text-lg text-slate-800 mb-2">Administrative Actions</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => setPromoteModalOpen(true)} className="text-sm bg-indigo-500 text-white px-3 py-1.5 rounded-md hover:bg-indigo-600 transition-colors">Promote / Repeat</button>
                                        <button onClick={() => setArchiveModalOpen(true)} className="text-sm bg-yellow-500 text-white px-3 py-1.5 rounded-md hover:bg-yellow-600 transition-colors">Archive Student</button>
                                        <button onClick={() => setDeleteModalOpen(true)} className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors">Delete Student</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                     {activeTab === 'academics' && (
                        <div className="animate-fade-in">
                            <h3 className="font-bold text-lg mb-2 text-slate-800">Class History</h3>
                            <p className="text-slate-600 mb-4">{student.classHistory.join(' -> ')}</p>
                            <h3 className="font-bold text-lg mb-2 text-slate-800">Term Reports</h3>
                             {student.grades.length > 0 ? student.grades.map(grade => (
                                <div key={grade.term} className="border rounded-lg p-4 mb-4">
                                     <div className="flex justify-between items-start">
                                        <p className="font-semibold">{grade.term} - Average: {grade.average}%, Position: {grade.position}</p>
                                        <div className="space-x-2 no-print">
                                            <button onClick={() => setReportToPrint(grade)} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300">Print/Export</button>
                                        </div>
                                     </div>
                                     <div className="overflow-x-auto mt-2">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="p-2">Subject</th>
                                                    <th className="p-2">CA (30%)</th>
                                                    <th className="p-2">Exam (70%)</th>
                                                    <th className="p-2">Total (100%)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(grade.subjects).map(([subject, scores]) =>(
                                                    <tr key={subject} className="border-b last:border-b-0">
                                                        <td className="p-2 font-medium">{subject}</td>
                                                        <td className="p-2">{scores.ca}</td>
                                                        <td className="p-2">{scores.exam}</td>
                                                        <td className="p-2 font-semibold">{scores.total}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                     </div>
                                </div>
                            )) : <p className="text-slate-500">No academic records found.</p>}

                             <div className="mt-6 no-print">
                                {!isViewOnly && (isAddingScores ? (
                                    <form onSubmit={handleSaveScores} className="p-4 border rounded-lg bg-slate-50">
                                        <h4 className="font-bold text-md mb-4 text-slate-700">New Term Report</h4>
                                        <input 
                                            type="text"
                                            value={newTermName}
                                            onChange={e => setNewTermName(e.target.value)}
                                            placeholder="Term Name (e.g. First Term 2024)"
                                            required
                                            className="w-full md:w-1/2 p-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        />
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-200">
                                                    <tr>
                                                        <th className="p-2 text-left">Subject</th>
                                                        <th className="p-2 text-left">CA (30)</th>
                                                        <th className="p-2 text-left">Exam (70)</th>
                                                        <th className="p-2 text-left">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {relevantSubjects.map(subject => (
                                                        <tr key={subject} className="border-b">
                                                            <td className="p-2 font-medium text-slate-800">{subject}</td>
                                                            <td className="p-2">
                                                                <input type="number" value={newScores[subject]?.ca || ''} onChange={e => handleScoreChange(subject, 'ca', e.target.value)} max="30" className="w-20 p-1 border rounded-md border-slate-300"/>
                                                            </td>
                                                            <td className="p-2">
                                                                <input type="number" value={newScores[subject]?.exam || ''} onChange={e => handleScoreChange(subject, 'exam', e.target.value)} max="70" className="w-20 p-1 border rounded-md border-slate-300"/>
                                                            </td>
                                                            <td className="p-2 font-semibold">
                                                                {(parseInt(newScores[subject]?.ca || '0') || 0) + (parseInt(newScores[subject]?.exam || '0') || 0)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex justify-end space-x-2 mt-4">
                                            <button type="button" onClick={() => setIsAddingScores(false)} className="px-3 py-1 bg-slate-200 text-slate-800 rounded-md text-sm hover:bg-slate-300 transition-colors">Cancel</button>
                                            <button type="submit" className="px-3 py-1 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700 transition-colors">Save Scores</button>
                                        </div>
                                    </form>
                                ) : (
                                    <button onClick={() => setIsAddingScores(true)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors">Add New Term Report</button>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'attendance' && (
                        <div className="animate-fade-in">
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Attendance History</h3>
                            <div className="max-h-96 overflow-y-auto pr-2 border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student.attendance.length > 0 ? [...student.attendance].reverse().map((att, index) => (
                                            <tr key={index} className="border-b last:border-b-0">
                                                <td className="p-3 font-medium text-slate-700">{att.date}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        att.status === 'Present' ? 'bg-green-100 text-green-800' :
                                                        att.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>{att.status}</span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={2} className="text-center p-4 text-slate-500">No attendance records found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'financials' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex flex-col md:flex-row justify-around bg-slate-50 p-4 rounded-lg gap-4">
                                <div className="text-center"><p className="text-sm text-slate-500">Total Fees</p><p className="font-bold text-2xl text-blue-600">GHS {student.financials.totalFees.toFixed(2)}</p></div>
                                <div className="text-center"><p className="text-sm text-slate-500">Total Paid</p><p className="font-bold text-2xl text-green-600">GHS {student.financials.paid.toFixed(2)}</p></div>
                                <div className="text-center"><p className="text-sm text-slate-500">Balance Outstanding</p><p className="font-bold text-2xl text-red-600">GHS {student.financials.balance.toFixed(2)}</p></div>
                            </div>
                            
                            {!isViewOnly && <div className="no-print">
                                <h3 className="font-bold text-lg text-slate-800 mb-2">Add New Payment</h3>
                                <form onSubmit={handleAddPayment} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white p-4 rounded-lg border">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700" htmlFor="payment-date">Date</label>
                                        <input id="payment-date" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700" htmlFor="payment-amount">Amount</label>
                                        <input id="payment-amount" type="number" placeholder="0.00" step="0.01" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700" htmlFor="receipt-number">Receipt Number</label>
                                        <input id="receipt-number" type="text" value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                    </div>
                                    <button type="submit" className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors h-fit">Add Payment</button>
                                </form>
                            </div>}

                            <div>
                                <h3 className="font-bold text-lg mb-2 text-slate-800">Payment History</h3>
                                <div className="max-h-60 overflow-y-auto pr-2 bg-slate-50 p-2 rounded-lg border">
                                    {sortedPayments.length > 0 ? (
                                        <ul className="space-y-2">
                                            {sortedPayments.map(p => (
                                                <li key={p.receipt} className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm">
                                                    <div>
                                                        <p className="font-medium text-slate-800">GHS {p.amount.toFixed(2)}</p>
                                                        <p className="text-xs text-slate-500">{p.date}</p>
                                                    </div>
                                                    <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">Receipt: {p.receipt}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-slate-500 text-center p-4">No payment history found.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'notes' && (
                        <div className="animate-fade-in">
                            <h3 className="font-bold text-lg text-slate-800 mb-4">Private Notes</h3>
                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 border-b pb-4">
                                {student.privateNotes.length > 0 ? [...student.privateNotes].reverse().map((note, index) => (
                                    <div key={index} className="p-3 bg-slate-50 rounded-lg border">
                                        <p className="text-slate-700 whitespace-pre-wrap">{note.content}</p>
                                        <p className="text-xs text-slate-500 text-right mt-1">- {note.author} on {note.date}</p>
                                    </div>
                                )) : (
                                    <p className="text-slate-500">No private notes for this student.</p>
                                )}
                            </div>
                            <div className="no-print">
                                <h4 className="font-semibold text-slate-800 mb-2">Add a New Note</h4>
                                <textarea
                                    value={newNoteContent}
                                    onChange={e => setNewNoteContent(e.target.value)}
                                    placeholder="Add a private note..."
                                    className="w-full p-2 border border-slate-300 rounded-lg h-20 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    rows={3}
                                />
                                <div className="flex justify-end mt-2">
                                    <button onClick={handleAddNote} className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors text-sm">Add Note</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        {reportToPrint && <PrintableReportCardModal report={reportToPrint} student={student} onClose={() => setReportToPrint(null)} />}
        {isPromoteModalOpen && <PromoteStudentModal student={student} onClose={() => setPromoteModalOpen(false)} onSave={(...args) => { onPromoteStudent(...args); setPromoteModalOpen(false); }} />}
        {isArchiveModalOpen && <ConfirmationModal title="Archive Student" message={<>Are you sure you want to archive <strong>{student.name}</strong>? Their profile will be hidden from the main list but can be viewed in the archives.</>} confirmText="Archive" confirmClass="bg-yellow-500 hover:bg-yellow-600" onConfirm={() => { onArchiveStudent(student.id); setArchiveModalOpen(false); }} onClose={() => setArchiveModalOpen(false)} />}
        {isDeleteModalOpen && <ConfirmationModal title="Delete Student" message={<>Are you sure you want to permanently delete the record for <strong>{student.name}</strong>? This action cannot be undone.</>} confirmText="Delete" confirmClass="bg-red-600 hover:bg-red-700" onConfirm={() => { onDeleteStudent(student.id); setDeleteModalOpen(false); }} onClose={() => setDeleteModalOpen(false)} />}
        </>
    );
};


export const Students: React.FC<{ user: User }> = ({ user }) => {
    const [students, setStudents] = useState<Student[]>(mockStudents);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('All');
    const [sortOption, setSortOption] = useState<'name' | 'id' | 'class'>('name');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [filterGender, setFilterGender] = useState('All');
    const [filterDobStart, setFilterDobStart] = useState('');
    const [filterDobEnd, setFilterDobEnd] = useState('');
    const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');

    const canAddStudent = useMemo(() => user.role === Role.Admin || user.role === Role.Headteacher || user.role === Role.Teacher, [user.role]);
    
    const filteredStudents = useMemo(() => {
        let results = students.filter(student => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const matchesSearch = 
                student.name.toLowerCase().includes(lowerSearchTerm) || 
                student.id.toLowerCase().includes(lowerSearchTerm) ||
                student.guardianName.toLowerCase().includes(lowerSearchTerm) ||
                student.enrolmentDate.includes(searchTerm);
            const matchesClass = selectedClass === 'All' || student.currentClass === selectedClass;
            const matchesGender = filterGender === 'All' || student.gender === filterGender;
            const matchesStatus = student.status === viewMode;

            let matchesDob = true;
            if (filterDobStart && filterDobEnd) {
                matchesDob = student.dateOfBirth >= filterDobStart && student.dateOfBirth <= filterDobEnd;
            } else if (filterDobStart) {
                matchesDob = student.dateOfBirth >= filterDobStart;
            } else if (filterDobEnd) {
                matchesDob = student.dateOfBirth <= filterDobEnd;
            }
            
            return matchesSearch && matchesClass && matchesGender && matchesDob && matchesStatus;
        });

        results.sort((a, b) => {
            switch (sortOption) {
                case 'id':
                    return a.id.localeCompare(b.id);
                case 'class':
                    return CLASSES.indexOf(a.currentClass) - CLASSES.indexOf(b.currentClass);
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });
        
        return results;
    }, [searchTerm, selectedClass, students, sortOption, filterGender, filterDobStart, filterDobEnd, viewMode]);

    const generateNewStudentId = useCallback(() => {
        const year = new Date().getFullYear();
        const nextSequence = students.length; 
        return `CCS${year}${nextSequence.toString().padStart(3, '0')}`;
    }, [students]);

    const handleAddStudent = useCallback((newStudentData: Omit<Student, 'id' | 'classHistory' | 'positionsHeld' | 'interests' | 'awards' | 'financials' | 'attendance' | 'grades' | 'privateNotes' | 'status' | 'parentPasswordHash'> & { photoUrl: string | null }) => {
        const newStudent: Student = {
            name: newStudentData.name,
            dateOfBirth: newStudentData.dateOfBirth,
            gender: newStudentData.gender,
            guardianName: newStudentData.guardianName,
            guardianContact: newStudentData.guardianContact,
            guardianEmail: newStudentData.guardianEmail,
            enrolmentDate: newStudentData.enrolmentDate,
            currentClass: newStudentData.currentClass,
            id: generateNewStudentId(),
            photoUrl: newStudentData.photoUrl || DEFAULT_AVATAR_URL,
            classHistory: [newStudentData.currentClass],
            positionsHeld: [],
            interests: [],
            awards: [],
            financials: {
                totalFees: 700 + Math.floor(Math.random() * 200),
                paid: 0,
                balance: 0,
                payments: [],
            },
            attendance: [],
            grades: [],
            privateNotes: [],
            status: 'active',
            parentPasswordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // Default: 'password'
        };
        newStudent.financials.balance = newStudent.financials.totalFees;

        setStudents(prev => [...prev, newStudent].sort((a,b) => a.name.localeCompare(b.name)));
        setIsAddModalOpen(false);
    }, [students, generateNewStudentId]);
    
    const handleUpdateStudent = (updatedStudent: Student) => {
        setStudents(prevStudents => 
            prevStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s)
        );
        setSelectedStudent(updatedStudent);
    };

    const handleDeleteStudent = (studentId: string) => {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        setSelectedStudent(null);
    };
    const handleArchiveStudent = (studentId: string) => {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'archived' } : s));
        setSelectedStudent(null);
    };
    const handlePromoteStudent = (studentId: string, newClass: string, isRepeating: boolean) => {
         setStudents(prevStudents => {
            const newStudents = prevStudents.map(s => {
                if (s.id === studentId) {
                    const updatedStudent = { ...s, currentClass: newClass };
                    if (!isRepeating && !updatedStudent.classHistory.includes(newClass)) {
                        updatedStudent.classHistory = [...updatedStudent.classHistory, newClass];
                    }
                    // Update the selected student in the details view immediately
                    setSelectedStudent(updatedStudent);
                    return updatedStudent;
                }
                return s;
            });
            return newStudents;
        });
    };
    
    if (selectedStudent) {
        return <StudentDetails 
            user={user}
            student={selectedStudent} 
            onBack={() => setSelectedStudent(null)} 
            onUpdateStudent={handleUpdateStudent}
            onPromoteStudent={handlePromoteStudent}
            onArchiveStudent={handleArchiveStudent}
            onDeleteStudent={handleDeleteStudent}
        />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                 <h1 className="text-3xl font-bold text-slate-800">Student Management</h1>
                 <div className="flex items-center space-x-2 rounded-lg bg-slate-200 p-1">
                    <button onClick={() => setViewMode('active')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'active' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-slate-300'}`}>Active</button>
                    <button onClick={() => setViewMode('archived')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'archived' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-slate-300'}`}>Archived</button>
                </div>
            </div>
           
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <input 
                    type="text"
                    placeholder="Search by name, ID, guardian..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 lg:col-span-2"
                />
                <select 
                    value={selectedClass} 
                    onChange={e => setSelectedClass(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                    <option value="All">All Classes</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                    value={filterGender} 
                    onChange={e => setFilterGender(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                    <option value="All">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                 <select 
                    value={sortOption} 
                    onChange={e => setSortOption(e.target.value as 'name' | 'id' | 'class')}
                    className="p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                    <option value="name">Sort by Name</option>
                    <option value="id">Sort by ID</option>
                    <option value="class">Sort by Class</option>
                </select>
                <div className="flex items-center space-x-2 lg:col-span-2">
                    <label className="text-sm text-slate-600">DOB:</label>
                    <input 
                        type="date"
                        value={filterDobStart}
                        onChange={e => setFilterDobStart(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        title="Date of Birth (Start)"
                    />
                    <span className="text-slate-500">-</span>
                    <input 
                        type="date"
                        value={filterDobEnd}
                        onChange={e => setFilterDobEnd(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        title="Date of Birth (End)"
                    />
                </div>
                <div className="lg:col-span-2"></div>
                {canAddStudent && <button onClick={() => setIsAddModalOpen(true)} className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors whitespace-nowrap h-full">Add New Student</button>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStudents.map(student => (
                    <StudentCard key={student.id} student={student} onSelect={setSelectedStudent} />
                ))}
            </div>
            {filteredStudents.length === 0 && <p className="text-center text-slate-500 mt-8">No {viewMode} students found.</p>}

            {isAddModalOpen && (
                <AddStudentModal 
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddStudent}
                    nextId={generateNewStudentId()}
                />
            )}
        </div>
    );
};
