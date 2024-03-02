import { v4 as uuidv4 } from "uuid";

export const assignUUID = (obj: any) => {
  obj.id = uuidv4();
  return obj;
};

export const isValidString = (value: any): boolean => {
  return typeof value === "string" && value.trim() !== "";
};
