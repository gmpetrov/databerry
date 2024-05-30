import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Chip, ColorPaletteProp, Stack } from '@mui/joy';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Tooltip from '@mui/joy/Tooltip';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import toast from 'react-hot-toast';

import { useNavbar } from '@app/hooks/useNavbar';
import { ProductType } from '@app/hooks/useProduct';

import { AppStatus, RouteNames } from '@chaindesk/lib/types';

import ExpandedNavigation, { AppLink } from './ExpandedNavigation';

export default function Navigation({
  isMaintenance,
  product,
  appLinks,
  settingLinks,
  docLinks,
  publicRuntimeConfig,
  status,
  latestVersion,
}: {
  isMaintenance: boolean;
  product: ProductType;
  appLinks: AppLink[];
  settingLinks: AppLink[];
  docLinks: AppLink[];
  status: AppStatus | undefined;
  publicRuntimeConfig: Record<string, unknown> & { version?: string };
  latestVersion?: string;
}) {
  const router = useRouter();
  const { open, setOpen } = useNavbar();

  React.useEffect(() => {
    if (
      isMaintenance &&
      router.route !== RouteNames.MAINTENANCE &&
      router.route !== '/'
    ) {
      router.push(RouteNames.MAINTENANCE);
    }
  }, [isMaintenance]);

  React.useEffect(() => {
    if (
      publicRuntimeConfig?.version &&
      latestVersion &&
      publicRuntimeConfig?.version !== latestVersion
    ) {
      toast(
        (t) => (
          <Stack
            direction={'row'}
            sx={{
              alignItems: 'center',
            }}
            gap={2}
            width={'100%'}
          >
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onClick={() => toast.dismiss(t.id)}
            >
              <CloseRoundedIcon />
            </IconButton>
            <p className="font-bold whitespace-nowrap">New version available</p>
            <Button
              size="sm"
              onClick={() => {
                window?.location?.reload?.();
              }}
            >
              Update
            </Button>
          </Stack>
        ),
        {
          duration: 10000,
        }
      );
    }
  }, [publicRuntimeConfig?.version, latestVersion]);

  return (
    <Stack
      sx={{
        borderRight: '1px solid',
        borderColor: 'divider',
        maxWidth: '300px',
      }}
    >
      <Stack
        direction="row"
        minHeight="100%"
        maxHeight="100%"
        position="relative"
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            display: 'none',
          },
          display: {
            sm: 'block',
          },
        })}
      >
        {open && (
          <ExpandedNavigation
            product={product}
            appLinks={appLinks}
            docLinks={docLinks as any}
            settingLinks={settingLinks}
            publicRuntimeConfig={publicRuntimeConfig}
            status={status}
          />
        )}

        <Stack bgcolor="background.surface" sx={{ height: '100%' }}>
          {!open && (
            <Stack
              pt={1}
              alignItems="center"
              className="relative h-full"
              bgcolor="background.surface"
            >
              <div className="relative w-6 h-6">
                <Image layout="fill" src="/logo.png" alt="Chaindesk" />
              </div>
              {[...appLinks, ...settingLinks, ...docLinks].map((link, i) => (
                <Tooltip
                  key={link.route}
                  title={link.label}
                  placement="right"
                  size="sm"
                >
                  <Link
                    key={link.route}
                    href={link.route}
                    target={(link as any)?.target}
                  >
                    <IconButton
                      size="lg"
                      color={
                        (link as (typeof appLinks)[0])?.active
                          ? 'primary'
                          : 'neutral'
                      }
                    >
                      {link.icon}
                    </IconButton>
                  </Link>
                </Tooltip>
              ))}
              <Tooltip
                title={'Upgrade Plan'}
                placement="right"
                size="sm"
                color="warning"
              >
                <Link href={RouteNames.BILLING}>
                  <IconButton size="lg" color="warning">
                    <ArrowCircleUpRoundedIcon style={{ fontSize: '20px' }} />
                  </IconButton>
                </Link>
              </Tooltip>

              <Tooltip title={'System Status'} placement="right" size="sm">
                {status ? (
                  <Link
                    href={'https://status.chaindesk.ai/'}
                    target={'_blank'}
                    className={'fixed bottom-2'}
                  >
                    <Chip
                      color={
                        (
                          {
                            [AppStatus.OK]: 'success',
                            [AppStatus.WARNING]: 'warning',
                            [AppStatus.KO]: 'danger',
                          } as Record<AppStatus, ColorPaletteProp>
                        )[status]
                      }
                      variant="soft"
                      sx={{ cursor: 'pointer' }}
                      endDecorator={open ? <ArrowForwardRoundedIcon /> : null}
                    >
                      <Stack direction="row" alignItems={'center'} gap={1}>
                        <Box
                          sx={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '99px',
                            // bgcolor: isStatusOK ? 'success.300' : 'danger.500',
                            ...(status === AppStatus.OK && {
                              bgcolor: 'success.300',
                            }),
                            ...(status === AppStatus.KO && {
                              bgcolor: 'danger.500',
                            }),
                            ...(status === AppStatus.WARNING && {
                              bgcolor: 'warning.500',
                            }),
                          }}
                        />
                      </Stack>
                    </Chip>
                  </Link>
                ) : (
                  <div />
                )}
              </Tooltip>
            </Stack>
          )}
        </Stack>
        {!open && <Divider orientation="vertical" />}
        <Tooltip
          placement="right"
          size="sm"
          title={open ? 'Close Sidebar' : 'Open Sidebar'}
        >
          <Box
            component="button"
            className="group"
            sx={{
              position: 'absolute',
              right: -30,
              zIndex: 999,
              bottom: '50%',
              minWidth: '5px',
              minHeight: '40px',
              backgroundColor: 'transparent',
              py: '20px',
              pr: '20px',
            }}
            onClick={() => {
              setOpen(!open);
            }}
          >
            <Box
              sx={{
                minHeight: '20px',
                maxHeight: '20px',
                maxWidth: '5px',
                minWidth: '5px',
                backgroundColor: 'background.level2',
                borderTopRightRadius: '5px',
                borderTopLeftRadius: '5px',
              }}
              className={`${
                !open ? 'group-hover:-rotate-12' : 'group-hover:rotate-12'
              }  group-hover:translate-y-[1.3px] duration-300 ease-in-out`}
            ></Box>
            <Box
              sx={{
                minHeight: '20px',
                maxHeight: '20px',
                maxWidth: '5px',
                minWidth: '5px',
                backgroundColor: 'background.level2',
                borderBottomRightRadius: '5px',
                borderBottomLeftRadius: '5px',
              }}
              className={`${
                !open ? 'group-hover:rotate-12' : 'group-hover:-rotate-12'
              } duration-300 ease-in-out`}
            ></Box>
          </Box>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
