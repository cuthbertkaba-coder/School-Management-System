import { Student } from "../types";

// The hashPassword function has been removed to switch to plaintext passwords for reliability in the demo environment.

export const calculateFinancials = (financials: Student['financials']) => {
    const totalFees = financials.feeItems.reduce((sum, item) => sum + item.amount, 0);
    const totalDiscounts = financials.discounts.reduce((sum, item) => sum + item.amount, 0);
    const paid = financials.payments.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalFees - totalDiscounts - paid;
    return { totalFees, totalDiscounts, paid, balance };
};