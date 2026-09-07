import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import SmartForm from '../common/form';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Card, Divider, Stack, Typography } from '@mui/joy';
import { useAppSelector } from '../../types/hooks.types';
import axios from 'axios';
import { API_URL } from '../../configs';
import { UpdateProfileFormFields } from '../../configs/form_fields';

export default function Profile() {
  const navigate = useNavigate();
  const { id: userId } = useAppSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = React.useState<{ [key: string]: string }>({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    password: ''
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      setIsFetching(true);
      try {
        
        const token = sessionStorage.getItem('access_token');
        const response = await axios.get(`${API_URL}/accounts/${userId}/details/`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  
        if (response.data) {
          console.log(response.data)
          setFormData({
            first_name: response.data.first_name || '',
            last_name: response.data.last_name || '',
            phone_number: response.data.phone_number || '',
            email: response.data.email || '',
            password: '' 
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const isFormValid = () => {

    return formData.first_name !== "" && 
           formData.last_name !== "" && 
           formData.phone_number !== "" && 
           formData.email !== "";
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Prepare update data (exclude empty password)
      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        email: formData.email
      };

      // Only include password if it's provided
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      const response = await axios.put(
        `${API_URL}/accounts/${userId}/details/`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(sessionStorage.getItem('access_token') ? { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` } : {})
          }
        }
      );

      if (response.status === 200) {
        // Show success message
        navigate('/my-profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error toast here
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  return (
<Box sx={{ flex: 1, width: '100%' }}>
 
      <Stack
        spacing={4}
        sx={{
          display: 'flex',
        
         
          py: { xs: 2, md: 3 },
        }}
      >
        <Card>
          <Box sx={{ mb: 1 }}>
            <Typography level="title-md">Personal info</Typography>
          </Box>
          <Divider />
  
          <Stack
            direction="column"
            spacing={2}
            sx={{ my: 1 }}
          >
            <Stack direction="row" spacing={2}>
              <Stack direction="column" spacing={1}>
                <AspectRatio
                  ratio="1"
                  maxHeight={108}
                  sx={{ flex: 1, minWidth: 108, borderRadius: '100%' }}
                >
          <Avatar alt= {`${formData.first_name} - $${formData.last_name}`}/>
                </AspectRatio>
             
              </Stack>
            </Stack>
   <SmartForm  formControls={UpdateProfileFormFields}
          isLoading = {isLoading}
          buttonText={"CONFIRM"}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          variant='solid'
          isBtnDisabled={!isFormValid()}
          message='UPDATING......'
         />
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}