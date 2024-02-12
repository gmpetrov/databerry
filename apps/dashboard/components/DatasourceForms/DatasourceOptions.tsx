import Chip from '@mui/joy/Chip';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { DatasourceType } from '@chaindesk/prisma';

import UsageLimitModal from '../UsageLimitModal';

type Props = {
  onSelect: (type: DatasourceType) => any;
};

type DatsourceOption = {
  type: DatasourceType;
  label: string;
  description: string;
  icon?: any;
  disabled?: boolean;
  isPremium?: boolean | undefined;
};

const DatasourceOptions = (props: Props) => {
  const { data: session, status } = useSession();
  const [showUsageLimitModal, setShowUsageLimitModal] = React.useState(false);

  const { t } = useTranslation('datenpool');

  const options: DatsourceOption[] = [
    {
      type: DatasourceType.web_site,
      // label: 'Webseite (gesamt)',
      label: `${t('website')}`,
      description: `${t('websiteSub')}`,
      icon: undefined,
      isPremium: false,
    },
    {
      type: 'youtube_video',
      label: 'Youtube',
      description:
        'Paste a youtube video, playlist or channel and make it your source of knowlege',
      disabled: false,
      icon: 'https://www.svgrepo.com/show/13671/youtube.svg',
      isPremium: true,
    },
    {
      type: 'google_drive_folder' as any,
      label: 'Google Drive™',
      description: 'Binde dein Google Drive an.',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Google_Drive_icon_%282020%29.svg/1024px-Google_Drive_icon_%282020%29.svg.png?20221103153031',
      disabled: true,
    },
    {
      type: 'notion' as any,
      label: 'Notion',
      description: 'Binde dein Notion-Workspace an.',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg',
      disabled: true,
    },
    {
      type: DatasourceType.text,
      label: `${t('text')}`,
      description: `${t('textSub')}`,
      icon: undefined,
    },
    {
      type: 'file' as any,
      label: 'File',
      description: 'z.B.: PDF, CSV, JSON, Text, PowerPoint, Word, Excel',
      disabled: false,
    },
    {
      type: DatasourceType.web_page,
      label: `${t('webSmall')}`,
      description: `${t('webSmallSub')}`,
      icon: undefined,
    },
    {
      type: DatasourceType.qa,
      label: 'Q&A',
      description: `${t('qaSub')}`,
      disabled: false,
    },
  ];

  // const options: DatsourceOption[] = [
  //   {
  //     type: DatasourceType.web_site,
  //     label: 'Web Site',
  //     description: 'Crawl all pages of a web site',
  //     icon: undefined,
  //     isPremium: true,
  //   },
  //   {
  //     type: 'google_drive_folder' as any,
  //     label: 'Google Drive™',
  //     description: 'Talk to your Google Drive files',
  //     isPremium: true,
  //     icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Google_Drive_icon_%282020%29.svg/1024px-Google_Drive_icon_%282020%29.svg.png?20221103153031',
  //   },
  //   {
  //     type: 'youtube_video',
  //     label: 'Youtube',
  //     description:
  //       'Paste a youtube video, playlist or channel and make it your source of knowlege',
  //     disabled: false,
  //     icon: 'https://www.svgrepo.com/show/13671/youtube.svg',
  //     isPremium: true,
  //   },
  //   {
  //     type: 'notion' as any,
  //     label: 'Notion',
  //     description: 'Connect your Notion workspace',
  //     icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg',
  //     disabled: false,
  //     isPremium: true,
  //   },
  //   {
  //     type: DatasourceType.qa,
  //     label: 'Q&A',
  //     description: 'Improve Answers with explicit Q&A pairs',
  //     disabled: false,
  //   },
  //   {
  //     type: DatasourceType.text,
  //     label: 'Text',
  //     description: 'Paste some text',
  //     icon: undefined,
  //   },
  //   {
  //     type: 'file' as any,
  //     label: 'File',
  //     description: 'It can be: PDF, CSV, JSON, Text, PowerPoint, Word, Excel',
  //     disabled: false,
  //   },
  //   {
  //     type: DatasourceType.web_page,
  //     label: 'Web Page',
  //     description: 'Crawl text from a single web page',
  //     icon: undefined,
  //   },
  // ];

  return (
    <div className="flex space-x-4">
      <Stack className="space-y-4" direction={'row'} flexWrap={'wrap'}>
        {options.map((each) => (
          <Sheet
            key={each.type}
            variant="outlined"
            sx={{
              borderRadius: 'md',
              p: 1.5,
              width: '100%',
              ':hover': { cursor: 'pointer' },
            }}
            onClick={
              each.disabled ||
              (each.isPremium && !session?.organization?.isPremium)
                ? () => setShowUsageLimitModal(true)
                : () => props.onSelect(each.type)
            }
          >
            <Stack gap={1}>
              <Stack gap={1} direction="row">
                {each.icon && <img src={each.icon} className="h-4" alt="" />}
                <Typography level="body-md" fontWeight={'bold'}>
                  {each.label}
                </Typography>
                {each.isPremium && (
                  <Chip variant="soft" color="warning" size="sm">
                    premium
                  </Chip>
                )}
                {each.disabled && (
                  <Chip variant="soft" color="neutral" size="sm">
                    Coming Soon
                  </Chip>
                )}
              </Stack>
              <Typography level="body-sm">{each.description}</Typography>
            </Stack>
          </Sheet>
        ))}
      </Stack>

      <UsageLimitModal
        isOpen={showUsageLimitModal}
        handleClose={() => setShowUsageLimitModal(false)}
        title="Premium Feature"
        description="Upgrade your account to access this feature"
      />
    </div>
  );
};

export default DatasourceOptions;
