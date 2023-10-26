import { Box, CircularProgress, Stack, Typography } from '@mui/joy';
import pDebounce from 'p-debounce';
import React, { memo, useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import useDeepCompareEffect from 'use-deep-compare-effect';

type Props = {
  defaultValues: any;
  onSubmit: any;
  validFormAction?(): void;
};

const AutoSaveForm = memo(
  ({ defaultValues, onSubmit, validFormAction }: Props) => {
    const methods = useFormContext();

    const debouncedSave = useCallback(
      pDebounce(() => {
        methods.handleSubmit(onSubmit)();
      }, 1000),
      []
    );

    const watchedData = useWatch({
      control: methods.control,
      defaultValue: defaultValues,
    });

    useDeepCompareEffect(() => {
      console.log(methods.formState.errors);
      if (methods.formState.isDirty) {
        debouncedSave();
      }
      if (methods.formState.isValid) {
        validFormAction?.();
      }
    }, [watchedData]);

    return methods.formState.isSubmitting ? (
      <Stack
        spacing={1}
        mt={2}
        height={10}
        direction="row"
        sx={{
          position: 'fixed',
          bottom: 30,
          right: 20,
        }}
      >
        <Typography>Auto-Save</Typography>
        <CircularProgress size="sm" />
      </Stack>
    ) : null;
  }
);

export default AutoSaveForm;
