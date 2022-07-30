import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
	BarSeries,
	AreaSeries,
	CandlestickSeries,
	LineSeries,
	RSISeries, AlternatingFillAreaSeries, StraightLine,
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	EdgeIndicator,
	CurrentCoordinate,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
	OHLCTooltip,
	MovingAverageTooltip,
	RSITooltip,
	SingleValueTooltip,
} from "react-stockcharts/lib/tooltip";
import { ema, rsi, sma, atr, forceIndex } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

import { LabelAnnotation, Label, Annotate } from "react-stockcharts/lib/annotation";


const macdAppearance = {
	stroke: {
		macd: "#FF0000",
		signal: "#00F300",
	},
	fill: {
		divergence: "#4682B4"
	},
};

function getMaxUndefined(calculators) {
	return calculators.map(each => each.undefinedLength()).reduce((a, b) => Math.max(a, b));
}
const LENGTH_TO_SHOW = 180;

class CandleStickChartWithRSIIndicator extends React.Component {
	render() {
		const fi = forceIndex()
			.merge((d, c) => {d.fi = c;})
			.accessor(d => d.fi);

		const fiEMA13 = ema()
			.id(1)
			.options({ windowSize: 13, sourcePath: "fi" })
			.merge((d, c) => {d.fiEMA13 = c;})
			.accessor(d => d.fiEMA13);

		const ema26 = ema()
			.id(0)
			.options({ windowSize: 26 })
			.merge((d, c) => {d.ema26 = c;})
			.accessor(d => d.ema26);

		const ema12 = ema()
			.id(1)
			.options({ windowSize: 12 })
			.merge((d, c) => {d.ema12 = c;})
			.accessor(d => d.ema12);

		// const macdCalculator = macd()
		// 	.options({
		// 		fast: 12,
		// 		slow: 26,
		// 		signal: 9,
		// 	})
		// 	.merge((d, c) => {d.macd = c;})
		// 	.accessor(d => d.macd);

		const smaVolume50 = sma()
			.id(3)
			.options({ windowSize: 50, sourcePath: "volume" })
			.merge((d, c) => {d.smaVolume50 = c;})
			.accessor(d => d.smaVolume50);

		const rsiCalculator = rsi()
			.options({ windowSize: 1 })
			.merge((d, c) => {d.rsi = c;})
			.accessor(d => d.rsi);

		const atr14 = atr()
			.options({ windowSize: 1 })
			.merge((d, c) => {d.atr14 = c;})
			.accessor(d => d.atr14);

		const { type, data: initialData, width, ratio } = this.props;

		const calculatedData = fiEMA13(fi(ema26(ema12(smaVolume50(rsiCalculator(atr14(initialData)))))));
		const calculatedFiData = fiEMA13(fi(initialData));

		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(calculatedData);

		//const start = xAccessor(last(data));
		//const end = xAccessor(data[Math.max(0, data.length - 150)]);


		const start = xAccessor(data[0]);
		const end = xAccessor(last(data));

		const xExtents = [start, end];

		const margin = { left: 70, right: 70, top: 20, bottom: 30 }

		return (
			<ChartCanvas height={900}
				width={width}
				ratio={ratio}
				margin={margin}
				type={'svg'} // type 'svg'
				seriesName="MSFT"
				data={data}
				xScale={xScale}
				xAccessor={xAccessor}
				displayXAccessor={displayXAccessor}
				xExtents={xExtents}
			>
				<Label x={(width - margin.left - margin.right) / 2} y={30}
					   fontSize="30" text="Share name" />

				<Chart id={1} height={300}
					yExtents={[d => [d.high, d.low], ema26.accessor(), ema12.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<CandlestickSeries />
					<LineSeries yAccessor={ema26.accessor()} stroke={ema26.stroke()}/>
					<LineSeries yAccessor={ema12.accessor()} stroke={ema12.stroke()}/>

					<CurrentCoordinate yAccessor={ema26.accessor()} fill={ema26.stroke()} />
					<CurrentCoordinate yAccessor={ema12.accessor()} fill={ema12.stroke()} />

					<EdgeIndicator itemType="last" orient="right" edgeAt="right"
						yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>

					<OHLCTooltip origin={[-40, 0]}/>

					<MovingAverageTooltip
						onClick={e => console.log(e)}
						origin={[-38, 15]}
						options={[
							{
								yAccessor: ema26.accessor(),
								type: "EMA",
								stroke: ema26.stroke(),
								windowSize: ema26.options().windowSize,
							},
							{
								yAccessor: ema12.accessor(),
								type: "EMA",
								stroke: ema12.stroke(),
								windowSize: ema12.options().windowSize,
							},
						]}
					/>

				</Chart>
				<Chart id={2} height={150}
					yExtents={[d => d.volume, smaVolume50.accessor()]}
					origin={(w, h) => [0, h - 675]}
				>
					<YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".2s")}/>

					<MouseCoordinateY
						at="left"
						orient="left"
						displayFormat={format(".4s")} />

					<BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? "#b3ffb3" : "#ffad99"} />
					<AreaSeries yAccessor={smaVolume50.accessor()} stroke={smaVolume50.stroke()} fill={smaVolume50.fill()}/>
				</Chart>
				<Chart
					id={3}
					yExtents={[0, 100]}
					height={125} origin={(w, h) => [0, h - 520]}
				>
					<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
					<YAxis axisAt="right"
						orient="right"
						tickValues={[30, 50, 70]}/>
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<RSISeries yAccessor={d => d.rsi} />

					<RSITooltip origin={[-38, 15]}
						yAccessor={d => d.rsi}
						options={rsiCalculator.options()} />
				</Chart>
				<Chart id={4}
					yExtents={atr14.accessor()}
					height={125} origin={(w, h) => [0, h - 380]} padding={{ top: 10, bottom: 10 }}
				>
					<XAxis axisAt="bottom" orient="bottom"  />
					<YAxis axisAt="right" orient="right" ticks={2}/>

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<LineSeries yAccessor={atr14.accessor()} stroke={atr14.stroke()}/>
					<SingleValueTooltip
						yAccessor={atr14.accessor()}
						yLabel={`ATR (${atr14.options().windowSize})`}
						yDisplayFormat={format(".2f")}
						/* valueStroke={atr14.stroke()} - optional prop */
						/* labelStroke="#4682B4" - optional prop */
						origin={[-40, 15]}/>
				</Chart>
				<Chart id={5} height={100}
					   yExtents={fi.accessor()}
					   origin={(w, h) => [0, h - 250]}
					   padding={{ top: 10, right: 0, bottom: 10, left: 0 }}
				>
					<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
					<YAxis axisAt="right" orient="right" ticks={4} tickFormat={format(".2s")}/>
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".4s")} />

					<AreaSeries baseAt={scale => scale(0)} yAccessor={fi.accessor()} />
					<StraightLine yValue={0} />

					<SingleValueTooltip
						yAccessor={fi.accessor()}
						yLabel="ForceIndex (1)"
						yDisplayFormat={format(".4s")}
						origin={[-40, 15]}
					/>
				</Chart>
				<Chart id={6} height={150}
					   yExtents={fiEMA13.accessor()}
					   origin={(w, h) => [0, h - 120]}
					   padding={{ top: 10, right: 0, bottom: 10, left: 0 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={4} tickFormat={format(".2s")}/>

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".4s")} />

					{/* <AreaSeries baseAt={scale => scale(0)} yAccessor={fiEMA13.accessor()} /> */}
					<AlternatingFillAreaSeries
						baseAt={0}
						yAccessor={fiEMA13.accessor()}
					/>
					<StraightLine yValue={0} />

					<SingleValueTooltip
						yAccessor={fiEMA13.accessor()}
						yLabel={`ForceIndex (${fiEMA13.options().windowSize})`}
						yDisplayFormat={format(".4s")}
						origin={[-40, 15]}
					/>
				</Chart>
				<CrossHairCursor />
			</ChartCanvas>
		);
	}
}

CandleStickChartWithRSIIndicator.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChartWithRSIIndicator.defaultProps = {
	type: "svg",
};
CandleStickChartWithRSIIndicator = fitWidth(CandleStickChartWithRSIIndicator);

export default CandleStickChartWithRSIIndicator;
