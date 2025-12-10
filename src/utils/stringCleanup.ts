
// export const stringCleanup = (str: string) => {
//     return str.replace(/_/g, ' ');
// };

export const stringCleanup = (str?: string | null) => {
  if (!str) return "";
  return str.replace(/_/g, " ");
};

