import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Container,
} from '@mui/material';
import api from '../api';

const initialForm = {
  name: '',
  email: '',
  password: '',
  hospitalId: '',
  address: '',
  dateOfBirth: '',
  speciality: '',
  qualification: '',
  yearsOfExperience: '',
  bio: '',
};

const initialAvailability = {
  dayOfWeek: 'MONDAY',
  startTime: '09:00',
  endTime: '17:00',
};

function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availabilityForm, setAvailabilityForm] = useState(initialAvailability);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isPlatformAdmin = currentUser?.roles?.includes('ROLE_PLATFORM_ADMIN');
  const managedDoctors = isPlatformAdmin
    ? doctors
    : doctors.filter((doctor) => doctor.hospitalId && doctor.hospitalId === currentUser?.hospitalId);

  const loadData = async () => {
    try {
      const [doctorRes, hospitalRes, meRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/hospitals'),
        api.get('/users/me'),
      ]);
      setDoctors(doctorRes.data);
      setHospitals(hospitalRes.data);
      setCurrentUser(meRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAvailability = async (doctorId) => {
    const res = await api.get(`/doctors/${doctorId}/availability`);
    setAvailabilitySlots(res.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isPlatformAdmin && currentUser?.hospitalId) {
      setForm((prev) => ({ ...prev, hospitalId: currentUser.hospitalId }));
    }
  }, [isPlatformAdmin, currentUser]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      ...initialForm,
      hospitalId: !isPlatformAdmin && currentUser?.hospitalId ? currentUser.hospitalId : '',
    });
  };

  const resetAvailabilityForm = () => {
    setEditingSlotId(null);
    setAvailabilityForm(initialAvailability);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    setAvailabilityForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor.id);
    setSelectedDoctor(doctor);
    setError('');
    setSuccess('');
    setForm({
      name: doctor.name || '',
      email: doctor.email || '',
      password: '',
      hospitalId: doctor.hospitalId || '',
      address: doctor.address || '',
      dateOfBirth: doctor.dateOfBirth || '',
      speciality: doctor.speciality || '',
      qualification: doctor.qualification || '',
      yearsOfExperience: doctor.yearsOfExperience ?? '',
      bio: doctor.bio || '',
    });
    loadAvailability(doctor.id).catch((err) => console.error(err));
  };

  const handleDelete = async (doctor) => {
    if (!window.confirm(`Delete ${doctor.name}?`)) return;
    setError('');
    setSuccess('');
    try {
      await api.post(`/doctors/${doctor.id}/delete`);
      setSuccess('Doctor deleted successfully.');
      if (editingId === doctor.id) {
        resetForm();
        setSelectedDoctor(null);
        setAvailabilitySlots([]);
      }
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete doctor');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const payload = {
      ...form,
      hospitalId: form.hospitalId || null,
      yearsOfExperience: form.yearsOfExperience === '' ? null : Number(form.yearsOfExperience),
    };

    if (editingId && !payload.password) {
      delete payload.password;
    }

    try {
      if (editingId) {
        await api.put(`/doctors/${editingId}`, payload);
        setSuccess('Doctor updated successfully.');
      } else {
        await api.post('/doctors', payload);
        setSuccess('Doctor added successfully.');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save doctor');
    }
  };

  const submitAvailability = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setError('');
    setSuccess('');
    try {
      if (editingSlotId) {
        await api.put(`/doctors/${selectedDoctor.id}/availability/${editingSlotId}`, availabilityForm);
        setSuccess('Availability updated successfully.');
      } else {
        await api.post(`/doctors/${selectedDoctor.id}/availability`, availabilityForm);
        setSuccess('Availability slot added successfully.');
      }
      resetAvailabilityForm();
      await loadAvailability(selectedDoctor.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save availability slot');
    }
  };

  const editSlot = (slot) => {
    setEditingSlotId(slot.id);
    setAvailabilityForm({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  };

  const deleteSlot = async (slot) => {
    if (!selectedDoctor) return;
    setError('');
    setSuccess('');
    try {
      await api.post(`/doctors/${selectedDoctor.id}/availability/${slot.id}/delete`);
      setSuccess('Availability slot deleted successfully.');
      if (editingSlotId === slot.id) {
        resetAvailabilityForm();
      }
      await loadAvailability(selectedDoctor.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete availability slot');
    }
  };

  return (
    <Container maxWidth="xl" className="page-shell">
      <Paper className="soft-panel" sx={{ p: { xs: 3, md: 4 }, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1">
              Doctor management
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
              Create doctors, assign hospital ownership, maintain profiles, and publish weekly appointment availability.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className="metric-card" sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.72)' }}>
              <Typography variant="h4">{managedDoctors.length}</Typography>
              <Typography color="text.secondary">manageable doctors</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {editingId ? 'Edit Doctor' : 'Add Doctor'}
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField fullWidth margin="normal" label="Name" name="name" value={form.name} onChange={handleChange} required />
              <TextField fullWidth margin="normal" label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              <TextField
                fullWidth
                margin="normal"
                label={editingId ? 'New Password (optional)' : 'Temporary Password'}
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required={!editingId}
              />
              {isPlatformAdmin && (
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="hospital-select-label">Hospital</InputLabel>
                  <Select
                    labelId="hospital-select-label"
                    label="Hospital"
                    name="hospitalId"
                    value={form.hospitalId}
                    onChange={handleChange}
                  >
                    {hospitals.map((hospital) => (
                      <MenuItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <TextField fullWidth margin="normal" label="Clinic Address" name="address" value={form.address} onChange={handleChange} />
              <TextField fullWidth margin="normal" label="Date of Birth" name="dateOfBirth" type="date" InputLabelProps={{ shrink: true }} value={form.dateOfBirth} onChange={handleChange} />
              <TextField fullWidth margin="normal" label="Speciality" name="speciality" value={form.speciality} onChange={handleChange} required />
              <TextField fullWidth margin="normal" label="Education / Qualification" name="qualification" value={form.qualification} onChange={handleChange} required />
              <TextField fullWidth margin="normal" label="Years of Experience" name="yearsOfExperience" type="number" value={form.yearsOfExperience} onChange={handleChange} />
              <TextField fullWidth margin="normal" label="Bio" name="bio" multiline minRows={3} value={form.bio} onChange={handleChange} />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button type="submit" variant="contained" fullWidth>
                  {editingId ? 'Update Doctor' : 'Save Doctor'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outlined" fullWidth onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>

          {selectedDoctor && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Availability for {selectedDoctor.name}
              </Typography>
              <Box component="form" onSubmit={submitAvailability}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="day-label">Day</InputLabel>
                  <Select labelId="day-label" label="Day" name="dayOfWeek" value={availabilityForm.dayOfWeek} onChange={handleAvailabilityChange}>
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => (
                      <MenuItem key={day} value={day}>{day}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField fullWidth margin="normal" type="time" label="Start Time" name="startTime" InputLabelProps={{ shrink: true }} value={availabilityForm.startTime} onChange={handleAvailabilityChange} />
                <TextField fullWidth margin="normal" type="time" label="End Time" name="endTime" InputLabelProps={{ shrink: true }} value={availabilityForm.endTime} onChange={handleAvailabilityChange} />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button type="submit" variant="contained" fullWidth>
                    {editingSlotId ? 'Update Slot' : 'Add Slot'}
                  </Button>
                  {editingSlotId && (
                    <Button type="button" variant="outlined" fullWidth onClick={resetAvailabilityForm}>
                      Cancel
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper className="table-wrap" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Manageable Doctors
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Speciality</TableCell>
                  <TableCell>Hospital</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {managedDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>{doctor.name}</TableCell>
                    <TableCell>{doctor.speciality || '-'}</TableCell>
                    <TableCell>{doctor.hospitalName || '-'}</TableCell>
                    <TableCell>{doctor.yearsOfExperience ?? '-'}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleEdit(doctor)}>Edit</Button>
                      <Button size="small" onClick={() => { setSelectedDoctor(doctor); loadAvailability(doctor.id).catch((err) => console.error(err)); }}>Availability</Button>
                      <Button size="small" color="error" onClick={() => handleDelete(doctor)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          {selectedDoctor && (
            <Paper className="table-wrap" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Weekly Availability Slots
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Day</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availabilitySlots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell>{slot.dayOfWeek}</TableCell>
                      <TableCell>{slot.startTime}</TableCell>
                      <TableCell>{slot.endTime}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => editSlot(slot)}>Edit</Button>
                        <Button size="small" color="error" onClick={() => deleteSlot(slot)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminDoctorsPage;
