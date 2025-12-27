import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSelectedCompanyId } from '../utils/companyHelper';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const StockSummary = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockSummary();
  }, []);

  const fetchStockSummary = async () => {
    try {
      const companyId = getSelectedCompanyId(user);
      const response = await api.get(`/inventory?company=${companyId}`);
      setItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching stock summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalValue = () => {
    return items.reduce((sum, item) => sum + (item.currentStock?.value || 0), 0);
  };

  const getTotalQuantity = () => {
    return items.reduce((sum, item) => sum + (item.currentStock?.quantity || 0), 0);
  };

  const handleExportPDF = () => {
    const tableData = items.map(item => [
      item.code || '-',
      item.name,
      item.unit,
      (item.currentStock?.quantity || 0).toFixed(2),
      item.rate?.toFixed(2),
      (item.currentStock?.value || 0).toFixed(2),
      item.currentStock?.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock'
    ]);
    tableData.push(['', 'Total', '', '', '', getTotalValue().toFixed(2), '']);
    exportToPDF('Stock Summary', ['Code', 'Name', 'Unit', 'Quantity', 'Rate', 'Value (₹)', 'Status'], tableData, 'stock-summary', user.company.name);
  };

  const handleExportExcel = () => {
    const tableData = items.map(item => [
      item.code || '-',
      item.name,
      item.unit,
      (item.currentStock?.quantity || 0).toFixed(2),
      item.rate?.toFixed(2),
      (item.currentStock?.value || 0).toFixed(2),
      item.currentStock?.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock'
    ]);
    tableData.push(['', 'Total', '', '', '', getTotalValue().toFixed(2), '']);
    exportToExcel('Stock Summary', ['Code', 'Name', 'Unit', 'Quantity', 'Rate', 'Value (₹)', 'Status'], tableData, 'stock-summary', user.company.name);
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
          <h1 className="text-3xl font-bold">Stock Summary</h1>
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
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm text-gray-600 mb-1">Total Items</div>
              <div className="text-3xl font-bold text-blue-600">{items.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-sm text-gray-600 mb-1">Total Quantity</div>
              <div className="text-3xl font-bold text-green-600">{getTotalQuantity().toFixed(2)}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-sm text-gray-600 mb-1">Total Value</div>
              <div className="text-3xl font-bold text-purple-600">₹{getTotalValue().toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-orange-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Item Code</th>
                <th className="px-4 py-3 text-left">Item Name</th>
                <th className="px-4 py-3 text-left">Unit</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Value</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => {
                const isLowStock = item.currentStock?.quantity <= item.reorderLevel;
                return (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{item.code || '-'}</td>
                    <td className="px-4 py-3 font-semibold">{item.name}</td>
                    <td className="px-4 py-3">{item.unit}</td>
                    <td className="px-4 py-3 text-right">
                      {item.currentStock?.quantity?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 text-right">₹{item.rate?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ₹{item.currentStock?.value?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isLowStock ? (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                          Low Stock
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-orange-100 font-bold">
                <td colSpan="5" className="px-4 py-3 text-right">Total Stock Value:</td>
                <td className="px-4 py-3 text-right">₹{getTotalValue().toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No inventory items found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockSummary;
