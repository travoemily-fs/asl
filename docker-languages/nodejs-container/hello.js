const today = new Date();

const timeFormat = new Intl.DateTimeFormat("en-US", {
	timeZone: "America/Los_Angeles",
	weekday: "long",
	year: "numeric",
	month: "long",
	day: "numeric",
	hour: "2-digit",
	minute: "2-digit",
	hour12: true
});

console.log("Hello ASL!");
console.log(timeFormat.format(today));
