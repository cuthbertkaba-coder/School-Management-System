

import React, { useState, useEffect, useRef } from 'react';
import { Teacher, User, Role } from '../types';
import { mockTeachers } from '../data/mockData';
import { CLASSES_JUNIOR, SUBJECTS, SCHOOL_ROLES, SCHOOL_NAME } from '../constants';

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

const Modal: React.FC<{ children: React.ReactNode; title: string; }> = ({ children, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
        <style>{keyframes}</style>
        <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg" style={animationStyle}>
            <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
            {children}
        </div>
    </div>
);

const AssignRoleModal: React.FC<{ teacher: Teacher, onClose: () => void, onSave: (teacher: Teacher) => void }> = ({ teacher, onClose, onSave }) => {
    const [roleType, setRoleType] = useState<'class' | 'subjects'>(teacher.assignedClass ? 'class' : (teacher.assignedSubjects?.length ? 'subjects' : 'class'));
    const [classSelection, setClassSelection] = useState(teacher.assignedClass || '');
    const [subjectSelection, setSubjectSelection] = useState<Set<string>>(new Set(teacher.assignedSubjects || []));

    const handleSubjectChange = (subject: string) => {
        const newSelection = new Set(subjectSelection);
        newSelection.has(subject) ? newSelection.delete(subject) : newSelection.add(subject);
        setSubjectSelection(newSelection);
    };

    const handleSave = () => {
        const updatedTeacher = { ...teacher };
        if (roleType === 'class') {
            updatedTeacher.assignedClass = classSelection;
            delete updatedTeacher.assignedSubjects;
        } else {
            updatedTeacher.assignedSubjects = Array.from(subjectSelection);
            delete updatedTeacher.assignedClass;
        }
        onSave(updatedTeacher);
    };

    return (
        <Modal title={`Assign Teaching Role for ${teacher.name}`}>
            <div className="space-y-4">
                <fieldset className="border border-slate-200 p-3 rounded-lg">
                    <legend className="text-sm font-medium text-slate-600 px-1">Role Type</legend>
                    <div className="flex space-x-4">
                        <label className="flex items-center cursor-pointer"><input type="radio" name="roleType" value="class" checked={roleType === 'class'} onChange={() => setRoleType('class')} className="mr-2 h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300" />Class Teacher (Creche - Basic 6)</label>
                        <label className="flex items-center cursor-pointer"><input type="radio" name="roleType" value="subjects" checked={roleType === 'subjects'} onChange={() => setRoleType('subjects')} className="mr-2 h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300" />Subject Teacher (Basic 7 - 9)</label>
                    </div>
                </fieldset>
                {roleType === 'class' ? (
                    <div>
                        <label htmlFor="class-select" className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
                        <select id="class-select" value={classSelection} onChange={e => setClassSelection(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"><option value="" disabled>-- Select a class --</option>{CLASSES_JUNIOR.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Subjects</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-3 rounded-lg max-h-48 overflow-y-auto bg-slate-50">{SUBJECTS.map(s => (<label key={s} className="flex items-center text-sm cursor-pointer p-1 rounded hover:bg-slate-200"><input type="checkbox" checked={subjectSelection.has(s)} onChange={() => handleSubjectChange(s)} className="mr-2 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />{s}</label>))}</div>
                    </div>
                )}
            </div>
            <div className="flex justify-end space-x-4 mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={roleType === 'class' && !classSelection} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">Save Assignment</button>
            </div>
        </Modal>
    );
};

const AssignSchoolRoleModal: React.FC<{ teacher: Teacher; onClose: () => void; onSave: (roles: string[]) => void; }> = ({ teacher, onClose, onSave }) => {
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set(teacher.schoolRoles || []));
    const handleRoleChange = (role: string) => {
        const newSelection = new Set(selectedRoles);
        newSelection.has(role) ? newSelection.delete(role) : newSelection.add(role);
        setSelectedRoles(newSelection);
    };
    return (
        <Modal title={`Assign School Roles for ${teacher.name}`}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-3 rounded-lg max-h-60 overflow-y-auto bg-slate-50">
                {SCHOOL_ROLES.map(role => (
                    <label key={role} className="flex items-center text-sm cursor-pointer p-1 rounded hover:bg-slate-200">
                        <input type="checkbox" checked={selectedRoles.has(role)} onChange={() => handleRoleChange(role)} className="mr-2 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                        {role}
                    </label>
                ))}
            </div>
            <div className="flex justify-end space-x-4 mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
                <button onClick={() => onSave(Array.from(selectedRoles))} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">Save Roles</button>
            </div>
        </Modal>
    );
};

const UploadDocumentModal: React.FC<{ onClose: () => void; onSave: (doc: { name: string; url: string; date: string }) => void; }> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !file) {
            alert("Please provide a document name and select a file.");
            return;
        }
        onSave({ name: name.trim(), url: '#', date: new Date().toISOString().split('T')[0] });
    };
    return (
        <Modal title="Upload New Document">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Document Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">File</label>
                    <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} required className="mt-1 w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">Upload</button>
                </div>
            </form>
        </Modal>
    );
};

const TeacherCard: React.FC<{ teacher: Teacher, onSelect: (teacher: Teacher) => void }> = ({ teacher, onSelect }) => (
    <div onClick={() => onSelect(teacher)} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer flex items-center space-x-4">
        <img src={teacher.photoUrl} alt={teacher.name} className="w-16 h-16 rounded-full object-cover" />
        <div>
            <p className="font-bold text-slate-800">{teacher.name}</p>
            <p className="text-sm text-slate-500">{teacher.staffNumber}</p>
            <p className="text-sm text-sky-600 font-medium">{teacher.assignedClass || teacher.assignedSubjects?.join(', ')}</p>
        </div>
    </div>
);

const TeacherDetails: React.FC<{ teacher: Teacher, user: User, onBack: () => void, onUpdate: (teacher: Teacher) => void, onArchive: (teacherId: string) => void, onOpenAssignModal: () => void, onOpenSchoolRoleModal: () => void, onOpenUploadModal: () => void }> = ({ teacher, user, onBack, onUpdate, onArchive, onOpenAssignModal, onOpenSchoolRoleModal, onOpenUploadModal }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableTeacher, setEditableTeacher] = useState<Teacher>(teacher);
    const profileRef = useRef<HTMLDivElement>(null);
    const [isArchiveModalOpen, setArchiveModalOpen] = useState(false);

    useEffect(() => { setEditableTeacher(teacher); }, [teacher]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditableTeacher(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = () => {
        const qualificationsArray = typeof editableTeacher.qualifications === 'string'
            ? (editableTeacher.qualifications as string).split(',').map(q => q.trim()).filter(Boolean)
            : editableTeacher.qualifications;
        onUpdate({ ...editableTeacher, qualifications: qualificationsArray });
        setIsEditing(false);
    };
    
    return (
        <>
            <div ref={profileRef} className="bg-white p-6 rounded-lg shadow-lg animate-fade-in">
                <button onClick={onBack} className="mb-4 text-sky-600 hover:underline no-print">&larr; Back to Teacher List</button>
                <div className="flex flex-col md:flex-row items-start md:space-x-8">
                    <div className="text-center mb-6 md:mb-0">
                        <img src={teacher.photoUrl} alt={teacher.name} className="w-40 h-40 rounded-full object-cover mx-auto shadow-md" />
                        <h2 className="text-2xl font-bold text-slate-800 mt-4">{teacher.name}</h2>
                        <p className="text-slate-600">{teacher.staffNumber}</p>
                        {teacher.status === 'archived' && <p className="text-sm bg-yellow-100 text-yellow-800 font-medium px-3 py-1 rounded-full inline-block mt-2">Archived</p>}
                    </div>
                    <div className="flex-1 w-full space-y-4">
                        <div className="flex justify-between items-center border-b pb-2 flex-wrap gap-2">
                            <h3 className="font-bold text-lg text-slate-800">Profile Information</h3>
                            <div className="space-x-2 no-print">
                                {isEditing ? (
                                    <><button onClick={handleSave} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600">Save</button><button onClick={() => setIsEditing(false)} className="bg-slate-500 text-white px-3 py-1 rounded-md text-sm hover:bg-slate-600">Cancel</button></>
                                ) : (
                                    <>
                                    <button onClick={() => setIsEditing(true)} className="bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm hover:bg-slate-300">Edit Profile</button>
                                    <button onClick={() => exportToPdf(profileRef.current!, `Teacher_Profile_${teacher.id}`)} className="bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm hover:bg-slate-300">Export PDF</button>
                                    <button onClick={() => window.print()} className="bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm hover:bg-slate-300">Print</button>
                                    {(user.role === Role.Admin || user.role === Role.Headteacher) && teacher.status === 'active' && (
                                        <button onClick={() => setArchiveModalOpen(true)} className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600">Archive</button>
                                    )}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
                            <div><strong>Year of Employment:</strong> {teacher.employmentYear}</div>
                            <div>
                                <strong>Email:</strong>
                                {isEditing ? <input type="email" name="email" value={editableTeacher.email} onChange={handleChange} className="w-full p-1 border rounded-md mt-1 border-slate-300"/> : ` ${teacher.email}`}
                            </div>
                            <div>
                                <strong>Contact:</strong>
                                {isEditing ? <input name="contact" value={editableTeacher.contact} onChange={handleChange} className="w-full p-1 border rounded-md mt-1 border-slate-300"/> : ` ${teacher.contact}`}
                                {!isEditing && (
                                    <div className="mt-2 space-x-2 no-print">
                                        <a href={`sms:${teacher.contact}`} className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-md hover:bg-slate-300 transition-colors">Send SMS</a>
                                        <a href={`mailto:${teacher.email}?subject=Message from ${SCHOOL_NAME}`} className="text-xs bg-sky-100 text-sky-800 px-3 py-1 rounded-md hover:bg-sky-200 transition-colors">Send Email</a>
                                    </div>
                                )}
                            </div>
                            <div className="sm:col-span-2"><strong>Qualifications:</strong>{isEditing ? <textarea name="qualifications" value={Array.isArray(editableTeacher.qualifications) ? editableTeacher.qualifications.join(', ') : editableTeacher.qualifications} onChange={handleChange} className="w-full p-1 border rounded-md mt-1 border-slate-300" rows={2}/> : ` ${teacher.qualifications.join(', ')}`}</div>
                            <div><strong>Emergency Contact:</strong> {teacher.emergencyContact.name} ({teacher.emergencyContact.phone})</div>
                        </div>
                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg text-slate-800">Roles & Responsibilities</h3>
                                <div className="space-x-2 no-print">
                                    <button onClick={onOpenAssignModal} className="bg-sky-500 text-white px-3 py-1 rounded-md text-sm hover:bg-sky-600">Assign Teaching Role</button>
                                    <button onClick={onOpenSchoolRoleModal} className="bg-teal-500 text-white px-3 py-1 rounded-md text-sm hover:bg-teal-600">Assign School Role</button>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border">
                                <p><strong>Teaching Role:</strong> <span className="font-medium text-sky-700">{teacher.assignedClass ? ` Class Teacher for ${teacher.assignedClass}` : teacher.assignedSubjects?.length ? ` Subject Teacher for ${teacher.assignedSubjects?.join(', ')}` : 'Not Assigned'}</span></p>
                                <p><strong>School Roles:</strong> <span className="font-medium text-teal-700">{teacher.schoolRoles?.join(', ') || 'N/A'}</span></p>
                            </div>
                        </div>
                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg text-slate-800">Uploaded Documents</h3>
                                <button onClick={onOpenUploadModal} className="bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm hover:bg-slate-300 no-print">Upload Document</button>
                            </div>
                            <ul className="space-y-2">{teacher.documents.map(doc => (<li key={doc.name} className="flex justify-between items-center p-2 bg-slate-50 rounded border"><span>{doc.name} (Uploaded: {doc.date})</span><a href={doc.url} className="text-sky-600 hover:underline text-sm">View</a></li>))}</ul>
                        </div>
                    </div>
                </div>
            </div>
            {isArchiveModalOpen && (
                <ConfirmationModal
                    title="Archive Teacher"
                    message={<>Are you sure you want to archive <strong>{teacher.name}</strong>? Their profile will be hidden from the main list but can be viewed in the archives.</>}
                    confirmText="Archive"
                    confirmClass="bg-yellow-500 hover:bg-yellow-600"
                    onConfirm={() => { onArchive(teacher.id); setArchiveModalOpen(false); }}
                    onClose={() => setArchiveModalOpen(false)}
                />
            )}
        </>
    );
};

export const Teachers: React.FC<{ user: User }> = ({ user }) => {
    const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isSchoolRoleModalOpen, setIsSchoolRoleModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');

    const handleUpdateTeacher = (updatedTeacher: Teacher) => {
        const updatedTeachers = teachers.map(t => t.id === updatedTeacher.id ? updatedTeacher : t);
        setTeachers(updatedTeachers);
        setSelectedTeacher(updatedTeacher);
    };

    const handleArchiveTeacher = (teacherId: string) => {
        setTeachers(prev => prev.map(t => t.id === teacherId ? {...t, status: 'archived'} : t));
        setSelectedTeacher(null);
    };

    const handleSaveAssignment = (updatedTeacher: Teacher) => {
        handleUpdateTeacher(updatedTeacher);
        setIsAssignModalOpen(false);
    };

    const handleSaveSchoolRoles = (roles: string[]) => {
        if (selectedTeacher) {
            handleUpdateTeacher({ ...selectedTeacher, schoolRoles: roles });
        }
        setIsSchoolRoleModalOpen(false);
    };

    const handleSaveDocument = (doc: { name: string; url: string; date: string }) => {
        if (selectedTeacher) {
            handleUpdateTeacher({ ...selectedTeacher, documents: [...selectedTeacher.documents, doc] });
        }
        setIsUploadModalOpen(false);
    };
    
    const teachersToShow = teachers.filter(t => t.status === viewMode);

    if (selectedTeacher) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <TeacherDetails user={user} teacher={selectedTeacher} onBack={() => setSelectedTeacher(null)} onUpdate={handleUpdateTeacher} onArchive={handleArchiveTeacher} onOpenAssignModal={() => setIsAssignModalOpen(true)} onOpenSchoolRoleModal={() => setIsSchoolRoleModalOpen(true)} onOpenUploadModal={() => setIsUploadModalOpen(true)} />
                {isAssignModalOpen && <AssignRoleModal teacher={selectedTeacher} onClose={() => setIsAssignModalOpen(false)} onSave={handleSaveAssignment} />}
                {isSchoolRoleModalOpen && <AssignSchoolRoleModal teacher={selectedTeacher} onClose={() => setIsSchoolRoleModalOpen(false)} onSave={handleSaveSchoolRoles} />}
                {isUploadModalOpen && <UploadDocumentModal onClose={() => setIsUploadModalOpen(false)} onSave={handleSaveDocument} />}
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Teacher Management</h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 rounded-lg bg-slate-200 p-1">
                        <button onClick={() => setViewMode('active')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'active' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-slate-300'}`}>Active</button>
                        <button onClick={() => setViewMode('archived')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'archived' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-slate-300'}`}>Archived</button>
                    </div>
                    <button className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors">Add New Teacher</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teachersToShow.map(teacher => (
                    <TeacherCard key={teacher.id} teacher={teacher} onSelect={setSelectedTeacher} />
                ))}
            </div>
            {teachersToShow.length === 0 && <p className="text-center text-slate-500 mt-8">No {viewMode} teachers found.</p>}
        </div>
    );
};