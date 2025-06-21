import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../NavBar/NavBar';
import Sidebar from '../Sidebar/Sidebar';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import { capitalizeWords, capitalizeSentence } from '../../utils/stringUtils';

import {
    fetchSwiggyAnalytics,
    fetchZomatoAnalytics,
    fetchMagicpinAnalytics,
} from '../../api/analyticsApi';

const platformToFetcher = {
    swiggy: fetchSwiggyAnalytics,
    zomato: fetchZomatoAnalytics,
    magicpin: fetchMagicpinAnalytics,
};

const cardConfigs = [
    {
        key: 'mostPopularDish',
        title: 'Popular Dish',
        icon: <RestaurantIcon />,
        color: 'linear-gradient(195deg, #42424a, #191919)',
        subtitle: 'Top Ordered Item',
    },
    {
        key: 'totalSales',
        title: 'Sales',
        icon: <AttachMoneyIcon />,
        color: 'linear-gradient(195deg, #49a3f1, #1A73E8)',
        subtitle: 'Total Orders',
    },
    {
        key: 'bestHour',
        title: 'Profitable Hour',
        icon: <AccessTimeIcon />,
        color: 'linear-gradient(195deg, #66BB6A, #43A047)',
        subtitle: 'Peak Hour',
    },
    {
        key: 'bestDay',
        title: 'Top Day',
        icon: <EventIcon />,
        color: 'linear-gradient(195deg, #EC407A, #D81B60)',
        subtitle: 'Highest Sales Day',
    },
];

const Analytics = () => {
    const { platform } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const fetcher = platformToFetcher[platform];
            if (fetcher) {
                const res = await fetcher();
                setData(res);
            }
            setLoading(false);
        };
        fetchData();
    }, [platform]);

    const renderCard = (config) => {
        const value = data[config.key];
        const displayValue = typeof value === 'string' ? capitalizeWords(value) : value;
        return (
            <Paper
                key={config.key}
                elevation={1}
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    p: 2,
                    borderRadius: 3,
                    bgcolor: '#2b2e2e',
                    color: '#ffffff',

                }}
            >
                <Box
                    sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        background: config.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        boxShadow: 1,
                        mb: 2,
                    }}
                >
                    {config.icon}
                </Box>
                <Typography variant="subtitle2" sx={{ color: '#ffffff' }}>
                    {config.title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
                    {config.key === 'totalSales' ? value.toLocaleString() : displayValue}
                </Typography>
                <Typography variant="caption" sx={{ color: '#ffffff' }}>
                    {config.subtitle}
                </Typography>
            </Paper>
        );
    };

    return (
        <>
            <NavBar />
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <div
                    style={{
                        flexGrow: 1,
                        padding: '1rem',
                        marginTop: '64px',
                        marginLeft: '20px',
                    }}
                >
                    {loading || !data ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {cardConfigs.map((cfg) => (
                                <Grid item xs={12} sm={6} md={3} key={cfg.key}>
                                    {renderCard(cfg)}
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </div>
            </div>
        </>
    );
};

export default Analytics; 