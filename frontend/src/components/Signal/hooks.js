import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import uuid from 'uuid/v4';
import { getDatasets, getSignals } from '../../selectors/data';
import { filterObjectByValue } from '../../utils';
import { getItems } from '../../selectors/plots';
import * as Plots from '../../actions/plots';

export const usePlots = (session) => {
  const dispatch = useDispatch();
  const datasets = useSelector((state) => filterObjectByValue(getDatasets(state), each => each.session === session));
  const signals = useSelector(getSignals);
  const plots = useSelector((state) => getItems(state)[session]);

  useEffect(() => {
    if (!plots) {
      // determine initial domain to fit all signals
      const sessionSignals = Object.values(datasets).reduce((array, each) => [...array, ...each.signals], []);
      const timestamps = sessionSignals.reduce((object, each) => ({
        from: [...object.from, new Date(signals[each].first_timestamp).valueOf()],
        to: [...object.from, new Date(signals[each].last_timestamp).valueOf()],
      }), { from: [], to: [] });
      const domain = [Math.min(...timestamps.from), Math.max(...timestamps.to)];
      dispatch(Plots.setDomain(session, domain));
      dispatch(Plots.upsert(session, { id: uuid() }, true));
    }
  }, [datasets, dispatch, plots, session, signals]);

  return { plots, datasets, signals };
};
