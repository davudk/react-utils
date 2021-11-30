import { useEffect, useRef, useState } from 'react';

export interface TimeoutOptions {
    delay: number;
    callback: Function;
    autoStart?: boolean;
    repeat?: boolean;
}

export interface TimeoutController {
    readonly running: boolean;
    start(): void;
    restart(): void;
    stop(): void;
}

export function useTimeout(options: TimeoutOptions): TimeoutController {
    const controllerRef = useRef<TimeoutController>();
    const timeoutHandleRef = useRef<any>();
    const [_, setForceUpdate] = useState();

    if (!controllerRef.current) {
        controllerRef.current = {
            running: !!timeoutHandleRef.current,
            start() {
                if (timeoutHandleRef.current) return;

                const cb = async () => {
                    try {
                        await options.callback();
                    } finally {
                        timeoutHandleRef.current = undefined;
                        if (options.repeat) {
                            this.start();
                        }
                    }
                };

                timeoutHandleRef.current = setTimeout(cb, options.delay);
                setForceUpdate(undefined);
            },
            restart() {
                this.stop();
                this.start();
            },
            stop() {
                if (timeoutHandleRef.current) {
                    clearTimeout(timeoutHandleRef.current);
                    timeoutHandleRef.current = undefined;
                }
                setForceUpdate(undefined);
            }
        }
    }

    useEffect(() => {
        if (options.autoStart) {
            controllerRef.current?.start();
        }

        return () => controllerRef.current?.stop();
    }, [options.autoStart]);

    useEffect(() => {
        return () => controllerRef.current?.stop();
    }, [options.autoStart]);

    return controllerRef.current;
}
