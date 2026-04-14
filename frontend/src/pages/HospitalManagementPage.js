import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
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
} from '@mui/material';
import api from '../api';

const initialHospital = {
  name: '',
  address: '',
  description: '',
};

const initialAdmin = {
  name: '',
  email: '',
  password: '',
  hospitalId: '',
};

function HospitalManagementPage() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [hospitalForm, setHospitalForm] = useState(initialHospital);
  const [adminForm, setAdminForm] = useState(initialAdmin);
  const [editingHospitalId, setEditingHospitalId] = useState(null);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [hospitalAdmins, setHospitalAdmins] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [calendarFilters, setCalendarFilters] = useState({
    hospitalId: '',
    from: '',
    to: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadHospitals = async () => {
    const res = await api.get('/hospitals');
    setHospitals(res.data);
  };

  const loadHospitalAdmins = async (hospitalId) => {
    if (!hospitalId) {
      setHospitalAdmins([]);
      return;
    }
    const res = await api.get(`/hospitals/${hospitalId}/admins`);
    setHospitalAdmins(res.data);
  };

  useEffect(() => {
    loadHospitals().catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedHospitalId) {
      loadHospitalAdmins(selectedHospitalId).catch((err) => console.error(err));
      setAdminForm((prev) => ({ ...prev, hospitalId: selectedHospitalId }));
    }
  }, [selectedHospitalId]);

  const resetHospitalForm = () => {
    setEditingHospitalId(null);
    setHospitalForm(initialHospital);
  };

  const resetAdminForm = () => {
    setEditingAdminId(null);
    setAdminForm({ ...initialAdmin, hospitalId: selectedHospitalId || '' });
  };

  const handleHospitalChange = (e) => {
    const { name, value } = e.target;
    setHospitalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCalendarChange = (e) => {
    const { name, value } = e.target;
    setCalendarFilters((prev) => ({ ...prev, [name]: value }));
  };

  const submitHospital = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingHospitalId) {
        await api.put(`/hospitals/${editingHospitalId}`, hospitalForm);
        setSuccess('Hospital updated successfully.');
      } else {
        await api.post('/hospitals', hospitalForm);
        setSuccess('Hospital created successfully.');
      }
      resetHospitalForm();
      await loadHospitals();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save hospital');
    }
  };

  const handleEditHospital = (hospital) => {
    setEditingHospitalId(hospital.id);
    setHospitalForm({
      name: hospital.name || '',
      address: hospital.address || '',
      description: hospital.description || '',
    });
    setSelectedHospitalId(hospital.id);
  };

  const handleDeleteHospital = async (hospital) => {
    if (!window.confirm(`Delete hospital ${hospital.name}?`)) return;
    setError('');
    setSuccess('');
    try {
      await api.post(`/hospitals/${hospital.id}/delete`);
      setSuccess('Hospital deleted successfully.');
      if (selectedHospitalId === hospital.id) {
        setSelectedHospitalId('');
        setHospitalAdmins([]);
      }
      await loadHospitals();
      resetHospitalForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete hospital');
    }
  };

  const submitAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingAdminId) {
        await api.put(`/hospitals/${adminForm.hospitalId}/admins/${editingAdminId}`, {
          name: adminForm.name,
          email: adminForm.email,
          password: adminForm.password || undefined,
        });
        setSuccess('Hospital admin updated successfully.');
      } else {
        await api.post(`/hospitals/${adminForm.hospitalId}/admins`, {
          name: adminForm.name,
          email: adminForm.email,
          password: adminForm.password,
        });
        setSuccess('Hospital admin created successfully.');
      }
      await loadHospitalAdmins(adminForm.hospitalId);
      resetAdminForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save hospital admin');
    }
  };

  const handleEditAdmin = (admin) => {
    setEditingAdminId(admin.id);
    setAdminForm({
      name: admin.name || '',
      email: admin.email || '',
      password: '',
      hospitalId: admin.hospitalId || selectedHospitalId || '',
    });
  };

  const handleDeleteAdmin = async (admin) => {
    if (!window.confirm(`Delete admin ${admin.name}?`)) return;
    setError('');
    setSuccess('');
    try {
      await api.post(`/hospitals/${admin.hospitalId}/admins/${admin.id}/delete`);
      setSuccess('Hospital admin deleted successfully.');
      await loadHospitalAdmins(admin.hospitalId);
      if (editingAdminId === admin.id) {
        resetAdminForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete hospital admin');
    }
  };

  const loadCalendar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.get(`/hospitals/${calendarFilters.hospitalId}/calendar`, {
        params: { from: calendarFilters.from, to: calendarFilters.to },
      });
      setCalendar(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load hospital calendar');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Platform Management
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {editingHospitalId ? 'Edit Hospital' : 'Create Hospital'}
            </Typography>
            <Box component="form" onSubmit={submitHospital}>
              <TextField fullWidth margin="normal" label="Hospital Name" name="name" value={hospitalForm.name} onChange={handleHospitalChange} required />
              <TextField fullWidth margin="normal" label="Address" name="address" value={hospitalForm.address} onChange={handleHospitalChange} />
              <TextField fullWidth margin="normal" label="Description" name="description" multiline minRows={3} value={hospitalForm.description} onChange={handleHospitalChange} />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button type="submit" variant="contained" fullWidth>
                  {editingHospitalId ? 'Update Hospital' : 'Create Hospital'}
                </Button>
                {editingHospitalId && <Button fullWidth variant="outlined" onClick={resetHospitalForm}>Cancel</Button>}
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {editingAdminId ? 'Edit Hospital Admin' : 'Create Hospital Admin'}
            </Typography>
            <Box component="form" onSubmit={submitAdmin}>
              <TextField fullWidth margin="normal" label="Name" name="name" value={adminForm.name} onChange={handleAdminChange} required />
              <TextField fullWidth margin="normal" label="Email" name="email" type="email" value={adminForm.email} onChange={handleAdminChange} required />
              <TextField fullWidth margin="normal" label={editingAdminId ? 'New Password (optional)' : 'Password'} name="password" type="password" value={adminForm.password} onChange={handleAdminChange} required={!editingAdminId} />
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="platform-hospital-label">Hospital</InputLabel>
                <Select
                  labelId="platform-hospital-label"
                  label="Hospital"
                  name="hospitalId"
                  value={adminForm.hospitalId}
                  onChange={handleAdminChange}
                >
                  {hospitals.map((hospital) => (
                    <MenuItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button type="submit" variant="contained" fullWidth>
                  {editingAdminId ? 'Update Admin' : 'Create Admin'}
                </Button>
                {editingAdminId && <Button fullWidth variant="outlined" onClick={resetAdminForm}>Cancel</Button>}
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hospitals
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hospitals.map((hospital) => (
                  <TableRow key={hospital.id} selected={selectedHospitalId === hospital.id}>
                    <TableCell>{hospital.name}</TableCell>
                    <TableCell>{hospital.address || '-'}</TableCell>
                    <TableCell>{hospital.description || '-'}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => setSelectedHospitalId(hospital.id)}>Admins</Button>
                      <Button size="small" onClick={() => handleEditHospital(hospital)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleDeleteHospital(hospital)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hospital Admins
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Hospital</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hospitalAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.hospitalName}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleEditAdmin(admin)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleDeleteAdmin(admin)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Hospital Appointment Calendar
            </Typography>
            <Box component="form" onSubmit={loadCalendar} sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, 1fr)', mb: 2 }}>
              <FormControl required>
                <InputLabel id="calendar-hospital-label">Hospital</InputLabel>
                <Select
                  labelId="calendar-hospital-label"
                  label="Hospital"
                  name="hospitalId"
                  value={calendarFilters.hospitalId}
                  onChange={handleCalendarChange}
                >
                  {hospitals.map((hospital) => (
                    <MenuItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField type="date" name="from" label="From" InputLabelProps={{ shrink: true }} value={calendarFilters.from} onChange={handleCalendarChange} required />
              <TextField type="date" name="to" label="To" InputLabelProps={{ shrink: true }} value={calendarFilters.to} onChange={handleCalendarChange} required />
              <Button type="submit" variant="contained">Load Calendar</Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Speciality</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calendar.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell>{appt.doctorName}</TableCell>
                    <TableCell>{appt.patientName}</TableCell>
                    <TableCell>{appt.doctorSpeciality || '-'}</TableCell>
                    <TableCell>{new Date(appt.start).toLocaleString()}</TableCell>
                    <TableCell>{new Date(appt.end).toLocaleString()}</TableCell>
                    <TableCell>{appt.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default HospitalManagementPage;
