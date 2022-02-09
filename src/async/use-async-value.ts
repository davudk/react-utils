import { useEffect, useMemo, useRef } from 'react';
import { useForceRender } from '..';
import { AsyncState, AsyncValue, AsyncValueTemplate, determineAsyncState } from './async-value';

export interface AsyncValueHookOptions<TValue, TError = any> {
    state?: AsyncState;
    value?: TValue;
    loading?: boolean;
    error?: TError;
}

export type AsyncValueHookReturn<TValue, TError = any> = [
    AsyncValue<TValue, TError>,
    AsyncValueHookHelperFunctions<TValue, TError>
]

export interface AsyncValueHookHelperFunctions<TValue, TError = any> {
    set(t: AsyncValueTemplate<TValue, TError>): AsyncValue<TValue, TError>;
    reset(): AsyncValue<TValue, TError>;
    clear(): AsyncValue<TValue, TError>;
    resolve(currValue: TValue, prevValue?: TValue): AsyncValue<TValue, TError>;
    load(): AsyncValue<TValue, TError>;
    reject(error: TError): AsyncValue<TValue, TError>;
}

export function useAsyncValue<TValue, TError = any>(options: AsyncValueHookOptions<TValue, TError>): AsyncValueHookReturn<TValue, TError> {
    const { value: providedValue, loading: providedLoading, error: providedError } = options;
    const { current: memoizedValues } = useRef<AsyncValueTemplate<TValue, TError>>({});
    const forceRender = useForceRender();

    useEffect(() => {
        if (typeof memoizedValues.currValue !== 'undefined') {
            memoizedValues.prevValue = memoizedValues.currValue;
        }
        memoizedValues.currValue = providedValue;
    }, [providedValue]);

    useEffect(() => {
        memoizedValues.loading = providedLoading;
    }, [providedLoading]);

    useEffect(() => {
        memoizedValues.error = providedError;
    }, [providedError]);

    const { currValue, prevValue, loading, error } = memoizedValues;

    const t: AsyncValueTemplate<TValue, TError> = { currValue, prevValue, loading, error };
    const state = determineAsyncState(t);

    useEffect(() => {
        memoizedValues.state = state;
    }, [state]);

    const asyncValue = useMemo(() => {
        return new AsyncValue(t);
    }, [state, currValue, prevValue, loading, error])

    const functions: AsyncValueHookHelperFunctions<TValue, TError> = useMemo(() => {
        return {
            set(t: AsyncValueTemplate<TValue, TError>): AsyncValue<TValue, TError> {
                const v = new AsyncValue(t);
                Object.assign(memoizedValues, v.template);
                forceRender();
                return v;
            },
            reset(): AsyncValue<TValue, TError> {
                return this.set(asyncValue.morph('reset'));
            },
            clear(): AsyncValue<TValue, TError> {
                return this.set(asyncValue.morph('clear'));
            },
            resolve(value: TValue): AsyncValue<TValue, TError> {
                return this.set(asyncValue.morph('resolved', value));
            },
            load(): AsyncValue<TValue, TError> {
                return this.set(asyncValue.morph('loading'));
            },
            reject(error: TError): AsyncValue<TValue, TError> {
                return this.set(asyncValue.morph('rejected', error));
            }
        };
    }, []);

    return [
        asyncValue,
        functions
    ];
}