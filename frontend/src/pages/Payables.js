import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSelectedCompanyId } from '../utils/companyHelper';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const Payables = () => {
  const { user } = useAuth();
  const [payables, setPayables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState([]);
  const [creditors, setCreditors] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const companyId = getSelectedCompanyId(user);
      const [ledgersRes, vouchersRes] = await Promise.all([
        api.get(`/ledgers?company=${companyId}`),
        api.get(`/vouchers?company=${companyId}`)
      ]);
      
      const allLedgers = ledgersRes.data.data || [];
      const creditorLedgers = allLedgers.filter(l => l.group?.name === 'Sundry Creditors');
      setCreditors(creditorLedgers);
      setVouchers(vouchersRes.data.data || []);
      
      calculatePayables(creditorLedgers, vouchersRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePayables = (creditorLedgers, allVouchers) => {
    const payablesList = [];

    creditorLedgers.forEach(creditor => {
      let balance = 0;
      const transactions = [];

      allVouchers.forEach(voucher => {
        voucher.entries.forEach(entry => {
          if (entry.ledger?._id === creditor._id) {
            if (entry.type === 'Cr') {
              balance += entry.amount;
            } else {
              balance -= entry.amount;
            }
            transactions.push({
              date: voucher.date,
              voucherNumber: voucher.voucherNumber,
              type: voucher.voucherType,
              amount: entry.amount,
              entryType: entry.type
            });
          }
        });
      });

      if (balance > 0.01) {
        payablesList.push({
          creditor,
          balance,
          transactions
        });
      }
    });

    setPayables(payablesList);
  };

  const getTotalPayables = () => {
    return payables.reduce((sum, item) => sum + item.balance, 0);
  };

  const handleExportPDF = () => {
    const tableData = payables.map(item => [
      item.creditor.name,
      item.creditor.contactDetails?.mobile || '-',
      item.balance.toFixed(2)
    ]);
    tableData.push(['Total Payables:', '', getTotalPayables().toFixed(2)]);
    exportToPDF('Payables Report', ['Creditor Name', 'Contact', 'Outstanding (₹)'], tableData, 'payables', user.company.name);
  };

  const handleExportExcel = () => {
    const tableData = payables.map(item => [
      item.creditor.name,
      item.creditor.contactDetails?.mobile || '-',
      item.balance.toFixed(2)
    ]);
    tableData.push(['Total Payables:', '', getTotalPayables().toFixed(2)]);
    exportToExcel('Payables Report', ['Creditor Name', 'Contact', 'Outstanding (₹)'], tableData, 'payables', user.company.name);
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
          <h1 className="text-3xl font-bold">Payables (Sundry Creditors)</h1>
          <div className="flex gap-3">
            <button onClick={handleExportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2">
              <span>📄</span> PDF
            </button>
            <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
              <span>📊</span> Excel
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-red-50 p-4 rounded">
              <div className="text-sm text-gray-600 mb-1">Total Creditors</div>
              <div className="text-3xl font-bold text-red-600">{payables.length}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <div className="text-sm text-gray-600 mb-1">Total Outstanding</div>
              <div className="text-3xl font-bold text-orange-600">₹{getTotalPayables().toFixed(2)}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <div className="text-sm text-gray-600 mb-1">Average per Creditor</div>
              <div className="text-3xl font-bold text-yellow-600">
                ₹{payables.length > 0 ? (getTotalPayables() / payables.length).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-red-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Creditor Name</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-right">Outstanding Amount (₹)</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payables.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{item.creditor.name}</td>
                  <td className="px-4 py-3">{item.creditor.contactDetails?.mobile || '-'}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">
                    ₹{item.balance.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-red-600 hover:underline text-sm">View Details</button>
                  </td>
                </tr>
              ))}
              <tr className="bg-red-100 font-bold">
                <td colSpan="2" className="px-4 py-3 text-right">Total Payables:</td>
                <td className="px-4 py-3 text-right text-lg">₹{getTotalPayables().toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          {payables.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No outstanding payables
            </div>
          )}
        </div>

        {payables.length > 0 && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Top Creditors</h3>
            <div className="space-y-3">
              {payables
                .sort((a, b) => b.balance - a.balance)
                .slice(0, 5)
                .map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-semibold">{item.creditor.name}</div>
                      <div className="text-sm text-gray-600">{item.transactions.length} transactions</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-red-600">₹{item.balance.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">
                        {((item.balance / getTotalPayables()) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payables;
