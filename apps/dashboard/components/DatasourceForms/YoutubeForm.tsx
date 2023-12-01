import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';

import {
  DatasourceSchema,
  DatasourceYoutube,
} from '@chaindesk/lib/types/models';
import YoutubeApi from '@chaindesk/lib/youtube-api';
import { DatasourceType } from '@chaindesk/prisma';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps<DatasourceYoutube> & {};

function getDatasourceType(url: string) {
  if (url.includes('@') || url.includes('list')) {
    return DatasourceType.youtube_bulk;
  } else if (url.includes('watch')) {
    return DatasourceType.youtube_video;
  } else {
    return null;
  }
}

function Nested() {
  const { control, register, setValue, watch } =
    useFormContext<DatasourceYoutube>();

  const url = watch('config.source_url');

  useEffect(() => {
    const type = getDatasourceType(url || '');
    if (type) {
      console.log(type);
      setValue('type', type, { shouldValidate: true, shouldDirty: true });
    }
  }, [url]);

  return (
    <Input
      label="Youtube URL (video, playlist or channel)"
      helperText="e.g.: https://www.youtube.com/watch?v=Jq_XKf5slVc"
      control={control as any}
      {...register('config.source_url')}
    />
  );
}

export default function YoutubeForm(props: Props) {
  const { defaultValues, ...rest } = props;

  return (
    <Base
      schema={DatasourceSchema}
      {...rest}
      hideName
      defaultValues={{
        ...props.defaultValues!,
      }}
    >
      <Nested />
    </Base>
  );
}
