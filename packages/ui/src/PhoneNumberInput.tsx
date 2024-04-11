import {
  Box,
  InputProps,
  Option,
  Select,
  SelectProps,
  Stack,
  Typography,
} from '@mui/joy';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import React, { forwardRef, useEffect, useMemo, useRef } from 'react';
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
  defaultCountryCode?: string;
  control?: any;
  handleChange: (value: string) => any;
  selectProps?: SelectProps<string, false>;
};

export const countryCodeToFlag = (isoCode: string) => {
  return isoCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

export { defaultCountries, parseCountry };

const PhoneNumberInput = forwardRef(
  (
    {
      value,
      name,
      defaultCountryCode,
      onChange,
      handleChange,
      selectProps,
      disabled,
      ...restProps
    }: Props,
    ref
  ) => {
    const selectRef = useRef<HTMLSelectElement>(null);
    const preferredCountry = useMemo(() => {
      if (typeof window !== 'undefined') {
        return (
          defaultCountryCode ??
          navigator.language?.split?.('-')[1]?.toLowerCase?.() ??
          'fr'
        );
      }
      return defaultCountryCode?.toLocaleLowerCase() ?? 'fr';
    }, [defaultCountryCode]);

    const {
      inputValue,
      handlePhoneValueChange,
      inputRef,
      country,
      setCountry,
    } = usePhoneInput({
      defaultCountry: preferredCountry,
      value,
      countries: defaultCountries,
      onChange: (data) => {
        handleChange?.(data?.phone);
      },
    });

    useEffect(() => {
      setCountry(preferredCountry);
    }, [preferredCountry]);

    return (
      <Input
        ref={ref}
        disabled={disabled}
        control={restProps.control}
        sx={{ minWidth: '100%' }}
        name={name}
        type="tel"
        size="sm"
        placeholder="phone number"
        value={inputValue}
        onChange={handlePhoneValueChange}
        startDecorator={
          <Typography component={'label'} sx={{ position: 'relative' }}>
            <Stack
              direction="row"
              gap={0.5}
              sx={(t) => ({
                cursor: 'pointer',
                alignItems: 'center',
                color: t.palette.text.secondary,
              })}
            >
              <Box sx={{ width: 20 }}>
                <FlagImage iso2={country.iso2} />
              </Box>
              <ExpandMoreRoundedIcon
                // sx={(t) => ({ fontSize: 'sm', color: t.palette.secondary })}
                sx={{ fontSize: 'sm' }}
              />
            </Stack>
            <Box
              component="select"
              ref={selectRef}
              onChange={(e) => {
                setCountry(e.target.value as CountryIso2);
              }}
              sx={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                zIndex: 1,
              }}
            >
              {defaultCountries.map((each) => {
                const country = parseCountry(each);
                return (
                  <option key={country.iso2} value={country.iso2}>
                    {/* Country name first otherwise not searchable with keyboard */}
                    {country.name} {countryCodeToFlag(country.iso2)}
                  </option>
                );
              })}
            </Box>
          </Typography>
        }
      />
    );
  }
);

export default PhoneNumberInput;
