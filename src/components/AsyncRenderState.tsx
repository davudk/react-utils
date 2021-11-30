import { createContext, ReactNode, useContext } from "react";
import { AsyncController } from "../utils";

export const AsyncRenderContext = createContext<AsyncController | null>(null);

export interface AsyncRenderStateProps {
    children?: ReactNode;

    mode: 'any' | 'all';

    result?: boolean;
    prevResult?: boolean;
    loading?: boolean;
    error?: boolean;
    empty?: boolean;
}

export function AsyncRenderState(props: AsyncRenderStateProps) {
    const { mode } = props;

    const controller = useContext(AsyncRenderContext);
    if (!controller) return null;

    const conditions = [
        check(props.result, controller.result !== undefined),
        check(props.prevResult, controller.prevResult !== undefined),
        check(props.loading, controller.loading),
        check(props.error, controller.error),
        check(props.empty, controller.empty)
    ];

    let invalid = false;
    if (mode === 'any') {
        invalid = !conditions.includes(true);
    } else if (mode === undefined || mode === 'all') {
        invalid = conditions.includes(false);
    } else {
        throw new Error('Unknown mode specified: ' + mode)
    }

    return invalid || props.children;

    function check(condition: boolean | undefined, valuePresent: boolean) {
        if (condition === undefined) return undefined;
        else return condition ? valuePresent : !valuePresent;
    }
}