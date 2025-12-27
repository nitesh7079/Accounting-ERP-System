import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSelectedCompanyId } from '../utils/companyHelper';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { exportLedgerDetailsToPDF, exportLedgerDetailsToExcel } from '../utils/exportUtils';

const CashBook = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [openingBalance, setOpeningBalance] = useState(0);

  useEffect(() => {
    fetchCashBook();
  }, [startDate, endDate]);

  const fetchCashBook = async () => {
    try {
      const companyId = getSelectedCompanyId(user);
      let url = `/vouchers?company=${companyId}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const response = await api.get(url);
      const vouchers = response.data.data || [];
      
      // Filter cash transactions
      const cashTransactions = [];
      for (const voucher of vouchers) {
        for (const entry of voucher.entries) {
          if (entry.ledger?.group?.name === 'Cash-in-Hand') {
            cashTransactions.push({
              date: voucher.date,
              voucherNumber: voucher.voucherNumber,
              voucherType: voucher.voucherType,
              particulars: voucher.narration || entry.ledger.name,
              debit: entry.type === 'Dr' ? entry.amount : 0,
              credit: entry.type === 'Cr' ? entry.amount : 0,
              voucher: voucher
            });
          }
        }
      }
      
      setTransactions(cashTransactions);
    } catch (error) {
      console.error('Error fetching cash book:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRunningBalance = () => {
    let balance = openingBalance;
    return transactions.map(txn => {
      balance = balance + txn.debit - txn.credit;
      return { ...txn, balance };
    });
  };

  const transactionsWithBalance = calculateRunningBalance();
  const closingBalance = transactionsWithBalance.length > 0 
    ? transactionsWithBalance[transactionsWithBalance.length - 1].balance 
    : openingBalance;

  const handleExportPDF = () => {
    exportLedgerDetailsToPDF('Cash Book', transactionsWithBalance, openingBalance, closingBalance, user.company.name);
  };

  const handleExportExcel = () => {
    exportLedgerDetailsToExcel('Cash Book', transactionsWithBalance, openingBalance, closingBalance, user.company.name);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Cash Book</h1>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
            >
              <span>📄</span> PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <span>📊</span> Excel
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Opening Balance</label>
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Voucher No.</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Particulars</th>
                <th className="px-4 py-3 text-right">Debit (₹)</th>
                <th className="px-4 py-3 text-right">Credit (₹)</th>
                <th className="px-4 py-3 text-right">Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-gray-100 font-semibold">
                <td colSpan="6" className="px-4 py-2">Opening Balance</td>
                <td className="px-4 py-2 text-right">₹{openingBalance.toFixed(2)}</td>
              </tr>
              {transactionsWithBalance.map((txn, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{new Date(txn.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{txn.voucherNumber}</td>
                  <td className="px-4 py-3">{txn.voucherType}</td>
                  <td className="px-4 py-3">{txn.particulars}</td>
                  <td className="px-4 py-3 text-right">{txn.debit > 0 ? `₹${txn.debit.toFixed(2)}` : '-'}</td>
                  <td className="px-4 py-3 text-right">{txn.credit > 0 ? `₹${txn.credit.toFixed(2)}` : '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold">₹{txn.balance.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-blue-100 font-bold">
                <td colSpan="6" className="px-4 py-3">Closing Balance</td>
                <td className="px-4 py-3 text-right">₹{closingBalance.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No cash transactions found
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CashBook;
