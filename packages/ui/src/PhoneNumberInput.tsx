import {
  Box,
  InputProps,
  Option,
  Select,
  SelectProps,
  Stack,
  Typography,
} from '@mui/joy';
import React, { forwardRef, useMemo, useRef } from 'react';
import {
  CountryIso2,
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from 'react-international-phone';
import Input from '@chaindesk/ui/Input';

export type Props = InputProps & {
  value: string;
  onChange: (phone: string) => void;
  control?: any;
  handleChange: (value: string) => any;
  selectProps?: SelectProps<string, false>;
};

const PhoneNumberInput = forwardRef(
  (
    { value, name, onChange, handleChange, selectProps, ...restProps }: Props,
    ref
  ) => {
    const defaultCountry = useMemo(() => {
      if (typeof window !== 'undefined') {
        return navigator.language?.split?.('-')[1]?.toLowerCase?.() || 'fr';
      }
      return 'fr';
    }, []);

    const {
      inputValue,
      handlePhoneValueChange,
      inputRef,
      country,
      setCountry,
    } = usePhoneInput({
      defaultCountry,
      value,
      countries: defaultCountries,
      onChange: (data) => {
        handleChange(data?.phone);
      },
    });

    return (
      <Input
        ref={ref}
        control={restProps.control}
        // {...(restProps as any)}
        name={name}
        type="tel"
        size="sm"
        placeholder="phone number"
        value={inputValue}
        onChange={handlePhoneValueChange}
        startDecorator={
          <Select
            size="sm"
            variant="plain"
            {...selectProps}
            slotProps={{
              ...selectProps?.slotProps,
              listbox: {
                variant: 'outlined',
                sx: {
                  zIndex: 100000000000,
                },
                ...selectProps?.slotProps?.listbox,
              },
            }}
            defaultValue={defaultCountry}
            onChange={(_, val) => setCountry(val as CountryIso2)}
            renderValue={(selection) => (
              <Box sx={{ width: 18 }}>
                <FlagImage iso2={selection?.value as CountryIso2} />
              </Box>
            )}
          >
            {defaultCountries.map((c, index) => {
              const country = parseCountry(c);
              return (
                <Option key={index} value={country.iso2}>
                  <Stack direction="row" sx={{ alignItems: 'center' }} gap={1}>
                    <Box sx={{ width: 24 }}>
                      <FlagImage iso2={country.iso2} />
                    </Box>
                    <span>{country.name}</span>
                    <Typography color="neutral">+{country.dialCode}</Typography>
                  </Stack>
                </Option>
              );
            })}
          </Select>
        }
      />
    );
  }
);

export default PhoneNumberInput;
