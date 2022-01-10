import { DependencyList, useEffect, useRef } from 'react';
import { AsyncController, AsyncControllerOptions } from '../utils';
import { useForceRender } from './use-force-render';

export interface AsyncOptions<TResult = any, TParams = any> extends AsyncControllerOptions<TResult, TParams> {
    autoLoad?: {
        params: TParams,
        deps: DependencyList
    };
}

export function useAsync<TResult = any, TParams = any>(options: AsyncOptions<TResult, TParams>): AsyncController<TResult, TParams> {
    const controllerRef = useRef<AsyncController<TResult, TParams>>();
    const forceRender = useForceRender();

    if (!controllerRef.current) {
        controllerRef.current = new AsyncController<TResult, TParams>({
            ...options,
            onMutate: () => {
                forceRender();
                options?.onMutate?.();
            }
        });
    }

    useEffect(() => {
        if (options.autoLoad && controllerRef.current) {
            controllerRef.current.load(options.autoLoad.params)
                .catch(() => undefined);
        }
    }, options.autoLoad?.deps);

    return controllerRef.current;
}
