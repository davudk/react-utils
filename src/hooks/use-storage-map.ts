import { useEffect, useRef } from "react";
import { MapController } from "..";
import { useForceRender } from "./use-force-render";
import { StorageType, useStorage } from "./use-storage";

export interface StorageMapOptions {
    type: StorageType;
}

export function useStorageMap<K = any, V = any>(name: string, options: StorageMapOptions): MapController<K, V> {
    const [value, setValue] = useStorage<[any, any][]>(name, {
        defaultValue: [],
        type: options.type
    });

    const controllerRef = useRef<MapController<K, V>>(createController());
    const forceRender = useForceRender();

    useEffect(() => {
        controllerRef.current = createController();
        forceRender();
    }, [value]);

    return controllerRef.current;

    function createController() {
        const source = new Map<K, V>();
        value.forEach(e => {
            if (e.length === 2) {
                source.set(e[0], e[1]);
            }
        })

        return new MapController<K, V>({
            source,
            onMutate: () => {
                setValue(Object.entries(controllerRef.current.map));
            }
        });
    }
}