export function formatDateToUTC7(isoString: string|undefined) {
    if(!isoString) return undefined
  const date = new Date(isoString);

  // Lấy timezone UTC+7
  const tzOffsetHours = 7;

  // Tính sang UTC+7
  const localDate = new Date(date.getTime() + tzOffsetHours * 60 * 60 * 1000);

  const formatterDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  const formatterTime = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });

  return `${formatterDate.format(localDate)} at ${formatterTime.format(
    localDate
  )} (UTC+07:00)`;
}

// console.log(formatDateToUTC7("2025-12-05T07:24:40.000Z"));
