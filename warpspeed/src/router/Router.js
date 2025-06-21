import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Route components
import Login from '../components/login/login';
import Home from '../components/home/Home';
import PrivateRoute from './PrivateRoute';
import Menu from '../components/menu/Menu';
import Escalation from '../components/escalation/Escalation';
import Analytics from '../components/analytics/Analytics';

const AppRouter = () => (
    <BrowserRouter>
        <Routes>
            {/* First route: /login */}
            <Route path="/login" element={<Login />} />
            <Route
                path="/home"
                element={
                    <PrivateRoute>
                        <Home />
                    </PrivateRoute>
                }
            />
            <Route
                path="/:platform/menu"
                element={
                    <PrivateRoute>
                        <Menu />
                    </PrivateRoute>
                }
            />
            <Route
                path="/:platform/escalation"
                element={
                    <PrivateRoute>
                        <Escalation />
                    </PrivateRoute>
                }
            />
            <Route
                path="/:platform/analytics"
                element={
                    <PrivateRoute>
                        <Analytics />
                    </PrivateRoute>
                }
            />
            {/* Redirect root to appropriate page */}
            <Route
                path="/"
                element={
                    localStorage.getItem('user') ? (
                        <Navigate to="/home" replace />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            {/* Redirect unmatched routes */}
            <Route
                path="*"
                element={
                    localStorage.getItem('user') ? (
                        <Navigate to="/home" replace />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
        </Routes>
    </BrowserRouter>
);

export default AppRouter; 