import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSelectedCompanyId } from '../utils/companyHelper';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { exportLedgerDetailsToPDF, exportLedgerDetailsToExcel } from '../utils/exportUtils';

const BankBook = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [bankLedgers, setBankLedgers] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBankLedgers();
  }, []);

  useEffect(() => {
    if (selectedBank) {
      fetchBankBook();
    }
  }, [selectedBank, startDate, endDate]);

  const fetchBankLedgers = async () => {
    try {
      setError('');
      const companyId = getSelectedCompanyId(user);
      const response = await api.get(`/ledgers?company=${companyId}`);
      const banks = response.data.data.filter(l => l.group?.name === 'Bank Accounts');
      setBankLedgers(banks);
      if (banks.length > 0) {
        setSelectedBank(banks[0]._id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching bank ledgers:', error);
      setError('Failed to load bank ledgers. Please try again.');
      setLoading(false);
    }
  };

  const fetchBankBook = async () => {
    try {
      setError('');
      setLoading(true);
      const companyId = getSelectedCompanyId(user);
      let url = `/vouchers?company=${companyId}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const response = await api.get(url);
      const vouchers = response.data.data || [];
      
      const bankTransactions = [];
      for (const voucher of vouchers) {
        for (const entry of voucher.entries) {
          if (entry.ledger?._id === selectedBank) {
            bankTransactions.push({
              date: voucher.date,
              voucherNumber: voucher.voucherNumber,
              voucherType: voucher.voucherType,
              particulars: voucher.narration || entry.ledger.name,
              debit: entry.type === 'Dr' ? entry.amount : 0,
              credit: entry.type === 'Cr' ? entry.amount : 0
            });
          }
        }
      }
      
      setTransactions(bankTransactions);
    } catch (error) {
      console.error('Error fetching bank book:', error);
      setError('Failed to load bank book data. Please try again.');
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
    const selectedBankName = bankLedgers.find(b => b._id === selectedBank)?.name || 'Bank Book';
    exportLedgerDetailsToPDF(selectedBankName, transactionsWithBalance, openingBalance, closingBalance, user.company.name);
  };

  const handleExportExcel = () => {
    const selectedBankName = bankLedgers.find(b => b._id === selectedBank)?.name || 'Bank Book';
    exportLedgerDetailsToExcel(selectedBankName, transactionsWithBalance, openingBalance, closingBalance, user.company.name);
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

  if (bankLedgers.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Bank Book</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-lg text-yellow-800">
              No bank accounts found. Please create a bank account ledger under the "Bank Accounts" group first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Bank Book</h1>
          <div className="flex gap-3">
            <button onClick={handleExportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2">
              <span>📄</span> PDF
            </button>
            <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
              <span>📊</span> Excel
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bank Account</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {bankLedgers.map(bank => (
                  <option key={bank._id} value={bank._id}>{bank.name}</option>
                ))}
              </select>
            </div>
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
            <thead className="bg-purple-600 text-white">
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
              <tr className="bg-purple-100 font-bold">
                <td colSpan="6" className="px-4 py-3">Closing Balance</td>
                <td className="px-4 py-3 text-right">₹{closingBalance.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No bank transactions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankBook;
