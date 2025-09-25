import { environment, LaunchType, getPreferenceValues, updateCommandMetadata, showHUD } from "@raycast/api";
import {
  getOutputDevices,
  getInputDevices,
  getDefaultOutputDevice,
  getDefaultInputDevice,
  setDefaultOutputDevice,
  setDefaultInputDevice,
  setDefaultSystemDevice,
} from "./audio-device";
import { getOutputPriorityList, getInputPriorityList } from "./priority-utils";

interface Preferences {
  enableAutoSwitch: boolean;
  systemOutput: boolean;
}

export default async function PriorityMonitor() {
  const preferences = getPreferenceValues<Preferences>();
  const isBackground = environment.launchType === LaunchType.Background;

  try {
    // Get current devices and priority lists
    const [outputDevices, inputDevices, currentOutput, currentInput, outputPriorityList, inputPriorityList] =
      await Promise.all([
        getOutputDevices(),
        getInputDevices(),
        getDefaultOutputDevice(),
        getDefaultInputDevice(),
        getOutputPriorityList(),
        getInputPriorityList(),
      ]);

    // Find highest priority available devices
    const getHighestPriorityDevice = (devices: any[], priorityList: string[]) => {
      let highestPriorityDevice = null;
      let highestPriorityRank = Infinity;

      for (const device of devices) {
        const priorityIndex = priorityList.findIndex((name) => name.toLowerCase() === device.name.toLowerCase());

        if (priorityIndex !== -1) {
          const rank = priorityIndex + 1;
          if (rank < highestPriorityRank) {
            highestPriorityRank = rank;
            highestPriorityDevice = device;
          }
        }
      }

      return highestPriorityDevice;
    };

    const topOutputDevice = getHighestPriorityDevice(outputDevices, outputPriorityList);
    const topInputDevice = getHighestPriorityDevice(inputDevices, inputPriorityList);

    // Check if we need to switch and auto-switch is enabled
    const switchedDevices: string[] = [];

    if (preferences.enableAutoSwitch && isBackground) {
      // Check output device
      if (topOutputDevice && currentOutput.uid !== topOutputDevice.uid) {
        try {
          await setDefaultOutputDevice(topOutputDevice.id);
          if (preferences.systemOutput) {
            await setDefaultSystemDevice(topOutputDevice.id);
          }
          switchedDevices.push(`Output: ${topOutputDevice.name}`);
        } catch (error) {
          console.log("Failed to switch output device:", error);
        }
      }

      // Check input device
      if (topInputDevice && currentInput.uid !== topInputDevice.uid) {
        try {
          await setDefaultInputDevice(topInputDevice.id);
          switchedDevices.push(`Input: ${topInputDevice.name}`);
        } catch (error) {
          console.log("Failed to switch input device:", error);
        }
      }

      // Show notification if we switched devices
      if (switchedDevices.length > 0) {
        showHUD(`Auto-switched to ${switchedDevices.join(", ")}`);
      }
    }

    // Update command metadata with current status
    const outputStatus = topOutputDevice ? `#1: ${topOutputDevice.name}` : "No priority devices";
    const inputStatus = topInputDevice ? `#1: ${topInputDevice.name}` : "No priority devices";

    await updateCommandMetadata({
      subtitle: preferences.enableAutoSwitch
        ? `Auto: ${outputStatus.split(": ")[1] || "None"} | ${inputStatus.split(": ")[1] || "None"}`
        : "Auto-switch disabled",
    });
  } catch (error) {
    console.log("Priority monitor error:", error);
    await updateCommandMetadata({ subtitle: "Error checking priorities" });
  }
}
