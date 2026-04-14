import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

/**
 * Top navigation bar that adapts to the user's authentication state. It
 * exposes relevant links based on the logged‑in user's roles and
 * provides a logout action. If no user is logged in the bar offers
 * links to the login and registration pages.
 */
function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const hasRole = (role) => user?.roles?.includes(role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Patient Management
        </Typography>
        {user ? (
          <>
            {hasRole('ROLE_PATIENT') && (
              <>
                <Button color="inherit" component={Link} to="/doctors">Doctors</Button>
                <Button color="inherit" component={Link} to="/appointments/new">New Appointment</Button>
                <Button color="inherit" component={Link} to="/appointments/my">My Appointments</Button>
              </>
            )}
            {(hasRole('ROLE_DOCTOR') || hasRole('ROLE_ADMIN') || hasRole('ROLE_PLATFORM_ADMIN')) && (
              <>
                <Button color="inherit" component={Link} to="/patients">Patients</Button>
                <Button color="inherit" component={Link} to="/appointments">Appointments</Button>
              </>
            )}
            {(hasRole('ROLE_ADMIN') || hasRole('ROLE_PLATFORM_ADMIN')) && (
              <Button color="inherit" component={Link} to="/admin/doctors">Doctors Admin</Button>
            )}
            {hasRole('ROLE_PLATFORM_ADMIN') && (
              <Button color="inherit" component={Link} to="/admin/hospitals">Hospitals</Button>
            )}
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">Login</Button>
            <Button color="inherit" component={Link} to="/register">Register</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
