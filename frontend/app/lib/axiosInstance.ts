import axios from "axios";
import { GetBaseUrl } from "./utils";

const axiosInstance = axios.create({
  baseURL: GetBaseUrl(),
  // baseURL: "http://147.182.131.129/",
  timeout: 20000,
  // withCredentials: true,

  headers: {
    common: {
      Authorization:
        typeof window !== "undefined" && localStorage.getItem("token")
          ? "Bearer " + localStorage.getItem("token")
          : null,
      accept: "application/json",
    },
  },
});

export const setAxiosAuthToken = (token: string) => {
  if (typeof token !== "undefined" && token) {
    axiosInstance.defaults.headers.common["Authorization"] = "Bearer " + token;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

export default axiosInstance;
