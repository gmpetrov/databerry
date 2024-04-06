import { zodResolver } from '@hookform/resolvers/zod';
import CorporateFareRoundedIcon from '@mui/icons-material/CorporateFareRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import CircularProgress from '@mui/joy/CircularProgress';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import axios from 'axios';
import mime from 'mime-types';
import { useSession } from 'next-auth/react';
import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

import { getMemberships } from '@app/pages/api/memberships';
import { getOrg } from '@app/pages/api/organizations/[id]';

import accountConfig from '@chaindesk/lib/account-config';
import { ApiErrorType } from '@chaindesk/lib/api-error';
import getS3RootDomain from '@chaindesk/lib/get-s3-root-domain';
import { hasAdminRole } from '@chaindesk/lib/has-oneof-roles';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import {
  GenerateUploadLinkRequest,
  OrganizationInviteSchema,
  UpdateOrgSchema,
} from '@chaindesk/lib/types/dtos';
import { MembershipRole, Prisma } from '@chaindesk/prisma';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

import IconInput from './ui/IconInput';
import SettingCard from './ui/SettingCard';
import Input from './Input';

type Props = {};

function OrganizationForm({}: Props) {
  const { data: session } = useSession();
  const methods = useForm<OrganizationInviteSchema>({
    resolver: zodResolver(OrganizationInviteSchema),
  });

  const updateOrgMethods = useForm<UpdateOrgSchema>({
    resolver: zodResolver(UpdateOrgSchema),
  });

  const getMembershipsQuery = useSWR<
    Prisma.PromiseReturnType<typeof getMemberships>
  >(`/api/memberships`, fetcher);

  const getOrganizationQuery = useSWR<Prisma.PromiseReturnType<typeof getOrg>>(
    session?.organization?.id
      ? `/api/organizations/${session?.organization?.id}`
      : null,
    fetcher
  );

  const [state, setState] = useStateReducer({
    isSubmitting: false,
    isDeletingMember: false,
    isUploadingIcon: false,
    isDeletingIcon: false,
    isUpdatingOrg: false,
    iconUrl: getOrganizationQuery?.data?.iconUrl || '',
  });

  const submitInvite = async (values: OrganizationInviteSchema) => {
    try {
      if (
        Number(getMembershipsQuery.data?.length) >=
        accountConfig[session?.organization?.currentPlan!]?.limits?.maxSeats
      ) {
        alert(
          'You have reached the maximum number of seats for your plan. Please contact support@chaindesk.ai to upgrade your plan.'
        );
        return;
      }

      setState({
        isSubmitting: true,
      });
      await axios.post(`/api/organizations/invite`, values);

      await getMembershipsQuery.mutate();

      methods.reset();
    } catch (err) {
      console.error(err);

      if (
        (err as any)?.response?.data?.error === ApiErrorType.ALREADY_INVITED
      ) {
        toast.error('User already invited', {
          duration: 5000,
        });

        methods.setError('email', {
          message: 'User already invited',
        });
      } else {
        toast.error(
          "Unable to send invite, please contact support@chaindesk.ai if it's persistent.",
          {
            duration: 5000,
          }
        );
      }
    } finally {
      setState({
        isSubmitting: false,
      });
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      if (
        window.confirm(
          'This user will be removed from the organization, are you sure?'
        )
      ) {
        setState({
          isDeletingMember: true,
        });

        await axios.delete(`/api/memberships/${id}`);

        await getMembershipsQuery.mutate();
      }
    } catch {
    } finally {
      setState({
        isDeletingMember: false,
      });
    }
  };

  const handleUpdateOrg = async (values: UpdateOrgSchema) => {
    try {
      setState({
        isUpdatingOrg: true,
      });
      await axios.patch(`/api/organizations/${session?.organization?.id}`, {
        ...values,
      });

      await getOrganizationQuery.mutate();

      await mutate('/api/organizations');
    } catch (err) {
      console.log(err);
    } finally {
      setState({
        isUpdatingOrg: false,
      });
    }
  };

  const handleUploadIcon = async (event: any) => {
    try {
      setState({ isUpdatingOrg: true });
      const file = event.target.files[0];
      const fileName = `icon.${mime.extension(file.type)}`;

      // upload text from file to AWS
      const uploadLinkRes = await axios.post(
        `/api/organizations/${session?.organization?.id}/generate-upload-link`,
        {
          fileName,
          type: file.type,
        } as GenerateUploadLinkRequest
      );

      await axios.put(uploadLinkRes.data, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      const iconUrl = `${getS3RootDomain()}/organizations/${
        session?.organization?.id
      }/${fileName}`;

      setState({
        iconUrl: iconUrl,
      });

      updateOrgMethods.setValue('iconUrl', iconUrl);

      await handleUpdateOrg({
        ...updateOrgMethods.getValues(),
        iconUrl,
      });

      toast.success('Icon updated successfully!');
    } catch (err) {
      console.log(err, err);
    } finally {
      setState({ isUpdatingOrg: false });
    }
  };

  const handleDeleteIcon = async () => {
    try {
      setState({
        isUpdatingOrg: true,
      });

      await handleUpdateOrg({
        ...updateOrgMethods.getValues(),
        iconUrl: null,
      });

      await getOrganizationQuery.mutate();

      setState({ iconUrl: '' });

      toast.success('Icon updated successfully!');
    } catch (err) {
    } finally {
      setState({
        isUpdatingOrg: false,
      });
    }
  };

  useEffect(() => {
    updateOrgMethods.reset({
      name: getOrganizationQuery?.data?.name,
      iconUrl: getOrganizationQuery?.data?.iconUrl,
    });
  }, [getOrganizationQuery?.data]);

  if (!getOrganizationQuery?.data) {
    return null;
  }

  return (
    <Stack gap={4} id="team">
      <SettingCard
        title="Team Settings"
        description="Personalize your team name and icon."
        disableSubmitButton
      >
        <form
          className="flex flex-col"
          onSubmit={updateOrgMethods.handleSubmit(handleUpdateOrg)}
        >
          <Input
            control={updateOrgMethods.control}
            value={getOrganizationQuery?.data?.iconUrl! || ''}
            hidden
            sx={{ height: 0 }}
            {...updateOrgMethods.register('iconUrl')}
          />

          <Stack gap={2}>
            <IconInput
              innerIcon={<CorporateFareRoundedIcon />}
              defaultIconUrl={getOrganizationQuery?.data?.iconUrl!}
              value={
                getOrganizationQuery?.data?.iconUrl
                  ? `${
                      getOrganizationQuery?.data?.iconUrl
                    }?timestamp=${Date.now()}`
                  : ''
              }
              onChange={handleUploadIcon}
              onDelete={handleDeleteIcon}
              disabled={!hasAdminRole(session?.roles)}
              loading={state.isUpdatingOrg}
            />
            <Input
              control={updateOrgMethods.control}
              label="Team Name"
              defaultValue={getOrganizationQuery?.data?.name!}
              disabled={!hasAdminRole(session?.roles) || state.isUpdatingOrg}
              {...updateOrgMethods.register('name')}
            />

            <Button
              type="submit"
              size="sm"
              sx={{ ml: 'auto' }}
              disabled={!hasAdminRole(session?.roles)}
              loading={state.isUpdatingOrg}
            >
              Update
            </Button>
          </Stack>
        </form>
      </SettingCard>

      <SettingCard
        title="Team Members"
        description="Invite a new member to collaborate"
        disableSubmitButton
      >
        <form onSubmit={methods.handleSubmit(submitInvite)} className="p-2">
          <Stack gap={2}>
            <Input
              control={methods.control}
              {...methods.register('email')}
              label="Email"
              onBlur={(e) => {}} // // Otherwise got error when submiting with return key 🤷
              endDecorator={
                <Button type="submit" loading={state.isSubmitting}>
                  Invite
                </Button>
              }
            />

            {/* <Button sx={{ ml: 'auto' }}>Invite</Button> */}
          </Stack>
        </form>

        {Number(getMembershipsQuery?.data?.length) > 0 && (
          <Stack sx={{ px: 2 }} gap={1}>
            <Typography
              level="body-md"
              fontWeight={'bold'}
              color={
                Number(getMembershipsQuery?.data?.length) >=
                accountConfig[session?.organization?.currentPlan!]?.limits
                  ?.maxSeats
                  ? 'danger'
                  : 'success'
              }
            >{`${getMembershipsQuery?.data?.length}/${
              accountConfig[session?.organization?.currentPlan!]?.limits
                ?.maxSeats
            } seats used`}</Typography>
            <Sheet sx={{ borderRadius: 'md' }}>
              <Table variant="outlined">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getMembershipsQuery?.data?.map((member) => (
                    <tr key={member?.id}>
                      <td>{member?.invitedEmail || member?.user?.email}</td>
                      <td>
                        <Chip size="sm" variant="soft" color="neutral">
                          {member?.role}
                        </Chip>
                      </td>
                      <td>
                        <Chip
                          size={'sm'}
                          variant="soft"
                          color={member?.userId ? 'success' : 'warning'}
                        >
                          {member?.userId ? 'Joined' : 'Pending'}
                        </Chip>
                      </td>
                      <td>
                        <IconButton
                          size="sm"
                          color="danger"
                          variant="plain"
                          onClick={() => handleDeleteMember(member?.id)}
                          disabled={
                            state.isDeletingMember ||
                            member.role === MembershipRole.OWNER ||
                            !hasAdminRole(session?.roles)
                          }
                        >
                          {state.isDeletingMember ? (
                            <CircularProgress size="sm" />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Sheet>
          </Stack>
        )}
      </SettingCard>

      {/* <stripe-pricing-table
        pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_SEAT_ID}
        publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        client-reference-id={session?.organization?.id}
        customer-email={session?.user?.email}
      ></stripe-pricing-table> */}
    </Stack>
  );
}

export default OrganizationForm;
