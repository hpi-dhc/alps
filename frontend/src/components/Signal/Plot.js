import React, { useState, useEffect } from 'react';
import { useCallbackRef } from 'use-callback-ref';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  ComposedChart,
  Area,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Label,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import formatDate from 'date-fns/format';
import * as plotModes from '../../constants/PlotModes';
import { getAnalysisLabels } from '../../selectors/data';
import generateColor from '@eknowles/color-this';

SignalPlot.propTypes = {
  data: PropTypes.array,
  tags: PropTypes.array,
  analysisSamples: PropTypes.array,
  mode: PropTypes.string,
  domainX: PropTypes.array,
  domainY: PropTypes.array,
  yLabel: PropTypes.string,
  showDots: PropTypes.bool,
  hideRange: PropTypes.bool,
  onAreaMarked: PropTypes.func,
  onPanEnd: PropTypes.func,
};

SignalPlot.defaultProps = {
  data: [],
  tags: [],
  analysisSamples: [],
  mode: plotModes.PAN_MODE,
  showDots: false,
  hideRange: false,
  domainX: [null, null],
  domainY: ['auto', 'auto'],
};

export default function SignalPlot ({
  data,
  tags,
  analysisSamples,
  mode,
  showDots,
  hideRange,
  domainX: domainXProp,
  domainY,
  yLabel,
  onAreaMarked,
  onPanEnd,
  ...rest
}) {
  const labels = useSelector(getAnalysisLabels);
  const [markedArea, setMarkedArea] = useState(['', '']);
  const [domainX, setDomainX] = useState(domainXProp);
  const [panStart, setPanStart] = useState();
  const [resolution, setResolution] = useState();
  const chartRef = useCallbackRef(null, (ref) => {
    if (!ref) return;
    const seconds = domainXProp[1] - domainXProp[0];
    setResolution(seconds / ref.container.clientWidth);
  });

  useEffect(() => {
    setDomainX(domainXProp);
    if (chartRef.current) {
      const seconds = domainXProp[1] - domainXProp[0];
      setResolution(seconds / chartRef.current.container.clientWidth);
    }
  }, [chartRef, domainXProp]);

  const xAxisTickFormatter = (tick) => {
    if (tick === Number.POSITIVE_INFINITY || tick === Number.NEGATIVE_INFINITY) {
      return '';
    }
    return formatDate(new Date(tick), 'HH:mm:ss');
  };

  const tooltipLabelFormatter = (label) => {
    const timestamp = new Date(label);
    const time = formatDate(timestamp, 'HH:mm:ss.SSS');
    const date = formatDate(timestamp, 'MMMM dd, yyyy');
    return `${time} (${date})`;
  };

  const handleMouseDown = (event) => {
    if (!event) return;
    if (mode === plotModes.PAN_MODE) {
      setPanStart({ at: event.chartX, domain: domainX });
    } else if (plotModes.MARK_MODES.includes(mode)) {
      setMarkedArea([event.activeLabel, markedArea[1]]);
    }
  };

  const handleMouseMove = (event) => {
    if (!event) return;
    if (mode === plotModes.PAN_MODE) {
      if (panStart) {
        const movedBy = (event.chartX - panStart.at) * resolution;
        setDomainX([panStart.domain[0] - movedBy, panStart.domain[1] - movedBy]);
      }
    } else if (plotModes.MARK_MODES.includes(mode)) {
      if (markedArea[0]) {
        setMarkedArea([markedArea[0], event.activeLabel]);
      }
    }
  };

  const handleMouseUp = () => {
    if (mode === plotModes.PAN_MODE && panStart) {
      if (onPanEnd) onPanEnd({ domainX });
      setPanStart();
    } else if (plotModes.MARK_MODES.includes(mode) && markedArea[0]) {
      if (markedArea[0] === markedArea[1] || !markedArea[1]) {
        setMarkedArea(['', '']);
        return;
      }

      if (markedArea[0] > markedArea[1]) {
        markedArea.reverse();
      }

      if (onAreaMarked) onAreaMarked(markedArea);
      setMarkedArea(['', '']);
    }
  };

  const renderMarkedArea = () => {
    if (markedArea[0] && markedArea[1]) {
      return <ReferenceArea
        x1={markedArea[0]}
        x2={markedArea[1]}
        strokeOpacity={0.3}
        ifOverflow='hidden'
      />;
    }
  };

  const renderTag = (item) => {
    return (
      <ReferenceLine
        key={item.x + item.y}
        x={item.x}
        stroke='red'
      >
        <Label
          value={item.y}
          position='insideBottomLeft'
          opacity={0.6}
        />
      </ReferenceLine>
    );
  };

  const renderAnalysisSample = (item) => {
    const color = generateColor(item.label);
    let x1 = new Date(item.start).valueOf();
    let x2 = new Date(item.end).valueOf();

    if (x1 < domainX[0] && x2 > domainX[0]) {
      x1 = domainX[0];
    }

    if (x2 > domainX[1] && x1 < domainX[1]) {
      x2 = domainX[1];
    }

    return (
      <ReferenceArea
        key={item.id}
        x1={x1}
        x2={x2}
        fill={color}
        fillOpacity={0.2}
        stroke={null}
      >
        <Label value={labels[item.label].name} position='insideTopLeft' />
      </ReferenceArea>
    );
  };

  return (
    <ResponsiveContainer width='99.9%' height={200}>
      <ComposedChart
        data={data}
        ref={chartRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <CartesianGrid />
        <XAxis
          allowDataOverflow
          dataKey='x'
          type='number'
          domain={domainX}
          tickCount={20}
          minTickGap={10}
          tickFormatter={xAxisTickFormatter}
        />
        <YAxis
          domain={domainY}
          type='number'
          scale='linear'
          interval={0}
        >
          <Label position='insideLeft' angle={270} style={{ textAnchor: 'middle' }}>{yLabel}</Label>
        </YAxis>
        {
          !panStart &&
          <Tooltip
            label
            labelFormatter={tooltipLabelFormatter}
          />
        }
        { analysisSamples.map(renderAnalysisSample) }
        <Area
          hide={hideRange}
          dataKey='range'
          type='monotoneX'
          dot={false}
          fillOpacity={0.3}
          strokeOpacity={0.5}
          isAnimationActive={false}
        />
        <Line
          dataKey='mean'
          type='monotoneX'
          dot={showDots}
          isAnimationActive={false}
        />
        <Line
          dataKey='y'
          type='monotoneX'
          dot={showDots}
          isAnimationActive={false}
        />
        { tags.map(renderTag) }
        { renderMarkedArea() }
      </ComposedChart>
    </ResponsiveContainer>
  );
}
