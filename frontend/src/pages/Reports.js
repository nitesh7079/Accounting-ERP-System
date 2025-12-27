import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const reportCategories = [
    {
      title: 'Financial Reports',
      reports: [
        { name: 'Trial Balance', path: '/reports/trial-balance', icon: '⚖️' },
        { name: 'Profit & Loss Account', path: '/reports/profit-loss', icon: '📊' },
        { name: 'Balance Sheet', path: '/reports/balance-sheet', icon: '📋' },
      ]
    },
    {
      title: 'Books',
      reports: [
        { name: 'Cash Book', path: '/reports/cash-book', icon: '💰' },
        { name: 'Bank Book', path: '/reports/bank-book', icon: '🏦' },
        { name: 'Day Book', path: '/reports/day-book', icon: '📖' },
      ]
    },
    {
      title: 'Outstanding Reports',
      reports: [
        { name: 'Receivables', path: '/reports/receivables', icon: '📥' },
        { name: 'Payables', path: '/reports/payables', icon: '📤' },
      ]
    },
    {
      title: 'Inventory Reports',
      reports: [
        { name: 'Stock Summary', path: '/reports/stock-summary', icon: '📦' },
      ]
    },
    {
      title: 'GST Reports',
      reports: [
        { name: 'GST Summary', path: '/reports/gst-summary', icon: '🧾' },
        { name: 'GSTR-1 (Sales)', path: '/reports/gstr1', icon: '📑' },
        { name: 'GSTR-2 (Purchase)', path: '/reports/gstr2', icon: '📄' },
      ]
    }
  ];

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Reports</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportCategories.map((category, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-primary">
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.reports.map((report, reportIdx) => (
                  <Link
                    key={reportIdx}
                    to={report.path}
                    className="flex items-center p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition"
                  >
                    <span className="text-2xl mr-3">{report.icon}</span>
                    <span className="font-medium">{report.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
