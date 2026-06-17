/**
 * Sessions are created with their date anchored at local noon (see sessions/create),
 * which leaves a ~12 hour buffer either side of midnight. That buffer is what makes it
 * safe to format dates in the viewer's local timezone here without the displayed day
 * rolling over to the previous or next calendar day.
 */
export function formatCalendarDate(date: string | Date): string {
	return new Date(date).toLocaleDateString();
}
