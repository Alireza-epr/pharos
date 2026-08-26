import {
  IConfigJSON,
  IEventDetection,
  IEventSchema,
  IRejectedEventSchema,
  ISortOption,
} from "@packages/types";
import { deepSortObject, deepStripHidden } from "./generalUtils";
import { EHiddenConfig } from "@packages/enum";

export const getSortValue = (obj: any, path: string) => {
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .reduce((acc, key) => acc?.[key], obj);
};

export const compareValues = (a: any, b: any) => {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  if (typeof a === "string" && typeof b === "string") {
    if (a !== "" && b !== "" && !isNaN(Number(a)) && !isNaN(Number(b))) {
      return Number(a) - Number(b);
    }
    return a.localeCompare(b);
  }

  return a - b;
};

export const sortEventSchema = (
  a_EventSchemas: (IEventSchema | IRejectedEventSchema)[],
  a_SortOptions: ISortOption[] = [
    { sortBy: "timestamp_utc", direction: "asc" },
    { sortBy: "event_id", direction: "asc" },
  ],
): (IEventSchema | IRejectedEventSchema)[] => {
  const { accepted, rejected } = a_EventSchemas.reduce(
    (acc, event) => {
      if (event.rejected) {
        acc.rejected.push(event);
      } else {
        acc.accepted.push(event);
      }

      return acc;
    },
    {
      accepted: [] as IEventSchema[],
      rejected: [] as IRejectedEventSchema[],
    },
  );

  const multiSort = (a: any, b: any) => {
    for (const { sortBy, direction = "asc" } of a_SortOptions) {
      const valA = getSortValue(a, sortBy);
      const valB = getSortValue(b, sortBy);

      const result = compareValues(valA, valB);

      if (result !== 0) {
        return direction === "asc" ? result : -result;
      }
    }
    return 0;
  };

  if (accepted.length > 0) {
    for (const option of a_SortOptions) {
      if (
        option.direction &&
        option.direction !== "asc" &&
        option.direction !== "desc"
      ) {
        throw new Error(
          `[sortEventSchema] Invalid direction "${option.direction}" for sortBy "${option.sortBy}". Allowed values are "asc" or "desc".`,
        );
      }
      const fieldExists = accepted.some(
        (event) => getSortValue(event, option.sortBy) !== undefined,
      );

      if (!fieldExists) {
        throw new Error(
          `[sortEventSchema] Invalid sortBy field: "${option.sortBy}"`,
        );
      }
    }
    accepted.sort(multiSort);
  }

  return [...deepSortObject(accepted), ...deepSortObject(rejected)];
};

export const stripHiddenConfiguration = (a_Configurations: IConfigJSON[]) => {
  const hiddenKeys = Object.values(EHiddenConfig) as EHiddenConfig[];

  const filteredConfiguration = deepStripHidden(
    a_Configurations,
    new Set(hiddenKeys),
  ) as IConfigJSON[];

  return filteredConfiguration;
};

export const groupByRejection = (
  a_Events: (IEventSchema | IRejectedEventSchema)[],
): IEventDetection =>
  a_Events.reduce<IEventDetection>(
    (acc, curr) => {
      if (curr.rejected) acc.rejected.push(curr);
      else acc.valid.push(curr);
      return acc;
    },
    { valid: [], rejected: [] },
  );
