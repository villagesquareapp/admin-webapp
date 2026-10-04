import type { ApiResponse } from "@/lib/api";

export const GENERAL_CATEGORY_SCOPE = "general";

// type is what the category endpoints take: "general" or a Trybe type uuid.
export interface CategoryScope {
  type: string;
  label: string;
  trybeTypeId: string | null;
}

type Fetch<T> = () => Promise<ApiResponse<T> | null>;

// Fetches the Trybe types and the requested list together. An unknown type
// falls back to General, which costs a second categories call.
export const loadCategoryScope = async <T>(
  param: string | string[] | undefined,
  fetchTrybeTypes: Fetch<ITrybeType[]>,
  fetchCategories: (type: string) => Promise<ApiResponse<T[]> | null>
) => {
  const requested = (Array.isArray(param) ? param[0] : param) || GENERAL_CATEGORY_SCOPE;
  const [typesRes, listRes] = await Promise.all([fetchTrybeTypes(), fetchCategories(requested)]);
  const trybeTypes = Array.isArray(typesRes?.data) ? typesRes.data : [];

  const match = trybeTypes.find((t) => t.uuid === requested);
  const scope: CategoryScope = match
    ? { type: match.uuid, label: match.name, trybeTypeId: match.uuid }
    : { type: GENERAL_CATEGORY_SCOPE, label: "General", trybeTypeId: null };

  const res = scope.type === requested ? listRes : await fetchCategories(scope.type);
  const categories: T[] = Array.isArray(res?.data) ? res.data : [];
  return { trybeTypes, scope, categories };
};
