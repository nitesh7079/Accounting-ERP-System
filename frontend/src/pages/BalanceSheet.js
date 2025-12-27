import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSelectedCompanyId } from '../utils/companyHelper';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const BalanceSheet = () => {
  const { user } = useAuth();
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [asOnDate, setAsOnDate] = useState(new Date().toISOString().split('T')[0]);
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    fetchData();
  }, [asOnDate]);

  const fetchData = async () => {
    try {
      const companyId = getSelectedCompanyId(user);
      const [ledgersRes, vouchersRes] = await Promise.all([
        api.get(`/ledgers?company=${companyId}`),
        api.get(`/vouchers?company=${companyId}&endDate=${asOnDate}`)
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

  const getBalanceSheetData = () => {
    const assets = {
      fixedAssets: [],
      currentAssets: [],
      investments: []
    };
    const liabilities = {
      capital: [],
      loans: [],
      currentLiabilities: [],
      reserves: []
    };

    ledgers.forEach(ledger => {
      const balance = calculateLedgerBalance(ledger._id);
      if (Math.abs(balance) > 0.01) {
        const groupName = ledger.group?.name || '';
        const nature = ledger.group?.nature || '';

        if (nature === 'Assets') {
          if (groupName.includes('Fixed Assets')) {
            assets.fixedAssets.push({ ...ledger, balance: Math.abs(balance) });
          } else if (groupName.includes('Current Assets') || groupName.includes('Bank') || groupName.includes('Cash')) {
            assets.currentAssets.push({ ...ledger, balance: Math.abs(balance) });
          } else if (groupName.includes('Investment')) {
            assets.investments.push({ ...ledger, balance: Math.abs(balance) });
          } else {
            assets.currentAssets.push({ ...ledger, balance: Math.abs(balance) });
          }
        } else if (nature === 'Liabilities') {
          if (groupName.includes('Capital')) {
            liabilities.capital.push({ ...ledger, balance: Math.abs(balance) });
          } else if (groupName.includes('Loan') || groupName.includes('Duties & Taxes')) {
            liabilities.loans.push({ ...ledger, balance: Math.abs(balance) });
          } else if (groupName.includes('Current Liabilities') || groupName.includes('Creditors')) {
            liabilities.currentLiabilities.push({ ...ledger, balance: Math.abs(balance) });
          } else if (groupName.includes('Reserves')) {
            liabilities.reserves.push({ ...ledger, balance: Math.abs(balance) });
          } else {
            liabilities.currentLiabilities.push({ ...ledger, balance: Math.abs(balance) });
          }
        }
      }
    });

    return { assets, liabilities };
  };

  const { assets, liabilities } = getBalanceSheetData();

  const totalAssets = [
    ...assets.fixedAssets,
    ...assets.currentAssets,
    ...assets.investments
  ].reduce((sum, item) => sum + item.balance, 0);

  const totalLiabilities = [
    ...liabilities.capital,
    ...liabilities.loans,
    ...liabilities.currentLiabilities,
    ...liabilities.reserves
  ].reduce((sum, item) => sum + item.balance, 0);

  const handleExportPDF = () => {
    const tableData = [
      ['LIABILITIES', '', 'ASSETS', ''],
      ['Capital Account:', '', 'Fixed Assets:', ''],
      ...liabilities.capital.map(l => [`  ${l.name}`, l.balance.toFixed(2), '', '']),
      ...assets.fixedAssets.map((a, i) => [i === 0 ? '' : '', '', `  ${a.name}`, a.balance.toFixed(2)]),
      ['Current Liabilities:', '', 'Current Assets:', ''],
      ...liabilities.currentLiabilities.map(l => [`  ${l.name}`, l.balance.toFixed(2), '', '']),
      ...assets.currentAssets.map((a, i) => [i === 0 ? '' : '', '', `  ${a.name}`, a.balance.toFixed(2)]),
      ['Total:', totalLiabilities.toFixed(2), 'Total:', totalAssets.toFixed(2)]
    ];
    exportToPDF('Balance Sheet', ['Liabilities', 'Amount (₹)', 'Assets', 'Amount (₹)'], tableData, 'balance-sheet', user.company.name);
  };

  const handleExportExcel = () => {
    const tableData = [
      ['LIABILITIES', '', 'ASSETS', ''],
      ['Capital Account:', '', 'Fixed Assets:', ''],
      ...liabilities.capital.map(l => [`  ${l.name}`, l.balance.toFixed(2), '', '']),
      ...assets.fixedAssets.map((a, i) => [i === 0 ? '' : '', '', `  ${a.name}`, a.balance.toFixed(2)]),
      ['Current Liabilities:', '', 'Current Assets:', ''],
      ...liabilities.currentLiabilities.map(l => [`  ${l.name}`, l.balance.toFixed(2), '', '']),
      ...assets.currentAssets.map((a, i) => [i === 0 ? '' : '', '', `  ${a.name}`, a.balance.toFixed(2)]),
      ['Total:', totalLiabilities.toFixed(2), 'Total:', totalAssets.toFixed(2)]
    ];
    exportToExcel('Balance Sheet', ['Liabilities', 'Amount (₹)', 'Assets', 'Amount (₹)'], tableData, 'balance-sheet', user.company.name);
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
          <h1 className="text-3xl font-bold">Balance Sheet</h1>
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
            <label className="block text-sm font-medium">As on Date:</label>
            <input
              type="date"
              value={asOnDate}
              onChange={(e) => setAsOnDate(e.target.value)}
              className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Liabilities Side */}
          <div className="bg-white rounded-lg shadow">
            <div className="bg-blue-600 text-white px-4 py-3 font-bold">Liabilities</div>
            <div className="p-4">
              {liabilities.capital.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2 text-blue-700">Capital Account</h3>
                  {liabilities.capital.map(ledger => (
                    <div key={ledger._id} className="flex justify-between py-1">
                      <span>{ledger.name}</span>
                      <span>₹{ledger.balance.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {liabilities.reserves.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2 text-blue-700">Reserves & Surplus</h3>
                  {liabilities.reserves.map(ledger => (
                    <div key={ledger._id} className="flex justify-between py-1">
                      <span>{ledger.name}</span>
                      <span>₹{ledger.balance.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {liabilities.loans.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2 text-blue-700">Loans & Advances</h3>
                  {liabilities.loans.map(ledger => (
                    <div key={ledger._id} className="flex justify-between py-1">
                      <span>{ledger.name}</span>
                      <span>₹{ledger.balance.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {liabilities.currentLiabilities.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2 text-blue-700">Current Liabilities</h3>
                  {liabilities.currentLiabilities.map(ledger => (
                    <div key={ledger._id} className="flex justify-between py-1">
                      <span>{ledger.name}</span>
                      <span>₹{ledger.balance.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t-2 pt-2 mt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">₹{totalLiabilities.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assets Side */}
          <div className="bg-white rounded-lg shadow">
            <div className="bg-green-600 text-white px-4 py-3 font-bold">Assets</div>
            <div className="p-4">
              {assets.fixedAssets.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2 text-green-700">Fixed Assets</h3>
                  {assets.fixedAssets.map(ledger => (
                    <div key={ledger._id} className="flex justify-between py-1">
                      <span>{ledger.name}</span>
                      <span>₹{ledger.balance.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {assets.investments.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2 text-green-700">Investments</h3>
                  {assets.investments.map(ledger => (
                    <div key={ledger._id} className="flex justify-between py-1">
                      <span>{ledger.name}</span>
                      <span>₹{ledger.balance.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {assets.currentAssets.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2 text-green-700">Current Assets</h3>
                  {assets.currentAssets.map(ledger => (
                    <div key={ledger._id} className="flex justify-between py-1">
                      <span>{ledger.name}</span>
                      <span>₹{ledger.balance.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t-2 pt-2 mt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">₹{totalAssets.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Balance Check</h3>
            <div className={`text-2xl font-bold ${Math.abs(totalAssets - totalLiabilities) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(totalAssets - totalLiabilities) < 0.01 ? '✓ Balanced' : '⚠ Not Balanced'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="flex justify-between py-2">
              <span>Total Assets:</span>
              <span className="font-bold">₹{totalAssets.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Total Liabilities:</span>
              <span className="font-bold">₹{totalLiabilities.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
