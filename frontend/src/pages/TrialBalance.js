import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const TrialBalance = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      if (user?.company?._id) {
        const response = await api.get(`/reports/trial-balance?company=${user.company._id}`);
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching trial balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const tableData = data.entries.map(entry => [
      entry.ledger,
      entry.group,
      entry.debit > 0 ? entry.debit.toFixed(2) : '-',
      entry.credit > 0 ? entry.credit.toFixed(2) : '-'
    ]);

    tableData.push([
      'Total',
      '',
      data.totals.debit,
      data.totals.credit
    ]);

    exportToPDF(
      'Trial Balance',
      ['Ledger', 'Group', 'Debit (₹)', 'Credit (₹)'],
      tableData,
      'trial-balance',
      user.company.name
    );
  };

  const handleExportExcel = () => {
    const tableData = data.entries.map(entry => [
      entry.ledger,
      entry.group,
      entry.debit > 0 ? entry.debit.toFixed(2) : '-',
      entry.credit > 0 ? entry.credit.toFixed(2) : '-'
    ]);

    tableData.push([
      'Total',
      '',
      data.totals.debit,
      data.totals.credit
    ]);

    exportToExcel(
      'Trial Balance',
      ['Ledger', 'Group', 'Debit (₹)', 'Credit (₹)'],
      tableData,
      'trial-balance',
      user.company.name
    );
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

  if (!data) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Trial Balance</h1>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 flex items-center gap-2"
            >
              <span>📄</span> Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <span>📊</span> Export Excel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">{user.company.name}</h2>
            <p className="text-gray-600">As on {new Date().toLocaleDateString()}</p>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ledger</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit (₹)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.entries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{entry.ledger}</td>
                  <td className="px-6 py-4 text-gray-600">{entry.group}</td>
                  <td className="px-6 py-4 text-right">
                    {entry.debit > 0 ? entry.debit.toFixed(2) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {entry.credit > 0 ? entry.credit.toFixed(2) : '-'}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="px-6 py-4">Total</td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 text-right">{data.totals.debit}</td>
                <td className="px-6 py-4 text-right">{data.totals.credit}</td>
              </tr>
            </tbody>
          </table>

          {parseFloat(data.totals.difference) > 0 && (
            <div className="p-4 bg-red-50 text-red-700 text-center">
              <strong>Warning:</strong> Difference of ₹{data.totals.difference} found. 
              Debit and Credit should be equal.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrialBalance;
