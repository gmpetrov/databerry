import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/joy/Alert';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Stack from '@mui/joy/Stack';
import { useRouter } from 'next/router';
import React from 'react';

import Input from '@app/components/Input';

import { RouteNames } from '@chaindesk/lib/types';

import SettingCard from './ui/SettingCard';
import BlablaFormProvider from './BlablaFormProvider';
import Loader from './Loader';

type Props = {
  formId: string;
};

function FormSettingsTab({ formId }: Props) {
  const router = useRouter();

  return (
    <BlablaFormProvider formId={formId}>
      {({ query, mutation, deleteMutation, methods }) => {
        if (!query.data && query.isLoading) {
          return <Loader />;
        }

        return (
          <Stack sx={{ width: '100%', maxWidth: 'md', mx: 'auto', gap: 2 }}>
            <SettingCard
              title="General Settings"
              // description="Deploy your agent with the following widgets or integrations"
              disableSubmitButton
              cardProps={{
                sx: {
                  width: '100%',
                  // maxWidth: 'md',
                  // mx: 'auto',
                },
              }}
            >
              <FormControl>
                <FormLabel>Name</FormLabel>

                <Input
                  control={methods.control}
                  {...methods.register('name')}
                ></Input>
              </FormControl>
            </SettingCard>

            <SettingCard
              title="Delete Form"
              description="It will delete the form permanently"
              cardProps={{
                color: 'danger',
              }}
              submitButtonProps={{
                onClick: async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const confirmed = await window.confirm(
                    'All submissions will be deleted. Are you sure?'
                  );

                  if (confirmed) {
                    await deleteMutation.trigger();
                    router.replace(RouteNames.FORMS);
                  }
                },
                color: 'danger',
                children: 'Delete',
                startDecorator: <DeleteIcon />,
                loading: deleteMutation.isMutating,
              }}
            >
              <FormControl sx={{ gap: 1 }}>
                <Alert color="danger">
                  Delete the form and all submissions permanently
                </Alert>
              </FormControl>
            </SettingCard>
          </Stack>
        );
      }}
    </BlablaFormProvider>
  );
}

export default FormSettingsTab;
