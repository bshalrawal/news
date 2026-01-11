
import NepaliDate from 'nepali-datetime';

const nepaliMonths = [
    'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
    'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत'
];

const nepaliDays = [
    'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'
];

export const englishToNepaliNumber = (num: number | string): string => {
    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num.toString().split('').map(c => {
        if (c >= '0' && c <= '9') {
            return nepaliDigits[parseInt(c)];
        }
        return c;
    }).join('');
};

export const formatToNepaliDate = (date: Date | string | NepaliDate): string => {
    let nd: NepaliDate;
    // Handle various input types
    if (typeof date === 'object' && date !== null && 'getYear' in date && 'getMonth' in date) {
        nd = date as NepaliDate;
    } else {
        try {
            nd = new NepaliDate(new Date(date as any));
        } catch (e) {
            console.error("Invalid date passed to formatToNepaliDate", date);
            return "";
        }
    }

    const year = englishToNepaliNumber(nd.getYear());
    const month = nepaliMonths[nd.getMonth()];
    const day = englishToNepaliNumber(nd.getDate());

    // Example result: १२ जेठ २०८१
    return `${day} ${month} ${year}`;
};

export const getRelativeTimeNepali = (date: Date | string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) return `भर्खरै`;
    if (diffMin < 60) return `${englishToNepaliNumber(diffMin)} मिनेट अगाडि`;
    if (diffHour < 24) return `${englishToNepaliNumber(diffHour)} घण्टा अगाडि`;
    if (diffDay < 7) return `${englishToNepaliNumber(diffDay)} दिन अगाडि`;

    return formatToNepaliDate(past);
};

export const getCurrentNepaliDateLine = (): string => {
    const now = new NepaliDate();
    const dayName = nepaliDays[now.getDay()]; // 0 is Sunday
    const year = englishToNepaliNumber(now.getYear());
    const month = nepaliMonths[now.getMonth()];
    const day = englishToNepaliNumber(now.getDate());

    return `${dayName}, ${day} ${month} ${year}`;
}
