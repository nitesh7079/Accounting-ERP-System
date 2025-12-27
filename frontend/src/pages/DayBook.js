import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSelectedCompanyId } from '../utils/companyHelper';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const DayBook = () => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchDayBook();
  }, [selectedDate]);

  const fetchDayBook = async () => {
    try {
      const companyId = getSelectedCompanyId(user);
      const url = `/vouchers?company=${companyId}&startDate=${selectedDate}&endDate=${selectedDate}`;
      const response = await api.get(url);
      setVouchers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching day book:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalDebit = () => {
    return vouchers.reduce((sum, voucher) => {
      const debitSum = voucher.entries
        .filter(e => e.type === 'Dr')
        .reduce((s, e) => s + e.amount, 0);
      return sum + debitSum;
    }, 0);
  };

  const getTotalCredit = () => {
    return vouchers.reduce((sum, voucher) => {
      const creditSum = voucher.entries
        .filter(e => e.type === 'Cr')
        .reduce((s, e) => s + e.amount, 0);
      return sum + creditSum;
    }, 0);
  };

  const handleExportPDF = () => {
    const tableData = [];
    vouchers.forEach(voucher => {
      tableData.push([voucher.voucherNumber, voucher.voucherType, voucher.narration || '-', '', '']);
      voucher.entries.forEach(entry => {
        tableData.push(['', '', `${entry.type} ${entry.ledger?.name || 'Unknown'}`, entry.type === 'Dr' ? entry.amount.toFixed(2) : '-', entry.type === 'Cr' ? entry.amount.toFixed(2) : '-']);
      });
    });
    tableData.push(['Total', '', '', getTotalDebit().toFixed(2), getTotalCredit().toFixed(2)]);
    exportToPDF('Day Book', ['Voucher No.', 'Type', 'Particulars', 'Debit (₹)', 'Credit (₹)'], tableData, `day-book-${selectedDate}`, user.company.name);
  };

  const handleExportExcel = () => {
    const tableData = [];
    vouchers.forEach(voucher => {
      tableData.push([voucher.voucherNumber, voucher.voucherType, voucher.narration || '-', '', '']);
      voucher.entries.forEach(entry => {
        tableData.push(['', '', `${entry.type} ${entry.ledger?.name || 'Unknown'}`, entry.type === 'Dr' ? entry.amount.toFixed(2) : '-', entry.type === 'Cr' ? entry.amount.toFixed(2) : '-']);
      });
    });
    tableData.push(['Total', '', '', getTotalDebit().toFixed(2), getTotalCredit().toFixed(2)]);
    exportToExcel('Day Book', ['Voucher No.', 'Type', 'Particulars', 'Debit (₹)', 'Credit (₹)'], tableData, `day-book-${selectedDate}`, user.company.name);
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
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Day Book</h1>
          <div className="flex gap-3">
            <button onClick={handleExportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2">
              <span>📄</span> PDF
            </button>
            <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
              <span>📊</span> Excel
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center gap-4">
            <label className="block text-sm font-medium">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Voucher No.</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Particulars</th>
                <th className="px-4 py-3 text-right">Debit (₹)</th>
                <th className="px-4 py-3 text-right">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vouchers.map((voucher) => (
                <React.Fragment key={voucher._id}>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-4 py-2">{voucher.voucherNumber}</td>
                    <td className="px-4 py-2">{voucher.voucherType}</td>
                    <td className="px-4 py-2" colSpan="3">{voucher.narration || '-'}</td>
                  </tr>
                  {voucher.entries.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2"></td>
                      <td className="px-4 py-2"></td>
                      <td className="px-4 py-2 pl-8">
                        {entry.type === 'Dr' ? 'Dr ' : 'Cr '} {entry.ledger?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {entry.type === 'Dr' ? `₹${entry.amount.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {entry.type === 'Cr' ? `₹${entry.amount.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              <tr className="bg-green-100 font-bold">
                <td colSpan="3" className="px-4 py-3 text-right">Total:</td>
                <td className="px-4 py-3 text-right">₹{getTotalDebit().toFixed(2)}</td>
                <td className="px-4 py-3 text-right">₹{getTotalCredit().toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          {vouchers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transactions found for this date
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayBook;
