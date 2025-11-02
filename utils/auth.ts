import { Student } from "../types";

// The hashPassword function has been removed to switch to plaintext passwords for reliability in the demo environment.

export const calculateFinancials = (financials: Student['financials']) => {
    const totalFees = financials.feeItems.reduce((sum, item) => sum + item.amount, 0);
    const totalDiscounts = financials.discounts.reduce((sum, item) => sum + item.amount, 0);
    const paid = financials.payments.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalFees - totalDiscounts - paid;
    return { totalFees, totalDiscounts, paid, balance };
};

export const getGradeInfo = (score: number) => {
    if (score >= 80) return { grade: 'A1', remarks: 'Excellent' };
    if (score >= 75) return { grade: 'B2', remarks: 'Very Good' };
    if (score >= 70) return { grade: 'B3', remarks: 'Good' };
    if (score >= 65) return { grade: 'C4', remarks: 'Credit' };
    if (score >= 60) return { grade: 'C5', remarks: 'Credit' };
    if (score >= 55) return { grade: 'C6', remarks: 'Credit' };
    if (score >= 50) return { grade: 'D7', remarks: 'Pass' };
    if (score >= 45) return { grade: 'E8', remarks: 'Weak Pass' };
    return { grade: 'F9', remarks: 'Fail' };
};
