import { ROUTE_URL } from "../../const/route_url.const";

const RETURN_TO_KEY = "returnTo";

type LocationLike = {
  pathname?: string;
  search?: string;
  state?: unknown;
};

export type ProjectNavigationState = {
  returnTo?: string;
  from?: string;
};

const isInternalPath = (value: string) => value.startsWith("/");

export const buildReturnToPath = (location: Pick<LocationLike, "pathname" | "search">): string => {
  return `${location.pathname ?? ""}${location.search ?? ""}`;
};

export const withReturnToQuery = (path: string, returnTo: string): string => {
  const [pathname, rawQuery = ""] = path.split("?");
  const query = new URLSearchParams(rawQuery);
  query.set(RETURN_TO_KEY, returnTo);
  const queryString = query.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};

export const getReturnToFromLocation = (location: Pick<LocationLike, "search" | "state">): string | undefined => {
  const state = (location.state ?? null) as ProjectNavigationState | null;
  const fromState = state?.returnTo?.trim();
  if (fromState && isInternalPath(fromState)) {
    return fromState;
  }

  const query = new URLSearchParams(location.search ?? "");
  const fromQuery = query.get(RETURN_TO_KEY)?.trim();
  if (fromQuery && isInternalPath(fromQuery)) {
    return fromQuery;
  }

  return undefined;
};

export const buildProjectActionNavigation = (
  targetPath: string,
  location: Pick<LocationLike, "pathname" | "search">,
): { to: string; state: ProjectNavigationState } => {
  const returnTo = buildReturnToPath(location);
  return {
    to: withReturnToQuery(targetPath, returnTo),
    state: {
      from: "project-detail",
      returnTo,
    },
  };
};

export const resolveProjectBackTarget = (location: Pick<LocationLike, "search" | "state">, projectId?: string): string => {
  const returnTo = getReturnToFromLocation(location);
  if (returnTo) {
    return returnTo;
  }

  if (projectId) {
    return ROUTE_URL.PROJECT_DETAIL.replace(":id", projectId);
  }

  return ROUTE_URL.PROJECT_LIST;
};
