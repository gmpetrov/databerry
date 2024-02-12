import { zodResolver } from '@hookform/resolvers/zod';
import { FormLabel, Option, Select } from '@mui/joy';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import Stack from '@mui/joy/Stack';
import axios from 'axios';
import i18next from 'i18next';
import mime from 'mime-types';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { ReactElement } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import Input from '@app/components/Input';
import OrganizationForm from '@app/components/OrganizationForm';
import SettingsLayout from '@app/components/SettingsLayout';
import IconInput from '@app/components/ui/IconInput';
import SettingCard from '@app/components/ui/SettingCard';
import useFileUpload from '@app/hooks/useFileUpload';
import useStateReducer from '@app/hooks/useStateReducer';

import { UpdateUserProfileSchema } from '@chaindesk/lib/types/dtos';
import { withAuth } from '@chaindesk/lib/withAuth';

export default function ProfileSettingsPage() {
  const { data: session, status, update } = useSession();
  const [state, setState] = useStateReducer({
    isUpdatingProfile: false,
  });
  const { upload, isUploading } = useFileUpload();

  const { t, i18n } = useTranslation('settings');

  const methods = useForm<UpdateUserProfileSchema>({
    resolver: zodResolver(UpdateUserProfileSchema),
  });

  const handleUploadPicture = async (event: any) => {
    const file = event?.target?.files?.[0];
    const fileName = `icon.${mime.extension(file.type)}`;

    console.log('fileName', fileName, file);
    const [customPictureUrl] = await upload([
      {
        case: 'userIcon',
        fileName,
        file,
      },
    ]);

    methods.setValue('customPicture', customPictureUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });

    await methods.handleSubmit(updateProfile)();
  };

  console.log('EROORS', methods.formState);

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

  React.useEffect(() => {
    if (status === 'authenticated') {
      methods.reset({
        email: session?.user?.email || '',
        name: session?.user?.name || '',
        customPicture: session?.user?.customPicture,
      });
    }
    i18n.changeLanguage(i18n.language == undefined ? 'de' : i18n.language);
  }, [
    i18n,
    methods,
    session?.user?.customPicture,
    session?.user?.email,
    session?.user?.name,
    status,
  ]);

  const updateLanguage = (newValue: string) => {
    // methods.setValue('language', newValue as string, {
    //   shouldDirty: true,
    //   shouldValidate: true,
    // });
    i18n.changeLanguage(newValue || 'de');
    // methods.trigger('language');
  };

  if (!session?.user) {
    return null;
  }

  const customPicture = methods.watch('customPicture');

  return (
    <Stack
      sx={{
        height: '100%',
      }}
      gap={4}
    >
      {/* <OrganizationForm /> */}

      <SettingCard
        title={t('title-profil')}
        description={t('subtitle-profil')}
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
            label={t('mail-profil')}
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

          <IconInput
            // innerIcon={<CorporateFareRoundedIcon />}
            defaultIconUrl={session?.user?.customPicture || ''}
            value={customPicture!}
            onChange={handleUploadPicture}
            onDelete={() => {
              methods.setValue('customPicture', null, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            // disabled={!hasAdminRole(session?.roles)}
            loading={isUploading || methods.formState.isSubmitting}
          />

          <input type="submit" hidden />
        </form>
      </SettingCard>

      <SettingCard
        title={t('language-profil')}
        description="Select your Dashboard Language."
        cardProps={{
          sx: { maxWidth: 'md', mx: 'auto', width: '100%' },
        }}
        disableSubmitButton={true}
        // submitButtonProps={{
        //   loading: state.isUpdatingProfile,
        //   disabled: !methods.formState?.isValid || !methods?.formState?.isDirty,
        //   children: 'Update',
        //   onClick: () => updateProfile(methods.getValues()),
        // }}
      >
        <form
          className="space-y-4"
          onSubmit={methods.handleSubmit(updateProfile)}
        >
          <FormLabel id="select-lang-label" htmlFor="select-lang-button">
            {t('language-profil')}
          </FormLabel>
          <Select
            {...methods.register('language')}
            key={methods.watch('language')}
            defaultValue={i18n.language}
            // value={methods.watch('language')}
            placeholder={'Sprache auswählen...'}
            // onChange={(e, newValue) => i18n.changeLanguage(newValue || 'de')}
            onChange={(e, newValue) => updateLanguage(newValue || 'de')}
            slotProps={{
              button: {
                id: 'select-lang-button',
                // TODO: Material UI set aria-labelledby correctly & automatically
                // but Base UI and Joy UI don't yet.
                'aria-labelledby': 'select-lang-label select-lang-button',
              },
            }}
          >
            <Option value="de">DE - Deutsch</Option>
            <Option value="en">EN - English</Option>
          </Select>
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
