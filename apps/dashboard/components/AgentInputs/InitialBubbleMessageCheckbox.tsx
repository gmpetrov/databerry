import { Checkbox, Stack, Typography } from '@mui/joy';
import { useFormContext } from 'react-hook-form';

function InitialBubbleMessageCheckbox({
  labelText = 'Disable initial message popup',
}) {
  const { register, setValue, getValues } = useFormContext();
  const { interfaceConfig } = getValues();
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('interfaceConfig.isInitMessagePopupDisabled', e.target.checked, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Checkbox
        {...register('interfaceConfig.isInitMessagePopupDisabled')}
        onChange={handleCheckboxChange}
        checked={Boolean(interfaceConfig?.isInitMessagePopupDisabled)}
        aria-label={labelText}
      />
      <Typography>{labelText}</Typography>
    </Stack>
  );
}

export default InitialBubbleMessageCheckbox;
