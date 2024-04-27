import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/LoginPage/Login.jsx';
import Dashboard from './components/DashboardPage/dashboard.jsx';



const App = () => {
    return (

        <Login/>
    );
};

export default App;
