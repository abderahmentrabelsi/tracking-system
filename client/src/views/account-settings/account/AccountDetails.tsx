'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { ChangeEvent } from 'react';
import CustomTextField from '@core/components/mui/TextField';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserDetailsByUsername, UserDetails, updateUserProfile } from '@/utils/userUtils';
import ProgressLinearWithLabel from '@/components/ProgressLinearWithLabel';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';

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
      if (!details) {
        throw new Error('User not found');
      }
      return details;
    },
  });

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDetails', username] });
    },
  });

  const initialData: Data = {
    firstName: userDetails?.firstName || '',
    lastName: userDetails?.lastName || '',
    email: userDetails?.email || '',
    phoneNumber: userDetails?.phoneNumber || '',
    address: userDetails?.address || '',
  };

  const [formData, setFormData] = useState<Data>(initialData);
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
    const {
      target: { value },
    } = event;
    setLanguage(value as string[]);
  };

  const handleFormChange = (field: keyof Data, value: Data[keyof Data]) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileInputChange = (file: ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    const { files } = file.target;

    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string);
      reader.readAsDataURL(files[0]);

      if (reader.result !== null) {
        setFileInput(reader.result as string);
      }
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

  return (
    <Card>
      <CardContent className="mbe-4">
        <div className="flex max-sm:flex-col items-center gap-6">
          <img height={100} width={100} className="rounded" src={imgSrc} alt="Profile" />
          <div className="flex flex-grow flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button component="label" variant="contained" htmlFor="account-settings-upload-image">
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
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                placeholder="John"
                onChange={(e) => handleFormChange('firstName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                placeholder="Doe"
                onChange={(e) => handleFormChange('lastName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label="Email"
                value={formData.email}
                placeholder="john.doe@gmail.com"
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                placeholder="+1 (234) 567-8901"
                onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label="Address"
                value={formData.address}
                placeholder="Address"
                onChange={(e) => handleFormChange('address', e.target.value)}
              />
            </Grid>
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
              <Button variant="tonal" type="reset" color="secondary" onClick={() => setFormData(initialData)}>
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
