import React, { memo, useCallback, useEffect } from 'react';

import debounce from 'p-debounce';
import { useFormContext, useWatch } from 'react-hook-form';
import useDeepCompareEffect from '@chaindesk/ui/hooks/useDeepCompareEffect';

const AutoSave = memo(({ defaultValues, onSubmit }: Props) => {
  // Get the closest form methods
  const methods = useFormContext();

  // Save if this function is called and then not called again within 1000ms
  // eslint-disable-next-line
  const debouncedSave = useCallback(
    debounce(() => {
      methods.handleSubmit(onSubmit)();
    }, 1000),
    [onSubmit, methods.handleSubmit]
  );

  // // Watch all the data, provide with defaultValues from server, this way we know if the new data came from server or where actually edited by user
  // const watchedData = methods.watch(undefined, defaultValues);
  const watchedData = useWatch({
    control: methods.control,
    defaultValue: defaultValues,
  });

  useDeepCompareEffect(() => {
    if (methods.formState.isDirty) {
      debouncedSave();
    }
  }, [watchedData]);

  return null;
});

AutoSave.displayName = 'AutoSave';

type Props = {
  defaultValues: any;
  onSubmit: any;
};

export default AutoSave;
