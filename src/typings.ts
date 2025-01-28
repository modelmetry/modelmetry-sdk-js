export type RecursivePartial<T> = {
    [P in keyof T]?:
    T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends (object | undefined) ? RecursivePartial<T[P]> :
    T[P];
};

// PartialExcept is a utility type that allows you to make all properties of a type optional except for the specified properties which become required, and non-null
export type PartialExcept<T, K extends keyof T> = Partial<T> & { [P in K]-?: T[P] };