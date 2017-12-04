export interface ValidationState {
    [propertyName: string]: ValidationStateElement;
}
export interface ValidationResult {
    validationState: ValidationState;
    isValid: boolean;
    changed: boolean;
}
export interface ValidationStateElement {
    message?: string;
    isValid: boolean;
    isDirty: boolean;
    showError: boolean;
    value: any;
}

export interface ValidatorFunction<TValue> {
    (value: TValue, ...moreValue: string[]): boolean;
    paramCount?: number;
}

export type GetShowErrorFunc<TState, TProps> = (validationState: ValidationStateElement, state: TState, props: TProps) => boolean;

export interface ValidationConfig<TState, TProps> {
    [propertyName: string]: ValidationConfigElement<TState, TProps, any>;
}

export interface ValidationConfigElement<TState, TProps, TValue> {
    validators: Validator<TState, TProps, TValue>[];
    valueGetter?(state: TState, props: TProps): TValue;
    shouldShowError?: GetShowErrorFunc<TState, TProps>;
}
export interface Validator<TState, TProps, TValue> {
    message: string,
    messageParams?: any;
    validator: ValidatorFunction<TValue>;
    extraParams?: ((state: TState, props: TProps) => TValue)[]
}
