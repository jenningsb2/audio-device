import { LocalStorage } from "@raycast/api";

const OUTPUT_PRIORITY_KEY = "outputPriorityList";
const INPUT_PRIORITY_KEY = "inputPriorityList";

export async function getOutputPriorityList(): Promise<string[]> {
  const stored = await LocalStorage.getItem<string>(OUTPUT_PRIORITY_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function getInputPriorityList(): Promise<string[]> {
  const stored = await LocalStorage.getItem<string>(INPUT_PRIORITY_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function setOutputPriorityList(priorityList: string[]): Promise<void> {
  await LocalStorage.setItem(OUTPUT_PRIORITY_KEY, JSON.stringify(priorityList));
}

export async function setInputPriorityList(priorityList: string[]): Promise<void> {
  await LocalStorage.setItem(INPUT_PRIORITY_KEY, JSON.stringify(priorityList));
}

export function assignPriorityRanks(devices: any[], priorityList: string[]): any[] {
  return devices.map((device) => {
    const existingIndex = priorityList.findIndex((name) => name.toLowerCase() === device.name.toLowerCase());

    let priorityRank: number;

    if (existingIndex !== -1) {
      // Device is in existing priority list
      priorityRank = existingIndex + 1;
    } else {
      // Device not in priority list - assign to bottom
      priorityRank = priorityList.length + 1;
    }

    return {
      ...device,
      priorityRank,
    };
  });
}

export async function ensureAllDevicesInPriorityList(devices: any[], isOutput: boolean): Promise<string[]> {
  const currentPriorityList = isOutput ? await getOutputPriorityList() : await getInputPriorityList();
  const allDeviceNames = devices.map((d) => d.name);

  // Add any missing devices to the end of the priority list
  const missingDevices = allDeviceNames.filter(
    (name) => !currentPriorityList.some((priorityName) => priorityName.toLowerCase() === name.toLowerCase()),
  );

  const updatedPriorityList = [...currentPriorityList, ...missingDevices];

  // Save the updated list if we added any devices
  if (missingDevices.length > 0) {
    if (isOutput) {
      await setOutputPriorityList(updatedPriorityList);
    } else {
      await setInputPriorityList(updatedPriorityList);
    }
  }

  return updatedPriorityList;
}
