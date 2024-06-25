import type { DoubleLinkedListNode } from 'doublell';
import { DoubleLinkedList } from 'doublell';

import { areEqual as globalAreEqual } from '../../config/are-equal.js';
import { getLogger, isSpecialLoggingEnabledFor } from '../../config/logging.js';
import { getStatsHandler } from '../../config/stats-handler.js';
import { makeUID } from '../../internal-utils/uid.js';
import type { Binding } from '../types/binding';
import type { BindingConstructorArgs } from '../types/binding-args';
import type { BindingInitializer } from '../types/binding-initializer';
import type { ChangeListener } from '../types/change-listener';
import type { SetValueTransformer } from '../types/set-value-transformer';
import { LOCK_DURATION_WARNING_INTERVAL_MSEC } from './consts.js';

/** A pending update on a binding */
type PendingUpdate<GetType = any> =
  | { type: 'set-raw'; value: GetType }
  | { type: 'set'; value: GetType }
  | { type: 'reset'; value?: undefined };

/** The standard implementation of a read-write binding */
export class BindingImpl<GetType = any> implements Binding<GetType> {
  // Public Fields

  public readonly isBinding = true;
  public readonly id: string;
  public readonly uid = makeUID();

  public readonly setValueTransformer: SetValueTransformer<GetType> | undefined;

  // Private Fields

  /** The stored value of the binding */
  private value_: GetType;

  /** An ID updated every time the value is changed.  This value is unique to this runtime. */
  private changeUid_ = this.uid; // Using the binding's uid as the initial change ID for convenience
  /** Registered change listeners */
  private onChangeListeners_?: DoubleLinkedList<ChangeListener>;

  /**
   * A flag indicating whether or not this binding was modified.  This is initially `false` when the binding is created and set to `true`
   * when `set` is called (even if the underlying value doesn't actually change).
   *
   * This can also be set manually using `setIsModified`.
   */
  private isModified_ = false;

  /** This binding is considered to be locked if `> 0` */
  private lockedCount_ = 0;
  /**
   * We keep track of the most-recent mutating call made while this binding is locked.  When it becomes unlocked, we apply the requested
   * change.
   */
  private pending_: PendingUpdate<GetType> | undefined = undefined;
  /**
   * In addition to tracking the most-recent mutating call made while this binding is locked, we also track if any of those mutating calls
   * were resets.  If they were, when this binding becomes unlocked, we first reset and then apply the pending update.
   */
  private hasPendingReset_ = false;

  /** The value equality checker function */
  private areEqual_?: (a: GetType, b: GetType) => boolean;
  /** If `true`, `areEqual_` (or the default) is used to determine if the value has changed */
  private detectChanges_: boolean;

  /** The initializer function, which can be used to reset the binding */
  private initializer_: BindingInitializer<GetType>;

  /**
   * @param initializer - A function called to initialize this binding's value, which can also be called to reset its value.
   * @param args - Additional arguments for configuring this binding.
   */
  constructor(initializer: BindingInitializer<GetType>, args: BindingConstructorArgs<GetType>) {
    const theInitialValue = initializer(false);

    this.id = args.id;
    this.value_ = theInitialValue;

    this.setValueTransformer = args.setValueTransformer;

    this.initializer_ = initializer;

    this.areEqual_ = args.areEqual;
    this.detectChanges_ = args.detectChanges ?? false;
  }

  // Getters

  public readonly get = () => this.value_;

  public readonly getChangeUid = () => this.changeUid_;

  // Setters

  public readonly reset = () => {
    if (this.lockedCount_ > 0) {
      getLogger().debug?.(
        `Attempted to change locked binding ${this.id}.  The most recently set value will be restored once this binding is unlocked`
      );
      this.pending_ = { type: 'reset' };
      this.hasPendingReset_ = true;

      return;
    }

    this.setRaw(this.initializer_(true));
    this.setIsModified(false);
  };

