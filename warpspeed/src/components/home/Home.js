import React from 'react';
import NavBar from '../NavBar/NavBar';
import Sidebar from '../Sidebar/Sidebar';

const Home = () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <>
            <NavBar />
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <div
                    style={{
                        flexGrow: 1,
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 'calc(100vh - 64px)',
                    }}
                >
                    <div style={{ textAlign: 'center', color: '#fff' }}>
                        <h1>Welcome {userData?.name || 'User'}!</h1>
                        <p>Streamline, analyze, escalate—everything in one place.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home; 