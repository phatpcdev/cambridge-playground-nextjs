import axios from "axios";

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isCancel(error)) return "Canceled";

  if (error instanceof Error || axios.isAxiosError(error)) {
    return error.message;
  }

  return "Something went wrong";
};
