import React, { useContext, useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import TodayIcon from '@mui/icons-material/Today';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

function NavButton({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <Button
      component={Link}
      to={item.to}
      onClick={onClick}
      startIcon={<Icon />}
      variant={active ? 'contained' : 'text'}
      color={active ? 'secondary' : 'inherit'}
      sx={{
        justifyContent: 'flex-start',
        color: active ? 'secondary.contrastText' : 'text.primary',
        px: 1.5,
      }}
    >
      {item.label}
    </Button>
  );
}

function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const hasRole = (role) => user?.roles?.includes(role);

  const navItems = user
    ? [
        hasRole('ROLE_PATIENT') && { label: 'Doctors', to: '/doctors', icon: PersonSearchIcon },
        hasRole('ROLE_PATIENT') && { label: 'Book', to: '/appointments/new', icon: CalendarMonthIcon },
        hasRole('ROLE_PATIENT') && { label: 'My Visits', to: '/appointments/my', icon: TodayIcon },
        (hasRole('ROLE_DOCTOR') || hasRole('ROLE_ADMIN') || hasRole('ROLE_PLATFORM_ADMIN')) && {
          label: 'Patients',
          to: '/patients',
          icon: GroupsIcon,
        },
        (hasRole('ROLE_DOCTOR') || hasRole('ROLE_ADMIN') || hasRole('ROLE_PLATFORM_ADMIN')) && {
          label: 'Appointments',
          to: '/appointments',
          icon: CalendarMonthIcon,
        },
        (hasRole('ROLE_ADMIN') || hasRole('ROLE_PLATFORM_ADMIN')) && {
          label: 'Doctor Admin',
          to: '/admin/doctors',
          icon: LocalHospitalIcon,
        },
        hasRole('ROLE_PLATFORM_ADMIN') && {
          label: 'Hospitals',
          to: '/admin/hospitals',
          icon: HealthAndSafetyIcon,
        },
      ].filter(Boolean)
    : [
        { label: 'Login', to: '/login', icon: PersonSearchIcon },
        { label: 'Register', to: '/register', icon: PersonAddAlt1Icon },
      ];

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/login');
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'PM';

  const navContent = (
    <Stack spacing={1} sx={{ p: { xs: 2, md: 0 } }}>
      {navItems.map((item) => (
        <NavButton
          key={item.to}
          item={item}
          active={location.pathname === item.to}
          onClick={() => setOpen(false)}
        />
      ))}
      {user && (
        <>
          <Divider sx={{ my: 1 }} />
          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            color="inherit"
            sx={{ justifyContent: 'flex-start', color: 'text.primary' }}
          >
            Logout
          </Button>
        </>
      )}
    </Stack>
  );

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: '1px solid rgba(23, 37, 42, 0.08)',
        backdropFilter: 'blur(18px)',
        backgroundColor: 'rgba(255, 255, 255, 0.82)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 72, gap: 2 }}>
          <Box
            component={Link}
            to="/"
            sx={{
              alignItems: 'center',
              color: 'text.primary',
              display: 'flex',
              flexGrow: { xs: 1, md: 0 },
              gap: 1.25,
              mr: 2,
              textDecoration: 'none',
            }}
          >
            <Avatar sx={{ bgcolor: 'primary.main', width: 42, height: 42 }}>
              <HealthAndSafetyIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" lineHeight={1}>
                MediCore
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Patient operations suite
              </Typography>
            </Box>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, alignItems: 'center' }}
          >
            {navItems.map((item) => (
              <NavButton key={item.to} item={item} active={location.pathname === item.to} />
            ))}
          </Stack>

          {user && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight={800}>
                  {user.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.roles?.[0]?.replace('ROLE_', '') || 'USER'}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>{initials}</Avatar>
              <Tooltip title="Logout">
                <IconButton onClick={handleLogout} aria-label="logout">
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          )}

          <IconButton
            aria-label="open navigation"
            onClick={() => setOpen(true)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280 }}>
          <Box sx={{ p: 2.5 }}>
            <Typography variant="h6">MediCore</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'Secure access'}
            </Typography>
          </Box>
          <Divider />
          {navContent}
        </Box>
      </Drawer>
    </AppBar>
  );
}

export default NavBar;
