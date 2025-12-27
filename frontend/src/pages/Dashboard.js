import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (user?.company?._id) {
        const response = await api.get(`/reports/dashboard?company=${user.company._id}`);
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            No company selected. Please select a company to view the dashboard.
          </div>
        </div>
      </div>
    );
  }

  const { summary, charts } = dashboardData;

  const salesChartData = {
    labels: charts.monthlySales.map(m => m.month),
    datasets: [
      {
        label: 'Monthly Sales',
        data: charts.monthlySales.map(m => m.sales),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      }
    ]
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard - {dashboardData.company}</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-600 text-sm uppercase mb-2">Total Sales</h3>
            <p className="text-3xl font-bold text-green-600">₹{summary.totalSales}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-600 text-sm uppercase mb-2">Total Purchase</h3>
            <p className="text-3xl font-bold text-red-600">₹{summary.totalPurchase}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-600 text-sm uppercase mb-2">Cash Balance</h3>
            <p className="text-3xl font-bold text-blue-600">₹{summary.cashBalance}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-600 text-sm uppercase mb-2">Bank Balance</h3>
            <p className="text-3xl font-bold text-purple-600">₹{summary.bankBalance}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-600 text-sm uppercase mb-2">Profit/Loss</h3>
            <p className={`text-3xl font-bold ${parseFloat(summary.profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{summary.profit}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {summary.profitPercentage}% margin
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Monthly Sales Trend</h3>
            <Line data={salesChartData} options={{ responsive: true }} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <div className="space-y-3">
              <a href="/vouchers/create" className="block px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded">
                Create New Voucher
              </a>
              <a href="/ledgers/create" className="block px-4 py-3 bg-green-50 hover:bg-green-100 rounded">
                Create New Ledger
              </a>
              <a href="/inventory/create" className="block px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded">
                Add Inventory Item
              </a>
              <a href="/reports/trial-balance" className="block px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded">
                View Trial Balance
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
