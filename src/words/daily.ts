const DAY = 24 * 60 * 60 * 1000;
const START_DATE = new Date(Date.UTC(2022, 0, 23));

export const getCurrentDate = (): Date => {
    return new Date();
};

export const getTodayNumber = () => getDayNumber(getCurrentDate());
export const getDayNumber = (currentTime: Date) => {
    const timeSinceStart = currentTime.getTime() - START_DATE.getTime();
    return Math.floor(timeSinceStart / DAY);
};

export const timeUntilNextDayMs = (dayNumber: number) => {
    const nextDay = START_DATE.getTime() + DAY * (dayNumber + 1);
    return Math.max(0, nextDay - getCurrentDate().getTime());
};
