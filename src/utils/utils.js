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

module.exports = {
	sleep,
	parseYear,
	parseDescription,
	truncate,
};