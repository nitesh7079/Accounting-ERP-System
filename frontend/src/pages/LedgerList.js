import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const LedgerList = () => {
  const { user } = useAuth();
  const [ledgers, setLedgers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (user?.company?._id) {
        const [ledgersRes, groupsRes] = await Promise.all([
          api.get(`/ledgers?company=${user.company._id}`),
          api.get(`/groups?company=${user.company._id}`)
        ]);

        setLedgers(ledgersRes.data.data);
        setGroups(groupsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLedgers = ledgers.filter(ledger => {
    const matchesSearch = ledger.name.toLowerCase().includes(filter.toLowerCase());
    const matchesGroup = !selectedGroup || ledger.group._id === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ledger?')) {
      try {
        await api.delete(`/ledgers/${id}`);
        setLedgers(ledgers.filter(l => l._id !== id));
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting ledger');
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
          <h1 className="text-3xl font-bold">Ledgers</h1>
          <Link
            to="/ledgers/create"
            className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Create Ledger
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search ledgers..."
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Group</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Groups</option>
                {groups.map(group => (
                  <option key={group._id} value={group._id}>{group.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Ledgers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opening Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLedgers.map(ledger => (
                <tr key={ledger._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{ledger.name}</td>
                  <td className="px-6 py-4">{ledger.group.name}</td>
                  <td className="px-6 py-4">
                    ₹{ledger.openingBalance.amount} {ledger.openingBalance.type}
                  </td>
                  <td className="px-6 py-4">
                    ₹{ledger.currentBalance.amount} {ledger.currentBalance.type}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/ledgers/${ledger._id}`}
                      className="text-blue-600 hover:underline mr-4"
                    >
                      View
                    </Link>
                    <Link
                      to={`/ledgers/edit/${ledger._id}`}
                      className="text-green-600 hover:underline mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(ledger._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLedgers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No ledgers found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LedgerList;
