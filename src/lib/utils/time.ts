export function getYangonTodayString() {
    const ytz = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Yangon', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const [mm, dd, yyyy] = ytz.split('/');
    return `${yyyy}-${mm}-${dd}`; // yyyy-mm-dd
}

export function getYangonDayRange(dateString: string) {
    return {
        start: `${dateString}T00:00:00.000+06:30`,
        end: `${dateString}T23:59:59.999+06:30`,
    }
}

export function formatYangonTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-US', { timeZone: 'Asia/Yangon', hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatYangonDate(dateStr: string | Date) {
    return new Date(dateStr).toLocaleDateString('en-US', { timeZone: 'Asia/Yangon', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
