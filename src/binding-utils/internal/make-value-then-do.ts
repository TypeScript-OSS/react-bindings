import isPromise from 'is-promise';

/**
 * Runs a function to make a value and then runs a subsequent function.  The subsequent function is run even if an exception is thrown while
 * making the value.  This efficiently handles value generation functions that return promises and that don't.
 */
export const makeValueThenDo = <T>(makeValue: () => Promise<T> | T, thenDo: (value?: T) => void): Promise<T> | T => {
  let value: Promise<T> | T;
  let makeValueSuccess = false;
  try {
    value = makeValue();
    makeValueSuccess = true;
  } finally {
    if (!makeValueSuccess) {
      thenDo();
    }
  }

  if (isPromise(value)) {
    return (async () => {
      let awaitValueSuccess = false;
      try {
        const output = await value;
        awaitValueSuccess = true;
        thenDo(output);
        return output;
      } finally {
        if (!awaitValueSuccess) {
          thenDo();
        }
      }
    })();
  } else {
    thenDo(value);
    return value;
  }
};
