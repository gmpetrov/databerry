import { Checkbox, Stack, Typography } from '@mui/joy';
import { useFormContext } from 'react-hook-form';

type CheckboxField =
  | 'isInitMessagePopupDisabled'
  | 'isHumanRequestedDisabled'
  | 'isMarkAsResolvedDisabled'
  | 'isLeadCaptureDisabled'
  | 'isBrandingDisabled';

function InterfaceConfigCheckbox({
  label,
  field,
  disabled,
}: {
  label: string;
  field: CheckboxField;
  disabled?: boolean;
}) {
  const { register, setValue, getValues } = useFormContext();
  const { interfaceConfig } = getValues();
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(`interfaceConfig.${field}`, e.target.checked, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Checkbox
        {...register(`interfaceConfig.${field}`)}
        onChange={handleCheckboxChange}
        checked={Boolean(interfaceConfig?.[field])}
        aria-label={label}
        disabled={!!disabled}
      />
      <Typography>{label}</Typography>
    </Stack>
  );
}

export default InterfaceConfigCheckbox;
