import { json} from  "d3-fetch";
import { tsvParse } from  "d3-dsv";
import { timeParse, timeFormat } from "d3-time-format";

function parseData(parse) {
	return function(d) {
	    d.date = parse(d.date);
		d.open = +d.open;
		d.high = +d.high;
		d.low = +d.low;
		d.close = +d.close;
		d.volume = +d.volume;
		//d.isComplete = +d.isComplete;

		return d;
	};
}

//const parseDate = timeParse("%d-%m-%Y-%H:%M");
const parseDate = timeParse("%Y-%m-%d");
export function getData() {
    //const promiseMSFT0 = fetch("http://localhost:3002/shares/get-candles")
    	//	.then(response => console.log(response.json))
    		//.then(data => parseData(parseDate))

//






    // const json_candles = d3.json("/data/users.json", function(data) {
    //                          console.log(data);
    //                      });

	json("http://localhost:3002/shares/get-candles.tsv", (err, res) => {

	
		var data = JSON.parse(res.result);

		console.log(data);
            data.forEach((d, i) => {
                // d.date = new Date(d3.time.format("%Y-%m-%d").parse(d.date).getTime());
                var date = new Date(timeFormat("%Y-%m-%d").parse(d.date).getTime()); // T%H:%M:%S.%LZ
                d.date = date;
                d.open = +d.open;
                d.high = +d.high;
                d.low = +d.low;
                d.close = +d.close;
                d.volume = +d.volume;
                console.log(d);
            });
			return data;
		})
		

}



/*
	const resp = json("http://localhost:3002/shares/get-candles.tsv")
		.then(response => response.text() var data = JSON.parse(res.result);)
		.then(data => console.log(data))
		.catch((error) => {
		            console.log(error);
        			//console.log(response.text());
        			//console.log(data);
		})
*/
	// const promiseMSFT = fetch("http://localhost:3002/shares/get-candles.tsv")
	// 	//.then(response => console.log(response.text()))
	// 	.then(response => response.text())
	// 	.then(data => tsvParse(data, parseData(parseDate)))
	// 	.catch((error,response,data) => {
	// 	            console.log(error);
    //     			//console.log(response.text());
    //     			//console.log(data);
	// 	}

	// 	)
	

