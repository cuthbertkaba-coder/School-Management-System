

import React, { useState, useMemo, useEffect } from 'react';
import { Page, User, Role, Student, Settings } from '../types';
import { CLASSES } from '../constants';

const AttendanceRegister: React.FC<{ students: Student[], isViewOnly: boolean }> = ({ students, isViewOnly }) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Student Name</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => (
                        <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{student.name}</td>
                            <td className="px-6 py-4">
                                <fieldset disabled={isViewOnly} className="flex space-x-2">
                                    <label className="flex items-center"><input type="radio" name={`status-${student.id}`} className="mr-1"/>Present</label>
                                    <label className="flex items-center"><input type="radio" name={`status-${student.id}`} className="mr-1"/>Absent</label>
                                    <label className="flex items-center"><input type="radio" name={`status-${student.id}`} className="mr-1"/>Late</label>
                                </fieldset>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const ScoreEntryTable: React.FC<{
    students: Student[];
    subject: string;
    term: string;
    scoreType: 'ca' | 'exam';
    isViewOnly: boolean;
    onScoreChange: (studentId: string, subject: string, field: 'classAssignments' | 'project' | 'midterm' | 'endOfTerm', value: number) => void;
}> = ({ students, subject, term, scoreType, isViewOnly, onScoreChange }) => {

    const headers = scoreType === 'ca'
        ? ['Class Assignments & Tests (20)', 'Project/Practical Work (10)', 'CA Total (30)']
        : ['Mid-Term (20)', 'End of Term (50)', 'Exam Total (70)', 'Final Total (100)'];
    
    const fields: ('classAssignments' | 'project' | 'midterm' | 'endOfTerm')[] = scoreType === 'ca' 
        ? ['classAssignments', 'project'] 
        : ['midterm', 'endOfTerm'];

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Student Name</th>
                        {headers.map(h => <th key={h} scope="col" className="px-6 py-3 text-center">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => {
                        const gradeData = student.grades.find(g => g.term === term)?.subjects[subject] || {};
                        const scores = {
                            classAssignments: gradeData.classAssignments || 0,
                            project: gradeData.project || 0,
                            midterm: gradeData.midterm || 0,
                            endOfTerm: gradeData.endOfTerm || 0,
                        };
                        const caTotal = scores.classAssignments + scores.project;
                        const examTotal = scores.midterm + scores.endOfTerm;

                        return (
                            <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{student.name}</td>
                                {scoreType === 'ca' ? (
                                    <>
                                        <td className="px-6 py-4"><input type="number" max="20" className="w-20 p-1 border rounded text-center bg-white focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100" disabled={isViewOnly} defaultValue={scores.classAssignments} onBlur={(e) => onScoreChange(student.id, subject, 'classAssignments', parseInt(e.target.value) || 0)} /></td>
                                        <td className="px-6 py-4"><input type="number" max="10" className="w-20 p-1 border rounded text-center bg-white focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100" disabled={isViewOnly} defaultValue={scores.project} onBlur={(e) => onScoreChange(student.id, subject, 'project', parseInt(e.target.value) || 0)}/></td>
                                        <td className="px-6 py-4 text-center font-bold text-blue-700">{caTotal}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-6 py-4"><input type="number" max="20" className="w-20 p-1 border rounded text-center bg-white focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100" disabled={isViewOnly} defaultValue={scores.midterm} onBlur={(e) => onScoreChange(student.id, subject, 'midterm', parseInt(e.target.value) || 0)}/></td>
                                        <td className="px-6 py-4"><input type="number" max="50" className="w-20 p-1 border rounded text-center bg-white focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100" disabled={isViewOnly} defaultValue={scores.endOfTerm} onBlur={(e) => onScoreChange(student.id, subject, 'endOfTerm', parseInt(e.target.value) || 0)}/></td>
                                        <td className="px-6 py-4 text-center font-bold text-blue-700">{examTotal}</td>
                                        <td className="px-6 py-4 text-center font-extrabold bg-slate-100">{caTotal + examTotal}</td>
                                    </>
                                )}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};


export const ClassManagement: React.FC<{ 
    initialPage: Page, 
    user: User, 
    students: Student[], 
    settings: Settings,
    onUpdateStudent: (student: Student) => void 
}> = ({ initialPage, user, students, settings, onUpdateStudent }) => {
    const [activeTab, setActiveTab] = useState(initialPage === Page.ClassRecords ? 'attendance' : 'ca');
    const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
    const [selectedSubject, setSelectedSubject] = useState('');

    const isViewOnly = useMemo(() => user.role === Role.SMCChair, [user.role]);

    const studentsInClass = useMemo(() => {
        return students.filter(s => s.currentClass === selectedClass && s.status === 'active');
    }, [students, selectedClass]);
    
    const subjectsForClass = useMemo(() => {
        return settings.classSubjects[selectedClass] || [];
    }, [settings.classSubjects, selectedClass]);

    useEffect(() => {
        if (subjectsForClass.length > 0) {
            setSelectedSubject(subjectsForClass[0]);
        } else {
            setSelectedSubject('');
        }
    }, [subjectsForClass]);
    
    const handleScoreChange = (studentId: string, subject: string, field: 'classAssignments' | 'project' | 'midterm' | 'endOfTerm', value: number) => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        let gradeForTerm = student.grades.find(g => g.term === settings.currentTerm);
        let updatedGrades = [...student.grades];
        
        // If no grade object for the current term exists, create it
        if (!gradeForTerm) {
            gradeForTerm = { term: settings.currentTerm, subjects: {}, average: 0, position: 0 };
            updatedGrades.push(gradeForTerm);
        }

        const subjectScores = gradeForTerm.subjects[subject] || {};
        const updatedSubjectScores = { ...subjectScores, [field]: value };
        
        const updatedSubjects = { ...gradeForTerm.subjects, [subject]: updatedSubjectScores };
        
        const finalGrades = updatedGrades.map(g => g.term === settings.currentTerm ? { ...g, subjects: updatedSubjects } : g);

        onUpdateStudent({ ...student, grades: finalGrades });
    };

    const TABS = [
        { id: 'attendance', label: 'Attendance', page: Page.ClassRecords },
        { id: 'ca', label: 'Continuous Assessment', page: Page.Examinations },
        { id: 'exam', label: 'Examinations', page: Page.Examinations },
        { id: 'reports', label: 'Generate Reports', page: Page.Examinations },
    ];
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Class & Exam Management</h1>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                 <div className="border-b border-slate-200">
                    <nav className="flex flex-wrap -mb-px space-x-4">
                        {TABS.map(tab => (
                             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-1 font-medium whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                 <select 
                    value={selectedClass} 
                    onChange={e => setSelectedClass(e.target.value)}
                    className="mt-4 sm:mt-0 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {activeTab !== 'attendance' && activeTab !== 'reports' && (
                <div className="mb-4">
                    <label className="text-sm font-medium text-slate-700 mr-2">Select Subject:</label>
                    <select 
                        value={selectedSubject} 
                        onChange={e => setSelectedSubject(e.target.value)}
                        className="p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={subjectsForClass.length === 0}
                    >
                        {subjectsForClass.length > 0 ? (
                            subjectsForClass.map(s => <option key={s} value={s}>{s}</option>)
                        ) : (
                            <option>No subjects assigned to this class</option>
                        )}
                    </select>
                </div>
            )}


            <div className="mt-6">
                {activeTab === 'attendance' && <AttendanceRegister students={studentsInClass} isViewOnly={isViewOnly} />}
                
                {activeTab === 'ca' && selectedSubject && (
                    <ScoreEntryTable 
                        students={studentsInClass} 
                        subject={selectedSubject} 
                        term={settings.currentTerm}
                        scoreType="ca" 
                        isViewOnly={isViewOnly} 
                        onScoreChange={handleScoreChange}
                    />
                )}

                {activeTab === 'exam' && selectedSubject && (
                    <ScoreEntryTable 
                        students={studentsInClass} 
                        subject={selectedSubject} 
                        term={settings.currentTerm}
                        scoreType="exam" 
                        isViewOnly={isViewOnly} 
                        onScoreChange={handleScoreChange}
                    />
                )}
                
                {activeTab === 'reports' && <p className="text-center p-8 bg-white rounded-lg shadow">Report card generation module coming soon.</p>}
            </div>
        </div>
    );
};