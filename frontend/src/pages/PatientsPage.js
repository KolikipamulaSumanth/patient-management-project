import React, { useEffect, useState, useContext } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../contexts/AuthContext';

/**
 * Displays a searchable list of patients. Administrators can add new
 * patients or edit and delete existing ones. Doctors have read‑only
 * access. The search input queries the backend each time its value
 * changes.
 */
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
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Patients
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
        />
        {canEdit && (
          <Button
            variant="contained"
            component={Link}
            to="/patients/new"
            sx={{ ml: 2 }}
          >
            Add Patient
          </Button>
        )}
      </Box>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Date of Birth</TableCell>
              {canEdit && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.address}</TableCell>
                <TableCell>{p.dateOfBirth}</TableCell>
                {canEdit && (
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/patients/${p.id}/edit`}
                      state={{ patient: p }}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      color="error"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

export default PatientsPage;
