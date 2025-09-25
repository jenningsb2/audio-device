import { Action, ActionPanel, Color, Icon, Keyboard, List, showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { getInputDevices, getOutputDevices, TransportType } from "./audio-device";
import {
  getOutputPriorityList,
  getInputPriorityList,
  setOutputPriorityList,
  setInputPriorityList,
  getDeviceInfo,
  saveDeviceInfo,
} from "./priority-utils";

type Device = {
  id: string;
  uid: string;
  name: string;
  transportType: string;
  isInput: boolean;
  isOutput: boolean;
  priorityRank: number;
  isAvailable: boolean;
};

export default function ListDevices() {
  const {
    data: deviceData,
    isLoading,
    revalidate,
  } = usePromise(async () => {
    const [outputDevices, inputDevices] = await Promise.all([getOutputDevices(), getInputDevices()]);

    // Get existing priority lists (don't auto-add missing devices here)
    const [outputPriorityList, inputPriorityList] = await Promise.all([
      getOutputPriorityList(),
      getInputPriorityList(),
    ]);

    // Get stored device info for transport types of disconnected devices
    const [outputDeviceInfo, inputDeviceInfo] = await Promise.all([getDeviceInfo(true), getDeviceInfo(false)]);

    // Process transport types for storage
    const outputDevicesWithTransport = outputDevices.map((device) => ({
      ...device,
      transportType: Object.entries(TransportType).find(([, v]) => v === device.transportType)?.[0] || "Unknown",
    }));

    const inputDevicesWithTransport = inputDevices.map((device) => ({
      ...device,
      transportType: Object.entries(TransportType).find(([, v]) => v === device.transportType)?.[0] || "Unknown",
    }));

    // Save current device info for future reference
    await Promise.all([
      saveDeviceInfo(outputDevicesWithTransport, true),
      saveDeviceInfo(inputDevicesWithTransport, false),
    ]);

    // Create full device lists including unavailable devices from priority lists
    const createFullDeviceList = (availableDevices: any[], priorityList: string[], isOutput: boolean) => {
      const devices: Device[] = [];
      const storedDeviceInfo = isOutput ? outputDeviceInfo : inputDeviceInfo;

      // Add all devices from priority list (available or not)
      priorityList.forEach((deviceName, index) => {
        const availableDevice = availableDevices.find((d) => d.name.toLowerCase() === deviceName.toLowerCase());

        if (availableDevice) {
          // Device is currently available
          devices.push({
            ...availableDevice,
            priorityRank: index + 1,
            isAvailable: true,
          });
        } else {
          // Device is in priority list but not currently available - use stored transport type
          const storedInfo = storedDeviceInfo.find((info) => info.name.toLowerCase() === deviceName.toLowerCase());
          devices.push({
            id: "",
            uid: `unavailable-${deviceName}`,
            name: deviceName,
            transportType: storedInfo?.transportType || "Unknown",
            isInput: !isOutput,
            isOutput: isOutput,
            priorityRank: index + 1,
            isAvailable: false,
          });
        }
      });

      // Add any new available devices that aren't in priority list yet
      availableDevices.forEach((device) => {
        const alreadyIncluded = devices.some((d) => d.name.toLowerCase() === device.name.toLowerCase());
        if (!alreadyIncluded) {
          devices.push({
            ...device,
            priorityRank:
              priorityList.length +
              devices.filter((d) => !priorityList.some((p) => p.toLowerCase() === d.name.toLowerCase())).length +
              1,
            isAvailable: true,
          });
        }
      });

      return devices;
    };

    const processedOutputDevices = createFullDeviceList(outputDevicesWithTransport, outputPriorityList, true);
    const processedInputDevices = createFullDeviceList(inputDevicesWithTransport, inputPriorityList, false);

    // Sort devices by priority rank (lower rank = higher priority)
    processedOutputDevices.sort((a, b) => a.priorityRank - b.priorityRank);
    processedInputDevices.sort((a, b) => a.priorityRank - b.priorityRank);

    return {
      outputDevices: processedOutputDevices,
      inputDevices: processedInputDevices,
    };
  }, []);

  if (isLoading) {
    return <List isLoading={true} />;
  }

  if (!deviceData) {
    return (
      <List>
        <List.EmptyView
          title="No Devices Found"
          description="No audio devices are currently available"
          icon={Icon.SpeakerOn}
        />
      </List>
    );
  }

  const setAsTopPriority = async (device: Device) => {
    try {
      if (device.isOutput) {
        const currentList = await getOutputPriorityList();
        const newList = [
          device.name,
          ...currentList.filter((name) => name.toLowerCase() !== device.name.toLowerCase()),
        ];
        await setOutputPriorityList(newList);
        showToast({ style: Toast.Style.Success, title: `Set ${device.name} as top priority output device` });
      } else {
        const currentList = await getInputPriorityList();
        const newList = [
          device.name,
          ...currentList.filter((name) => name.toLowerCase() !== device.name.toLowerCase()),
        ];
        await setInputPriorityList(newList);
        showToast({ style: Toast.Style.Success, title: `Set ${device.name} as top priority input device` });
      }
      revalidate();
    } catch (error) {
      showToast({ style: Toast.Style.Failure, title: "Failed to set priority" });
    }
  };

  const moveUp = async (device: Device) => {
    try {
      const currentList = device.isOutput ? await getOutputPriorityList() : await getInputPriorityList();
      const currentIndex = currentList.findIndex((name) => name.toLowerCase() === device.name.toLowerCase());

      if (currentIndex > 0) {
        const newList = [...currentList];
        // Swap with the device above
        [newList[currentIndex], newList[currentIndex - 1]] = [newList[currentIndex - 1], newList[currentIndex]];

        if (device.isOutput) {
          await setOutputPriorityList(newList);
        } else {
          await setInputPriorityList(newList);
        }

        showToast({ style: Toast.Style.Success, title: `Moved ${device.name} up in priority` });
        revalidate();
      }
    } catch (error) {
      showToast({ style: Toast.Style.Failure, title: "Failed to move device up" });
    }
  };

  const moveDown = async (device: Device) => {
    try {
      const currentList = device.isOutput ? await getOutputPriorityList() : await getInputPriorityList();
      const currentIndex = currentList.findIndex((name) => name.toLowerCase() === device.name.toLowerCase());

      if (currentIndex < currentList.length - 1 && currentIndex !== -1) {
        const newList = [...currentList];
        // Swap with the device below
        [newList[currentIndex], newList[currentIndex + 1]] = [newList[currentIndex + 1], newList[currentIndex]];

        if (device.isOutput) {
          await setOutputPriorityList(newList);
        } else {
          await setInputPriorityList(newList);
        }

        showToast({ style: Toast.Style.Success, title: `Moved ${device.name} down in priority` });
        revalidate();
      }
    } catch (error) {
      showToast({ style: Toast.Style.Failure, title: "Failed to move device down" });
    }
  };

  const moveToBottom = async (device: Device) => {
    try {
      if (device.isOutput) {
        const currentList = await getOutputPriorityList();
        const newList = [
          ...currentList.filter((name) => name.toLowerCase() !== device.name.toLowerCase()),
          device.name,
        ];
        await setOutputPriorityList(newList);
        showToast({ style: Toast.Style.Success, title: `Moved ${device.name} to bottom of output priority list` });
      } else {
        const currentList = await getInputPriorityList();
        const newList = [
          ...currentList.filter((name) => name.toLowerCase() !== device.name.toLowerCase()),
          device.name,
        ];
        await setInputPriorityList(newList);
        showToast({ style: Toast.Style.Success, title: `Moved ${device.name} to bottom of input priority list` });
      }
      revalidate();
    } catch (error) {
      showToast({ style: Toast.Style.Failure, title: "Failed to move device" });
    }
  };

  const renderDeviceActions = (device: Device) => (
    <ActionPanel>
      <ActionPanel.Section title="Priority Actions">
        <Action
          title="Set as Top Priority"
          icon={Icon.ChevronUp}
          onAction={() => setAsTopPriority(device)}
          shortcut={{ modifiers: ["cmd"], key: "t" }}
        />
        {device.priorityRank > 1 && (
          <Action
            title="Move Up in Priority"
            icon={Icon.ArrowUp}
            onAction={() => moveUp(device)}
            shortcut={{ modifiers: ["cmd"], key: "arrowUp" }}
          />
        )}
        <Action
          title="Move Down in Priority"
          icon={Icon.ArrowDown}
          onAction={() => moveDown(device)}
          shortcut={{ modifiers: ["cmd"], key: "arrowDown" }}
        />
        <Action
          title="Move to Bottom"
          icon={Icon.ChevronDown}
          onAction={() => moveToBottom(device)}
          shortcut={{ modifiers: ["cmd"], key: "b" }}
        />
        {!device.isAvailable && (
          <Action
            title="Remove from Priority List"
            icon={Icon.Trash}
            style={Action.Style.Destructive}
            onAction={async () => {
              try {
                if (device.isOutput) {
                  const currentList = await getOutputPriorityList();
                  const newList = currentList.filter((name) => name.toLowerCase() !== device.name.toLowerCase());
                  await setOutputPriorityList(newList);
                  showToast({ style: Toast.Style.Success, title: `Removed ${device.name} from priority list` });
                } else {
                  const currentList = await getInputPriorityList();
                  const newList = currentList.filter((name) => name.toLowerCase() !== device.name.toLowerCase());
                  await setInputPriorityList(newList);
                  showToast({ style: Toast.Style.Success, title: `Removed ${device.name} from priority list` });
                }
                revalidate();
              } catch (error) {
                showToast({ style: Toast.Style.Failure, title: "Failed to remove device" });
              }
            }}
            shortcut={{ modifiers: ["cmd"], key: "backspace" }}
          />
        )}
      </ActionPanel.Section>

      <ActionPanel.Section title="Copy Actions">
        <Action.CopyToClipboard
          title="Copy Device Name"
          content={device.name}
          shortcut={Keyboard.Shortcut.Common.Copy}
        />
        <Action.CopyToClipboard
          title="Copy Device ID"
          content={device.id}
          shortcut={{ modifiers: ["cmd"], key: "i" }}
        />
        <Action.CopyToClipboard
          title="Copy Device UID"
          content={device.uid}
          shortcut={{ modifiers: ["cmd"], key: "u" }}
        />
      </ActionPanel.Section>

      <ActionPanel.Section title="Info">
        <Action
          title="Show Device Details"
          icon={Icon.Info}
          onAction={() => {
            showToast({
              style: Toast.Style.Success,
              title: device.name,
              message: `Type: ${device.transportType}\nID: ${device.id}\nUID: ${device.uid}`,
            });
          }}
          shortcut={{ modifiers: ["cmd"], key: "d" }}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );

  const getDeviceIcon = (device: Device): string => {
    // Check for AirPlay devices first
    if (device.transportType === "Airplay") {
      return "airplay.png";
    }

    // Check if it's a Bluetooth device
    if (device.transportType === "Bluetooth" || device.transportType === "BluetoothLowEnergy") {
      const name = device.name.toLowerCase();
      if (name.includes("airpods max")) {
        return "airpods-max.png";
      } else if (name.includes("airpods pro")) {
        return "airpods-pro.png";
      } else if (name.includes("airpods")) {
        return "airpods.png";
      }
      return "bluetooth-speaker.png";
    }

    // Default icons based on device type
    return device.isInput ? "mic.png" : "speaker.png";
  };

  return (
    <List searchBarPlaceholder="Search audio devices...">
      <List.Section title={`Output Devices (${deviceData.outputDevices.length})`}>
        {deviceData.outputDevices.map((device) => (
          <List.Item
            key={device.uid}
            title={device.name}
            subtitle={device.isAvailable ? device.transportType : `${device.transportType} (Disconnected)`}
            icon={{
              source: getDeviceIcon(device),
              tintColor: device.priorityRank === 1 && device.isAvailable ? Color.Green : Color.SecondaryText,
            }}
            accessories={[
              ...(device.isAvailable ? [{ text: device.id, tooltip: `Device ID: ${device.id}` }] : []),
              ...(!device.isAvailable ? [{ icon: Icon.WifiDisabled, tooltip: "Device disconnected" }] : []),
              { text: `#${device.priorityRank}`, tooltip: `Priority rank ${device.priorityRank}` },
            ]}
            actions={renderDeviceActions(device)}
          />
        ))}
      </List.Section>

      <List.Section title={`Input Devices (${deviceData.inputDevices.length})`}>
        {deviceData.inputDevices.map((device) => (
          <List.Item
            key={device.uid}
            title={device.name}
            subtitle={device.isAvailable ? device.transportType : `${device.transportType} (Disconnected)`}
            icon={{
              source: getDeviceIcon(device),
              tintColor: device.priorityRank === 1 && device.isAvailable ? Color.Green : Color.SecondaryText,
            }}
            accessories={[
              ...(device.isAvailable ? [{ text: device.id, tooltip: `Device ID: ${device.id}` }] : []),
              ...(!device.isAvailable ? [{ icon: Icon.WifiDisabled, tooltip: "Device disconnected" }] : []),
              { text: `#${device.priorityRank}`, tooltip: `Priority rank ${device.priorityRank}` },
            ]}
            actions={renderDeviceActions(device)}
          />
        ))}
      </List.Section>
    </List>
  );
}
