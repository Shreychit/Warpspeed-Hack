import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import { makeStyles } from '@mui/styles';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ReportIcon from '@mui/icons-material/Report';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HomeIcon from '@mui/icons-material/Home';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const useStyles = makeStyles(() => ({
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#2e2b2b',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRight: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            paddingTop: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            margin: 10,
            height: 'calc(100% - 20px)',
            borderRadius: 12,
            position: 'fixed',
        },
    },
    nested: {
        paddingLeft: 32,
    },
    listItemButton: {
        '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.08)',
        },
    },
    listItemText: {
        '& .MuiTypography-root': {
            fontSize: 14,
        },
    },
    bottomCard: {
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: 12,
        margin: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.18)',
    },
    bottomButton: {
        marginTop: 12,
        color: '#fff',
        borderColor: '#fff',
        textTransform: 'none',
    },
}));

const platforms = [
    { key: 'magicpin', label: 'Magicpin' },
    { key: 'swiggy', label: 'Swiggy' },
    { key: 'zomato', label: 'Zomato' },
];

const subItems = [
    { key: 'menu', label: 'Menu', icon: <MenuBookIcon /> },
    { key: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
    { key: 'escalation', label: 'Escalation', icon: <ReportIcon /> },
];

const Sidebar = () => {
    const classes = useStyles();
    const navigate = useNavigate();
    const [openSections, setOpenSections] = useState({});

    const handleToggle = (key) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <Drawer className={classes.drawer} variant="permanent" anchor="left">
            <List sx={{ flexGrow: 1 }}>
                {/* Home */}
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate('/home')}>
                        <ListItemIcon sx={{ color: 'white' }}>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Home" />
                    </ListItemButton>
                </ListItem>

                {/* Merchant */}
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleToggle('merchant')}>
                        <ListItemIcon sx={{ color: 'white' }}>
                            <StorefrontIcon />
                        </ListItemIcon>
                        <ListItemText primary="Merchant" />
                        {openSections['merchant'] ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />}
                    </ListItemButton>
                </ListItem>
                <Collapse in={openSections['merchant']} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {platforms.map((platform) => (
                            <React.Fragment key={platform.key}>
                                {/* Platform header */}
                                <ListItem disablePadding className={classes.nested}>
                                    <ListItemButton onClick={() => handleToggle(`platform-${platform.key}`)}>
                                        <ListItemIcon sx={{ color: 'white' }}>
                                            <RestaurantIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={platform.label} />
                                        {openSections[`platform-${platform.key}`] ? (
                                            <ExpandLess sx={{ color: 'white' }} />
                                        ) : (
                                            <ExpandMore sx={{ color: 'white' }} />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                                {/* Platform sub items */}
                                <Collapse in={openSections[`platform-${platform.key}`]} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {subItems.map((sub) => (
                                            <ListItem
                                                key={`${platform.key}-${sub.key}`}
                                                disablePadding
                                                className={classes.nested}
                                                sx={{ pl: 6 }}
                                            >
                                                <ListItemButton
                                                    onClick={() => {
                                                        const path = `/${platform.key}/${sub.key}`;
                                                        navigate(path);
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ color: 'white' }}>
                                                        {sub.icon}
                                                    </ListItemIcon>
                                                    <ListItemText primary={sub.label} />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            </React.Fragment>
                        ))}
                    </List>
                </Collapse>

                {/* Customer (disabled) */}
                <ListItem disablePadding>
                    <ListItemButton disabled sx={{ cursor: 'default', opacity: 0.6 }}>
                        <ListItemIcon sx={{ color: 'white' }}>
                            <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Customer" />
                    </ListItemButton>
                </ListItem>
            </List>
            {/* Bottom promotional card */}
            {/* <div className={classes.bottomCard}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Let's start!</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                    AI-powered analysis transforms your data into insights with ease!
                </div>
                <button className={classes.bottomButton} style={{ background: '#e37b39', border: 'none', borderRadius: 8, padding: '8px 12px', marginTop: 12, cursor: 'pointer' }}>
                    AI-Powered Analysis
                </button>
            </div> */}
        </Drawer>
    );
};

export default Sidebar;
