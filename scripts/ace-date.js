var AceDate = /^u/.test(typeof exports) ? AceDate || {} : exports;
void function(exports){
	function formatDate(date, separator) {
		date = date ? new Date(date) : new Date();
		separator = separator || "$1-$2-$3 $4:$5:$6";
		return String([
			date.getFullYear(),
			(date.getMonth() + 101),
			(date.getDate() + 100),
			(date.getHours() + 100),
			(date.getMinutes() + 100),
			(date.getSeconds() + 100)]
		).replace(/^(\d+),\d*(\d{2}),\d*(\d{2}),\d*(\d{2}),\d*(\d{2}),\d*(\d{2})$/g, separator);
	}

	exports.format = formatDate;
}(AceDate);