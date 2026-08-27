const { DateTime } = require('luxon');

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function parseYear(date) {
	if (!date) {
		return null;
	}

	const match = String(date).match(/\b(\d{4})\b/);

	return match ? Number(match[1]) : null;
}

function parseDescription(description) {
	if (!description) {
		return 'No description available.';
	}

	if (typeof description === 'string') {
		return description;
	}

	return description.value ?? 'No description available.';
}

function truncate(text, max) {
	if (!text) {return null;}

	if (text.length <= max) {return text;}

	return text.substring(0, max - 3) + '...';
}

function parseDate(input) {
	const formats = [
		'yyyy-MM-dd',
		'MM/dd/yyyy',
		'M/d/yyyy',
		'MMMM d, yyyy',
		'MMM d, yyyy',
	];

	for (const format of formats) {
		const date = DateTime.fromFormat(input.trim(), format, {
			locale: 'en-US',
		});

		if (date.isValid) return date;
	}

	throw new Error('Invalid date. Use YYYY-MM-DD, MM/DD/YYYY, or Month DD, YYYY.');
}

function parseTime(input) {
	const formats = [
		'HH:mm',
		'h:mm a',
		'h a',
	];

	for (const format of formats) {
		const time = DateTime.fromFormat(input.trim(), format, {
			locale: 'en-US',
		});

		if (time.isValid) return time;
	}

	throw new Error('Invalid time. Use HH:MM, H:MM AM/PM, or H AM/PM.');
}

function discordTimestamp(milliseconds, format = 'F') {
	return `<t:${Math.floor(milliseconds / 1000)}:${format}>`;
}

module.exports = {
	sleep,
	parseYear,
	parseDescription,
	truncate,
	parseDate,
	parseTime,
	discordTimestamp,
};