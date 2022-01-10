
export interface AsyncControllerOptions<TResult = any, TParams = any> {
    initial?: { value: TResult } | { provider(): TResult; };
    load: LoadHandler<TResult, TParams>;
    onMutate?(): void;
}

export type LoadHandler<TResult = any, TParams = any> = (params: TParams, options: LoadOptions) => Promise<TResult>;

export interface LoadOptions {
    abortSignal: AbortSignal;
}

export class AsyncController<TResult = any, TParams = any> {
    private _stateCounter = 0;
    private _result?: TResult;
    private _prevResult?: TResult;
    private _loading = false;
    private _error?: any;
    private _abortController?: AbortController;

    constructor(public readonly options: AsyncControllerOptions<TResult, TParams>) {
        const { initial } = options as any;
        if (initial?.value !== undefined) this._result = initial?.value;
        else if (initial?.provider) this._result = initial?.provider?.();
    }

    get result() { return this._result; }
    get prevResult() { return this._prevResult; }
    get loading() { return this._loading; }
    get error() { return this._error; }

    set result(value: TResult | undefined) {
        this._result = value;
        this._prevResult = undefined;
        this._loading = false;
        this._error = undefined;
        this.handleMutate();
    }

    get empty(): boolean {
        return this._result === undefined
            && this._prevResult === undefined
            && !this.loading
            && !this.error;
    }

    clear() {
        this._result = undefined;
        this._prevResult = undefined;
        this._loading = false;
        this._error = undefined;
        this._abortController?.abort();
        this._abortController = undefined;
        this.handleMutate();
    }

    cancel() {
        this._abortController?.abort();
    }

    async load(params: TParams): Promise<void> {
        return this.loadImpl(this.options.load, params);
    }

    customLoad(callback: () => Promise<TResult>): void;
    customLoad(callback: (params: TParams) => Promise<TResult>, params: TParams): void;
    customLoad(callback: (params?: TParams) => Promise<TResult>, params?: TParams): void;
    customLoad(callback: any, params?: TParams): void {
        this.loadImpl(callback, params!);
    }

    private async loadImpl(callback: LoadHandler<TResult, TParams>, params: TParams): Promise<void> {
        const currentState = ++this._stateCounter;
        const isStateCurrent = () => currentState === this._stateCounter;

        try {
            this._prevResult = this._result;
            this._result = undefined;
            this._loading = true;
            this._error = undefined;
            this._abortController?.abort();
            this._abortController = new AbortController();
            this.handleMutate();

            const options: LoadOptions = {
                abortSignal: this._abortController.signal
            }
            this._result = await callback(params, options);

            if (isStateCurrent()) {
                this._loading = false;
                this._error = undefined;
                this._abortController = undefined;
                this.handleMutate();
            }
        } catch (err) {
            if (isStateCurrent()) {
                this._result = undefined;
                this._loading = false;
                this._error = err;
                this.handleMutate();
            }
            throw err;
        }
    }

    private handleMutate() {
        this.options.onMutate?.();
    }
}
