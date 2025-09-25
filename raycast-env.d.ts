/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Play sound effects through current output - Play system sounds through current output. */
  "systemOutput": boolean,
  /** Favourite Output Device - The name, as found in the output device list, of the output device to use as the first favourite */
  "favourite": string,
  /** Favourite Output Device 2 - The name, as found in the output device list, of the output device to use as the second favourite */
  "favourite2": string,
  /** Enable Automatic Priority Switching - Automatically switch to the highest priority available device when audio devices connect or disconnect */
  "enableAutoSwitch": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `set-output-device` command */
  export type SetOutputDevice = ExtensionPreferences & {}
  /** Preferences accessible in the `set-input-device` command */
  export type SetInputDevice = ExtensionPreferences & {}
  /** Preferences accessible in the `favourite` command */
  export type Favourite = ExtensionPreferences & {}
  /** Preferences accessible in the `toggle-favourites` command */
  export type ToggleFavourites = ExtensionPreferences & {}
  /** Preferences accessible in the `list-devices` command */
  export type ListDevices = ExtensionPreferences & {}
  /** Preferences accessible in the `priority-monitor` command */
  export type PriorityMonitor = ExtensionPreferences & {}
  /** Preferences accessible in the `use-combo1` command */
  export type UseCombo1 = ExtensionPreferences & {
  /** Combo Name - A friendly name for this device combination */
  "comboName": string,
  /** Input Device - The name of the input device for this combo */
  "input": string,
  /** Output Device - The name of the output device for this combo */
  "output": string
}
  /** Preferences accessible in the `use-combo2` command */
  export type UseCombo2 = ExtensionPreferences & {
  /** Combo Name - A friendly name for this device combination */
  "comboName": string,
  /** Input Device - The name of the input device for this combo */
  "input": string,
  /** Output Device - The name of the output device for this combo */
  "output": string
}
  /** Preferences accessible in the `use-combo3` command */
  export type UseCombo3 = ExtensionPreferences & {
  /** Combo Name - A friendly name for this device combination */
  "comboName": string,
  /** Input Device - The name of the input device for this combo */
  "input": string,
  /** Output Device - The name of the output device for this combo */
  "output": string
}
}

declare namespace Arguments {
  /** Arguments passed to the `set-output-device` command */
  export type SetOutputDevice = {}
  /** Arguments passed to the `set-input-device` command */
  export type SetInputDevice = {}
  /** Arguments passed to the `favourite` command */
  export type Favourite = {}
  /** Arguments passed to the `toggle-favourites` command */
  export type ToggleFavourites = {}
  /** Arguments passed to the `list-devices` command */
  export type ListDevices = {}
  /** Arguments passed to the `priority-monitor` command */
  export type PriorityMonitor = {}
  /** Arguments passed to the `use-combo1` command */
  export type UseCombo1 = {}
  /** Arguments passed to the `use-combo2` command */
  export type UseCombo2 = {}
  /** Arguments passed to the `use-combo3` command */
  export type UseCombo3 = {}
}

