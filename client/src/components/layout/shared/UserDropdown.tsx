import {  useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Avatar from 'react-avatar';
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { useQuery } from '@tanstack/react-query';
import { fetchUserDetails, UserDetails } from '@/utils/userUtils';
import { stringToColor } from '@/utils/colorUtils';

const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)',
});

const UserDropdown = () => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Assuming fetchUserDetails cannot be changed, adjust the useQuery call to handle null
  const { data: userDetails, isLoading, isError } = useQuery<UserDetails | null>({
    queryKey: ['userDropdownDetails'],
    queryFn: fetchUserDetails,
  });
  const handleDropdownOpen = () => {
    setOpen(!open);
  };

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(url);
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  const handleUserLogout = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_GO_APP_SERVER_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      document.cookie = "access_token=; Max-Age=-1; path=/";
      router.push('/login');
    } else {
      console.error('Logout failed');
    }
  };

  // Ensure userDetails is not null before accessing its properties
  const avatarColor = userDetails ? stringToColor(userDetails?.username ?? '') : '';
  return (
    <>
      <Badge
        ref={anchorRef}
        overlap="circular"
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className="mis-2"
      >
        <div onClick={handleDropdownOpen} className="cursor-pointer bs-[38px] is-[38px]">
          {userDetails?.picture ? (
            <img
              src={userDetails.picture}
              alt={userDetails.firstName || 'Unknown User'}
              style={{ width: 38, height: 38, borderRadius: '50%' }}
            />
          ) : (
            <Avatar
              name={`${userDetails?.firstName || 'Unknown'} ${userDetails?.lastName || 'User'}`}
              round
              size="38"
              color={avatarColor}
            />
          )}
        </div>
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement="bottom-end"
        anchorEl={anchorRef.current}
        className="min-is-[240px] !mbs-3 z-[1]"
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className="flex items-center plb-2 pli-6 gap-2" tabIndex={-1}>
                    {userDetails?.picture ? (
                      <img
                        src={userDetails.picture}
                        alt={userDetails.firstName || 'Unknown User'}
                        style={{ width: 38, height: 38, borderRadius: '50%' }}
                      />
                    ) : (
                      <Avatar
                        name={`${userDetails?.firstName || 'Unknown'} ${userDetails?.lastName || 'User'}`}
                        round
                        size="38"
                        color={avatarColor}
                      />
                    )}
                    <div className="flex items-start flex-col">
                      <Typography className="font-medium" color="text.primary">
                        {userDetails?.username || 'Unknown User'}
                      </Typography>
                      <Typography variant="caption">{userDetails?.email || 'No email'}</Typography>
                    </div>
                  </div>
                  <Divider className="mlb-1" />
                  <MenuItem className="mli-2 gap-3" onClick={e => handleDropdownClose(e, `/user-profile/${userDetails?.username}`)}>
                    <i className="tabler-user text-[22px]" />
                    <Typography color="text.primary">My Profile</Typography>
                  </MenuItem>
                  <MenuItem className="mli-2 gap-3" onClick={e => handleDropdownClose(e, `/account-settings/${userDetails?.username}`)}>
                    <i className="tabler-settings text-[22px]" />
                    <Typography color="text.primary">Settings</Typography>
                  </MenuItem>
                  <div className="flex items-center plb-2 pli-3">
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      size="small"
                      endIcon={<i className="tabler-logout" />}
                      onClick={handleUserLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default UserDropdown;
