import { DependencyList, EffectCallback, useEffect, useRef } from "react";

export function useEffectSkipInitial(effect: EffectCallback, deps?: DependencyList) {
    const initialRef = useRef(true);

    useEffect(() => {
        if (initialRef.current) {
            initialRef.current = false;
        } else {
            return effect();
        }
    }, deps);
}