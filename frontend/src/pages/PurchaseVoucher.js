import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const PurchaseVoucher = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ledgers, setLedgers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    voucherNumber: '',
    date: new Date().toISOString().split('T')[0],
    ref: '',
    partyAccount: '',
    purchaseLedger: '',
    items: [
      { inventoryItem: '', quantity: 1, rate: 0, amount: 0 }
    ],
    narration: ''
  });

  const [selectedParty, setSelectedParty] = useState(null);

  useEffect(() => {
    fetchData();
    generateVoucherNumber();
  }, []);

  const fetchData = async () => {
    try {
      const [ledgersRes, itemsRes] = await Promise.all([
        user?.company?._id 
          ? api.get(`/ledgers?company=${user.company._id}`)
          : api.get('/ledgers'),
        user?.company?._id 
          ? api.get(`/inventory?company=${user.company._id}`)
          : api.get('/inventory')
      ]);
      
      setLedgers(ledgersRes.data.data || []);
      setInventoryItems(itemsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const generateVoucherNumber = () => {
    const timestamp = Date.now().toString().slice(-4);
    setFormData(prev => ({ ...prev, voucherNumber: `PUR-${timestamp}` }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'partyAccount') {
      const party = ledgers.find(l => l._id === value);
      setSelectedParty(party);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(newItems[index].quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = qty * rate;
    }

    if (field === 'inventoryItem') {
      const item = inventoryItems.find(i => i._id === value);
      if (item) {
        newItems[index].rate = item.rate || 0;
        const qty = parseFloat(newItems[index].quantity) || 0;
        newItems[index].amount = qty * item.rate;
      }
    }

    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { inventoryItem: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.partyAccount || !formData.purchaseLedger) {
      setError('Please select Party Account and Purchase Ledger');
      return;
    }

    setLoading(true);

    try {
      const totalAmount = calculateTotal();
      const voucherData = {
        voucherNumber: formData.voucherNumber,
        voucherType: 'Purchase',
        date: formData.date,
        party: formData.partyAccount,
        narration: formData.narration,
        company: user.company._id,
        totalAmount: totalAmount,
        entries: [
          { ledger: formData.purchaseLedger, type: 'Dr', amount: totalAmount },
          { ledger: formData.partyAccount, type: 'Cr', amount: totalAmount }
        ],
        items: formData.items.map(item => ({
          inventoryItem: item.inventoryItem,
          quantity: parseFloat(item.quantity),
          rate: parseFloat(item.rate),
          amount: parseFloat(item.amount)
        }))
      };

      await api.post('/vouchers', voucherData);
      navigate('/vouchers');
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating purchase voucher');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = calculateTotal();

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-red-700 text-white px-4 py-2 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-bold">Purchase</span>
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
              <label className="block text-sm mb-1">Ref:</label>
              <input
                type="text"
                name="ref"
                value={formData.ref}
                onChange={handleChange}
                className="w-full px-3 py-1 border bg-white"
                placeholder="Reference"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-1">
                <label className="text-sm">Party's A/c Name:</label>
                <select
                  name="partyAccount"
                  value={formData.partyAccount}
                  onChange={handleChange}
                  className="flex-1 px-3 py-1 border bg-white font-bold"
                  required
                >
                  <option value="">Select Party</option>
                  {ledgers
                    .filter(l => l.group?.name === 'Sundry Creditors' || l.group?.name === 'Sundry Debtors')
                    .map(ledger => (
                      <option key={ledger._id} value={ledger._id}>{ledger.name}</option>
                    ))}
                </select>
              </div>
              {selectedParty && (
                <div className="text-sm italic">
                  Current Balance: ₹{selectedParty.currentBalance?.amount?.toFixed(2)} {selectedParty.currentBalance?.type}
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <label className="text-sm">Purchase Ledger:</label>
                <select
                  name="purchaseLedger"
                  value={formData.purchaseLedger}
                  onChange={handleChange}
                  className="flex-1 px-3 py-1 border bg-white"
                  required
                >
                  <option value="">Select Purchase Ledger</option>
                  {ledgers
                    .filter(l => l.group?.name === 'Purchase Accounts' || l.group?.name === 'Purchase')
                    .map(ledger => (
                      <option key={ledger._id} value={ledger._id}>{ledger.name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mb-4 bg-white">
              <table className="w-full border-collapse">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border px-2 py-2 text-left text-sm">Name of Item</th>
                    <th className="border px-2 py-2 text-right text-sm w-24">Quantity</th>
                    <th className="border px-2 py-2 text-right text-sm w-32">Rate</th>
                    <th className="border px-2 py-2 text-center text-sm w-16">per</th>
                    <th className="border px-2 py-2 text-right text-sm w-32">Amount</th>
                    <th className="border px-2 py-2 text-center text-sm w-20">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border px-2 py-1">
                        <select
                          value={item.inventoryItem}
                          onChange={(e) => handleItemChange(index, 'inventoryItem', e.target.value)}
                          className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Item</option>
                          {inventoryItems.map(invItem => (
                            <option key={invItem._id} value={invItem._id}>{invItem.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full text-right px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          step="0.01"
                          min="0"
                          required
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          className="w-full text-right px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          step="0.01"
                          min="0"
                          required
                        />
                      </td>
                      <td className="border px-2 py-1 text-center text-sm">
                        {inventoryItems.find(i => i._id === item.inventoryItem)?.unit || '-'}
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          value={item.amount}
                          readOnly
                          className="w-full text-right px-2 py-1 border-0 bg-gray-50 font-semibold"
                          step="0.01"
                        />
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="6" className="border-0 py-2">
                      <button type="button" onClick={addItem} className="text-blue-600 hover:text-blue-800 text-sm font-medium">+ Add Item</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mb-4 text-right">
              <div className="inline-block bg-yellow-100 px-6 py-2 border border-gray-400">
                <span className="font-bold text-lg">Total Amount: ₹{totalAmount.toFixed(2)}</span>
              </div>
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

export default PurchaseVoucher;
