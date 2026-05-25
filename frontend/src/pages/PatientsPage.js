import React, { useEffect, useState, useContext } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  InputAdornment,
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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../contexts/AuthContext';

function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/patients', {
          params: { search, page: 0, size: 100 },
        });
        setPatients(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPatients();
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    try {
      await api.delete(`/patients/${id}`);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const canEdit = user?.roles.includes('ROLE_ADMIN') || user?.roles.includes('ROLE_PLATFORM_ADMIN');

  return (
    <Container maxWidth="xl" className="page-shell">
      <Paper className="soft-panel" sx={{ p: { xs: 3, md: 4 }, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Chip color="primary" label={canEdit ? 'Care registry' : 'Clinical view'} sx={{ mb: 2 }} />
            <Typography variant="h3" component="h1">
              Patient registry
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 700 }}>
              Search patient records from the protected backend API. Admin users can add, update, and delete records from this screen.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className="metric-card" sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.72)' }}>
              <Typography variant="h4">{patients.length}</Typography>
              <Typography color="text.secondary">visible patient records</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems={{ sm: 'center' }}>
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or address"
          sx={{ minWidth: { sm: 360 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        {canEdit && (
          <Button variant="contained" component={Link} to="/patients/new" startIcon={<GroupAddIcon />}>
            Add Patient
          </Button>
        )}
      </Stack>

      <Paper className="table-wrap">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Date of Birth</TableCell>
              {canEdit && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
                      {p.name?.slice(0, 1) || 'P'}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={800}>{p.name}</Typography>
                      <Chip size="small" label={`ID ${p.id}`} variant="outlined" />
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.address || '-'}</TableCell>
                <TableCell>{p.dateOfBirth || '-'}</TableCell>
                {canEdit && (
                  <TableCell align="right">
                    <Button
                      component={Link}
                      to={`/patients/${p.id}/edit`}
                      state={{ patient: p }}
                      startIcon={<EditIcon />}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      color="error"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!patients.length && (
              <TableRow>
                <TableCell colSpan={canEdit ? 5 : 4} align="center">
                  No patients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

export default PatientsPage;
