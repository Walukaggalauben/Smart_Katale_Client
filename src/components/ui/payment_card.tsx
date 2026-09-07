import Box from '@mui/joy/Box';
import SmartForm from '../common/form';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Divider, Stack, Typography, Button } from '@mui/joy';
import { useAppSelector } from '../../types/hooks.types';
import axios from 'axios';
import { API_URL, PaymentCardFormFields } from '../../configs';
import type { PaymentCardFormProps } from '../../interfaces/users.interfaces';



export default function PaymentCardForm({ cardToEdit, onSuccess, onCancel }: PaymentCardFormProps) {
  const navigate = useNavigate();
  const { id: userId } = useAppSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = React.useState<{ [key: string]: string }>({
    card_number: '',
    card_holder_name: '',
    expiry_date: '',
    cvv: '',
    is_default: 'false'
  });

  useEffect(() => {
    if (cardToEdit) {
      setFormData({
        card_number: cardToEdit.card_number || '',
        card_holder_name: cardToEdit.card_holder_name || '',
        expiry_date: cardToEdit.expiry_date || '',
        cvv: cardToEdit.cvv || '',
        is_default: cardToEdit.is_default ? 'true' : 'false'
      });
    } else {
      setFormData({
        card_number: '',
        card_holder_name: '',
        expiry_date: '',
        cvv: '',
        is_default: 'false'
      });
    }
  }, [cardToEdit]);

  const isFormValid = () => {
    return formData.card_number !== "" && 
           formData.card_holder_name !== "" && 
           formData.expiry_date !== "" &&
           formData.cvv !== "";
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const url = cardToEdit 
        ? `${API_URL}/accounts/${userId}/card-details/${cardToEdit.id}/`
        : `${API_URL}/accounts/${userId}/card-details/`;
      
      const method = cardToEdit ? 'put' : 'post';
      
      const response = await axios({
        method,
        url,
        data: {
          card_number: formData.card_number,
          card_holder_name: formData.card_holder_name,
          expiry_date: formData.expiry_date,
          cvv: formData.cvv,
          is_default: formData.is_default === 'true'
        },
        headers: {
          'Content-Type': 'application/json',
          ...(sessionStorage.getItem('access_token') ? { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` } : {})
        }
      });

      if (response.status === 200 || response.status === 201) {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error saving payment card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <Stack
        spacing={4}
        sx={{
          display: 'flex',
          maxWidth: '800px',
          mx: 'auto',
          px: { xs: 1, md: 2 },
          py: { xs: 1, md: 2 },
        }}
      >
        <Card>
          <Box sx={{ mb: 1 }}>
            <Typography level="title-md">
              {cardToEdit ? 'EDIT PAYMENT CARD' : 'ADD PAYMENT CARD'}
            </Typography>
          </Box>
          <Divider />
  
          <Stack direction="column" spacing={2} sx={{ my: 1 }}>
            <SmartForm
              formControls={PaymentCardFormFields}
              isLoading={isLoading}
              buttonText={cardToEdit ? "UPDATE CARD" : "ADD CARD"}
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              variant='solid'
              isBtnDisabled={!isFormValid()}
              message={cardToEdit ? 'UPDATING CARD...' : 'ADDING CARD...'}
            />
            
            <Button
              variant="plain"
              color="neutral"
              onClick={handleCancel}
              sx={{ mt: 1 }}
            >
              Cancel
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}