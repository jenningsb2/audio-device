import { Action, ActionPanel, Color, Icon, Keyboard, List, showHUD } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { getInputDevices, getOutputDevices, TransportType } from "./audio-device";
import { getOutputPriorityList, getInputPriorityList, getPriorityRank } from "./priority-utils";

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
  const { data: deviceData, isLoading } = usePromise(async () => {
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

  const renderDeviceActions = (device: Device) => (
    <ActionPanel>
      <Action.CopyToClipboard title="Copy Device Name" content={device.name} shortcut={Keyboard.Shortcut.Common.Copy} />
      <Action.CopyToClipboard title="Copy Device ID" content={device.id} shortcut={{ modifiers: ["cmd"], key: "i" }} />
      <Action.CopyToClipboard
        title="Copy Device UID"
        content={device.uid}
        shortcut={{ modifiers: ["cmd"], key: "u" }}
      />
      <Action
        title="Show Device Details"
        icon={Icon.Info}
        onAction={() => {
          showHUD(`${device.name}\nType: ${device.transportType}\nID: ${device.id}\nUID: ${device.uid}`);
        }}
        shortcut={{ modifiers: ["cmd"], key: "d" }}
      />
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
