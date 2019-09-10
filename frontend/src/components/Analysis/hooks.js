import { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import DataFrame from 'dataframe-js';
import { getDatasets, getAllSignals } from '../../selectors/data';
import { PROCESS_STATUS } from '../Common/StatusIcon';

export const useJoinedResults = (results) => {
  const datasets = useSelector(getDatasets);
  const signals = useSelector(getAllSignals);
  const isProcessing = results.some(each => [PROCESS_STATUS.QUEUED, PROCESS_STATUS.PROCESSING].includes(each.status));
  const isError = results.some(each => each.status === PROCESS_STATUS.ERROR);
  const doNotProcess = !results.length || isProcessing || isError;

  const getSuffix = useCallback((signal) => {
    return `${signals[signal].name} / ${datasets[signals[signal].dataset].title}`;
  }, [datasets, signals]);

  const [columns, tableData] = useMemo(() => {
    if (doNotProcess) return [[], []];

    let [dataframe, ...rest] = results.map(({ signal, result }) => {
      const suffix = getSuffix(signal);
      let dataframe = new DataFrame(result.table.data, result.table.columns);

      if (results.length > 1) {
        dataframe = dataframe.renameAll(dataframe.listColumns().map((each) => {
          if (!['Variable', 'Unit'].includes(each)) {
            return `${each} (${suffix})`;
          }
          return each;
        }));
      }

      return dataframe;
    });

    for (let each of rest) {
      dataframe = dataframe.fullJoin(each, 'Variable');
    }

    if (rest.length > 0) {
      const hasUnits = dataframe.listColumns().includes('Unit');
      const units = hasUnits ? dataframe.toArray('Unit') : [];
      const columnNames = dataframe.toArray('Variable').map((each, index) => {
        if (units[index]) {
          return `${each} (${units[index]})`;
        } else {
          return each;
        }
      });
      dataframe = dataframe.transpose()
        .renameAll(columnNames)
        .slice(hasUnits ? 2 : 1)
        .withColumn('Signal', (_, index) => getSuffix(results[index].signal));
      dataframe = dataframe.restructure([
        'Signal',
        ...dataframe.listColumns().filter(each => each !== 'Signal'),
      ]);
    }

    const columns = dataframe.listColumns().map(each => ({ title: each, field: each }));
    return [columns, dataframe.toCollection()];
  }, [doNotProcess, getSuffix, results]);

  const plots = useMemo(() => {
    if (doNotProcess) return [];

    if (results.length === 1 && results[0].result) {
      return [results[0].result.plot];
    }

    return results.reduce((array, { signal, result }) => {
      if (!result || !result.plot) return array;

      const suffix = getSuffix(signal);
      return [...array, {
        ...result.plot,
        layout: {
          ...result.plot.layout,
          width: undefined,
          height: undefined,
          title: {
            ...result.plot.layout.title,
            text: `${result.plot.layout.title.text} (${suffix})`,
          },
        },
      }];
    }, []);
  }, [doNotProcess, getSuffix, results]);

  return [columns, tableData, plots, isProcessing];
};
