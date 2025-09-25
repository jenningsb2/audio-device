import { Action, ActionPanel, Color, Icon, Keyboard, List, showHUD, showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { getInputDevices, getOutputDevices, TransportType } from "./audio-device";
import {
  getOutputPriorityList,
  getInputPriorityList,
  setOutputPriorityList,
  setInputPriorityList,
  getPriorityRank,
} from "./priority-utils";

type Device = {
  id: string;
  uid: string;
  name: string;
  transportType: string;
  isInput: boolean;
  isOutput: boolean;
  priorityRank: number | null;
};

export default function ListDevices() {
  const {
    data: deviceData,
    isLoading,
    revalidate,
  } = usePromise(async () => {
    const [outputDevices, inputDevices, outputPriorityList, inputPriorityList] = await Promise.all([
      getOutputDevices(),
      getInputDevices(),
      getOutputPriorityList(),
      getInputPriorityList(),
    ]);

    const processedOutputDevices = outputDevices.map((device) => ({
      ...device,
      transportType: Object.entries(TransportType).find(([, v]) => v === device.transportType)?.[0] || "Unknown",
      priorityRank: getPriorityRank(device.name, outputPriorityList),
    }));

    const processedInputDevices = inputDevices.map((device) => ({
      ...device,
      transportType: Object.entries(TransportType).find(([, v]) => v === device.transportType)?.[0] || "Unknown",
      priorityRank: getPriorityRank(device.name, inputPriorityList),
    }));

    // Sort devices: priority devices first (by rank), then non-priority alphabetically
    processedOutputDevices.sort((a, b) => {
      if (a.priorityRank && b.priorityRank) {
        return a.priorityRank - b.priorityRank; // Lower rank number = higher priority
      }
      if (a.priorityRank && !b.priorityRank) return -1; // Priority devices first
      if (!a.priorityRank && b.priorityRank) return 1; // Priority devices first
      return a.name.localeCompare(b.name); // Alphabetical for non-priority
    });

    processedInputDevices.sort((a, b) => {
      if (a.priorityRank && b.priorityRank) {
        return a.priorityRank - b.priorityRank; // Lower rank number = higher priority
      }
      if (a.priorityRank && !b.priorityRank) return -1; // Priority devices first
      if (!a.priorityRank && b.priorityRank) return 1; // Priority devices first
      return a.name.localeCompare(b.name); // Alphabetical for non-priority
    });

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
        showHUD(`Set ${device.name} as top priority output device`);
      } else {
        const currentList = await getInputPriorityList();
        const newList = [
          device.name,
          ...currentList.filter((name) => name.toLowerCase() !== device.name.toLowerCase()),
        ];
        await setInputPriorityList(newList);
        showHUD(`Set ${device.name} as top priority input device`);
      }
      revalidate();
    } catch (error) {
      showToast({ style: Toast.Style.Failure, title: "Failed to set priority" });
    }
  };

  const addToPriorityList = async (device: Device) => {
    try {
      if (device.isOutput) {
        const currentList = await getOutputPriorityList();
        if (!currentList.some((name) => name.toLowerCase() === device.name.toLowerCase())) {
          await setOutputPriorityList([...currentList, device.name]);
          showHUD(`Added ${device.name} to output priority list`);
        }
      } else {
        const currentList = await getInputPriorityList();
        if (!currentList.some((name) => name.toLowerCase() === device.name.toLowerCase())) {
          await setInputPriorityList([...currentList, device.name]);
          showHUD(`Added ${device.name} to input priority list`);
        }
      }
      revalidate();
    } catch (error) {
      showToast({ style: Toast.Style.Failure, title: "Failed to add to priority list" });
    }
  };

  const removeFromPriorityList = async (device: Device) => {
    try {
      if (device.isOutput) {
        const currentList = await getOutputPriorityList();
        const newList = currentList.filter((name) => name.toLowerCase() !== device.name.toLowerCase());
        await setOutputPriorityList(newList);
        showHUD(`Removed ${device.name} from output priority list`);
      } else {
        const currentList = await getInputPriorityList();
        const newList = currentList.filter((name) => name.toLowerCase() !== device.name.toLowerCase());
        await setInputPriorityList(newList);
        showHUD(`Removed ${device.name} from input priority list`);
      }
      revalidate();
    } catch (error) {
      showToast({ style: Toast.Style.Failure, title: "Failed to remove from priority list" });
    }
  };

  const renderDeviceActions = (device: Device) => (
    <ActionPanel>
      {device.priorityRank ? (
        <ActionPanel.Section title="Priority Actions">
          <Action
            title="Set as Top Priority"
            icon={Icon.ChevronUp}
            onAction={() => setAsTopPriority(device)}
            shortcut={{ modifiers: ["cmd"], key: "t" }}
          />
          <Action
            title="Remove from Priority List"
            icon={Icon.Trash}
            style={Action.Style.Destructive}
            onAction={() => removeFromPriorityList(device)}
            shortcut={{ modifiers: ["cmd"], key: "backspace" }}
          />
        </ActionPanel.Section>
      ) : (
        <ActionPanel.Section title="Priority Actions">
          <Action
            title="Add to Priority List"
            icon={Icon.Plus}
            onAction={() => addToPriorityList(device)}
            shortcut={{ modifiers: ["cmd"], key: "return" }}
          />
        </ActionPanel.Section>
      )}

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
            showHUD(`${device.name}\nType: ${device.transportType}\nID: ${device.id}\nUID: ${device.uid}`);
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
            subtitle={device.transportType}
            icon={{
              source: getDeviceIcon(device),
              tintColor: device.priorityRank ? Color.Green : Color.PrimaryText,
            }}
            accessories={[
              ...(device.priorityRank
                ? [{ text: `#${device.priorityRank}`, tooltip: `Priority rank ${device.priorityRank}` }]
                : []),
              { text: device.id, tooltip: `Device ID: ${device.id}` },
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
            subtitle={device.transportType}
            icon={{
              source: getDeviceIcon(device),
              tintColor: device.priorityRank ? Color.Green : Color.PrimaryText,
            }}
            accessories={[
              ...(device.priorityRank
                ? [{ text: `#${device.priorityRank}`, tooltip: `Priority rank ${device.priorityRank}` }]
                : []),
              { text: device.id, tooltip: `Device ID: ${device.id}` },
            ]}
            actions={renderDeviceActions(device)}
          />
        ))}
      </List.Section>
    </List>
  );
}
