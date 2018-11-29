/**
 * Copyright 2018-present Facebook.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @format
 * @flow
 */

import {FlipperDevicePlugin, Device} from 'flipper';
import type {Notification} from '../../plugin';

type Crash = {|
  notificationID: number,
  callStack: [string],
  reason: string,
  name: string,
|};
type PersistedState = {|
  crashes: Array<Crash>,
|};

export default class CrashReporterPlugin extends FlipperDevicePlugin {
  static title = 'Crash Reporter';
  static id = 'CrashReporter';
  static icon = 'apps';

  static defaultPersistedState = {
    crashes: [],
  };

  static supportsDevice(device: Device) {
    return device.os === 'iOS' || device.os === 'Android';
  }
  /*
   * Reducer to process incoming "send" messages from the mobile counterpart.
   */
  static persistedStateReducer = (
    persistedState: PersistedState,
    method: string,
    payload: Object,
  ): PersistedState => {
    if (method === 'crash-report') {
      return {
        ...persistedState,
        crashes: persistedState.crashes.concat([
          {
            notificationID: Math.random(), // All notifications are unique
            callStack: payload.callstack,
            name: payload.name,
            reason: payload.reason,
          },
        ]),
      };
    }
    return persistedState;
  };

  /*
   * Callback to provide the currently active notifications.
   */
  static getActiveNotifications = (
    persistedState: PersistedState,
  ): Array<Notification> => {
    return persistedState.crashes.map((crash: Crash) => {
      return {
        id: 'crash-notification:' + crash.notificationID,
        message: crash.callStack,
        severity: 'error',
        title: 'CRASH: ' + crash.name + ' ' + crash.reason,
      };
    });
  };

  render() {
    return 'Dedicated space to debug crashes. Look out for crash notifications.';
  }
}
