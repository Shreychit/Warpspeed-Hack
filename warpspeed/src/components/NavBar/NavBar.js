import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

const NavBar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        // Clear Google session and local storage
        try {
            googleLogout();
        } catch (err) {
            console.warn('Google logout issue', err);
        }
        localStorage.removeItem('user');
        handleClose();
        navigate('/login');
    };

    const avatarSrc = user?.picture || '';
    const avatarAlt = user?.name || 'U';

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{ backgroundColor: '#000', boxShadow: 'none' }}
        >
            <Toolbar>
                <Box sx={{ flexGrow: 1 }} />

                {/* Profile Icon */}
                <IconButton edge="end" onClick={handleAvatarClick} size="large" sx={{ color: 'inherit' }}>
                    {avatarSrc ? (
                        <Avatar src={avatarSrc} alt={avatarAlt} />
                    ) : (
                        <Avatar>{avatarAlt.charAt(0)}</Avatar>
                    )}
                </IconButton>

                {/* Dropdown Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar; 