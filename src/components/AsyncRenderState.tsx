import React, { createContext, ReactNode, useContext } from "react";
import { AsyncController } from "../utils";

export const AsyncRenderContext = createContext<AsyncController | null>(null);

export interface AsyncRenderStateProps<TResult = any, TParams = any> {
    children?: ReactNode | (() => ReactNode);
    control?: AsyncController<TResult, TParams>;

    mode?: 'any' | 'all';

    result?: boolean;
    prevResult?: boolean;
    loading?: boolean;
    error?: boolean;
    empty?: boolean;
    orElse?: boolean;
}

export function AsyncRenderState<TResult = any, TParams = any>(props: AsyncRenderStateProps<TResult, TParams>) {
    const { mode } = props;

    const ctx = useContext(AsyncRenderContext);
    const controller = props.control ?? ctx;
    if (!controller) return null;

    const conditions = [
        check(props.result, controller.result !== undefined),
        check(props.prevResult, controller.prevResult !== undefined),
        check(props.loading, controller.loading),
        check(props.error, controller.error !== undefined),
        check(props.empty, controller.empty)
    ];

    let invalid = false;
    if (mode === 'any') {
        invalid = !conditions.includes(true) && !props.orElse;
    } else if (mode === undefined || mode === 'all') {
        invalid = conditions.includes(false);
    } else {
        throw new Error('Unknown mode specified: ' + mode)
    }

    if (invalid) return null;
    else if (typeof props.children === 'function') {
        return <>{props.children()}</>;
    } else {
        return <>{props.children}</>;
    }

    function check(condition: boolean | undefined, valuePresent: boolean) {
        if (condition === undefined) return undefined;
        else return condition ? valuePresent : !valuePresent;
    }
}