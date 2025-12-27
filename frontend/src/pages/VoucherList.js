import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const VoucherList = () => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voucherType, setVoucherType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchVouchers();
  }, [voucherType, startDate, endDate]);

  const fetchVouchers = async () => {
    try {
      if (user?.company?._id) {
        let url = `/vouchers?company=${user.company._id}`;
        if (voucherType) url += `&voucherType=${voucherType}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        const response = await api.get(url);
        setVouchers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      try {
        await api.delete(`/vouchers/${id}`);
        setVouchers(vouchers.filter(v => v._id !== id));
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting voucher');
      }
    }
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
          <h1 className="text-3xl font-bold">Vouchers</h1>
          <div className="flex gap-3">
            <div className="relative group">
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                Create Voucher
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded shadow-lg border hidden group-hover:block z-10">
                <Link to="/vouchers/contra" className="block px-4 py-2 hover:bg-gray-100 text-gray-800">
                  <span className="font-semibold">F4:</span> Contra
                </Link>
                <Link to="/vouchers/payment" className="block px-4 py-2 hover:bg-gray-100 text-gray-800">
                  <span className="font-semibold">F5:</span> Payment
                </Link>
                <Link to="/vouchers/receipt" className="block px-4 py-2 hover:bg-gray-100 text-gray-800">
                  <span className="font-semibold">F6:</span> Receipt
                </Link>
                <Link to="/vouchers/journal" className="block px-4 py-2 hover:bg-gray-100 text-gray-800">
                  <span className="font-semibold">F7:</span> Journal
                </Link>
                <Link to="/vouchers/sales" className="block px-4 py-2 hover:bg-gray-100 text-gray-800">
                  <span className="font-semibold">F8:</span> Sales
                </Link>
                <Link to="/vouchers/purchase" className="block px-4 py-2 hover:bg-gray-100 text-gray-800">
                  <span className="font-semibold">F9:</span> Purchase
                </Link>
                <div className="border-t border-gray-200"></div>
                <Link to="/vouchers/create" className="block px-4 py-2 hover:bg-gray-100 text-gray-800">
                  Other Vouchers
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Voucher Type</label>
              <select
                value={voucherType}
                onChange={(e) => setVoucherType(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Types</option>
                <option value="Payment">Payment</option>
                <option value="Receipt">Receipt</option>
                <option value="Contra">Contra</option>
                <option value="Journal">Journal</option>
                <option value="Sales">Sales</option>
                <option value="Purchase">Purchase</option>
                <option value="Credit Note">Credit Note</option>
                <option value="Debit Note">Debit Note</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Vouchers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voucher No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Narration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vouchers.map(voucher => (
                <tr key={voucher._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{voucher.voucherNumber}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {voucher.voucherType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(voucher.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">₹{voucher.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">{voucher.narration}</td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/vouchers/${voucher._id}`}
                      className="text-blue-600 hover:underline mr-4"
                    >
                      View
                    </Link>
                    <Link
                      to={`/vouchers/edit/${voucher._id}`}
                      className="text-green-600 hover:underline mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(voucher._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {vouchers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No vouchers found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoucherList;
