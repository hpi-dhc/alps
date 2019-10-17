import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardActions, Button } from '@material-ui/core';
import SignalPlot from '../Signal/Plot';
import { getPlotData, getDomain, getSegments } from '../../selectors/sync';
import * as Sync from '../../actions/sync';
import { ZOOM_MODE } from '../../constants/PlotModes';

export default function SignalComparison () {
  const dispatch = useDispatch();
  const data = useSelector(getPlotData);
  const domain = useSelector(getDomain);

  const segments = useSelector(getSegments);
  const isZoomSegmentsDisabled = Object.keys(segments).length === 0;

  const handleZoom1stSegment = useCallback((event) => {
    dispatch(Sync.setDomain([
      new Date(segments['first']['start']).getTime(),
      new Date(segments['first']['end']).getTime(),
    ]));
  }, [dispatch, segments]);

  const handleZoom2ndSegment = useCallback((event) => {
    dispatch(Sync.setDomain([
      new Date(segments['second']['start']).getTime(),
      new Date(segments['second']['end']).getTime(),
    ]));
  }, [dispatch, segments]);

  const handleZoomOut = useCallback((event) => {
    dispatch(Sync.setDomain([null, null]));
  }, [dispatch]);

  const handleZoomIn = useCallback((domain) => {
    dispatch(Sync.setDomain(domain));
  }, [dispatch]);

  return (
    <Card style={{ userSelect: 'none' }}>
      <CardActions>
        <Button
          onClick={handleZoomOut}
        >
          Reset Zoom
        </Button>
        <Button
          disabled={isZoomSegmentsDisabled}
          onClick={handleZoom1stSegment}
        >
          1st Shake
        </Button>
        <Button
          disabled={isZoomSegmentsDisabled}
          onClick={handleZoom2ndSegment}
        >
          2nd Shake
        </Button>
      </CardActions>
      <CardContent>
        <SignalPlot
          data={data}
          domainX={domain}
          onAreaMarked={handleZoomIn}
          mode={ZOOM_MODE}
          disableTooltip
        />
      </CardContent>
    </Card>
  );
}
