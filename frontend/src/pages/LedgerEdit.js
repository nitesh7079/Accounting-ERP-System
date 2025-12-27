import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const LedgerEdit = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    group: '',
    openingBalanceAmount: 0,
    openingBalanceType: 'Dr',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [ledgerRes, groupsRes] = await Promise.all([
        api.get(`/ledgers/${id}`),
        user?.company?._id 
          ? api.get(`/groups?company=${user.company._id}`)
          : api.get('/groups')
      ]);

      const ledger = ledgerRes.data.data;
      setFormData({
        name: ledger.name,
        alias: ledger.alias || '',
        group: ledger.group?._id || '',
        openingBalanceAmount: ledger.openingBalance?.amount || 0,
        openingBalanceType: ledger.openingBalance?.type || 'Dr',
        description: ledger.description || ''
      });

      setGroups(groupsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load ledger details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const ledgerData = {
        name: formData.name,
        alias: formData.alias,
        group: formData.group,
        openingBalance: {
          amount: parseFloat(formData.openingBalanceAmount),
          type: formData.openingBalanceType,
          date: new Date()
        },
        currentBalance: {
          amount: parseFloat(formData.openingBalanceAmount),
          type: formData.openingBalanceType
        },
        description: formData.description
      };

      await api.put(`/ledgers/${id}`, ledgerData);
      navigate('/ledgers');
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating ledger');
    } finally {
      setSaving(false);
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Edit Ledger</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Ledger Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Alias</label>
              <input
                type="text"
                name="alias"
                value={formData.alias}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Under Group *</label>
              <select
                name="group"
                value={formData.group}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Group</option>
                {groups.map(group => (
                  <option key={group._id} value={group._id}>{group.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Opening Balance</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="openingBalanceAmount"
                  value={formData.openingBalanceAmount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  step="0.01"
                />
                <select
                  name="openingBalanceType"
                  value={formData.openingBalanceType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Dr">Debit</option>
                  <option value="Cr">Credit</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? 'Updating...' : 'Update Ledger'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/ledgers')}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LedgerEdit;
