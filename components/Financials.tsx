
import React, { useState, useMemo, useRef } from 'react';
import { Student } from '../types';
import { mockStudents } from '../data/mockData';
import { CLASSES, SCHOOL_LOGO_URL, SCHOOL_NAME } from '../constants';
import { calculateFinancials } from '../utils/auth';


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

const AddPaymentModal: React.FC<{
    student: Student;
    onClose: () => void;
    onSave: (studentId: string, payment: { date: string, amount: number, receipt: string }) => void;
}> = ({ student, onClose, onSave }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [receipt, setReceipt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const paymentAmount = parseFloat(amount);
        if (!date || isNaN(paymentAmount) || paymentAmount <= 0 || !receipt.trim()) {
            alert('Please fill all fields with valid data.');
            return;
        }
        onSave(student.id, { date, amount: paymentAmount, receipt: receipt.trim() });
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
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md" style={animationStyle}>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Add Payment for {student.name}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700" htmlFor="payment-date">Date</label>
                        <input id="payment-date" type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700" htmlFor="payment-amount">Amount (GHS)</label>
                        <input id="payment-amount" type="number" placeholder="0.00" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700" htmlFor="receipt-number">Receipt Number</label>
                        <input id="receipt-number" type="text" value={receipt} onChange={e => setReceipt(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Save Payment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StatementModal: React.FC<{ student: Student; onClose: () => void; academicYear: string; currentTerm: string; }> = ({ student, onClose, academicYear, currentTerm }) => {
    const statementRef = useRef<HTMLDivElement>(null);
    const summary = calculateFinancials(student.financials);

    const handlePrint = () => {
        if (!statementRef.current) return;
        const printContents = `<div class="printable-content-wrapper">${statementRef.current.innerHTML}</div><div class="printable-footer">${"Training the Head, Hands and Heart"}</div>`;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl animate-fade-in-up">
                <div ref={statementRef} className="p-6 text-black">
                    <div className="text-center border-b pb-4 mb-4">
                        <img src={SCHOOL_LOGO_URL} alt="School Logo" className="w-16 h-16 mx-auto mb-2" />
                        <h2 className="text-2xl font-bold text-black">{SCHOOL_NAME}</h2>
                        <p className="text-black">Student Financial Statement</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-6">
                        <p><strong>Student:</strong> {student.name}</p>
                        <p><strong>Student ID:</strong> {student.id}</p>
                        <p><strong>Class:</strong> {student.currentClass}</p>
                        <p><strong>Academic Year:</strong> {academicYear}</p>
                        <p><strong>Term:</strong> {currentTerm}</p>
                        <p><strong>Date Issued:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-lg text-black mb-2">Fee Items</h3>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50"><tr><th className="p-2 border">Date</th><th className="p-2 border">Description</th><th className="p-2 border text-right">Amount (GHS)</th></tr></thead>
                                <tbody>{student.financials.feeItems.map((item, i) => (<tr key={`fee-${i}`}><td className="p-2 border">{item.date}</td><td className="p-2 border">{item.category}</td><td className="p-2 border text-right">{item.amount.toFixed(2)}</td></tr>))}</tbody>
                            </table>
                        </div>
                        {student.financials.discounts.length > 0 && <div>
                            <h3 className="font-bold text-lg text-black mb-2">Discounts</h3>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50"><tr><th className="p-2 border">Type</th><th className="p-2 border">Description</th><th className="p-2 border text-right">Amount (GHS)</th></tr></thead>
                                <tbody>{student.financials.discounts.map((d, i) => (<tr key={`disc-${i}`}><td className="p-2 border">{d.type}</td><td className="p-2 border">{d.description || 'N/A'}</td><td className="p-2 border text-right">-{d.amount.toFixed(2)}</td></tr>))}</tbody>
                            </table>
                        </div>}
                        <div>
                             <h3 className="font-bold text-lg text-black mb-2">Payment History</h3>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50"><tr><th className="p-2 border">Date</th><th className="p-2 border">Receipt No.</th><th className="p-2 border text-right">Amount Paid (GHS)</th></tr></thead>
                                <tbody>{student.financials.payments.map((p, i) => (<tr key={`pay-${i}`}><td className="p-2 border">{p.date}</td><td className="p-2 border">{p.receipt}</td><td className="p-2 border text-right">{p.amount.toFixed(2)}</td></tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 bg-slate-100 p-4 rounded-lg mt-6 text-black">
                        <div className="text-right font-semibold">Total Bill:</div><div className="font-bold">GHS {summary.totalFees.toFixed(2)}</div>
                        <div className="text-right font-semibold">Total Discounts:</div><div className="font-bold">- GHS {summary.totalDiscounts.toFixed(2)}</div>
                         <div className="text-right font-semibold border-t pt-2 mt-2">Net Bill:</div><div className="font-bold border-t pt-2 mt-2">GHS {(summary.totalFees - summary.totalDiscounts).toFixed(2)}</div>
                        <div className="text-right font-semibold">Total Paid:</div><div className="font-bold">GHS {summary.paid.toFixed(2)}</div>
                        <div className="text-right font-bold text-lg border-t pt-2 mt-2">Balance Due:</div><div className={`font-extrabold text-lg border-t pt-2 mt-2`}>GHS {summary.balance.toFixed(2)}</div>
                    </div>
                </div>
                <div className="flex justify-end space-x-4 p-4 bg-slate-50 border-t rounded-b-lg no-print">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Close</button>
                    <button onClick={() => exportToPdf(statementRef.current!, `Statement_${student.id}`)} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Export PDF</button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Print Statement</button>
                </div>
            </div>
        </div>
    );
};


export const Financials: React.FC<{ students: Student[], onUpdateStudent: (student: Student) => void, academicYear: string, currentTerm: string }> = ({ students, onUpdateStudent, academicYear, currentTerm }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('All');
    const [studentForPayment, setStudentForPayment] = useState<Student | null>(null);
    const [studentForStatement, setStudentForStatement] = useState<Student | null>(null);
    const financialsTableRef = useRef<HTMLDivElement>(null);


    const handleSavePayment = (studentId: string, payment: { date: string; amount: number; receipt: string; }) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            const updatedStudent = {
                ...student,
                financials: {
                    ...student.financials,
                    payments: [...student.financials.payments, payment]
                }
            };
            onUpdateStudent(updatedStudent);
        }
        setStudentForPayment(null);
    };

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesClass = selectedClass === 'All' || student.currentClass === selectedClass;
            return matchesSearch && matchesClass;
        });
    }, [searchTerm, selectedClass, students]);
    
    const totals = useMemo(() => {
        return filteredStudents.reduce((acc, s) => {
            const summary = calculateFinancials(s.financials);
            acc.totalFees += summary.totalFees;
            acc.paid += summary.paid;
            acc.balance += summary.balance;
            return acc;
        }, { totalFees: 0, paid: 0, balance: 0 });
    }, [filteredStudents]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Fees & Financials</h1>
                <div className="space-x-2 no-print">
                    <button onClick={() => exportToPdf(financialsTableRef.current!, 'Financials_Summary')} className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50">Export PDF</button>
                    <button onClick={() => window.print()} className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50">Print List</button>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow text-center"><p className="text-sm text-slate-500">Total Billed</p><p className="font-bold text-2xl text-blue-800">GHS {totals.totalFees.toFixed(2)}</p></div>
                <div className="bg-white p-4 rounded-lg shadow text-center"><p className="text-sm text-slate-500">Total Paid</p><p className="font-bold text-2xl text-green-700">GHS {totals.paid.toFixed(2)}</p></div>
                <div className="bg-white p-4 rounded-lg shadow text-center"><p className="text-sm text-slate-500">Total Outstanding</p><p className="font-bold text-2xl text-red-700">GHS {totals.balance.toFixed(2)}</p></div>
            </div>

            <div ref={financialsTableRef} className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Student Name</th>
                            <th scope="col" className="px-6 py-3">Class</th>
                            <th scope="col" className="px-6 py-3">Total Bill (GHS)</th>
                            <th scope="col" className="px-6 py-3">Amount Paid (GHS)</th>
                            <th scope="col" className="px-6 py-3">Balance (GHS)</th>
                            <th scope="col" className="px-6 py-3 no-print">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => {
                            const summary = calculateFinancials(student.financials);
                            return (
                                <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{student.name}</td>
                                    <td className="px-6 py-4">{student.currentClass}</td>
                                    <td className="px-6 py-4">{summary.totalFees.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-green-600 font-semibold">{summary.paid.toFixed(2)}</td>
                                    <td className={`px-6 py-4 font-semibold ${summary.balance > 0 ? 'text-red-600' : 'text-slate-500'}`}>{summary.balance.toFixed(2)}</td>
                                    <td className="px-6 py-4 space-x-2 whitespace-nowrap no-print">
                                        <button onClick={() => setStudentForPayment(student)} className="text-blue-600 hover:underline font-medium">Add Payment</button>
                                        <button onClick={() => setStudentForStatement(student)} className="text-slate-500 hover:underline font-medium">View Statement</button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
             {filteredStudents.length === 0 && <p className="text-center text-slate-500 mt-8 p-4 bg-white rounded-lg shadow">No students found.</p>}
             {studentForPayment && (
                <AddPaymentModal
                    student={studentForPayment}
                    onClose={() => setStudentForPayment(null)}
                    onSave={handleSavePayment}
                />
             )}
             {studentForStatement && (
                <StatementModal
                    student={studentForStatement}
                    onClose={() => setStudentForStatement(null)}
                    academicYear={academicYear}
                    currentTerm={currentTerm}
                />
             )}
        </div>
    );
};