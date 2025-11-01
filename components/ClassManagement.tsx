
import React, { useState, useMemo } from 'react';
import { Page, User, Role } from '../types';
import { mockStudents } from '../data/mockData';
import { CLASSES } from '../constants';

const AttendanceRegister: React.FC<{ class: string, isViewOnly: boolean }> = ({ class: selectedClass, isViewOnly }) => {
    const students = useMemo(() => mockStudents.filter(s => s.currentClass === selectedClass), [selectedClass]);
    
    return (
        <div>
            <h3 className="font-bold text-xl mb-4 text-slate-800">Attendance for {selectedClass} - {new Date().toLocaleDateString()}</h3>
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
        </div>
    );
}

const ScoreInput: React.FC<{ class: string, isViewOnly: boolean }> = ({ class: selectedClass, isViewOnly }) => {
    const students = useMemo(() => mockStudents.filter(s => s.currentClass === selectedClass), [selectedClass]);

    return (
        <div>
            <h3 className="font-bold text-xl mb-4 text-slate-800">Score Input for {selectedClass}</h3>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Student Name</th>
                            <th scope="col" className="px-6 py-3">Continuous Assessment (30%)</th>
                            <th scope="col" className="px-6 py-3">Exam Score (70%)</th>
                            <th scope="col" className="px-6 py-3">Total (100%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{student.name}</td>
                                <td className="px-6 py-4"><input type="number" max="30" className="w-20 p-1 border rounded" disabled={isViewOnly} /></td>
                                <td className="px-6 py-4"><input type="number" max="70" className="w-20 p-1 border rounded" disabled={isViewOnly} /></td>
                                <td className="px-6 py-4 font-bold text-slate-800">--</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {!isViewOnly && <div className="mt-4 flex justify-end">
                <button className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700">Save Scores</button>
            </div>}
        </div>
    );
}

export const ClassManagement: React.FC<{ initialPage: Page, user: User }> = ({ initialPage, user }) => {
    const [activeTab, setActiveTab] = useState(initialPage === Page.ClassRecords ? 'attendance' : 'scores');
    const [selectedClass, setSelectedClass] = useState(CLASSES[0]);

    const isViewOnly = useMemo(() => user.role === Role.SMCChair, [user.role]);

    const TABS = [
        { id: 'attendance', label: 'Attendance Register', page: Page.ClassRecords },
        { id: 'scores', label: 'Score Input Portal', page: Page.Examinations },
        { id: 'reports', label: 'Generate Report Cards', page: Page.Examinations },
    ];
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Class & Exam Management</h1>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                 <div className="border-b border-slate-200">
                    <nav className="flex flex-wrap -mb-px space-x-4">
                        {TABS.map(tab => (
                             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-1 font-medium whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                 <select 
                    value={selectedClass} 
                    onChange={e => setSelectedClass(e.target.value)}
                    className="mt-4 sm:mt-0 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="mt-6">
                {activeTab === 'attendance' && <AttendanceRegister class={selectedClass} isViewOnly={isViewOnly} />}
                {activeTab === 'scores' && <ScoreInput class={selectedClass} isViewOnly={isViewOnly} />}
                {activeTab === 'reports' && <p className="text-center p-8 bg-white rounded-lg shadow">Report card generation module coming soon.</p>}
            </div>
        </div>
    );
};