  public readonly setRaw = (newValue: GetType) => {
    if (this.lockedCount_ > 0) {
      getLogger().debug?.(
        `Attempted to change locked binding ${this.id}.  The most recently set value will be restored once this binding is unlocked`
      );
      this.pending_ = { type: 'set-raw', value: newValue };
      return;
    }

    if (this.detectChanges_) {
      const shouldChangeValue = !(this.areEqual_ ?? globalAreEqual)(this.value_, newValue);
      if (!shouldChangeValue) {
        return; // No change
      }
    }

    const startMSec = performance.now();

    this.value_ = newValue;
    this.changeUid_ = makeUID();

    const numListeners = this.triggerChangeListeners();

    getStatsHandler().trackBindingDidSetRaw?.({
      binding: this,
      durationMSec: performance.now() - startMSec,
      numListeners
    });
  };

  public readonly set = (newValue: GetType) => {
    if (this.lockedCount_ > 0) {
      getLogger().debug?.(
        `Attempted to change locked binding ${this.id}.  The most recently set value will be restored once this binding is unlocked`
      );
      this.pending_ = { type: 'set', value: newValue };
      return;
    }

    this.isModified_ = true;
    this.setRaw(this.setValueTransformer !== undefined ? this.setValueTransformer(newValue, this) : newValue);
  };

  // Modified

  public readonly isModified = () => this.isModified_;

  public readonly setIsModified = (newIsModified: boolean) => {
    this.isModified_ = newIsModified;
  };

  // Locked

  public readonly isLocked = () => this.lockedCount_ > 0;

  public readonly lock = () => {
    this.lockedCount_ += 1;

    const shouldLogBindingLockDurationWarnings = isSpecialLoggingEnabledFor('binding-lock-duration-warnings');
    const warningTimeout: ReturnType<typeof setTimeout> | undefined = shouldLogBindingLockDurationWarnings
      ? setTimeout(() => {
          getLogger().debug?.(
            `A lock for binding ${this.id} wasn't released after more than ${LOCK_DURATION_WARNING_INTERVAL_MSEC / 1000} seconds`
          );
        }, LOCK_DURATION_WARNING_INTERVAL_MSEC)
      : undefined;

    let wasUnlocked = false;
    return () => {
      if (wasUnlocked) {
        getLogger().debug?.(`A lock for binding ${this.id} was released more than once`);
        return;
      }
      wasUnlocked = true;

      if (warningTimeout !== undefined) {
        clearTimeout(warningTimeout);
      }

      this.lockedCount_ -= 1;

      // Restoring any pending values that were set while locked (mostly for bindings with memories)
      if (this.lockedCount_ === 0 && this.pending_ !== undefined) {
        const hasPendingReset = this.hasPendingReset_;
        this.hasPendingReset_ = false;

        const pending = this.pending_;
        this.pending_ = undefined;

        if (hasPendingReset) {
          this.reset();
        }

        switch (pending.type) {
          case 'set':
            this.set(pending.value);
            break;
          case 'set-raw':
            this.setRaw(pending.value);
            break;
          case 'reset':
            // Nothing to do here, handled above
            break;
        }
      }
    };
  };

  // Change Listener

  public readonly addChangeListener = (listener: ChangeListener) => {
    getStatsHandler().trackBindingDidAddChangeListener?.({ binding: this });

    if (this.onChangeListeners_ === undefined) {
      this.onChangeListeners_ = new DoubleLinkedList<ChangeListener>();
    }
    let newNode: Readonly<DoubleLinkedListNode<ChangeListener>> | undefined = this.onChangeListeners_.append(listener);

    // Returning function that can be used to remove the same change listener;
    return () => {
      if (newNode === undefined) {
        getLogger().debug?.(`A change listener for binding ${this.id} was removed more than once`);
        return;
      }

      getStatsHandler().trackBindingDidRemoveChangeListener?.({ binding: this });
      this.onChangeListeners_!.remove(newNode);
      newNode = undefined;
    };
  };

  public readonly triggerChangeListeners = () => {
    if (this.onChangeListeners_ === undefined) {
      return 0;
    }

    const listeners = this.onChangeListeners_.toArray();
    for (const listener of listeners) {
      listener();
    }

    return listeners?.length;
  };
}
