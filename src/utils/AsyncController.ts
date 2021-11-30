
export interface AsyncControllerOptions<TResult = any, TParams = any> {
    initialValue?: TResult;
    initialValueProvider?(): TResult;
    load(params: TParams): Promise<TResult>;
    onMutate?(): void;
};

export class AsyncController<TResult = any, TParams = any> {
    private _result?: TResult;
    private _previousResult?: TResult;
    private _loading = false;
    private _error?: any;

    constructor(public readonly options: AsyncControllerOptions<TResult, TParams>) {
        this._result = options.initialValueProvider?.() ?? options.initialValue;
    }

    get result() { return this._result; }
    get previousResult() { return this._previousResult; }
    get loading() { return this._loading; }
    get error() { return this._error; }

    set result(value: TResult | undefined) {
        this._result = value;
        this._previousResult = undefined;
        this._loading = false;
        this._error = undefined;
        this.handleMutate();
    }

    get empty(): boolean {
        return this._result === undefined
            && this._previousResult === undefined
            && !this.loading
            && !this.error;
    }

    clear() {
        this._result = undefined;
        this._previousResult = undefined;
        this._loading = false;
        this._error = undefined;
        this.handleMutate();
    }

    load(params: TParams): void {
        this.loadImpl(this.options.load, params);
    }

    customLoad(callback: () => Promise<TResult>): void;
    customLoad(callback: (params: TParams) => Promise<TResult>, params: TParams): void;
    customLoad(callback: (params?: TParams) => Promise<TResult>, params?: TParams): void;
    customLoad(callback: any, params?: TParams): void {
        this.loadImpl(callback, params!);
    }

    private async loadImpl(callback: (params: TParams) => Promise<TResult>, params: TParams): Promise<void> {
        try {
            this._previousResult = this._result;
            this._result = undefined;
            this._loading = true;
            this._error = undefined;
            this.handleMutate();

            this._result = await callback(params);
            this._loading = false;
            this._error = undefined;
            this.handleMutate();
        } catch (err) {
            this._result = undefined;
            this._loading = false;
            this._error = err;
            this.handleMutate();
        }
    }

    private handleMutate() {
        this.options.onMutate?.();
    }
}
