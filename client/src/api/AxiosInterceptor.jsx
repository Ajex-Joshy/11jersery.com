import { useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import axiosInstance from "./axiosInstance";

const AxiosInterceptor = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  const token = keycloak.token; // 1. Get the token

  useEffect(() => {
    if (!initialized) return; // skip effect until ready

    const interceptor = axiosInstance.interceptors.request.use(
      async (config) => {
        if (keycloak?.token) {
          try {
            await keycloak.updateToken(30, {
              extraQueryParams: {
                audience: "11jersey.com-api",
              },
            });
            config.headers.Authorization = `Bearer ${keycloak.token}`;
          } catch (error) {
            console.error("Failed to refresh token:", error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axiosInstance.interceptors.request.eject(interceptor);
    };
  }, [keycloak, initialized]);

  // Render the children (your app)
  return <>{children}</>;
};

export default AxiosInterceptor;
