import Logout from '@mui/icons-material/Logout'
import AppBar from '@mui/material/AppBar'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import { UserAvatar } from '../components/UserAvatar'
import { findNavItem, navItems } from './navItems'

const DRAWER_WIDTH = 248
const BOTTOM_NAV_HEIGHT = 64

function Brand() {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Typography component="span" sx={{ fontSize: 28, lineHeight: 1 }}>
        🔮
      </Typography>
      <Typography variant="h6" component="span" sx={{ fontWeight: 800 }}>
        Bola de Cristal
      </Typography>
    </Stack>
  )
}

export function AppLayout() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const current = findNavItem(location.pathname)

  if (!user) {
    return null
  }

  if (isDesktop) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', p: 2 },
          }}
        >
          <Box sx={{ px: 1, py: 2 }}>
            <Brand />
          </Box>
          <List sx={{ flexGrow: 1 }}>
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                selected={current?.path === item.path}
                onClick={() => navigate(item.path)}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', px: 1 }}>
            <UserAvatar user={user} size={36} />
            <Typography sx={{ flexGrow: 1, fontWeight: 700 }}>{user.displayName}</Typography>
            <Tooltip title="Sair">
              <IconButton onClick={logout} aria-label="Sair">
                <Logout />
              </IconButton>
            </Tooltip>
          </Stack>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 4, maxWidth: 1100 }}>
          <Outlet />
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: `${BOTTOM_NAV_HEIGHT + 16}px` }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Brand />
          </Box>
          <UserAvatar user={user} />
          <IconButton onClick={logout} aria-label="Sair" edge="end">
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ p: 2 }}>
        <Outlet />
      </Box>
      <Paper
        elevation={0}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: 1, borderColor: 'divider', zIndex: 1100 }}
      >
        <BottomNavigation
          showLabels
          value={current?.path ?? false}
          onChange={(_, path: string) => navigate(path)}
          sx={{ height: BOTTOM_NAV_HEIGHT }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              value={item.path}
              label={item.shortLabel}
              icon={item.icon}
              sx={{ minWidth: 0, px: 0.5 }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}