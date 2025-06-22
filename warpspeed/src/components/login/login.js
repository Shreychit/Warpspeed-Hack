import React from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useGoogleLogin } from '@react-oauth/google';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
    const navigate = useNavigate();

    const onSuccess = async (tokenResponse) => {
        try {
            let userData = null;

            // Case 1: Using Google One Tap / Credential Response which contains a JWT
            if (tokenResponse?.credential) {
                userData = jwtDecode(tokenResponse.credential);
            }

            // Case 2: OAuth response with an access_token (not a JWT)
            if (!userData && tokenResponse?.access_token) {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch user info');
                }

                userData = await res.json();
            }

            if (userData) {
                console.log('Google user data:', userData);
                localStorage.setItem('user', JSON.stringify(userData));
                navigate('/home');
            } else {
                throw new Error('No valid credential or access token found');
            }
        } catch (err) {
            console.error('Failed to process Google login', err);
        }
    };

    const onError = () => {
        console.error('Google login failed');
    };

    const login = useGoogleLogin({
        onSuccess,
        onError,
    });

    return (
        <Grid container sx={{ minHeight: '100vh', backgroundColor: '#000' }}>
            {/* Left Section */}
            <Grid
                item
                xs={12}
                md={6}
                sx={{
                    backgroundColor: '#000',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 4,
                }}
            >
                <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center', color: '#ffffff' }} gutterBottom>
                    Merchant Mate
                </Typography>
                <Typography variant="subtitle1" sx={{ textAlign: 'center', color: '#ffffff' }}>
                    Sign in to continue
                </Typography>
            </Grid>

            {/* Right Section */}
            <Grid
                item
                xs={12}
                md={6}
                sx={{
                    backgroundColor: '#000',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 2,
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: 400,
                        backgroundColor: '#fff',
                        borderRadius: 3,
                        boxShadow: 3,
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <Button
                        variant="contained"
                        startIcon={<GoogleIcon />}
                        onClick={() => login()}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            backgroundColor: '#2b2e2e',
                            color: '#ffffff',
                            '&:hover': {
                                backgroundColor: '#3b3e3e',
                            },
                            py: 1.5,
                            boxShadow: 'none',
                        }}
                        fullWidth
                    >
                        Continue with Google
                    </Button>
                </Box>
            </Grid>
        </Grid>
    );
};

export default Login;
