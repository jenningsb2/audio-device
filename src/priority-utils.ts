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

export function getPriorityRank(deviceName: string, priorityList: string[]): number | null {
  const index = priorityList.findIndex((name) => name.toLowerCase() === deviceName.toLowerCase());
  return index !== -1 ? index + 1 : null;
}
