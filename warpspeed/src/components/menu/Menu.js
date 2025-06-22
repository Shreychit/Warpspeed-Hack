import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../NavBar/NavBar';
import Sidebar from '../Sidebar/Sidebar';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { fetchMerchantMenu } from '../../api/menuApi';
import { capitalizeWords } from '../../utils/stringUtils';
import FilterListIcon from '@mui/icons-material/FilterList';
import { default as MuiMenu } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

// Styled search bar
const SearchBarWrapper = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: 24,
    backgroundColor: '#2e2b2b',
    width: '70%',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 8px 10px rgba(0,0,0,0.3)',
}));

const StyledInput = styled(InputBase)(({ theme }) => ({
    color: '#fff',
    padding: theme.spacing(1.2, 1, 1.2, 2),
    flexGrow: 1,
    '& .MuiInputBase-input': {
        padding: 0,
    },
    '& .MuiInputBase-input::placeholder': {
        color: '#fff',
        opacity: 1,
    },
}));

const Menu = () => {
    const { platform } = useParams();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedStore, setSelectedStore] = useState(''); // "" => All stores

    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                const user = JSON.parse(localStorage.getItem('user')) || {};
                const sub = user.sub || 'uid_merchant_c'; // fallback for local testing
                const data = await fetchMerchantMenu(platform, sub);
                setMenuItems(data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchMenu();
    }, [platform]);

    const filteredMenu = useMemo(() => {
        const q = search.toLowerCase();
        return menuItems.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(q);
            const matchesStore = selectedStore ? item.storeName === selectedStore : true;
            return matchesSearch && matchesStore;
        });
    }, [menuItems, search, selectedStore]);

    const storeNames = useMemo(() => {
        const names = new Set(menuItems.map((item) => item.storeName).filter(Boolean));
        return Array.from(names);
    }, [menuItems]);

    const handleFilterClick = (e) => {
        setAnchorEl(e.currentTarget);
    };

    const handleFilterClose = () => {
        setAnchorEl(null);
    };

    const handleStoreSelect = (name) => {
        setSelectedStore(name);
        handleFilterClose();
    };

    const formatDiscount = (discount) => {
        if (!discount) return '';
        if (discount.mode === 'percentage') return `${discount.value}% off`;
        if (discount.mode === 'flat') return `₹${discount.value} off`;
        return `${discount.value} off`;
    };

    const formatPromoWindow = (windowObj) => {
        if (!windowObj) return '';
        const opts = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const startStr = new Date(windowObj.start).toLocaleString('en-GB', opts);
        const endStr = new Date(windowObj.end).toLocaleString('en-GB', opts);
        return `${startStr} — ${endStr}`;
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
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '100vh',
                        marginTop: '64px', // offset NavBar height
                        marginLeft: '20px', // sidebar width 240 + 20px gap
                        backgroundColor: '#000',
                    }}
                >
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                        <SearchBarWrapper>
                            <StyledInput
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Box sx={{ px: 2, display: 'flex', alignItems: 'center' }}>
                                <SearchIcon sx={{ color: '#fff' }} />
                            </Box>
                        </SearchBarWrapper>
                        <IconButton onClick={handleFilterClick} sx={{ color: selectedStore ? 'primary.main' : '#fff' }}>
                            <FilterListIcon />
                        </IconButton>
                        <MuiMenu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleFilterClose}>
                            <MenuItem onClick={() => handleStoreSelect('')}>All Stores</MenuItem>
                            {storeNames.map((name) => (
                                <MenuItem
                                    key={name}
                                    selected={name === selectedStore}
                                    onClick={() => handleStoreSelect(name)}
                                >
                                    {name}
                                </MenuItem>
                            ))}
                        </MuiMenu>
                    </Box>
                    {loading ? (
                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {filteredMenu.map((item, idx) => {
                                const isDark = idx % 2 === 0;
                                const bg = '#2e2b2b';
                                const txt = '#fff';
                                return (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                                        <Card
                                            sx={{
                                                height: 'auto',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: 4,
                                                overflow: 'hidden',
                                                backgroundColor: bg,
                                                color: txt,
                                            }}
                                        >
                                            <Box sx={{ position: 'relative' }}>
                                                <CardMedia
                                                    component="img"
                                                    image={item.image}
                                                    alt={item.name}
                                                    sx={{
                                                        height: 200,
                                                        width: '100%',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                                {item.promo && (
                                                    <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                        <Chip
                                                            label={`${capitalizeWords(item.promo.name)} • ${formatDiscount(item.promo.discount)}`}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#ff5722',
                                                                color: '#fff',
                                                            }}
                                                        />
                                                        <Chip
                                                            label={`${formatPromoWindow(item.promo.window)}`}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#424242',
                                                                color: '#fff',
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                                {item.storeStatus && (
                                                    <Chip
                                                        label={item.storeStatus === 'active' ? 'Active' : 'Closed'}
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            color: '#fff',
                                                            backgroundColor: item.storeStatus === 'active' ? '#4caf50' : '#9e9e9e',
                                                        }}
                                                    />
                                                )}
                                                {item.isActive === false && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            backgroundColor: 'rgba(0,0,0,0.6)',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                                                            Out of Stock
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                            <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                        {capitalizeWords(item.name)}
                                                    </Typography>
                                                    {/* <IconButton size="small" color="primary">
                                                        <FavoriteBorderIcon />
                                                    </IconButton> */}
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                                    {item.category && <Chip label={capitalizeWords(item.category)} size="small" sx={{ color: '#fff', background: 'rgba(255,255,255,0.15)' }} />}
                                                    {item.isVeg !== undefined && <Chip label={item.isVeg ? 'Veg' : 'Non-Veg'} size="small" sx={{ color: '#fff', background: 'rgba(255,255,255,0.15)' }} />}
                                                    {item.calories && <Chip label={`${item.calories} kcal`} size="small" sx={{ color: '#fff', background: 'rgba(255,255,255,0.15)' }} />}
                                                </Box>
                                                <Typography variant="body2" sx={{ mb: 1, color: '#fff' }}>
                                                    {item.storeName ? `${item.storeName} • ` : ''}Rating: {item.ratingAvg ?? 'N/A'}
                                                    {item.ratingCount ? ` (${item.ratingCount})` : ''} • Stock: {item.stockQty ?? '—'}
                                                </Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                                    ${item.price.toFixed(2)}
                                                </Typography>
                                                {/* <Button variant="contained" fullWidth sx={{ mt: 'auto', textTransform: 'none' }}>
                                                    Add To Cart
                                                </Button> */}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </div>
            </div>
        </>
    );
};

export default Menu; 