import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const ReceiptVoucher = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    voucherNumber: '',
    date: new Date().toISOString().split('T')[0],
    account: '',
    entries: [{ ledger: '', amount: 0 }],
    narration: ''
  });

  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    fetchLedgers();
    generateVoucherNumber();
  }, []);

  const fetchLedgers = async () => {
    try {
      const response = user?.company?._id 
        ? await api.get(`/ledgers?company=${user.company._id}`)
        : await api.get('/ledgers');
      setLedgers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
    }
  };

  const generateVoucherNumber = () => {
    const timestamp = Date.now().toString().slice(-4);
    setFormData(prev => ({ ...prev, voucherNumber: `REC-${timestamp}` }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'account') {
      const account = ledgers.find(l => l._id === value);
      setSelectedAccount(account);
    }
  };

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...formData.entries];
    newEntries[index][field] = value;
    setFormData(prev => ({ ...prev, entries: newEntries }));
  };

  const addEntry = () => {
    setFormData(prev => ({
      ...prev,
      entries: [...prev.entries, { ledger: '', amount: 0 }]
    }));
  };

  const removeEntry = (index) => {
    if (formData.entries.length > 1) {
      setFormData(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotal = () => {
    return formData.entries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.account) {
      setError('Please select receipt account');
      return;
    }

    if (formData.entries.some(e => !e.ledger || e.amount <= 0)) {
      setError('All entries must have valid ledger and amount');
      return;
    }

    setLoading(true);

    try {
      const totalAmount = calculateTotal();
      const voucherData = {
        voucherNumber: formData.voucherNumber,
        voucherType: 'Receipt',
        date: formData.date,
        narration: formData.narration,
        company: user.company._id,
        totalAmount: totalAmount,
        entries: [
          { ledger: formData.account, type: 'Dr', amount: totalAmount },
          ...formData.entries.map(e => ({ ledger: e.ledger, type: 'Cr', amount: parseFloat(e.amount) }))
        ]
      };

      await api.post('/vouchers', voucherData);
      navigate('/vouchers');
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating receipt voucher');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = calculateTotal();

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-red-800 text-white px-4 py-2 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-bold">Receipt</span>
            <span>No. {formData.voucherNumber}</span>
          </div>
          <div className="text-right text-sm">
            Miti: <br />
            {new Date(formData.date).toLocaleDateString('en-GB', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric',
              weekday: 'long'
            })}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-gray-50 p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-1">
                <label className="text-sm">Account:</label>
                <select
                  name="account"
                  value={formData.account}
                  onChange={handleChange}
                  className="flex-1 px-3 py-1 border bg-white font-bold"
                  required
                >
                  <option value="">Select Account</option>
                  {ledgers.filter(l => l.group?.name === 'Cash-in-Hand' || l.group?.name === 'Bank Accounts').map(ledger => (
                    <option key={ledger._id} value={ledger._id}>{ledger.name}</option>
                  ))}
                </select>
              </div>
              {selectedAccount && (
                <div className="text-sm italic">
                  Cur Bal: {selectedAccount.currentBalance?.amount?.toFixed(2)} {selectedAccount.currentBalance?.type}
                </div>
              )}
            </div>

            <div className="bg-white border mb-4">
              <div className="grid grid-cols-2 bg-gray-200 border-b">
                <div className="px-4 py-2 font-semibold text-sm">Particulars</div>
                <div className="px-4 py-2 font-semibold text-sm text-right">Amount</div>
              </div>
              {formData.entries.map((entry, index) => (
                <div key={index} className="grid grid-cols-2 border-b">
                  <div className="px-4 py-3">
                    <select
                      value={entry.ledger}
                      onChange={(e) => handleEntryChange(index, 'ledger', e.target.value)}
                      className="w-full px-2 py-1 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Ledger</option>
                      {ledgers.map(ledger => (
                        <option key={ledger._id} value={ledger._id}>{ledger.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="px-4 py-3 border-l flex justify-between items-center">
                    <input
                      type="number"
                      value={entry.amount}
                      onChange={(e) => handleEntryChange(index, 'amount', e.target.value)}
                      className="w-full text-right px-2 py-1 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                      required
                    />
                    {formData.entries.length > 1 && (
                      <button type="button" onClick={() => removeEntry(index)} className="ml-2 text-red-600 text-sm">✕</button>
                    )}
                  </div>
                </div>
              ))}
              <div className="px-4 py-2">
                <button type="button" onClick={addEntry} className="text-blue-600 text-sm">+ Add Entry</button>
              </div>
            </div>

            <div className="mb-4 text-right">
              <span className="font-bold">Total: ₹{totalAmount.toFixed(2)}</span>
            </div>

            <div className="mb-6">
              <label className="block text-sm mb-1">Narration:</label>
              <textarea
                name="narration"
                value={formData.narration}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border bg-white"
              />
            </div>

            <div className="flex gap-4 pt-4 border-t-2 border-gray-300">
              <button type="button" onClick={() => navigate('/vouchers')} className="bg-gray-500 text-white px-6 py-2 hover:bg-gray-600">Q: Quit</button>
              <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-2 hover:bg-green-700 disabled:bg-gray-400">{loading ? 'Saving...' : 'A: Accept'}</button>
              <button type="button" className="bg-red-600 text-white px-6 py-2 hover:bg-red-700">D: Delete</button>
              <button type="button" onClick={() => window.location.reload()} className="bg-yellow-600 text-white px-6 py-2 hover:bg-yellow-700">X: Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceiptVoucher;
