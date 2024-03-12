// client side only.
export default function getCurrentTimeInTimezone(timezone: string) {
  if (document == undefined) return undefined;
  try {
    const now = new Date();

    const options = {
      hour: 'numeric',
      minute: 'numeric',
      timeZone: timezone,
      timeZoneName: 'short',
    } as const;

    const formatter = new Intl.DateTimeFormat('en-US', options);

    const dateTimeWithTimeZone = formatter.format(now);

    return dateTimeWithTimeZone;
  } catch {
    return undefined;
  }
}
