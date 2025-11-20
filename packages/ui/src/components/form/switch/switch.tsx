"use client";

import {
  Switch as AriaSwitch,
  composeRenderProps,
} from "react-aria-components";

import {
  switchContainerStyles,
  switchHandleStyles,
  switchStyles,
} from "./switch.styles";

import type { SwitchProps } from "./switch.types";

/**
 * Switch component - a toggle control for binary on/off states.
 * Accessible and keyboard navigable by default using React Aria.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <Switch>
 *   Enable notifications
 * </Switch>
 * ```
 *
 * @example
 * Controlled:
 * ```tsx
 * const [isEnabled, setIsEnabled] = useState(false);
 *
 * <Switch
 *   isSelected={isEnabled}
 *   onChange={setIsEnabled}
 * >
 *   Dark mode
 * </Switch>
 * ```
 *
 * @example
 * Disabled:
 * ```tsx
 * <Switch isDisabled>
 *   Unavailable option
 * </Switch>
 * ```
 *
 * @example
 * Read-only:
 * ```tsx
 * <Switch isReadOnly isSelected>
 *   Read-only setting
 * </Switch>
 * ```
 */
const Switch = ({ children, className, ...props }: SwitchProps) => (
  <AriaSwitch
    className={composeRenderProps(className, (className, renderProps) =>
      switchContainerStyles({ ...renderProps, className }),
    )}
    {...props}
  >
    {composeRenderProps(children, (children) => (
      <>
        <div className={switchStyles()}>
          <div className={switchHandleStyles()} />
        </div>
        {children}
      </>
    ))}
  </AriaSwitch>
);

Switch.displayName = "Switch";

export { Switch };
