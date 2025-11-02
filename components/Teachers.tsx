
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Staff, User, Role, StaffCategory, SchoolDocument, Settings } from '../types';
import { mockStaff } from '../data/mockData';
import { AdminManageAccountModal } from './Settings';
import { CLASSES } from '../constants';

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

const animationStyle = { animation: 'fade-in-up 0.3s ease-out forwards' };
const keyframes = `
    @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const ConfirmationModal: React.FC<{
    title: string;
    message: React.ReactNode;
    confirmText: string;
    confirmClass: string;
    onConfirm: () => void;
    onClose: () => void;
}> = ({ title, message, onConfirm, onClose, confirmText, confirmClass }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <style>{keyframes}</style>
        <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm" style={animationStyle}>
            <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
            <div className="text-slate-600 mb-6">{message}</div>
            <div className="flex justify-end space-x-4">
                <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
                <button onClick={onConfirm} className={`px-4 py-2 text-white rounded-lg transition-colors ${confirmClass}`}>{confirmText}</button>
            </div>
        </div>
    </div>
);


const StaffCard: React.FC<{ staff: Staff, onSelect: (staff: Staff) => void }> = ({ staff, onSelect }) => (
    <div onClick={() => onSelect(staff)} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer flex items-center space-x-4">
        <img src={staff.photoUrl} alt={staff.name} className="w-16 h-16 rounded-full object-cover" />
        <div>
            <p className="font-bold text-slate-800">{staff.name}</p>
            <p className="text-sm text-slate-500">{staff.staffNumber}</p>
            <p className="text-sm text-blue-600 font-medium">{staff.assignedClass || staff.assignedSubjects?.join(', ')}</p>
        </div>
    </div>
);

const StaffDetails: React.FC<{ 
    staff: Staff, 
    user: User, 
    users: User[],
    settings: Settings,
    onBack: () => void, 
    onUpdate: (staff: Staff) => void, 
    onArchive: (staffId: string) => void,
    onDelete: (staffId: string) => void,
    onAdminAccountChange: (userId: string, newUsername: string, newPassword?: string) => void;
}> = ({ staff, user, users, settings, onBack, onUpdate, onArchive, onDelete, onAdminAccountChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableStaff, setEditableStaff] = useState<Staff>(staff);
    const profileRef = useRef<HTMLDivElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const [isArchiveModalOpen, setArchiveModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isManageAccountModalOpen, setManageAccountModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const [docName, setDocName] = useState('');
    const docFileRef = useRef<HTMLInputElement>(null);

    const userAccount = useMemo(() => users.find(u => u.staffId === staff.id), [users, staff.id]);
    const canPerformAdminActions = useMemo(() => user.role === Role.Admin || user.role === Role.Headteacher, [user.role]);

    useEffect(() => { setEditableStaff(staff); }, [staff]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('emergencyContact.')) {
            const field = name.split('.')[1] as 'name' | 'phone';
            setEditableStaff(prev => ({
                ...prev,
                emergencyContact: { ...prev.emergencyContact, [field]: value }
            }));
        } else if (name === 'assignedClass' && value === 'None') {
            setEditableStaff(prev => ({ ...prev, assignedClass: undefined }));
        } else {
            setEditableStaff(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditableStaff(prev => ({...prev, photoUrl: reader.result as string}));
          };
          reader.readAsDataURL(file);
      }
    };

    const handleSubjectAssignmentChange = (subject: string, isChecked: boolean) => {
        setEditableStaff(prev => {
            const currentSubjects = prev.assignedSubjects || [];
            const newSubjects = isChecked
                ? [...currentSubjects, subject]
                : currentSubjects.filter(s => s !== subject);
            return { ...prev, assignedSubjects: newSubjects.sort() };
        });
    };
    
    const handleSave = () => {
        const qualificationsArray = typeof editableStaff.qualifications === 'string'
            ? (editableStaff.qualifications as string).split(',').map(q => q.trim()).filter(Boolean)
            : editableStaff.qualifications;
        const schoolRolesArray = typeof editableStaff.schoolRoles === 'string'
            ? (editableStaff.schoolRoles as string).split(',').map(q => q.trim()).filter(Boolean)
            : editableStaff.schoolRoles;

        onUpdate({ ...editableStaff, qualifications: qualificationsArray, schoolRoles: schoolRolesArray });
        setIsEditing(false);
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
        const updatedStaff = {...staff, documents: [...(staff.documents || []), newDoc] };
        onUpdate(updatedStaff);
        setDocName('');
        if(docFileRef.current) docFileRef.current.value = '';
    };

    const renderField = (label: string, value: any, name: string, type: 'text' | 'textarea' | 'number' | 'email' | 'tel' | 'select' = 'text', options: string[] = []) => (
         <div>
            <strong className="block mb-1 text-sm text-slate-600">{label}</strong>
            {isEditing ? (
                 type === 'textarea' ?
                 <textarea name={name} value={Array.isArray(value) ? value.join(', ') : value} onChange={handleChange} className="w-full p-2 border rounded-md border-slate-300 bg-white focus:ring-2 focus:ring-blue-500" rows={2}/>
                 : type === 'select' ?
                 <select name={name} value={value} onChange={handleChange} className="w-full p-2 border rounded-md border-slate-300 bg-white focus:ring-2 focus:ring-blue-500">{options.map(o => <option key={o} value={o}>{o}</option>)}</select>
                 : <input type={type} name={name} value={value} onChange={handleChange} className="w-full p-2 border rounded-md border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"/>
            ) : (
                <p className="p-2 bg-slate-50 rounded-md min-h-[40px]">{Array.isArray(value) ? value.join(', ') || 'N/A' : value}</p>
            )}
        </div>
    );

    const generateUsername = (name: string) => {
        const nameParts = name.toLowerCase().split(' ').filter(Boolean);
        if (nameParts.length > 1) {
            return `${nameParts[0][0]}.${nameParts[nameParts.length - 1]}`;
        } else if (nameParts.length === 1) {
            return nameParts[0];
        }
        return 'new.user';
    };
    const userForModal = userAccount || { id: `new_for_${staff.id}`, name: staff.name, username: generateUsername(staff.name) };
    
    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-lg animate-fade-in">
                 <div ref={profileRef} className="printable-content-wrapper">
                    <button onClick={onBack} className="mb-4 text-blue-600 hover:underline no-print">&larr; Back to Staff List</button>
                    <div className="flex flex-col md:flex-row items-start md:space-x-8">
                        <div className="text-center mb-6 md:mb-0">
                            <img src={isEditing ? editableStaff.photoUrl : staff.photoUrl} alt={staff.name} className="w-40 h-40 rounded-full object-cover mx-auto shadow-md" />
                            {isEditing && (
                                <div className="no-print">
                                    <input type="file" accept="image/*" ref={photoInputRef} onChange={handlePhotoChange} className="hidden"/>
                                    <button onClick={() => photoInputRef.current?.click()} className="mt-2 text-sm bg-slate-200 text-slate-700 px-3 py-1 rounded-md hover:bg-slate-300 transition-colors">Change Photo</button>
                                </div>
                            )}
                            <h2 className="text-2xl font-bold text-slate-800 mt-4">{staff.name}</h2>
                             <div className="text-slate-600 font-medium mt-1">
                                {isEditing ? 
                                    <input type="text" name="staffNumber" value={editableStaff.staffNumber} onChange={handleChange} className="w-full text-center font-mono p-1 border rounded-md border-slate-300 bg-white"/> 
                                    : <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{staff.staffNumber}</span>
                                }
                            </div>
                            <p className="text-sm bg-indigo-100 text-indigo-800 font-medium px-3 py-1 rounded-full inline-block mt-2">{staff.category}</p>
                            {staff.status === 'archived' && <p className="text-sm bg-yellow-100 text-yellow-800 font-medium px-3 py-1 rounded-full inline-block mt-2 no-print">Archived</p>}
                        </div>
                        <div className="flex-1 w-full">
                            <div className="border-b border-slate-200 mb-4 no-print">
                                <nav className="flex space-x-4 no-print">
                                    <button onClick={() => setActiveTab('profile')} className={`py-2 px-1 font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500'}`}>Profile</button>
                                    <button onClick={() => setActiveTab('documents')} className={`py-2 px-1 font-medium ${activeTab === 'documents' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500'}`}>Documents</button>
                                </nav>
                            </div>
                             <div className={activeTab === 'profile' ? 'animate-fade-in' : 'hidden'}>
                                <div className="flex justify-between items-center pb-2 flex-wrap gap-2 mb-4">
                                    <h3 className="font-bold text-lg text-slate-800">Profile Information</h3>
                                    <div className="space-x-2 no-print">
                                        {isEditing ? (
                                            <><button onClick={handleSave} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600">Save</button><button onClick={() => setIsEditing(false)} className="bg-slate-500 text-white px-3 py-1 rounded-md text-sm hover:bg-slate-600">Cancel</button></>
                                        ) : (
                                            <>
                                            <button onClick={() => setIsEditing(true)} className="bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm hover:bg-slate-300">Edit Profile</button>
                                            <button onClick={() => exportToPdf(profileRef.current!, `Staff_Profile_${staff.id}`)} className="bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm hover:bg-slate-300">Export PDF</button>
                                            <button onClick={() => window.print()} className="bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm hover:bg-slate-300">Print Profile</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
                                   {renderField('Full Name', editableStaff.name, 'name')}
                                   {renderField('Email Address', editableStaff.email, 'email', 'email')}
                                   {renderField('Contact Number', editableStaff.contact, 'contact', 'tel')}
                                   {renderField('Year of Employment', editableStaff.employmentYear, 'employmentYear', 'number')}
                                   {renderField('Employment Type', editableStaff.employmentType, 'employmentType', 'select', ['Full-time', 'Part-time', 'Volunteer'])}
                                   <div className="sm:col-span-2">{renderField('Qualifications', editableStaff.qualifications, 'qualifications', 'textarea')}</div>
                                   {renderField("Emergency Contact Name", editableStaff.emergencyContact.name, 'emergencyContact.name')}
                                   {renderField("Emergency Contact Phone", editableStaff.emergencyContact.phone, 'emergencyContact.phone', 'tel')}
                                   <div className="sm:col-span-2">{renderField('Assigned School Roles', editableStaff.schoolRoles, 'schoolRoles', 'textarea')}</div>

                                    {editableStaff.category === StaffCategory.Teaching && (
                                        <>
                                            <div className="sm:col-span-2"><hr className="my-2" /></div>
                                            
                                            {/* Assigned Class */}
                                            {renderField('Assigned Class', editableStaff.assignedClass || 'None', 'assignedClass', 'select', ['None', ...CLASSES])}

                                            {/* Assigned Subjects */}
                                            <div className="sm:col-span-2">
                                                <strong className="block mb-1 text-sm text-slate-600">Assigned Subjects</strong>
                                                {isEditing ? (
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 border rounded-md max-h-40 overflow-y-auto bg-white">
                                                        {settings.schoolSubjects.map(subject => (
                                                            <label key={subject} className="flex items-center text-sm">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editableStaff.assignedSubjects?.includes(subject) || false}
                                                                    onChange={(e) => handleSubjectAssignmentChange(subject, e.target.checked)}
                                                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"
                                                                />
                                                                {subject}
                                                            </label>
                                                        ))}
                                                    </div>
                                                ) : (
                                                <p className="p-2 bg-slate-50 rounded-md min-h-[40px]">{editableStaff.assignedSubjects?.join(', ') || 'N/A'}</p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                                {canPerformAdminActions && (
                                    <div className="border-t mt-6 pt-4 no-print">
                                        <h3 className="font-bold text-lg text-slate-800 mb-2">Administrative Actions</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => setManageAccountModalOpen(true)} className="text-sm bg-slate-600 text-white px-3 py-1.5 rounded-md hover:bg-slate-700 transition-colors">{userAccount ? 'Manage Account' : 'Create Account'}</button>
                                            {staff.status === 'active' &&
                                                <>
                                                    <button onClick={() => setArchiveModalOpen(true)} className="text-sm bg-yellow-500 text-white px-3 py-1.5 rounded-md hover:bg-yellow-600">Archive</button>
                                                    <button onClick={() => setDeleteModalOpen(true)} className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700">Delete</button>
                                                </>
                                            }
                                        </div>
                                    </div>
                                )}
                             </div>
                             <div className={activeTab === 'documents' ? 'animate-fade-in no-print' : 'hidden no-print'}>
                                 <h3 className="font-bold text-lg text-slate-800 mb-4">Staff Documents</h3>
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
                                 <div className="space-y-2">
                                    {editableStaff.documents && editableStaff.documents.length > 0 ? (
                                        editableStaff.documents.map((doc, i) => (
                                            <div key={i} className="flex justify-between items-center p-2 bg-white border rounded">
                                                <span>{doc.name}</span>
                                                <span className="text-sm text-slate-500">{doc.date}</span>
                                            </div>
                                        ))
                                    ) : <p className="text-slate-500">No documents uploaded.</p>}
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            {isArchiveModalOpen && (
                <ConfirmationModal
                    title="Archive Staff Member"
                    message={<>Are you sure you want to archive <strong>{staff.name}</strong>? Their profile will be hidden from the main list but can be viewed in the archives.</>}
                    confirmText="Archive"
                    confirmClass="bg-yellow-500 hover:bg-yellow-600"
                    onConfirm={() => { onArchive(staff.id); setArchiveModalOpen(false); }}
                    onClose={() => setArchiveModalOpen(false)}
                />
            )}
             {isDeleteModalOpen && (
                <ConfirmationModal
                    title="Delete Staff Member"
                    message={<>Are you sure you want to permanently delete <strong>{staff.name}</strong>? This action cannot be undone.</>}
                    confirmText="Delete"
                    confirmClass="bg-red-600 hover:bg-red-700"
                    onConfirm={() => { onDelete(staff.id); setDeleteModalOpen(false); }}
                    onClose={() => setDeleteModalOpen(false)}
                />
            )}
            {isManageAccountModalOpen && (
                <AdminManageAccountModal
                    userToUpdate={userForModal}
                    isParent={false}
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

const AddStaffModal: React.FC<{
    onClose: () => void,
    onAddStaff: (staff: Omit<Staff, 'id' | 'staffNumber'>, user: Omit<User, 'id'>, password: string) => void;
    allStaff: Staff[];
}> = ({ onClose, onAddStaff, allStaff }) => {
    const [newStaff, setNewStaff] = useState<Partial<Staff>>({
        category: StaffCategory.Teaching,
        employmentType: 'Full-time',
        employmentYear: new Date().getFullYear(),
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewStaff(prev => ({...prev, [name]: value}));
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setNewStaff(prev => ({...prev, photoUrl: reader.result as string}));
          };
          reader.readAsDataURL(file);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, email, category } = newStaff;
        if (!name || !email || !category) {
            alert("Name, Email, and Category are required.");
            return;
        }

        // Generate username (e.g., j.doe)
        const nameParts = name.toLowerCase().split(' ');
        const username = nameParts.length > 1 
            ? `${nameParts[0][0]}.${nameParts[nameParts.length - 1]}` 
            : nameParts[0];

        // Default password for new staff: Password@123
        const password = 'Password@123';

        const user: Omit<User, 'id'> = {
            username,
            name: name,
            role: category === StaffCategory.Teaching ? Role.Teacher : Role.Admin, // Simplified role assignment
        };

        const finalStaff = {
            ...newStaff,
            photoUrl: newStaff.photoUrl || DEFAULT_AVATAR_URL,
            documents: [],
            status: 'active',
        } as Omit<Staff, 'id' | 'staffNumber'>;

        onAddStaff(finalStaff, user, password);
        onClose();
    }

    return (
        <Modal title="Add New Staff Member">
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg">
                    <img src={newStaff.photoUrl || DEFAULT_AVATAR_URL} alt="Staff" className="w-24 h-24 rounded-full object-cover bg-slate-200" />
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm bg-slate-200 text-slate-700 px-3 py-1 rounded-md">Upload Photo</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" onChange={handleChange} placeholder="Full Name*" required className="p-2 border rounded"/>
                    <input name="email" type="email" onChange={handleChange} placeholder="Email Address*" required className="p-2 border rounded"/>
                    <select name="category" value={newStaff.category} onChange={handleChange} className="p-2 border rounded">
                        {Object.values(StaffCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                     <select name="employmentType" value={newStaff.employmentType} onChange={handleChange} className="p-2 border rounded">
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Volunteer">Volunteer</option>
                    </select>
                    <input name="contact" onChange={handleChange} placeholder="Contact Number" className="p-2 border rounded"/>
                    <input name="employmentYear" type="number" value={newStaff.employmentYear} onChange={handleChange} placeholder="Employment Year" className="p-2 border rounded"/>
                    <textarea name="qualifications" onChange={handleChange} placeholder="Qualifications (comma-separated)" className="md:col-span-2 p-2 border rounded" />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add Staff</button>
                </div>
            </form>
        </Modal>
    )
}

const Modal: React.FC<{ children: React.ReactNode; title: string; }> = ({ children, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
        <style>{keyframes}</style>
        <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl" style={animationStyle}>
            <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
            {children}
        </div>
    </div>
);

export const StaffPage: React.FC<{ 
    user: User, 
    staff: Staff[], 
    users: User[],
    settings: Settings,
    onUpdateStaff: (staff: Staff) => void, 
    onAddStaffAndUser: any,
    onDeleteStaff: (staffId: string) => void,
    onAdminAccountChange: (userId: string, newUsername: string, newPassword?: string) => void;
}> = ({ user, staff, users, settings, onUpdateStaff, onAddStaffAndUser, onDeleteStaff, onAdminAccountChange }) => {
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');
    const [activeCategory, setActiveCategory] = useState<StaffCategory>(StaffCategory.Teaching);
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    const handleArchiveStaff = (staffId: string) => {
        const staffToUpdate = staff.find(s => s.id === staffId);
        if (staffToUpdate) {
            onUpdateStaff({ ...staffToUpdate, status: 'archived' });
        }
        setSelectedStaff(null);
    };

     const handleDeleteStaff = (staffId: string) => {
        onDeleteStaff(staffId);
        setSelectedStaff(null);
    };
    
    const filteredStaff = useMemo(() => {
        return staff.filter(s => s.status === viewMode && s.category === activeCategory);
    }, [staff, viewMode, activeCategory]);

    if (selectedStaff) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <StaffDetails 
                    user={user} 
                    staff={selectedStaff} 
                    users={users}
                    settings={settings}
                    onBack={() => setSelectedStaff(null)} 
                    onUpdate={onUpdateStaff} 
                    onArchive={handleArchiveStaff} 
                    onDelete={handleDeleteStaff}
                    onAdminAccountChange={onAdminAccountChange} 
                />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Staff Management</h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 rounded-lg bg-slate-200 p-1">
                        <button onClick={() => setViewMode('active')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'active' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-slate-300'}`}>Active</button>
                        <button onClick={() => setViewMode('archived')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'archived' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-slate-300'}`}>Archived</button>
                    </div>
                    <button onClick={() => setAddModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Add New Staff</button>
                </div>
            </div>

            <div className="border-b border-slate-200 mb-6">
                <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto">
                    {Object.values(StaffCategory).map(category => (
                        <button key={category} onClick={() => setActiveCategory(category)} className={`py-2 px-2 sm:px-1 font-medium whitespace-nowrap ${activeCategory === category ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500'}`}>{category}</button>
                    ))}
                </nav>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStaff.map(s => (
                    <StaffCard key={s.id} staff={s} onSelect={setSelectedStaff} />
                ))}
            </div>
            {filteredStaff.length === 0 && <p className="text-center text-slate-500 mt-8">No {viewMode} staff found in this category.</p>}
            {isAddModalOpen && <AddStaffModal onClose={() => setAddModalOpen(false)} onAddStaff={onAddStaffAndUser} allStaff={staff} />}
        </div>
    );
};