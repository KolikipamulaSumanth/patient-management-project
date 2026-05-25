import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import { Link } from 'react-router-dom';
import api from '../api';

function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [availability, setAvailability] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .get('/doctors')
      .then(async (res) => {
        setDoctors(res.data);
        const entries = await Promise.all(
          res.data.map(async (doctor) => {
            const slotRes = await api.get(`/doctors/${doctor.id}/availability`);
            return [doctor.id, slotRes.data];
          })
        );
        setAvailability(Object.fromEntries(entries));
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredDoctors = useMemo(() => {
    const term = search.toLowerCase();
    return doctors.filter((doctor) =>
      [doctor.name, doctor.speciality, doctor.hospitalName, doctor.qualification]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [doctors, search]);

  const slotCount = Object.values(availability).reduce((sum, slots) => sum + slots.length, 0);

  return (
    <Container maxWidth="xl" className="page-shell">
      <Paper className="soft-panel" sx={{ p: { xs: 3, md: 4 }, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Chip label="Patient booking" color="secondary" sx={{ mb: 2 }} />
            <Typography variant="h3" component="h1">
              Find the right doctor and book a visit.
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 680 }}>
              Search by specialty, hospital, qualification, or doctor name. Availability comes directly from the backend doctor schedules.
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Grid container spacing={2}>
              {[
                ['Doctors', doctors.length],
                ['Published slots', slotCount],
                ['Hospitals', new Set(doctors.map((d) => d.hospitalName).filter(Boolean)).size],
              ].map(([label, value]) => (
                <Grid item xs={4} key={label}>
                  <Box className="metric-card" sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.72)' }}>
                    <Typography variant="h4">{value}</Typography>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <TextField
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search doctors, specialties, hospitals..."
        sx={{ mb: 3, maxWidth: 560 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredDoctors.map((doctor) => {
          const slots = availability[doctor.id] || [];
          return (
            <Grid item xs={12} md={6} lg={4} key={doctor.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', width: 56, height: 56 }}>
                      {doctor.name?.slice(0, 1) || 'D'}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6">{doctor.name}</Typography>
                      {doctor.speciality && <Chip size="small" label={doctor.speciality} color="primary" />}
                    </Box>
                  </Stack>

                  <Stack spacing={1.2} sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocalHospitalIcon color="action" fontSize="small" />
                      <Typography variant="body2">{doctor.hospitalName || 'Hospital not specified'}</Typography>
                    </Stack>
                    {doctor.qualification && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SchoolIcon color="action" fontSize="small" />
                        <Typography variant="body2">{doctor.qualification}</Typography>
                      </Stack>
                    )}
                    {doctor.yearsOfExperience != null && (
                      <Typography variant="body2" color="text.secondary">
                        {doctor.yearsOfExperience} years experience
                      </Typography>
                    )}
                  </Stack>

                  {doctor.bio && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {doctor.bio}
                    </Typography>
                  )}

                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <AccessTimeIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle2">Availability</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {slots.length ? (
                        slots.slice(0, 4).map((slot) => (
                          <Chip
                            key={slot.id || `${slot.dayOfWeek}-${slot.startTime}`}
                            size="small"
                            label={`${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`}
                            variant="outlined"
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No slots published yet
                        </Typography>
                      )}
                    </Stack>
                  </Box>

                  <Button
                    component={Link}
                    to={`/appointments/new?doctorId=${doctor.id}`}
                    variant="contained"
                    startIcon={<CalendarMonthIcon />}
                    fullWidth
                  >
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}

export default DoctorsPage;
