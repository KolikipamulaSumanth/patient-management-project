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
import BadgeIcon from '@mui/icons-material/Badge';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import api from '../api';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        address,
        dateOfBirth,
      });
      login(res.data.token);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
    }
  };

  return (
    <Container maxWidth="lg" className="page-shell">
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: { xs: 3, md: 5 }, height: '100%' }}>
            <Stack spacing={1} sx={{ mb: 4 }}>
              <BadgeIcon color="primary" fontSize="large" />
              <Typography variant="h4" component="h1">
                Create a patient profile
              </Typography>
              <Typography color="text.secondary">
                Registration creates a patient login and lets you immediately test doctor browsing and appointment booking.
              </Typography>
            </Stack>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField fullWidth label="Name" margin="normal" value={name} onChange={(e) => setName(e.target.value)} required />
              <TextField fullWidth label="Email" type="email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <TextField fullWidth label="Address" margin="normal" value={address} onChange={(e) => setAddress(e.target.value)} />
              <TextField fullWidth type="date" label="Date of Birth" InputLabelProps={{ shrink: true }} margin="normal" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }}>
                Register
              </Button>
              <Typography sx={{ mt: 3 }} variant="body2" color="text.secondary">
                Already have an account? <Link to="/login">Login</Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper
            className="soft-panel"
            sx={{ p: { xs: 3, md: 5 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <Box>
              <Chip color="primary" label="Patient journey" sx={{ mb: 3 }} />
              <Typography variant="h3" component="h2" gutterBottom>
                From signup to scheduled visit in minutes.
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 600 }}>
                This flow is useful for showing authentication, patient creation, protected API calls, doctor availability lookup, and appointment lifecycle actions.
              </Typography>
            </Box>
            <Stack spacing={2} sx={{ mt: 5 }}>
              {['Profile is created through /auth/register', 'JWT token is stored for protected requests', 'Patient lands on doctors and can book appointments'].map((item) => (
                <Box key={item} sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.72)' }}>
                  <EventAvailableIcon color="secondary" />
                  <Typography fontWeight={700}>{item}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default RegisterPage;
