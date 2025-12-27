import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';

const CompanyList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch companies');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await api.delete(`/companies/${id}`);
        fetchCompanies();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete company');
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Loading companies...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Companies</h1>
          <Link
            to="/companies/create"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            + Create Company
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {companies.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No companies found. Create your first company to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company._id}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {company.name}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      company.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {company.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-2 mb-4">
                  {company.address && (
                    <p>
                      📍 {company.address.city && `${company.address.city}, `}
                      {company.address.state}
                    </p>
                  )}
                  {company.gstin && <p>🏢 GSTIN: {company.gstin}</p>}
                  {company.email && <p>📧 {company.email}</p>}
                  {company.phone && <p>📞 {company.phone}</p>}
                  {company.financialYear && (
                    <p>
                      📅 FY: {new Date(company.financialYear.startDate).toLocaleDateString()} - {new Date(company.financialYear.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/companies/${company._id}`}
                    className="flex-1 bg-blue-500 text-white text-center px-4 py-2 rounded hover:bg-blue-600"
                  >
                    View
                  </Link>
                  <Link
                    to={`/companies/edit/${company._id}`}
                    className="flex-1 bg-yellow-500 text-white text-center px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(company._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CompanyList;
