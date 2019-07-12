
export function filterObjectByValue (object, predicate) {
  return Object.keys(object).reduce((filtered, key) => {
    if (predicate(object[key])) {
      filtered[key] = object[key];
    }
    return filtered;
  }, {});
}
