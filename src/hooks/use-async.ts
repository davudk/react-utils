import { useRef } from 'react';
import { AsyncController, AsyncControllerOptions } from '../utils';
import { useForceRender } from './use-force-render';
import { useIsMounted } from './use-is-mounted';

export interface AsyncOptions<TResult = any, TParams = any> extends AsyncControllerOptions<TResult, TParams> {
}

export function useAsync<TResult = any, TParams = any>(options: AsyncOptions<TResult, TParams>): AsyncController<TResult, TParams> {
    const controllerRef = useRef<AsyncController<TResult, TParams>>();
    const isMounted = useIsMounted();
    const forceRender = useForceRender();

    if (!controllerRef.current) {
        controllerRef.current = new AsyncController<TResult, TParams>({
            ...options,
            onMutate: () => {
                if (isMounted()) {
                    forceRender();
                }
                options?.onMutate?.();
            }
        });
    }

    return controllerRef.current;
}
