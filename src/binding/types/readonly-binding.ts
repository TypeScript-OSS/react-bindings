import type { ChangeListener, ChangeListenerRemover } from './change-listener';

/** The readonly interface for bindings */
export interface ReadonlyBinding<GetType = any> {
  /** A marker indicating that this is a binding type */
  readonly isBinding: true;

  /** A technical, but human-readable ID, which isn't guaranteed to be unique */
  readonly id: string;
  /** An ID that's unique to this runtime */
  readonly uid: string;

  /**
   * Adds a listener that will be called when this binding changes.
   *
   * @see `useBindingEffect` and `BindingsConsumer`
   *
   * @returns a function that may be used to remove the added listener.
   */
  readonly addChangeListener: (listener: ChangeListener) => ChangeListenerRemover;

  /** @returns the value */
  readonly get: () => GetType;
  /** Every time the value is changed, the change uid is updated */
  readonly getChangeUid: () => string;
  /** @returns `true` if this binding has been marked as being modified */
  readonly isModified: () => boolean;

  /** @returns `true` if the binding is locked */
  readonly isLocked: () => boolean;
  /**
   * Increments the lock count and returns a method to decrement it.  A binding is locked if its lock
   * count is `> 0`.  When a binding is locked, mutating calls (`reset`/`set`/`setRaw`) won't have an immediate effect.  However, if a
   * mutating call is made on a locked binding, the change will be applied once the binding becomes unlocked.
   *
   * @returns a function for decrementing this binding's lock count.
   */
  readonly lock: () => () => void;

  /** Forcibly triggers the change listeners.  Don't normally use this! */
  readonly triggerChangeListeners: () => void;
}
