/** A function called to initialize a binding's value, which can also be called to reset its value. */
export type BindingInitializer<GetType> = (isReset: boolean) => GetType;
