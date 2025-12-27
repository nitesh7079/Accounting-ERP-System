import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSelectedCompanyId } from '../utils/companyHelper';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const ProfitLoss = () => {
  const { user } = useAuth();
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      const companyId = getSelectedCompanyId(user);
      const [ledgersRes, vouchersRes] = await Promise.all([
        api.get(`/ledgers?company=${companyId}`),
        api.get(`/vouchers?company=${companyId}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`)
      ]);
      
      setLedgers(ledgersRes.data.data || []);
      setVouchers(vouchersRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLedgerBalance = (ledgerId) => {
    let balance = 0;
    vouchers.forEach(voucher => {
      voucher.entries.forEach(entry => {
        if (entry.ledger?._id === ledgerId) {
          if (entry.type === 'Dr') {
            balance += entry.amount;
          } else {
            balance -= entry.amount;
          }
        }
      });
    });
    return balance;
  };

  const getIncomeExpenses = () => {
    const directIncome = [];
    const indirectIncome = [];
    const directExpenses = [];
    const indirectExpenses = [];

    ledgers.forEach(ledger => {
      const balance = calculateLedgerBalance(ledger._id);
      if (Math.abs(balance) > 0.01) {
        const groupName = ledger.group?.name || '';
        
        if (groupName.includes('Sales') || groupName.includes('Direct Income')) {
          directIncome.push({ ...ledger, balance: Math.abs(balance) });
        } else if (groupName.includes('Indirect Income')) {
          indirectIncome.push({ ...ledger, balance: Math.abs(balance) });
        } else if (groupName.includes('Purchase') || groupName.includes('Direct Expenses')) {
          directExpenses.push({ ...ledger, balance: Math.abs(balance) });
        } else if (groupName.includes('Indirect Expenses')) {
          indirectExpenses.push({ ...ledger, balance: Math.abs(balance) });
        }
      }
    });

    return { directIncome, indirectIncome, directExpenses, indirectExpenses };
  };

  const { directIncome, indirectIncome, directExpenses, indirectExpenses } = getIncomeExpenses();

  const totalDirectIncome = directIncome.reduce((sum, item) => sum + item.balance, 0);
  const totalIndirectIncome = indirectIncome.reduce((sum, item) => sum + item.balance, 0);
  const totalDirectExpenses = directExpenses.reduce((sum, item) => sum + item.balance, 0);
  const totalIndirectExpenses = indirectExpenses.reduce((sum, item) => sum + item.balance, 0);

  const grossProfit = totalDirectIncome - totalDirectExpenses;
  const netProfit = grossProfit + totalIndirectIncome - totalIndirectExpenses;

  const handleExportPDF = () => {
    const tableData = [
      ['EXPENSES', '', 'INCOME', ''],
      ['Direct Expenses:', totalDirectExpenses.toFixed(2), 'Direct Income:', totalDirectIncome.toFixed(2)],
      ...directExpenses.map(l => [`  ${l.name}`, l.balance.toFixed(2), '', '']),
      ...directIncome.map((l, i) => [i === 0 ? '' : '', '', `  ${l.name}`, l.balance.toFixed(2)]),
      ['Gross Profit:', grossProfit > 0 ? grossProfit.toFixed(2) : '0.00', '', ''],
      ['Indirect Expenses:', totalIndirectExpenses.toFixed(2), 'Indirect Income:', totalIndirectIncome.toFixed(2)],
      ...indirectExpenses.map(l => [`  ${l.name}`, l.balance.toFixed(2), '', '']),
      ...indirectIncome.map((l, i) => [i === 0 ? '' : '', '', `  ${l.name}`, l.balance.toFixed(2)]),
      ['Net Profit:', netProfit >= 0 ? netProfit.toFixed(2) : `(${Math.abs(netProfit).toFixed(2)})`, '', '']
    ];
    exportToPDF('Profit & Loss Account', ['Expenditure', 'Amount (₹)', 'Income', 'Amount (₹)'], tableData, 'profit-loss', user.company.name);
  };

  const handleExportExcel = () => {
    const tableData = [
      ['EXPENSES', '', 'INCOME', ''],
      ['Direct Expenses:', totalDirectExpenses.toFixed(2), 'Direct Income:', totalDirectIncome.toFixed(2)],
      ...directExpenses.map(l => [`  ${l.name}`, l.balance.toFixed(2), '', '']),
      ...directIncome.map((l, i) => [i === 0 ? '' : '', '', `  ${l.name}`, l.balance.toFixed(2)]),
      ['Gross Profit:', grossProfit > 0 ? grossProfit.toFixed(2) : '0.00', '', ''],
      ['Indirect Expenses:', totalIndirectExpenses.toFixed(2), 'Indirect Income:', totalIndirectIncome.toFixed(2)],
      ...indirectExpenses.map(l => [`  ${l.name}`, l.balance.toFixed(2), '', '']),
      ...indirectIncome.map((l, i) => [i === 0 ? '' : '', '', `  ${l.name}`, l.balance.toFixed(2)]),
      ['Net Profit:', netProfit >= 0 ? netProfit.toFixed(2) : `(${Math.abs(netProfit).toFixed(2)})`, '', '']
    ];
    exportToExcel('Profit & Loss Account', ['Expenditure', 'Amount (₹)', 'Income', 'Amount (₹)'], tableData, 'profit-loss', user.company.name);
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
          <h1 className="text-3xl font-bold">Profit & Loss Account</h1>
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
          <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Expenses Side */}
          <div className="bg-white rounded-lg shadow">
            <div className="bg-red-600 text-white px-4 py-3 font-bold">Expenditure</div>
            <div className="p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2 text-red-700">Direct Expenses</h3>
                {directExpenses.map(ledger => (
                  <div key={ledger._id} className="flex justify-between py-1">
                    <span>{ledger.name}</span>
                    <span>₹{ledger.balance.toFixed(2)}</span>
                  </div>
                ))}
                {directExpenses.length === 0 && <div className="text-gray-500 text-sm">No direct expenses</div>}
              </div>

              <div className="border-t pt-2 mb-4">
                <div className="flex justify-between font-semibold">
                  <span>Gross Profit c/d</span>
                  <span className="text-green-600">₹{grossProfit > 0 ? grossProfit.toFixed(2) : '0.00'}</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2 text-red-700">Indirect Expenses</h3>
                {indirectExpenses.map(ledger => (
                  <div key={ledger._id} className="flex justify-between py-1">
                    <span>{ledger.name}</span>
                    <span>₹{ledger.balance.toFixed(2)}</span>
                  </div>
                ))}
                {indirectExpenses.length === 0 && <div className="text-gray-500 text-sm">No indirect expenses</div>}
              </div>

              <div className="border-t-2 pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Net Profit</span>
                  <span className={netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ₹{Math.abs(netProfit).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Income Side */}
          <div className="bg-white rounded-lg shadow">
            <div className="bg-green-600 text-white px-4 py-3 font-bold">Income</div>
            <div className="p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2 text-green-700">Direct Income</h3>
                {directIncome.map(ledger => (
                  <div key={ledger._id} className="flex justify-between py-1">
                    <span>{ledger.name}</span>
                    <span>₹{ledger.balance.toFixed(2)}</span>
                  </div>
                ))}
                {directIncome.length === 0 && <div className="text-gray-500 text-sm">No direct income</div>}
              </div>

              <div className="border-t pt-2 mb-4">
                <div className="flex justify-between font-semibold">
                  <span>Gross Profit b/d</span>
                  <span className="text-green-600">₹{grossProfit > 0 ? grossProfit.toFixed(2) : '0.00'}</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2 text-green-700">Indirect Income</h3>
                {indirectIncome.map(ledger => (
                  <div key={ledger._id} className="flex justify-between py-1">
                    <span>{ledger.name}</span>
                    <span>₹{ledger.balance.toFixed(2)}</span>
                  </div>
                ))}
                {indirectIncome.length === 0 && <div className="text-gray-500 text-sm">No indirect income</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Summary</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between py-2">
                <span>Total Direct Income:</span>
                <span className="font-semibold">₹{totalDirectIncome.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Total Direct Expenses:</span>
                <span className="font-semibold">₹{totalDirectExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2">
                <span className="font-bold">Gross Profit:</span>
                <span className={`font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{Math.abs(grossProfit).toFixed(2)}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between py-2">
                <span>Total Indirect Income:</span>
                <span className="font-semibold">₹{totalIndirectIncome.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Total Indirect Expenses:</span>
                <span className="font-semibold">₹{totalIndirectExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2">
                <span className="font-bold">Net Profit:</span>
                <span className={`font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{Math.abs(netProfit).toFixed(2)} {netProfit < 0 ? '(Loss)' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLoss;
