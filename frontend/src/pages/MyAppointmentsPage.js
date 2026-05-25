import React, { useEffect, useState } from 'react';
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
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import api from '../api';

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

function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [dialogType, setDialogType] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [note, setNote] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const upcomingCount = appointments.filter((appt) => canModifyAppointment(appt)).length;
  const completedCount = appointments.filter((appt) => appt.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter((appt) => appt.status === 'CANCELLED').length;

  const loadAppointments = async () => {
    try {
      const res = await api.get('/appointments/my', { params: { page: 0, size: 100 } });
      setAppointments(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const closeDialog = () => {
    setDialogType('');
    setSelectedAppointment(null);
    setNote('');
    setStart('');
    setEnd('');
    setActionError('');
  };

  const openCancelDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setDialogType('cancel');
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

  const handleCancel = async () => {
    try {
      await api.post(`/appointments/${selectedAppointment.id}/cancel`, { note });
      await loadAppointments();
      closeDialog();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleReschedule = async () => {
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
            <Chip label="Patient timeline" color="primary" sx={{ mb: 2 }} />
            <Typography variant="h3" component="h1">
              My appointments
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 700 }}>
              Track upcoming visits, reschedule when needed, and review status updates from your care team.
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Grid container spacing={2}>
              {[
                ['Upcoming', upcomingCount, CalendarMonthIcon],
                ['Completed', completedCount, EventAvailableIcon],
                ['Cancelled', cancelledCount, EventBusyIcon],
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
      <Paper className="table-wrap">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Doctor</TableCell>
              <TableCell>Speciality</TableCell>
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
                <TableCell>{appt.doctorName}</TableCell>
                <TableCell>{appt.doctorSpeciality || '-'}</TableCell>
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
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
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
                      color="error"
                      variant="outlined"
                      disabled={!canModifyAppointment(appt)}
                      onClick={() => openCancelDialog(appt)}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {!appointments.length && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No appointments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(dialogType)} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogType === 'cancel' ? 'Cancel Appointment' : 'Reschedule Appointment'}
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
            label={dialogType === 'cancel' ? 'Cancellation note' : 'Reschedule note'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
          {dialogType === 'cancel' ? (
            <Button color="error" variant="contained" onClick={handleCancel}>
              Confirm Cancel
            </Button>
          ) : (
            <Button variant="contained" onClick={handleReschedule}>
              Save New Time
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MyAppointmentsPage;
