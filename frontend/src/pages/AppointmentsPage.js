import React, { useEffect, useState, useContext } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import api from '../api';
import AuthContext from '../contexts/AuthContext';

function formatDateTimeInput(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function canModifyAppointment(appointment) {
  return !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(appointment.status);
}

function StatusChip({ status }) {
  const colorMap = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    RESCHEDULED: 'secondary',
    COMPLETED: 'success',
    NO_SHOW: 'error',
    CANCELLED: 'default',
  };

  return <Chip size="small" label={status} color={colorMap[status] || 'default'} />;
}

function AppointmentsPage() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [dialogType, setDialogType] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [note, setNote] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const isAdmin = user?.roles.includes('ROLE_ADMIN') || user?.roles.includes('ROLE_PLATFORM_ADMIN');
  const pendingCount = appointments.filter((appt) => appt.status === 'PENDING').length;
  const activeCount = appointments.filter((appt) => canModifyAppointment(appt)).length;
  const closedCount = appointments.length - activeCount;

  useEffect(() => {
    if (isAdmin) {
      Promise.all([api.get('/doctors'), api.get('/users/me')])
        .then(([doctorRes, meRes]) => {
          const visibleDoctors = user?.roles.includes('ROLE_PLATFORM_ADMIN')
            ? doctorRes.data
            : doctorRes.data.filter((doctor) => doctor.hospitalId === meRes.data.hospitalId);
          setDoctors(visibleDoctors);
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Failed to load doctors');
        });
    }
  }, [isAdmin, user]);

  const loadAppointments = async () => {
    try {
      const params = { page: 0, size: 100 };
      if (isAdmin) {
        if (!selectedDoctor) {
          setAppointments([]);
          return;
        }
        params.doctorId = selectedDoctor;
      }
      const res = await api.get('/appointments', { params });
      setAppointments(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [selectedDoctor, isAdmin]);

  const closeDialog = () => {
    setDialogType('');
    setSelectedAppointment(null);
    setNote('');
    setStart('');
    setEnd('');
    setActionError('');
  };

  const openStatusDialog = (appointment, type) => {
    setSelectedAppointment(appointment);
    setDialogType(type);
    setNote('');
    setActionError('');
  };

  const openRescheduleDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setDialogType('reschedule');
    setNote('');
    setStart(formatDateTimeInput(appointment.start));
    setEnd(formatDateTimeInput(appointment.end));
    setActionError('');
  };

  const submitStatus = async (status) => {
    try {
      await api.post(`/appointments/${selectedAppointment.id}/status`, { status, note });
      await loadAppointments();
      closeDialog();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const submitCancel = async () => {
    try {
      await api.post(`/appointments/${selectedAppointment.id}/cancel`, { note });
      await loadAppointments();
      closeDialog();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const submitReschedule = async () => {
    try {
      await api.put(`/appointments/${selectedAppointment.id}/reschedule`, { start, end, note });
      await loadAppointments();
      closeDialog();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reschedule appointment');
    }
  };

  return (
    <Container maxWidth="xl" className="page-shell">
      <Paper className="soft-panel" sx={{ p: { xs: 3, md: 4 }, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Chip label="Operations command" color="secondary" sx={{ mb: 2 }} />
            <Typography variant="h3" component="h1">
              Appointment control center
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 700 }}>
              Review bookings, move appointments through their lifecycle, and capture operational notes against protected backend endpoints.
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Grid container spacing={2}>
              {[
                ['Pending', pendingCount, PendingActionsIcon],
                ['Active', activeCount, AssignmentTurnedInIcon],
                ['Closed', closedCount, EventBusyIcon],
              ].map(([label, value, Icon]) => (
                <Grid item xs={4} key={label}>
                  <Box className="metric-card" sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.72)' }}>
                    <Icon color="primary" />
                    <Typography variant="h4">{value}</Typography>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {isAdmin && (
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 240 }}>
            <InputLabel id="doctor-select-label">Select Doctor</InputLabel>
            <Select
              labelId="doctor-select-label"
              value={selectedDoctor}
              label="Select Doctor"
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {doctors.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      <Paper className="table-wrap">
        <Table>
          <TableHead>
            <TableRow>
              {isAdmin && <TableCell>Doctor</TableCell>}
              <TableCell>Patient</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Lifecycle Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appt) => (
              <TableRow key={appt.id}>
                {isAdmin && <TableCell>{appt.doctorName}</TableCell>}
                <TableCell>{appt.patientName}</TableCell>
                <TableCell>{new Date(appt.start).toLocaleString()}</TableCell>
                <TableCell>{new Date(appt.end).toLocaleString()}</TableCell>
                <TableCell>
                  <StatusChip status={appt.status} />
                </TableCell>
                <TableCell>{appt.reason || '-'}</TableCell>
                <TableCell>
                  {appt.statusNote || '-'}
                  {appt.statusUpdatedAt ? (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {new Date(appt.statusUpdatedAt).toLocaleString()}
                      {appt.statusUpdatedBy ? ` by ${appt.statusUpdatedBy}` : ''}
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={!canModifyAppointment(appt)}
                      onClick={() => openStatusDialog(appt, 'confirm')}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={!canModifyAppointment(appt)}
                      onClick={() => openRescheduleDialog(appt)}
                    >
                      Reschedule
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={!canModifyAppointment(appt)}
                      onClick={() => openStatusDialog(appt, 'complete')}
                    >
                      Complete
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={!canModifyAppointment(appt)}
                      onClick={() => openStatusDialog(appt, 'no-show')}
                    >
                      No Show
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      disabled={!canModifyAppointment(appt)}
                      onClick={() => openStatusDialog(appt, 'cancel')}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {!appointments.length && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} align="center">
                  No appointments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(dialogType)} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogType === 'confirm' && 'Confirm Appointment'}
          {dialogType === 'complete' && 'Complete Appointment'}
          {dialogType === 'no-show' && 'Mark Appointment as No Show'}
          {dialogType === 'cancel' && 'Cancel Appointment'}
          {dialogType === 'reschedule' && 'Reschedule Appointment'}
        </DialogTitle>
        <DialogContent>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          {dialogType === 'reschedule' && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="New Start Time"
                InputLabelProps={{ shrink: true }}
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <TextField
                fullWidth
                type="datetime-local"
                label="New End Time"
                InputLabelProps={{ shrink: true }}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </Stack>
          )}
          <TextField
            fullWidth
            multiline
            minRows={3}
            margin="normal"
            label="Operational note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
          {dialogType === 'confirm' && (
            <Button variant="contained" onClick={() => submitStatus('CONFIRMED')}>
              Confirm
            </Button>
          )}
          {dialogType === 'complete' && (
            <Button variant="contained" onClick={() => submitStatus('COMPLETED')}>
              Complete
            </Button>
          )}
          {dialogType === 'no-show' && (
            <Button variant="contained" color="warning" onClick={() => submitStatus('NO_SHOW')}>
              Mark No Show
            </Button>
          )}
          {dialogType === 'cancel' && (
            <Button variant="contained" color="error" onClick={submitCancel}>
              Cancel Appointment
            </Button>
          )}
          {dialogType === 'reschedule' && (
            <Button variant="contained" onClick={submitReschedule}>
              Save New Time
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AppointmentsPage;
