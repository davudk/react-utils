import { useEffect, useRef } from "react";
import { useEffectSkipInitial } from "./use-effect-skip-initial";
import { useForceRender } from "./use-force-render";
import { useIsMounted } from './use-is-mounted';

export type StorageType = 'localStorage' | 'sessionStorage';

export interface StorageOptions<T = any> {
    defaultValue: T;
    type: StorageType;
    parser?: (s: string) => T;
    serializer?: (value: T) => string;
    validate?: (value: T) => T;
}

const listeners = new Map<string, Set<Function>>();

export function useStorage<T = any>(name: string, options: StorageOptions<T>) {
    if (!globalThis.window) {
        return [options.defaultValue, () => { }, () => { }] as const;
    }

    const forceRender = useForceRender();
    const isMounted = useIsMounted();
    const valueRef = useRef<T>(options.defaultValue);
    const storageRef = useRef<Storage>(getStorage(options.type));
    const refreshRef = useRef((skipRender?: boolean) => {
        const s = storageRef.current.getItem(name);
        if (s === null) {
            valueRef.current = options.defaultValue;
        } else {
            const parsedValue = (options.parser ?? JSON.parse)(s);
            const validatedValue = (options.validate ?? (x => x))(parsedValue);
            valueRef.current = validatedValue;
        }
        if (!skipRender) {
            forceRender();
        }
    });
    const storageEventRef = useRef<(e: StorageEvent) => void>(e => {
        if (e.key === name) refreshRef.current();
    });

    if (!isMounted()) {
        refreshRef.current(true);
    }

    useEffectSkipInitial(() => {
        storageRef.current = getStorage(options.type);
        refreshRef.current();
    }, [options.type]);

    useEffect(() => {
        if (!listeners.has(name)) {
            listeners.set(name, new Set());
        }

        listeners.get(name)!.add(refreshRef.current);

        if (options.type === 'localStorage') {
            window.addEventListener('storage', storageEventRef.current);
        }

        return () => {
            if (options.type === 'localStorage') {
                window.removeEventListener('storage', storageEventRef.current);
            }

            listeners.get(name)!.delete(refreshRef.current);
        };
    }, [options.type]);

    const set = (value: T) => {
        if (value === null || value === undefined) {
            storageRef.current.removeItem(name);
        } else {
            const s = (options.serializer ?? JSON.stringify)(value);
            if (s === null || s === undefined) {
                storageRef.current.removeItem(name);
            } else {
                storageRef.current.setItem(name, s);
            }
        }
        listeners.get(name)?.forEach(c => c());
    };

    const clear = () => {
        storageRef.current.removeItem(name);
        listeners.get(name)?.forEach(c => c());
    };

    return [valueRef.current, set, clear] as const;
}

function getStorage(type: StorageType) {
    if (type === 'localStorage') return localStorage;
    else if (type === 'sessionStorage') return sessionStorage;
    else if (type) throw new Error('Unknown storage: ' + type);
    else throw new Error('Storage type not specified.');
}