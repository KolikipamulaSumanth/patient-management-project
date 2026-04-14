import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, TextField, Button, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" align="center">
          Schedule Appointment
        </Typography>
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
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Available slots:{' '}
            {availabilitySlots.length
              ? availabilitySlots.map((slot) => `${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`).join(', ')
              : 'No availability published for this doctor yet'}
          </Typography>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Schedule
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default AppointmentForm;
