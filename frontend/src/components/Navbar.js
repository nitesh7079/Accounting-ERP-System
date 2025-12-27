import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Navbar = () => {
  const { user, logout, setSelectedCompany } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    localStorage.getItem('selectedCompanyId') || user?.company?._id || ''
  );

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setSelectedCompanyId(companyId);
    localStorage.setItem('selectedCompanyId', companyId);
    
    // Update user context with selected company
    const selectedCompany = companies.find(c => c._id === companyId);
    if (selectedCompany && setSelectedCompany) {
      setSelectedCompany(selectedCompany);
    }
    
    // Reload to refresh all data with new company
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('selectedCompanyId');
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">
            ERP System
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="hover:text-gray-200">Dashboard</Link>
            <Link to="/vouchers" className="hover:text-gray-200">Vouchers</Link>
            <Link to="/ledgers" className="hover:text-gray-200">Ledgers</Link>
            <Link to="/inventory" className="hover:text-gray-200">Inventory</Link>
            <Link to="/reports" className="hover:text-gray-200">Reports</Link>
            <Link to="/companies" className="hover:text-gray-200">Companies</Link>
            
            <div className="flex items-center space-x-4">
              {companies.length > 0 && (
                <select
                  value={selectedCompanyId}
                  onChange={handleCompanyChange}
                  className="bg-white text-gray-800 px-3 py-1 rounded text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              )}
              <span className="text-sm">
                {user?.username} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
