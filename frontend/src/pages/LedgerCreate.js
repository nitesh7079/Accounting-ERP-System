import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { getSelectedCompanyId } from '../utils/companyHelper';
import Navbar from '../components/Navbar';

const LedgerCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
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
    fetchGroups();
  }, [user]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      console.log('User:', user);
      const companyId = getSelectedCompanyId(user);
      if (companyId) {
        console.log('Fetching groups for company:', companyId);
        const response = await api.get(`/groups?company=${companyId}`);
        console.log('Groups response:', response.data);
        const groupData = response.data.data || [];
        setGroups(groupData);
        
        if (groupData.length === 0) {
          setError('No groups found for this company. Please create groups first.');
        }
      } else {
        // If no company assigned, fetch all groups
        console.log('No company found, fetching all groups');
        const response = await api.get('/groups');
        console.log('All groups response:', response.data);
        const groupData = response.data.data || [];
        setGroups(groupData);
        
        if (groupData.length === 0) {
          setError('No groups found. Please select a company and create groups first.');
        }
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Failed to load groups. ' + (error.response?.data?.message || error.message));
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
    
    if (!formData.group) {
      setError('Please select a group');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const companyId = getSelectedCompanyId(user);
      
      if (!companyId) {
        setError('Please select a company first');
        setLoading(false);
        return;
      }
      
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
        description: formData.description,
        company: companyId
      };

      await api.post('/ledgers', ledgerData);
      navigate('/ledgers');
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating ledger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Create Ledger</h1>

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
                disabled={loading || groups.length === 0}
              >
                <option value="">
                  {groups.length === 0 ? 'No groups available' : 'Select Group'}
                </option>
                {groups.map(group => (
                  <option key={group._id} value={group._id}>{group.name}</option>
                ))}
              </select>
              {groups.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  No groups found. Please ensure a company is selected and groups exist.
                </p>
              )}
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
                disabled={loading}
                className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Ledger'}
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

export default LedgerCreate;
