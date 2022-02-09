
export type AsyncState = 'uninitialized' | 'loading' | 'resolved' | 'rejected';

export interface AsyncValueTemplate<TValue, TError = any> {
    state?: AsyncState;
    currValue?: TValue;
    prevValue?: TValue;
    loading?: boolean;
    error?: TError;
}

export class AsyncValue<TValue, TError = any> implements Readonly<AsyncValueTemplate<TValue, TError>> {
    private _state?: AsyncState;
    public readonly currValue?: TValue;
    public readonly prevValue?: TValue;
    public readonly loading?: boolean;
    public readonly error?: TError;

    constructor(t?: AsyncValueTemplate<TValue, TError>) {
        this._state = t?.state;
        this.currValue = t?.currValue;
        this.prevValue = t?.prevValue;
        this.loading = t?.loading;
        this.error = t?.error;
    }

    get state(): AsyncState {
        if (!this._state) {
            this._state = determineAsyncState(this);
        }
        return this._state;
    }

    get currentOrPrevious(): TValue | undefined {
        if (typeof this.currValue !== 'undefined') return this.currValue;
        else return this.prevValue;
    }

    get template(): AsyncValueTemplate<TValue, TError> {
        const { state, currValue, prevValue, loading, error } = this;
        return { state, currValue, prevValue, loading, error };
    }

    morph(action: 'reset'): AsyncValue<TValue, TError>;
    morph(action: 'clear'): AsyncValue<TValue, TError>;
    morph(state: 'loading'): AsyncValue<TValue, TError>;
    morph(state: 'resolved', value: TValue): AsyncValue<TValue, TError>;
    morph(state: 'rejected', error: TError): AsyncValue<TValue, TError>;
    morph(actionOrState: string, arg?: TValue | TError): AsyncValue<TValue, TError> {
        if (actionOrState === 'reset') return new AsyncValue();
        else if (actionOrState === 'clear') return new AsyncValue({ prevValue: this.currentOrPrevious });
        else if (actionOrState === 'loading') return new AsyncValue({ loading: true, prevValue: this.currentOrPrevious });
        else if (actionOrState === 'resolved') return new AsyncValue({ currValue: arg as any, prevValue: this.currentOrPrevious });
        else if (actionOrState === 'rejected') return new AsyncValue({ error: arg as any, prevValue: this.currentOrPrevious });
        else throw new Error('Unknown morph action specified to AsyncValue.');
    }

    static initial<TValue, TError = any>(): AsyncValue<TValue, TError> {
        return new AsyncValue();
    }

    static resolved<TValue, TError = any>(currValue: TValue, prevValue?: TValue): AsyncValue<TValue, TError> {
        return new AsyncValue({ currValue, prevValue });
    }

    static loading<TValue, TError = any>(): AsyncValue<TValue, TError> {
        return new AsyncValue({ loading: true });
    }

    static rejected<TValue, TError = any>(error: TError): AsyncValue<TValue, TError> {
        return new AsyncValue({ error });
    }
}

export function determineAsyncState<T>(v: AsyncValueTemplate<T>): AsyncState {
    if (v.state) return v.state;
    else if (typeof v.error !== 'undefined') return 'rejected';
    else if (v.loading) return 'loading';
    else if (typeof v.currValue !== 'undefined') return 'resolved';
    else return 'uninitialized';
}