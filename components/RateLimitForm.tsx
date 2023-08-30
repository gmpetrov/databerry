import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormLabel, Typography } from '@mui/joy';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';
import { AgentInterfaceConfig } from '@app/types/models';

const rateLimitSchema = AgentInterfaceConfig.pick({
  rateLimit: true,
  rateLimitInterval: true,
  rateLimitMessage: true,
});

export type RateLimitFields = z.infer<typeof rateLimitSchema>;

interface IRateLimitFormProps {
  onSubmit(args: RateLimitFields): Promise<void>;
}

const RateLimitForm: React.FC<IRateLimitFormProps> = ({ onSubmit }) => {
  const { register, control, handleSubmit, setValue } =
    useForm<RateLimitFields>({
      resolver: zodResolver(rateLimitSchema),
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormLabel>Rate Limit</FormLabel>
      <Typography
        level='body3'
        sx={{
          mb: 2,
        }}
      >
        Limit the number of messages sent from one device on the Chat Bubble,
        iFrame and Standalone integrations.
      </Typography>

      <Input
        control={control as any}
        sx={{
          mb: 2,
        }}
        label='rateLimit'
        {...register('rateLimit')}
      />
      <Input
        control={control as any}
        sx={{
          mb: 2,
        }}
        label='rateLimitInterval'
        {...register('rateLimitInterval')}
        onChange={(e) => {
          console.log(typeof e.target.value);
        }}
      />
      <Input
        control={control as any}
        sx={{
          mb: 2,
        }}
        label='rateLimitReachedMessage'
        {...register('rateLimitMessage')}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type='submit'
          variant='solid'
          color='primary'
          sx={{ ml: 2, mt: 2 }} // Adjust the margin as needed
        >
          Save
        </Button>
      </div>
    </form>
  );
};

export default RateLimitForm;
