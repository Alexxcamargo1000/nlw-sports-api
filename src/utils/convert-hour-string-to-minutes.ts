// 18:00 -> 1080

export function convertHoursStringToMinutes(hoursString: string) {
  const [hours, minutes] = hoursString.split(":").map(Number);

  const minutesAmounts = (hours * 60) + minutes;

  return minutesAmounts;
}