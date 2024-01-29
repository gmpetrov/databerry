export default function formatPhoneNumber({
  phoneNumber,
}: {
  phoneNumber?: string;
}) {
  if (!phoneNumber) return '';

  if (phoneNumber?.startsWith('+')) {
    return phoneNumber;
  } else if (phoneNumber?.startsWith('00')) {
    return phoneNumber.replace(/^00/, '+');
  }

  return `+${phoneNumber}`;
}
