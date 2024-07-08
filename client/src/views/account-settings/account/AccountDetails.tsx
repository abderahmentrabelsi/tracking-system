'use client';

import { ChangeEvent, useEffect, useState } from 'react'
import { useParams } from 'next/navigation';
import {
  Grid,
  Card,
  CardContent,
  Button,
  Typography,
  MenuItem,
  Chip, SelectChangeEvent
} from '@mui/material'
import Avatar from 'react-avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CustomTextField from '@core/components/mui/TextField';
import ProgressLinearWithLabel from '@/components/ProgressLinearWithLabel';
import { fetchUserDetailsByUsername, UserDetails, updateUserProfile } from '@/utils/userUtils';
import { stringToColor } from '@/utils/colorUtils';

const languageData = ['English', 'Arabic', 'French', 'German', 'Portuguese'];

type Data = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number | string;
  address: string;
};

const AccountDetails = () => {
  const { username } = useParams<{ username: string }>();
  const queryClient = useQueryClient();

  const { data: userDetails, isError, isLoading } = useQuery<UserDetails>({
    queryKey: ['userDetails', username],
    queryFn: async () => {
      const details = await fetchUserDetailsByUsername(username);
      if (!details) throw new Error('User not found');
      return details;
    },
  });

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDetails', username] });
    },
  });

  const [formData, setFormData] = useState<Data>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  const [fileInput, setFileInput] = useState<string>('');
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png');
  const [language, setLanguage] = useState<string[]>(['English']);

  useEffect(() => {
    if (userDetails) {
      setFormData({
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        email: userDetails.email,
        phoneNumber: userDetails.phoneNumber,
        address: userDetails.address,
      });
    }
  }, [userDetails]);

  const handleDelete = (value: string) => {
    setLanguage((current) => current.filter((item) => item !== value));
  };

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    setLanguage(event.target.value as string[]);
  };

  const handleFormChange = (field: keyof Data, value: Data[keyof Data]) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputReset = () => {
    setFileInput('');
    setImgSrc('/images/avatars/1.png');
  };

  const handleSubmit = () => {
    mutation.mutate({ username, ...formData });
  };

  if (isLoading) return <ProgressLinearWithLabel />;
  if (isError) return <div>Error loading user details</div>;

  const avatarColor = stringToColor(userDetails?.username || 'Unknown User');

  return (
    <Card>
      <CardContent className="mbe-4">
        <div className="flex max-sm:flex-col items-center gap-6">
          {imgSrc === '/images/avatars/1.png' ? (
            <Avatar
              name={userDetails?.firstName || 'Unknown User'}
              round
              size="100"
              color={avatarColor}
            />
          ) : (
            <img
              src={imgSrc}
              alt="Uploaded Avatar"
              className="rounded-full"
              style={{ width: '100px', height: '100px' }}
            />
          )}
          <div className="flex flex-grow flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                component="label"
                variant="contained"
                htmlFor="account-settings-upload-image"
              >
                Upload New Photo
                <input
                  hidden
                  type="file"
                  value={fileInput}
                  accept="image/png, image/jpeg"
                  onChange={handleFileInputChange}
                  id="account-settings-upload-image"
                />
              </Button>
              <Button variant="tonal" color="secondary" onClick={handleFileInputReset}>
                Reset
              </Button>
            </div>
            <Typography>Allowed JPG, GIF or PNG. Max size of 800K</Typography>
          </div>
        </div>
      </CardContent>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <Grid container spacing={6}>
            {['firstName', 'lastName', 'email', 'phoneNumber', 'address'].map((field) => (
              <Grid item xs={12} sm={6} key={field}>
                <CustomTextField
                  fullWidth
                  label={field.replace(/^\w/, (c) => c.toUpperCase())}
                  value={formData[field as keyof Data]}
                  placeholder={field === 'phoneNumber' ? '+1 (234) 567-8901' : field}
                  onChange={(e) => handleFormChange(field as keyof Data, e.target.value)}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6}>
              <CustomTextField
                select
                fullWidth
                label="Language"
                value={language}
                SelectProps={{
                  multiple: true,
                  onChange: handleChange,
                  renderValue: (selected) => (
                    <div className="flex flex-wrap gap-2">
                      {(selected as string[]).map((value) => (
                        <Chip
                          key={value}
                          clickable
                          onMouseDown={(event) => event.stopPropagation()}
                          size="small"
                          label={value}
                          onDelete={() => handleDelete(value)}
                        />
                      ))}
                    </div>
                  ),
                }}
              >
                {languageData.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid item xs={12} className="flex gap-4 flex-wrap">
              <Button variant="contained" onClick={handleSubmit}>
                Save Changes
              </Button>
              <Button
                variant="tonal"
                type="reset"
                color="secondary"
                onClick={() => setFormData(userDetails as Data)}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountDetails;
