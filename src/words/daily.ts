const DAY = 24 * 60 * 60 * 1000;
const START_DATE = new Date(Date.UTC(2022, 0, 22));

export const getTodayNumber = () => getDayNumber(new Date());
export const getDayNumber = (currentTime: Date) => {
    const timeSinceStart = currentTime.getTime() - START_DATE.getTime();
    return Math.floor(timeSinceStart / DAY);
};

export const timeUntilNextDayMs = (dayNumber: number) => {
    const nextDay = START_DATE.getTime() + DAY * (dayNumber + 1);
    return Math.max(0, nextDay - Date.now());
};
