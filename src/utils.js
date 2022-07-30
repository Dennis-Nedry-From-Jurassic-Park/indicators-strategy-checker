import {timeParse} from "d3-time-format";

function parseData(parse) {
	return function(d) {
		d.date = parse(d.date);
		d.open = +d.open;
		d.high = +d.high;
		d.low = +d.low;
		d.close = +d.close;
		d.volume = +d.volume;
        console.log(d)
		return d;
	};
}

const parseDate = timeParse("%Y-%m-%d");
//var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z");
export function getData() {
	return fetch("http://localhost:3002/shares/get_candles_json")
		.then(response => response.text())
		.then(data => JSON.parse(data).map(function (d) {
			return {
				date: parseDate(d.date),
				open: +d.open,
				high: +d.high,
				low: +d.low,
				close: +d.close,
				volume: +d.volume
			};
		}));
}