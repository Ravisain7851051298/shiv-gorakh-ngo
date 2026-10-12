export default function getUserFacingError(error, fallback) {
  const message =
    typeof error === "string"
      ? error
      : error?.response?.data?.message ?? error?.message;

  return typeof message === "string" && message.trim() ? message : fallback;
}
