import Avatar from '@mui/material/Avatar'

import type { User } from '../types'

interface UserAvatarProps {
  user: User
  size?: number
}

export function UserAvatar({ user, size = 32 }: UserAvatarProps) {
  return (
    <Avatar
      alt={user.displayName}
      sx={{ bgcolor: user.color, width: size, height: size, fontSize: size * 0.45, fontWeight: 800 }}
    >
      {user.displayName.charAt(0).toUpperCase()}
    </Avatar>
  )
}