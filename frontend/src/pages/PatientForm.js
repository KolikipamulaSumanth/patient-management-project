import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
} from '@mui/material';
import api from '../api';

/**
 * Form for creating or updating a patient. When editing the component
 * expects the patient object to be passed via the route state. If it is
 * absent a fallback fetch of the first page of patients is performed to
 * locate the record by its identifier. Administrators only.
 */
function PatientForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');

  // Load patient data for editing
  useEffect(() => {
    if (isEdit) {
      // Try to get patient from route state
      if (location.state && location.state.patient) {
        const p = location.state.patient;
        setForm({
          name: p.name || '',
          email: p.email || '',
          address: p.address || '',
          dateOfBirth: p.dateOfBirth || '',
        });
      } else {
        // Fallback: fetch list and find patient by id
        api
          .get('/patients', { params: { page: 0, size: 100 } })
          .then((res) => {
            const patient = res.data.find((p) => p.id === id);
            if (patient) {
              setForm({
                name: patient.name || '',
                email: patient.email || '',
                address: patient.address || '',
                dateOfBirth: patient.dateOfBirth || '',
              });
            }
          })
          .catch((err) => console.error(err));
      }
    }
  }, [id, isEdit, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        await api.put(`/patients/${id}`, form);
      } else {
        await api.post('/patients', form);
      }
      navigate('/patients');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save patient';
      setError(message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" align="center">
          {isEdit ? 'Edit Patient' : 'Add Patient'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            margin="normal"
            value={form.name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            margin="normal"
            value={form.email}
            onChange={handleChange}
            required
            disabled={isEdit} // Do not allow editing email on update
          />
          <TextField
            fullWidth
            label="Address"
            name="address"
            margin="normal"
            value={form.address}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            type="date"
            label="Date of Birth"
            name="dateOfBirth"
            InputLabelProps={{ shrink: true }}
            margin="normal"
            value={form.dateOfBirth}
            onChange={handleChange}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default PatientForm;