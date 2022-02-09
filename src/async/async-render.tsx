import { ReactNode } from 'react';
import { AsyncValueTemplate, determineAsyncState } from './async-value';

export type AsyncRenderFunction<TValue, TError = any> = (props: AsyncValueTemplate<TValue, TError>) => ReactNode;

export interface AsyncRenderProps<TValue, TError = any> extends AsyncValueTemplate<TValue, TError> {
    children: ReactNode | AsyncRenderFunction<TValue, TError>;
    renderValueWhileLoading?: boolean;

    renderEmpty?: AsyncRenderFunction<TValue, TError>;
    renderError?: AsyncRenderFunction<TValue, TError>;
    renderLoading?: AsyncRenderFunction<TValue, TError>;
}

export function AsyncRender<TValue = any, TError = any>(props: AsyncRenderProps<TValue, TError>): ReactNode {
    const { children, renderValueWhileLoading, renderEmpty, renderError, renderLoading } = props;
    const { currValue, prevValue, loading, error } = props;
    const state = determineAsyncState(props);

    const renderData: AsyncRenderFunction<TValue, TError> = typeof children === 'function'
        ? children as AsyncRenderFunction<TValue, TError>
        : () => children;

    const v: AsyncValueTemplate<TValue, TError> = { state, currValue, prevValue, loading, error };

    switch (state) {
        case 'uninitialized': return renderEmpty?.(v) ?? null;
        case 'loading': return (renderValueWhileLoading ? renderData?.(v) : renderLoading?.(v)) ?? null;
        case 'resolved': return renderData?.(v) ?? null;
        case 'rejected': return renderError?.(v) ?? null;
        default: return null;
    }
}
