import React, { useState, useContext } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import api from '../api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid credentials';
      setError(message);
    }
  };

  return (
    <Container maxWidth="lg" className="page-shell">
      <Grid container spacing={4} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <Paper
            className="soft-panel"
            sx={{
              height: '100%',
              minHeight: 520,
              p: { xs: 3, md: 5 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Chip label="Live backend console" color="secondary" sx={{ mb: 3 }} />
              <Typography variant="h3" component="h1" gutterBottom>
                Healthcare operations, ready for a real demo.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
                Sign in to validate patients, doctors, appointments, hospital admin flows, and JWT protected endpoints from one polished interface.
              </Typography>
            </Box>
            <Grid container spacing={2} sx={{ mt: 4 }}>
              {[
                ['Role based', 'Patient, doctor, admin, and platform admin routing.'],
                ['Appointment flow', 'Book, reschedule, cancel, confirm, complete, and audit visits.'],
                ['Hospital ops', 'Manage doctors, hospitals, admins, and published availability.'],
              ].map(([title, body]) => (
                <Grid item xs={12} sm={4} key={title}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.72)' }}>
                    <MonitorHeartIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={800}>
                      {title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {body}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 3, md: 5 }, height: '100%' }}>
            <Stack spacing={1} alignItems="flex-start" sx={{ mb: 4 }}>
              <LockOpenIcon color="primary" fontSize="large" />
              <Typography variant="h4" component="h2">
                Welcome back
              </Typography>
              <Typography color="text.secondary">
                Use a seeded backend account or any account created from the registration flow.
              </Typography>
            </Stack>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }}>
                Login
              </Button>
              <Typography sx={{ mt: 3 }} variant="body2" color="text.secondary">
                Need a patient account? <Link to="/register">Register a patient profile</Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default LoginPage;
