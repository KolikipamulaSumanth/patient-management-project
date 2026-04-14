import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../api';

function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [availability, setAvailability] = useState({});

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

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Find a Doctor
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Browse doctors, view their background, and book an appointment with the right specialist.
      </Typography>
      <Grid container spacing={3}>
        {doctors.map((doctor) => (
          <Grid item xs={12} md={6} key={doctor.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                  <Typography variant="h6">{doctor.name}</Typography>
                  {doctor.speciality && <Chip label={doctor.speciality} color="primary" variant="outlined" />}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {doctor.hospitalName || 'Hospital not specified'}
                </Typography>
                {doctor.qualification && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Education:</strong> {doctor.qualification}
                  </Typography>
                )}
                {doctor.age && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Age:</strong> {doctor.age}
                  </Typography>
                )}
                {doctor.yearsOfExperience != null && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Experience:</strong> {doctor.yearsOfExperience} years
                  </Typography>
                )}
                {doctor.address && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Clinic Address:</strong> {doctor.address}
                  </Typography>
                )}
                {doctor.bio && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>About:</strong> {doctor.bio}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Availability:</strong>{' '}
                  {(availability[doctor.id] || []).length
                    ? availability[doctor.id].map((slot) => `${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`).join(', ')
                    : 'No slots published yet'}
                </Typography>
                <Button
                  component={Link}
                  to={`/appointments/new?doctorId=${doctor.id}`}
                  variant="contained"
                >
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default DoctorsPage;
