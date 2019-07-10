import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
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
import moment from 'moment';

function SignalPlot ({ data, onAreaMarked, domainX, domainY, tags, ...rest }) {
  const [markedArea, setMarkedArea] = useState(['', '']);

  const xAxisTickFormatter = (tick) => {
    return moment(tick).format('HH[:]mm[:]ss');
  };

  const tooltipLabelFormatter = (label) => {
    const timestamp = moment(Number(label));
    const time = timestamp.format('HH[:]mm[:]ss[.]SSS');
    const date = timestamp.format('LL');
    return `${time} (${date})`;
  };

  const handleMouseDown = (event) => {
    if (event) {
      setMarkedArea([event.activeLabel, markedArea[1]]);
    }
  };

  const handleMouseMove = (event) => {
    if (event && markedArea[0]) {
      setMarkedArea([markedArea[0], event.activeLabel]);
    }
  };

  const handleMouseUp = () => {
    if (markedArea[0] === markedArea[1] || !markedArea[1]) {
      setMarkedArea(['', '']);
      return;
    }

    if (markedArea[0] > markedArea[1]) {
      markedArea.reverse();
    }

    if (onAreaMarked) onAreaMarked(markedArea);
    setMarkedArea(['', '']);
  };

  const renderMarkedArea = () => {
    if (markedArea[0] && markedArea[1]) {
      return <ReferenceArea x1={markedArea[0]} x2={markedArea[1]} strokeOpacity={0.3} />;
    }
  };

  const renderTags = () => {
    return tags.map((each) => (
      <ReferenceLine
        key={each.x + each.y}
        x={each.x}
        stroke='red'
      >
        <Label
          value={each.y}
          position='insideBottomLeft'
          opacity={0.6}
        />
      </ReferenceLine>
    ));
  };

  return (
    <div style={{ width: '100%', height: '200px' }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
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
          <YAxis domain={domainY} />
          <Tooltip label labelFormatter={tooltipLabelFormatter} />
          <Line
            dataKey='y'
            type='monotoneX'
            dot={false}
            isAnimationActive={false}
          />
          { renderTags() }
          { renderMarkedArea() }
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

SignalPlot.propTypes = {
  data: PropTypes.array,
  tags: PropTypes.array,
  domainX: PropTypes.array,
  domainY: PropTypes.array,
  onAreaMarked: PropTypes.func,
};

SignalPlot.defaultProps = {
  data: [],
  tags: [],
  domainX: [null, null],
  domainY: ['auto', 'auto'],
};

export default SignalPlot;
