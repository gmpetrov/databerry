import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, FormLabel, Stack, Typography } from '@mui/joy';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';
import { AgentInterfaceConfig } from '@app/types/models';

const rateLimitSchema = AgentInterfaceConfig.pick({
  rateLimit: true,
});

export type RateLimitFields = z.infer<typeof rateLimitSchema>;

interface Props extends RateLimitFields {
  onSubmit(args: RateLimitFields): Promise<void>;
}

const RateLimitForm: React.FC<Props> = ({ onSubmit, rateLimit }) => {
  const { register, control, handleSubmit, watch } = useForm<RateLimitFields>({
    resolver: zodResolver(rateLimitSchema),
    defaultValues: {
      rateLimit,
    },
  });

  const isRateLimitEnabled = watch('rateLimit.enabled');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormLabel>Rate Limit</FormLabel>
      <Typography
        level="body3"
        sx={{
          mb: 2,
        }}
      >
        Limit the number of messages sent from one device on the Chat Bubble,
        iFrame and Standalone integrations.
      </Typography>

      <Stack gap={2}>
        <div className="flex space-x-4">
          <Checkbox
            size="lg"
            {...register('rateLimit.enabled')}
            defaultChecked={isRateLimitEnabled}
          />
          <div className="flex flex-col">
            <FormLabel>Enable Rate Limit</FormLabel>
            <Typography level="body3">
              X messages max every Y seconds
            </Typography>
          </div>
        </div>

        <Stack gap={2} pl={4}>
          <Input
            control={control as any}
            label="Max number of queries"
            disabled={!isRateLimitEnabled}
            placeholder="10"
            {...register('rateLimit.maxQueries')}
          />
          <Input
            control={control as any}
            label="Interval (in seconds)"
            disabled={!isRateLimitEnabled}
            placeholder="60"
            {...register('rateLimit.interval')}
          />
          <Input
            control={control as any}
            label="Rate Limit Reached Message"
            placeholder="Usage limit reached"
            disabled={!isRateLimitEnabled}
            {...register('rateLimit.limitReachedMessage')}
          />
        </Stack>
      </Stack>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="solid"
          color="primary"
          sx={{ ml: 2, mt: 2 }} // Adjust the margin as needed
        >
          Save
        </Button>
      </div>
    </form>
  );
};

export default RateLimitForm;
