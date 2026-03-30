import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SecurityIcon from '@mui/icons-material/Security';
import SchoolIcon from '@mui/icons-material/School';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BugReportIcon from '@mui/icons-material/BugReport';
import LinkIcon from '@mui/icons-material/Link';
import ShieldIcon from '@mui/icons-material/Shield';

const DRAWER_WIDTH = 280;

const menuItems = [
  {
    label: 'อธิบายโมเดล',
    items: [
      { text: 'Machine Learning', subtitle: 'ตรวจจับ Malware', path: '/ml-explanation', icon: <SchoolIcon /> },
      { text: 'Neural Network', subtitle: 'ตรวจจับ URL อันตราย', path: '/nn-explanation', icon: <PsychologyIcon /> },
    ],
  },
  {
    label: 'ทดสอบโมเดล',
    items: [
      { text: 'ตรวจจับ Malware', subtitle: 'อัพโหลดไฟล์', path: '/test-malware', icon: <BugReportIcon /> },
      { text: 'ตรวจจับ URL', subtitle: 'ป้อน URL', path: '/test-url', icon: <LinkIcon /> },
    ],
  },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        <ShieldIcon sx={{ fontSize: 36, color: 'primary.main', filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '0.05em', lineHeight: 1.2, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MALPHIS
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            AI Security Platform
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(59,130,246,0.15)' }} />
      <Box sx={{ flex: 1, py: 1 }}>
        {menuItems.map((group) => (
          <Box key={group.label} sx={{ mb: 1 }}>
            <Typography
              variant="overline"
              sx={{ px: 3, py: 1.5, display: 'block', color: 'text.secondary', fontSize: '0.65rem', letterSpacing: '0.1em' }}
            >
              {group.label}
            </Typography>
            <List disablePadding>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItem key={item.path} disablePadding sx={{ px: 1.5 }}>
                    <ListItemButton
                      onClick={() => {
                        navigate(item.path);
                        if (isMobile) setMobileOpen(false);
                      }}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        py: 1.2,
                        backgroundColor: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                        borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(59,130,246,0.08)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'text.secondary' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        secondary={item.subtitle}
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? 'primary.light' : 'text.primary',
                        }}
                        secondaryTypographyProps={{
                          fontSize: '0.72rem',
                          color: 'text.secondary',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
      <Divider sx={{ borderColor: 'rgba(59,130,246,0.15)' }} />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
          © 2026 MALPHIS AI Project
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ bgcolor: 'rgba(10,14,26,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,130,246,0.15)' }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>MALPHIS</Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          mt: isMobile ? 8 : 0,
          maxWidth: '100%',
          overflow: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
