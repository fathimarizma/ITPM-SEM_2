import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout & Routing Elements
import MainLayout from './components/Layout/MainLayout';
import { ProtectedRoute } from './components/Routing/ProtectedRoute';
import { RoleRoute } from './components/Routing/RoleRoute';

// Pages
import Landing from './pages/Landing';
import About from './pages/About';
import SearchBoardings from './pages/Boardings/SearchBoardings';
import Dashboard from './pages/Dashboard';
import MyListings from './pages/MyListings';
import AddListing from './pages/AddListing';
import EditListing from './pages/EditListing';
import Payment from './pages/Payment';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyEmail from './pages/Auth/VerifyEmail';
import Profile from './pages/Profile/Profile';
import AdminDashboard from './pages/Admin/AdminDashboard';
import RoommateSearch from './pages/Roommates/RoommateSearch';
import CreateRoommatePost from './pages/Roommates/CreateRoommatePost';
import EditRoommatePost from './pages/Roommates/EditRoommatePost';
import RoommateProfile from './pages/Roommates/RoommateProfile';
import MyMatches from './pages/Roommates/MyMatches';
import SavedBoardings from './pages/Boardings/SavedBoardings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/403" element={
          <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
              <p className="text-xl text-gray-700">Access Denied</p>
            </div>
          </div>
        } />

        {/* Public Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<SearchBoardings />} />

        {/* Roommate Finder Pages */}
        <Route path="/roommates" element={<RoommateSearch />} />
        <Route path="/roommates/add" element={<ProtectedRoute><CreateRoommatePost /></ProtectedRoute>} />
        <Route path="/roommates/edit/:id" element={<ProtectedRoute><EditRoommatePost /></ProtectedRoute>} />
        <Route path="/roommates/matches" element={<ProtectedRoute><MyMatches /></ProtectedRoute>} />
        <Route path="/roommates/:id" element={<RoommateProfile />} />

        {/* Protected Dashboard Routes */}
        <Route path="/saved-boardings" element={<ProtectedRoute><SavedBoardings /></ProtectedRoute>} />
        
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          
          <Route path="/dashboard" element={
            <RoleRoute roles={['Owner']}><Dashboard /></RoleRoute>
          } />
          
          <Route path="listings" element={
            <RoleRoute roles={['Owner']}><MyListings /></RoleRoute>
          } />
          
          <Route path="listings/add" element={
            <RoleRoute roles={['Owner']}><AddListing /></RoleRoute>
          } />
          
          <Route path="listings/payment" element={
            <RoleRoute roles={['Owner']}><Payment /></RoleRoute>
          } />
          
          <Route path="listings/edit/:id" element={
            <RoleRoute roles={['Owner']}><EditListing /></RoleRoute>
          } />

          <Route path="admin" element={
            <RoleRoute roles={['Admin']}><AdminDashboard /></RoleRoute>
          } />



          <Route path="profile" element={<Profile />} />

        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
