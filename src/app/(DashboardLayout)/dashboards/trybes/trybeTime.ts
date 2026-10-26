import { format, parseISO } from "date-fns";

// Date and time in the viewer's zone, for lists that load in the browser.
export const dateTime = (at: string) => {
  try {
    return format(parseISO(at), "d MMM yyyy, HH:mm");
  } catch {
    return at;
  }
};
