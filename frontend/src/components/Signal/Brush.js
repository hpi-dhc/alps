import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  Brush,
  LineChart,
  Line,
} from 'recharts';
import moment from 'moment';

SignalBrush.propTypes = {
  data: PropTypes.array.isRequired,
  scope: PropTypes.object.isRequired,
  onChange: PropTypes.func,
};

SignalBrush.defaultProps = {
  data: [undefined],
  scope: {
    startIndex: undefined,
    endIndex: undefined,
  },
};

export default function SignalBrush ({ data, scope, onChange }) {
  const [indices, setIndices] = useState({ startIndex: 0, endIndex: data.length - 1 });
  const [hasBrushChanged, setBrushChanged] = useState(false);

  const handleBrushChange = (event) => {
    setBrushChanged(true);
    setIndices(event);
  };

  const handleMouseUp = () => {
    if (hasBrushChanged) {
      console.log(indices);
      setBrushChanged(false);
    }
  };

  const formatTick = (item) => moment(item).format('LLL');

  const renderBrush = () => {
    console.log('Render brush');
    return (
      <Brush
        key={Date.now()}
        dataKey='x'
        onChange={handleBrushChange}
        tickFormatter={formatTick}
        startIndex={scope.startIndex}
        endIndex={scope.endIndex}
      >
        <LineChart data={data}>
          <Line dataKey='y' dot={false} isAnimationActive={false} />
        </LineChart>
      </Brush>
    );
  };

  return (
    <ResponsiveContainer height={50}>
      <LineChart
        data={data}
        onMouseUp={handleMouseUp}
      >
        { renderBrush() }
      </LineChart>
    </ResponsiveContainer>
  );
}
