import React, { useEffect, useState } from 'react';
import NavBar from '../NavBar/NavBar';
import Sidebar from '../Sidebar/Sidebar';
// import Box from '@mui/material/Box';
// import TextField from '@mui/material/TextField';
// import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useParams } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { capitalizeSentence } from '../../utils/stringUtils';

const Escalation = () => {
    const { platform } = useParams();

    // Retrieve authenticated user details (inserted by login flow)
    // so that we can identify the merchant on backend. Fall back to
    // a hard-coded uid while developing locally, matching Menu component.
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const sub = user.sub || 'uid_merchant_c';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [grievances, setGrievances] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`https://prompt-me-harder-backend.onrender.com/grievance/${platform}/${sub}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                }
                const json = await res.json();
                setGrievances(json?.data?.grievances || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [platform, sub]);

    // Helper to render status with color
    const renderStatus = (status) => (
        <span style={{ color: status === 'open' ? 'green' : 'red', fontWeight: 600 }}>
            {capitalizeSentence(status)}
        </span>
    );

    // Helper to render actions list with tick at end (only if actions exist)
    const renderActions = (actions) => {
        if (!Array.isArray(actions) || actions.length === 0) {
            return '—';
        }

        return (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {actions.map((act, idx) => {
                    // Gracefully support both string and object-based actions.
                    let label;
                    if (typeof act === 'string') {
                        label = capitalizeSentence(act);
                    } else if (act && typeof act === 'object') {
                        // Prefer `note` if present, otherwise stringify the object keys.
                        label = act.note ? capitalizeSentence(act.note) : JSON.stringify(act);
                    } else {
                        label = String(act);
                    }
                    return (
                        <span key={idx}>{label}</span>
                    );
                })}
                <CheckCircleIcon sx={{ color: 'green', fontSize: 18 }} />
            </span>
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
                        marginTop: '64px', // offset NavBar
                        marginLeft: '20px', // sidebar width + gap
                    }}
                >
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
                            <CircularProgress />
                        </div>
                    ) : error ? (
                        <Typography color="error" align="center" sx={{ mt: 4 }}>
                            {error}
                        </Typography>
                    ) : (
                        <TableContainer component={Paper} sx={{ backgroundColor: '#2e2b2b', maxWidth: '100%', overflowX: 'auto' }}>
                            <Table stickyHeader sx={{
                                '& .MuiTableCell-root': { color: '#fff', borderColor: '#444' },
                                '& .MuiTableCell-head': { backgroundColor: '#2e2b2b', color: '#fff', fontWeight: 'bold' },
                            }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Severity</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {grievances.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                No data
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        grievances.map((row) => (
                                            <TableRow key={row.id} hover>
                                                <TableCell>{row.id}</TableCell>
                                                <TableCell>{capitalizeSentence(row.title)}</TableCell>
                                                <TableCell>{capitalizeSentence(row.description)}</TableCell>
                                                <TableCell>{capitalizeSentence(row.severity)}</TableCell>
                                                <TableCell>{renderStatus(row.status)}</TableCell>
                                                <TableCell>{renderActions(row.actions)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </div>
            </div>
        </>
    );
};

export default Escalation; 