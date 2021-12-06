import { useEffect, useRef } from "react";
import { ArrayController } from "..";
import { useForceRender } from "./use-force-render";
import { StorageType, useStorage } from "./use-storage";

export interface StorageArrayOptions<T> {
    defaultValue?: T[];
    type: StorageType;
}

export function useStorageArray<T = any>(name: string, options: StorageArrayOptions<T>): ArrayController<T> {
    const [value, setValue] = useStorage<T[]>(name, {
        defaultValue: options.defaultValue ?? [],
        type: options.type
    });

    const controllerRef = useRef<ArrayController<T>>(createController());
    const forceRender = useForceRender();

    useEffect(() => {
        controllerRef.current = createController();
        forceRender();
    }, [value]);

    return controllerRef.current;

    function createController() {
        return new ArrayController<T>(value, {
            onMutate: () => {
                setValue(controllerRef.current.values)
            }
        });
    }
}