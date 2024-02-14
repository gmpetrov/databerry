/* 
   from: https://github.com/kentcdodds/use-deep-compare-effect 
   issue: https://github.com/react-hook-form/react-hook-form/issues/7068#issuecomment-973167261
*/

import { dequal as deepEqual } from 'dequal';
import * as React from 'react';

import { deepClone } from '@chaindesk/lib/deepClone';
type UseEffectParams = Parameters<typeof React.useEffect>;
type EffectCallback = UseEffectParams[0];
type DependencyList = UseEffectParams[1];

export function useDeepCompareMemoize<T>(value: T) {
  const ref = React.useRef<T>(value);
  const signalRef = React.useRef<number>(0);

  if (!deepEqual(value, ref.current)) {
    ref.current = deepClone(value); // deep copy.
    signalRef.current += 1;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => ref.current, [signalRef.current]);
}

function useDeepCompareEffect(
  callback: EffectCallback,
  dependencies: DependencyList
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useEffect(callback, useDeepCompareMemoize(dependencies));
}

export default useDeepCompareEffect;
