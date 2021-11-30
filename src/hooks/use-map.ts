import { useRef } from 'react';
import { MapController, MapControllerOptions } from '../utils';
import { useForceRender } from './use-force-render';

export function useMap<K = any, V = any>(options?: MapControllerOptions) {
    const controllerRef = useRef<MapController<K, V>>();
    const forceRender = useForceRender();

    if (!controllerRef.current) {
        controllerRef.current = new MapController<K, V>({
            ...options,
            onMutate: () => {
                forceRender();
                options?.onMutate?.();
            }
        });
    }

    return controllerRef.current;
}
