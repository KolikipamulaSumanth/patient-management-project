import React, { useState, useEffect } from 'react';
import { Alert, Box, Button, Chip, Container, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

/**
 * Form for patients to schedule a new appointment. The user selects a
 * doctor from a drop‑down, provides start and end times and an optional
 * reason for the visit. On success the patient is redirected to their
 * appointments list.
 */
function AppointmentForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState(searchParams.get('doctorId') || '');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [availabilitySlots, setAvailabilitySlots] = useState([]);

  useEffect(() => {
    // Fetch doctors for dropdown
    api
      .get('/doctors')
      .then((res) => {
        setDoctors(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!doctorId) {
      setAvailabilitySlots([]);
      return;
    }
    api
      .get(`/doctors/${doctorId}/availability`)
      .then((res) => setAvailabilitySlots(res.data))
      .catch((err) => console.error(err));
  }, [doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/appointments', {
        doctorId,
        start,
        end,
        reason,
      });
      navigate('/appointments/my');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to schedule appointment';
      setError(message);
    }
  };

  return (
    <Container maxWidth="lg" className="page-shell">
      <Grid container spacing={4} alignItems="stretch">
        <Grid item xs={12} md={5}>
          <Paper className="soft-panel" sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
            <Chip label="Booking workflow" color="secondary" sx={{ mb: 3 }} />
            <Typography variant="h3" component="h1">
              Schedule an appointment
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Choose a doctor, compare their published availability, and submit the request to the appointment service.
            </Typography>
            <Stack spacing={2} sx={{ mt: 4 }}>
              {availabilitySlots.length ? availabilitySlots.map((slot) => (
                <Box key={slot.id || `${slot.dayOfWeek}-${slot.startTime}`} sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.72)' }}>
                  <Typography fontWeight={800}>{slot.dayOfWeek}</Typography>
                  <Typography color="text.secondary">{slot.startTime} - {slot.endTime}</Typography>
                </Box>
              )) : (
                <Typography color="text.secondary">Select a doctor to view published slots.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <CalendarMonthIcon color="primary" />
              <Typography variant="h5" component="h2">
                Appointment details
              </Typography>
            </Stack>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="doctor-select-label">Doctor</InputLabel>
            <Select
              labelId="doctor-select-label"
              value={doctorId}
              label="Doctor"
              onChange={(e) => setDoctorId(e.target.value)}
              required
            >
              {doctors.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name} {d.speciality ? `- ${d.speciality}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="datetime-local"
            label="Start Time"
            InputLabelProps={{ shrink: true }}
            margin="normal"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
          <TextField
            fullWidth
            type="datetime-local"
            label="End Time"
            InputLabelProps={{ shrink: true }}
            margin="normal"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Reason (optional)"
            margin="normal"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }}>
            Schedule
          </Button>
        </Box>
      </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AppointmentForm;
