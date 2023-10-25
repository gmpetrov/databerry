import {
  Button,
  Card,
  CardContent,
  Grid,
  Input,
  Modal,
  Sheet,
  Typography,
} from '@mui/joy';
import axios from 'axios';
import React from 'react';
type Props = {
  isOpen: boolean;
  handleCloseModal(): void;
};

function ActionsModal({ isOpen, handleCloseModal }: Props) {
  const [url, setWebsiteUrl] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const handleSubmit = async () => {
    setIsLoading(true);
    await axios.post('/api/automate', { type: 'website', url });
    setIsLoading(false);
  };
  return (
    <Modal
      open={isOpen}
      onClose={handleCloseModal}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Sheet>
        <Grid spacing={4} gap={5} justifyContent="center">
          <Grid xs={12} container gap={5} spacing={4} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography> Chat with a website</Typography>
                <Input
                  placeholder="website url"
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
                <Button onClick={handleSubmit}>
                  {isLoading ? 'loading' : 'submit'}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography> Chat with a notebook</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Sheet>
    </Modal>
  );
}

export default ActionsModal;
