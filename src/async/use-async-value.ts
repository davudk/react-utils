import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useForceRender } from '..';
import { AsyncValue, AsyncValueTemplate, determineAsyncState } from './async-value';

export interface AsyncValueHookOptions<TValue, TError = any> {
    data?: TValue;
    value?: TValue;
    loading?: boolean;
    error?: TError;
}

export type AsyncValueHookReturn<TValue, TError = any> = [
    AsyncValue<TValue, TError>,
    AsyncValueHookSetterFunction<TValue, TError>,
    AsyncValueHookHelperFunctions<TValue, TError>
]

export type AsyncValueHookSetterFunction<TValue, TError = any> = (value: AsyncValueTemplate<TValue, TError>) => AsyncValue<TValue, TError>;

export interface AsyncValueHookHelperFunctions<TValue, TError = any> {
    reset(): AsyncValue<TValue, TError>;
    clear(): AsyncValue<TValue, TError>;
    resolve(currValue: TValue, prevValue?: TValue): AsyncValue<TValue, TError>;
    load(): AsyncValue<TValue, TError>;
    reject(error: TError): AsyncValue<TValue, TError>;
}

export function useAsyncValue<TValue, TError = any>(options: AsyncValueHookOptions<TValue, TError>): AsyncValueHookReturn<TValue, TError> {
    const { loading: providedLoading, error: providedError } = options;
    const providedValue = typeof options.data !== 'undefined' ? options.data : options.value;

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
    t.state = determineAsyncState(t);

    const asyncValue = useMemo(() => {
        return new AsyncValue(t);
    }, [t.state, currValue, prevValue, loading, error])

    const setAsyncValue: AsyncValueHookSetterFunction<TValue, TError> = useCallback((t: AsyncValueTemplate<TValue, TError>) => {
        const v = new AsyncValue(t);
        Object.assign(memoizedValues, v.template);
        forceRender();
        return v;
    }, []);

    const functions: AsyncValueHookHelperFunctions<TValue, TError> = useMemo(() => {
        return {
            reset(): AsyncValue<TValue, TError> {
                return setAsyncValue(asyncValue.morph('reset'));
            },
            clear(): AsyncValue<TValue, TError> {
                return setAsyncValue(asyncValue.morph('clear'));
            },
            resolve(value: TValue): AsyncValue<TValue, TError> {
                return setAsyncValue(asyncValue.morph('resolved', value));
            },
            load(): AsyncValue<TValue, TError> {
                return setAsyncValue(asyncValue.morph('loading'));
            },
            reject(error: TError): AsyncValue<TValue, TError> {
                return setAsyncValue(asyncValue.morph('rejected', error));
            }
        };
    }, []);

    return [
        asyncValue,
        setAsyncValue,
        functions
    ];
}