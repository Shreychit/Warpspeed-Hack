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
import { capitalizeWords } from '../../utils/stringUtils';
import { fetchAnalyticsByPlatform } from '../../api/analyticsApi';

// Recharts components
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    ResponsiveContainer,
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    ZAxis,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Cell,
} from 'recharts';

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
    const [analytics, setAnalytics] = useState([]);
    const [summary, setSummary] = useState(null);
    const [ordersByHour, setOrdersByHour] = useState([]);
    const [ordersByDay, setOrdersByDay] = useState([]);
    const [bubbleData, setBubbleData] = useState([]);
    const [storeIds, setStoreIds] = useState([]);
    const [radarData, setRadarData] = useState([]);
    const [dishRatingsData, setDishRatingsData] = useState([]);
    const [trendingData, setTrendingData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await fetchAnalyticsByPlatform(platform);

            // Save store–level analytics for charts in a flattened structure suitable for Recharts
            const chartReadyData = (res.analytics || []).map((store) => ({
                storeId: store.storeId,
                orders: store.totals?.orders ?? 0,
                revenue: store.totals?.revenue ?? 0,
            }));
            setAnalytics(chartReadyData);
            const currentStoreIds = (res.analytics || []).map((s) => s.storeId);
            setStoreIds(currentStoreIds);

            // Build multi-line orders-per-hour dataset
            const hourMap = {};
            (res.analytics || []).forEach((store) => {
                const idKey = `store${store.storeId}`;
                Object.entries(store.ordersPerHour || {}).forEach(([hr, cnt]) => {
                    if (!hourMap[hr]) hourMap[hr] = { hour: hr };
                    hourMap[hr][idKey] = cnt;
                });
            });
            // Ensure missing hours get 0 for each store
            Object.values(hourMap).forEach((obj) => {
                currentStoreIds.forEach((sid) => {
                    const key = `store${sid}`;
                    if (obj[key] === undefined) obj[key] = 0;
                });
            });
            const hourArray = Object.values(hourMap).sort((a, b) => Number(a.hour) - Number(b.hour));
            setOrdersByHour(hourArray);

            // Build grouped orders-per-day dataset
            const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const dayMap = {};
            (res.analytics || []).forEach((store) => {
                const keyPrefix = `store${store.storeId}`;
                Object.entries(store.ordersPerDay || {}).forEach(([day, cnt]) => {
                    if (!dayMap[day]) dayMap[day] = { day };
                    dayMap[day][keyPrefix] = cnt;
                });
            });
            // fill zeros
            Object.values(dayMap).forEach((obj) => {
                currentStoreIds.forEach((sid) => {
                    const key = `store${sid}`;
                    if (obj[key] === undefined) obj[key] = 0;
                });
            });
            const dayArray = dayOrder
                .filter((d) => dayMap[d])
                .map((d) => dayMap[d]);
            setOrdersByDay(dayArray);

            // Build quick summary for the KPI cards
            if (res.analytics && res.analytics.length) {
                const dishCount = {};
                const hourCount = {};
                const dayCount = {};
                let totalOrders = 0;

                res.analytics.forEach((store) => {
                    // dish popularity
                    dishCount[store.bestSeller] = (dishCount[store.bestSeller] || 0) + 1;
                    // peak hours
                    hourCount[store.peakHour] = (hourCount[store.peakHour] || 0) + 1;
                    // peak days
                    dayCount[store.peakDay] = (dayCount[store.peakDay] || 0) + 1;
                    // orders total
                    totalOrders += store.totals?.orders ?? 0;
                });

                const mostPopularDish = Object.keys(dishCount).reduce((a, b) => (dishCount[a] >= dishCount[b] ? a : b));
                const bestHour = Object.keys(hourCount).reduce((a, b) => (hourCount[a] >= hourCount[b] ? a : b));
                const bestDay = Object.keys(dayCount).reduce((a, b) => (dayCount[a] >= dayCount[b] ? a : b));

                setSummary({ mostPopularDish, totalSales: totalOrders, bestHour, bestDay });
            }

            // Prepare bubble chart data: correlation of orders vs revenue
            const bubbles = (res.analytics || []).map((store) => ({
                storeId: store.storeId,
                orders: store.totals?.orders ?? 0,
                revenue: store.totals?.revenue ?? 0,
                rating: store.avgStoreRating ?? 0,
                recommendation: store.recommendation || '',
            }));
            setBubbleData(bubbles);

            // Radar data (avg ratings)
            const radar = (res.analytics || []).map((store) => ({
                storeId: store.storeId,
                rating: store.avgStoreRating ?? 0,
            }));
            setRadarData(radar);

            // Dish ratings radar dataset
            const dishMap = {};
            (res.analytics || []).forEach((store) => {
                Object.entries(store.dishRatings || {}).forEach(([dish, rating]) => {
                    if (!dishMap[dish]) dishMap[dish] = { dish };
                    dishMap[dish][`store${store.storeId}`] = rating;
                });
            });
            // Ensure each store appears for every dish
            Object.values(dishMap).forEach((obj) => {
                currentStoreIds.forEach((sid) => {
                    const key = `store${sid}`;
                    if (obj[key] === undefined) obj[key] = null;
                });
            });
            setDishRatingsData(Object.values(dishMap));

            // Trending items frequency dataset
            const freqMap = {};
            (res.analytics || []).forEach((store) => {
                (store.trending || []).forEach((item) => {
                    freqMap[item] = (freqMap[item] || 0) + 1;
                });
            });
            const trendArray = Object.entries(freqMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
            setTrendingData(trendArray);

            setLoading(false);
        };

        fetchData();
    }, [platform]);

    const renderCard = (config) => {
        const value = summary[config.key];
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
                    {loading || !summary ? (
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

                            {/* Totals Comparison Chart */}
                            <Grid item xs={12} md={4} lg={4}>
                                <Paper
                                    elevation={1}
                                    sx={{ p: 2, borderRadius: 3, bgcolor: '#2b2e2e', color: '#ffffff' }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        Orders & Revenue by Store
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analytics} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                            <XAxis dataKey="storeId" stroke="#fff" />
                                            <YAxis stroke="#fff" />
                                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
                                            <Legend />
                                            <Bar dataKey="orders" fill="#49a3f1" name="Orders" />
                                            <Bar dataKey="revenue" fill="#66BB6A" name="Revenue" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            {/* Orders by Hour Trend */}
                            <Grid item xs={12} md={4} lg={4}>
                                <Paper
                                    elevation={1}
                                    sx={{ p: 2, borderRadius: 3, bgcolor: '#2b2e2e', color: '#ffffff' }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        Orders by Hour (Multi-Store Trend)
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={ordersByHour} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                            <XAxis dataKey="hour" stroke="#fff" />
                                            <YAxis stroke="#fff" />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                            <Legend />
                                            {storeIds.map((sid, idx) => {
                                                const colors = [
                                                    '#ff7300',
                                                    '#387908',
                                                    '#8884d8',
                                                    '#82ca9d',
                                                    '#ffc658',
                                                    '#d0ed57',
                                                ];
                                                return (
                                                    <Line
                                                        key={sid}
                                                        type="monotone"
                                                        dataKey={`store${sid}`}
                                                        name={`Store ${sid}`}
                                                        stroke={colors[idx % colors.length]}
                                                        dot={false}
                                                    />
                                                );
                                            })}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            {/* Orders by Day of Week */}
                            <Grid item xs={12} md={4} lg={4}>
                                <Paper
                                    elevation={1}
                                    sx={{ p: 2, borderRadius: 3, bgcolor: '#2b2e2e', color: '#ffffff' }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        Orders by Day of Week (Grouped)
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={ordersByDay} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                            <XAxis dataKey="day" stroke="#fff" />
                                            <YAxis stroke="#fff" />
                                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
                                            <Legend />
                                            {storeIds.map((sid, idx) => {
                                                const colors = [
                                                    '#ff7300',
                                                    '#387908',
                                                    '#8884d8',
                                                    '#82ca9d',
                                                    '#ffc658',
                                                    '#d0ed57',
                                                ];
                                                return (
                                                    <Bar
                                                        key={`day-${sid}`}
                                                        dataKey={`store${sid}`}
                                                        name={`Store ${sid}`}
                                                        fill={colors[idx % colors.length]}
                                                    />
                                                );
                                            })}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            {/* Revenue vs Orders Correlation */}
                            <Grid item xs={12} md={4} lg={4}>
                                <Paper
                                    elevation={1}
                                    sx={{ p: 2, borderRadius: 3, bgcolor: '#2b2e2e', color: '#ffffff' }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        Revenue vs. Orders Correlation
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                            <XAxis type="number" dataKey="orders" name="Orders" stroke="#fff" />
                                            <YAxis type="number" dataKey="revenue" name="Revenue" stroke="#fff" />
                                            <ZAxis type="number" dataKey="rating" range={[60, 160]} name="Rating" />
                                            <Tooltip content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const d = payload[0].payload;
                                                    return (
                                                        <Paper sx={{ p: 1 }}>
                                                            <Typography variant="subtitle2">Store {d.storeId}</Typography>
                                                            <Typography variant="body2">Orders: {d.orders}</Typography>
                                                            <Typography variant="body2">Revenue: ₹{d.revenue}</Typography>
                                                            <Typography variant="body2">Rating: {d.rating}</Typography>
                                                            <Typography variant="caption">{d.recommendation}</Typography>
                                                        </Paper>
                                                    );
                                                }
                                                return null;
                                            }} />
                                            <Scatter name="Stores" data={bubbleData} fill="#8884d8" />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            {/**
                             * Store Ratings Radar and Dish Ratings per Store charts have been temporarily removed
                             * to keep three charts per row. Uncomment and adjust grid sizing if you want these
                             * visualizations back on the dashboard.
                             */}

                            {/* Trending Items Frequency */}
                            <Grid item xs={12} md={4} lg={4}>
                                <Paper
                                    elevation={1}
                                    sx={{ p: 2, borderRadius: 3, bgcolor: '#2b2e2e', color: '#ffffff' }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        Trending Items Frequency
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={trendingData}
                                            layout="vertical"
                                            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                            <XAxis type="number" stroke="#fff" />
                                            <YAxis type="category" dataKey="name" stroke="#fff" width={100} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" name="Frequency" fill="#49a3f1">
                                                {trendingData.map((entry, index) => {
                                                    const colors = [
                                                        '#ff7300',
                                                        '#387908',
                                                        '#8884d8',
                                                        '#82ca9d',
                                                        '#ffc658',
                                                        '#d0ed57',
                                                    ];
                                                    return (
                                                        <Cell key={`trend-${index}`} fill={colors[index % colors.length]} />
                                                    );
                                                })}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </div>
            </div>
        </>
    );
};

export default Analytics; 