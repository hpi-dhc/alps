import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import uuid from 'uuid/v4';
import { getDatasets, getSessions, getAllSignals } from '../../selectors/data';
import { filterObjectByValue } from '../../utils';
import { getItems } from '../../selectors/plots';
import * as Plots from '../../actions/plots';

export const usePlots = (sessionId) => {
  const dispatch = useDispatch();
  const session = useSelector(getSessions)[sessionId];
  const datasets = useSelector((state) => filterObjectByValue(getDatasets(state), each => session.datasets.includes(each.id)));
  const signals = useSelector(getAllSignals);
  const plots = useSelector((state) => getItems(state)[sessionId]);

  useEffect(() => {
    if (!plots) {
      // determine initial domain to fit all signals
      const sessionSignals = Object.values(datasets).reduce((array, each) => [...array, ...each.signals], []);
      const timestamps = sessionSignals.reduce((object, each) => ({
        from: [...object.from, new Date(signals[each].firstTimestamp).valueOf()],
        to: [...object.from, new Date(signals[each].lastTimestamp).valueOf()],
      }), { from: [], to: [] });
      const domain = [Math.min(...timestamps.from), Math.max(...timestamps.to)];
      dispatch(Plots.setDomain(sessionId, domain));
      dispatch(Plots.upsert(sessionId, { id: uuid() }, true));
    }
  }, [datasets, dispatch, plots, sessionId, signals]);

  return { plots, datasets, signals };
};
