import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { PROCESS_STATUS } from './StatusIcon';

export const usePollingEffect = (items, startActionType, stopActionType) => {
  const dispatch = useDispatch();
  const [pollingItems, setPollingItems] = useState([]);

  useEffect(() => {
    let itemsToCheck = items;
    if (!Array.isArray(items)) {
      itemsToCheck = [items];
    }
    const polling = itemsToCheck.filter(each => each && each.process).reduce((arr, each) => {
      if ([PROCESS_STATUS.QUEUED, PROCESS_STATUS.PROCESSING].includes(each.process.status)) {
        dispatch({ type: startActionType, id: each.id });
        return [...arr, each.id];
      }
      return arr;
    }, []);

    setPollingItems(polling);

    return () => {
      polling.forEach(id => dispatch({ type: stopActionType, id }));
    };
  }, [dispatch, items, startActionType, stopActionType]);

  return {
    isPolling: pollingItems.length > 0,
    pollingItems,
  };
};
