import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import Stack from '@mui/joy/Stack';
import axios from 'axios';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import Input from '@app/components/Input';
import OrganizationForm from '@app/components/OrganizationForm';
import SettingsLayout from '@app/components/SettingsLayout';
import SettingCard from '@app/components/ui/SettingCard';
import useStateReducer from '@app/hooks/useStateReducer';

import { UpdateUserProfileSchema } from '@chaindesk/lib/types/dtos';
import { withAuth } from '@chaindesk/lib/withAuth';

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession();
  const [state, setState] = useStateReducer({
    isUpdatingProfile: false,
  });

  const methods = useForm<UpdateUserProfileSchema>({
    resolver: zodResolver(UpdateUserProfileSchema),
  });

  const updateProfile = async (data: UpdateUserProfileSchema) => {
    try {
      setState({
        isUpdatingProfile: true,
      });

      await axios.patch('/api/accounts/profile', data);

      await update();

      toast.success('Profile updated successfully.');
    } catch (err) {
      console.error(err);
      toast.success('Error updating profile.');
    } finally {
      setState({
        isUpdatingProfile: false,
      });
    }
  };

  React.useEffect(() => {
    if (session?.user?.email) {
      methods.setValue('email', session?.user?.email);
    }
  }, [session?.user?.email]);

  if (!session?.user) {
    return null;
  }

  return (
    <Stack
      sx={{
        height: '100%',
      }}
    >
      {/* <OrganizationForm /> */}

      <SettingCard
        title="Profile Settings"
        description="Your personal information and settings."
        cardProps={{
          sx: { maxWidth: 'md', mx: 'auto', width: '100%' },
        }}
        submitButtonProps={{
          loading: state.isUpdatingProfile,
          disabled: !methods.formState?.isValid || !methods?.formState?.isDirty,
          children: 'Update',
          onClick: () => updateProfile(methods.getValues()),
        }}
      >
        <form
          className="space-y-4"
          onSubmit={methods.handleSubmit(updateProfile)}
        >
          <Input
            control={methods.control}
            label="Email"
            value={session?.user?.email || ''}
            disabled
            {...methods.register('email')}
          />

          <Input
            control={methods.control}
            label="Name"
            defaultValue={session?.user?.name || ''}
            {...methods.register('name')}
          />

          <input type="submit" hidden />
        </form>
      </SettingCard>
    </Stack>
  );
}

ProfileSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

// export const getServerSideProps = withAuth(
//   async (ctx: GetServerSidePropsContext) => {
//     return {
//       props: {},
//     };
//   }
// );
