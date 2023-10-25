import { Checkbox, Stack, Typography } from '@mui/joy';
import { useFormContext } from 'react-hook-form';

type CheckboxField =
  | 'isInitMessagePopupDisabled'
  | 'isHumanRequestedDisabled'
  | 'isMarkAsResolvedDisabled'
  | 'isLeadCaptureDisabled';

function InterfaceConfigCheckbox({
  label,
  field,
}: {
  label: string;
  field: CheckboxField;
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
      />
      <Typography>{label}</Typography>
    </Stack>
  );
}

export default InterfaceConfigCheckbox;
