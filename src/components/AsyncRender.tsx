import React, { ReactNode } from "react";
import { AsyncController } from "../utils";
import { AsyncRenderContext, AsyncRenderState } from "./AsyncRenderState";

export interface AsyncRenderProps<TResult = any, TParams = any> {
    children?: ReactNode;
    control: AsyncController<TResult, TParams>;
}

export function AsyncRender<TResult = any, TParams = any>(props: AsyncRenderProps<TResult, TParams>) {
    return (
        <AsyncRenderContext.Provider value={props.control}>
            {props.children}
        </AsyncRenderContext.Provider>
    )
}

AsyncRender.State = AsyncRenderState;