/**
 * The method for limiting.
 *
 * - `'none'` - No limiting is applied so functions run immediately, every time they're called.  The queue and priority are ignored.
 * - `'debounce'` - Functions calls are grouped
 * - `'throttle'` - Functions are called at most once per interval
 *
 * _For the following examples, assume each `x` or `-` take 100ms and that the limit interval is 200ms:_
 *
 * - _`x` means function call_
 * - _`-` means nothing happened_
 *
 * If a function is called like: `x--xxxx--x`
 *
 * **Debouncing**
 *
 * With debouncing, calls are grouped as long as repeated calls are requested within the limiting interval.
 *
 * - with leading edge debouncing, the function is run like `x--x-----x`
 * - with trailing edge debouncing, the function is run like `---x------x---x`
 * - with both leading and trailing edge debouncing, the function is run like `x--x-----xx`
 *
 * **Throttling**
 *
 * With throttling, calls are run at most once per limiting interval.
 *
 * - with leading edge throttling, the function is run like `x--x--x--x`
 * - with trailing edge throttling, the function is run like `---x--x--x--x`
 * - with both leading and trailing edge throttling, the function is run like `x--x--x--x--x`
 */
export type LimitType = 'none' | 'debounce' | 'throttle';
