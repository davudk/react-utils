import { useRef } from 'react';
import { ArrayController, ArrayControllerOptions } from '../utils';
import { useForceRender } from './use-force-render';

export function useArray<T = any>(values?: T[], options?: ArrayControllerOptions): ArrayController<T> {
    const controllerRef = useRef<ArrayController<T>>();
    const forceRender = useForceRender();

    if (!controllerRef.current) {
        controllerRef.current = new ArrayController<T>(values, {
            ...options,
            onMutate: () => {
                forceRender();
                options?.onMutate?.();
            }
        });
    }

    return controllerRef.current;
}
