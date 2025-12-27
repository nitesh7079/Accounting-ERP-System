import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LedgerList from './pages/LedgerList';
import LedgerCreate from './pages/LedgerCreate';
import LedgerView from './pages/LedgerView';
import LedgerEdit from './pages/LedgerEdit';
import InventoryList from './pages/InventoryList';
import InventoryCreate from './pages/InventoryCreate';
import InventoryView from './pages/InventoryView';
import InventoryEdit from './pages/InventoryEdit';
import VoucherList from './pages/VoucherList';
import VoucherCreate from './pages/VoucherCreate';
import VoucherView from './pages/VoucherView';
import VoucherEdit from './pages/VoucherEdit';
import SalesVoucher from './pages/SalesVoucher';
import ContraVoucher from './pages/ContraVoucher';
import PaymentVoucher from './pages/PaymentVoucher';
import ReceiptVoucher from './pages/ReceiptVoucher';
import JournalVoucher from './pages/JournalVoucher';
import PurchaseVoucher from './pages/PurchaseVoucher';
import Reports from './pages/Reports';
import TrialBalance from './pages/TrialBalance';
import CashBook from './pages/CashBook';
import BankBook from './pages/BankBook';
import DayBook from './pages/DayBook';
import StockSummary from './pages/StockSummary';
import ProfitLoss from './pages/ProfitLoss';
import BalanceSheet from './pages/BalanceSheet';
import Receivables from './pages/Receivables';
import Payables from './pages/Payables';
import CompanyList from './pages/CompanyList';
import CompanyCreate from './pages/CompanyCreate';
import CompanyView from './pages/CompanyView';
import CompanyEdit from './pages/CompanyEdit';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/ledgers" element={
            <PrivateRoute>
              <LedgerList />
            </PrivateRoute>
          } />

          <Route path="/ledgers/create" element={
            <PrivateRoute>
              <LedgerCreate />
            </PrivateRoute>
          } />

          <Route path="/ledgers/:id" element={
            <PrivateRoute>
              <LedgerView />
            </PrivateRoute>
          } />

          <Route path="/ledgers/edit/:id" element={
            <PrivateRoute>
              <LedgerEdit />
            </PrivateRoute>
          } />

          <Route path="/inventory" element={
            <PrivateRoute>
              <InventoryList />
            </PrivateRoute>
          } />

          <Route path="/inventory/create" element={
            <PrivateRoute>
              <InventoryCreate />
            </PrivateRoute>
          } />

          <Route path="/inventory/:id" element={
            <PrivateRoute>
              <InventoryView />
            </PrivateRoute>
          } />

          <Route path="/inventory/edit/:id" element={
            <PrivateRoute>
              <InventoryEdit />
            </PrivateRoute>
          } />

          <Route path="/vouchers" element={
            <PrivateRoute>
              <VoucherList />
            </PrivateRoute>
          } />

          <Route path="/vouchers/create" element={
            <PrivateRoute>
              <VoucherCreate />
            </PrivateRoute>
          } />

          <Route path="/vouchers/:id" element={
            <PrivateRoute>
              <VoucherView />
            </PrivateRoute>
          } />

          <Route path="/vouchers/edit/:id" element={
            <PrivateRoute>
              <VoucherEdit />
            </PrivateRoute>
          } />

          <Route path="/vouchers/sales" element={
            <PrivateRoute>
              <SalesVoucher />
            </PrivateRoute>
          } />

          <Route path="/vouchers/purchase" element={
            <PrivateRoute>
              <PurchaseVoucher />
            </PrivateRoute>
          } />

          <Route path="/vouchers/contra" element={
            <PrivateRoute>
              <ContraVoucher />
            </PrivateRoute>
          } />

          <Route path="/vouchers/payment" element={
            <PrivateRoute>
              <PaymentVoucher />
            </PrivateRoute>
          } />

          <Route path="/vouchers/receipt" element={
            <PrivateRoute>
              <ReceiptVoucher />
            </PrivateRoute>
          } />

          <Route path="/vouchers/journal" element={
            <PrivateRoute>
              <JournalVoucher />
            </PrivateRoute>
          } />

          <Route path="/reports" element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          } />

          <Route path="/reports/trial-balance" element={
            <PrivateRoute>
              <TrialBalance />
            </PrivateRoute>
          } />

          <Route path="/reports/cash-book" element={
            <PrivateRoute>
              <CashBook />
            </PrivateRoute>
          } />

          <Route path="/reports/bank-book" element={
            <PrivateRoute>
              <BankBook />
            </PrivateRoute>
          } />

          <Route path="/reports/day-book" element={
            <PrivateRoute>
              <DayBook />
            </PrivateRoute>
          } />

          <Route path="/reports/stock-summary" element={
            <PrivateRoute>
              <StockSummary />
            </PrivateRoute>
          } />

          <Route path="/reports/profit-loss" element={
            <PrivateRoute>
              <ProfitLoss />
            </PrivateRoute>
          } />

          <Route path="/reports/balance-sheet" element={
            <PrivateRoute>
              <BalanceSheet />
            </PrivateRoute>
          } />

          <Route path="/reports/receivables" element={
            <PrivateRoute>
              <Receivables />
            </PrivateRoute>
          } />

          <Route path="/reports/payables" element={
            <PrivateRoute>
              <Payables />
            </PrivateRoute>
          } />

          <Route path="/companies" element={
            <PrivateRoute>
              <CompanyList />
            </PrivateRoute>
          } />

          <Route path="/companies/create" element={
            <PrivateRoute>
              <CompanyCreate />
            </PrivateRoute>
          } />

          <Route path="/companies/:id" element={
            <PrivateRoute>
              <CompanyView />
            </PrivateRoute>
          } />

          <Route path="/companies/edit/:id" element={
            <PrivateRoute>
              <CompanyEdit />
            </PrivateRoute>
          } />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
