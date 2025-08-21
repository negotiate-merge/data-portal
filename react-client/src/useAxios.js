import api from "./httpClient";
import { useContext, useEffect } from "react";
import { UserContext } from "./UserContext";


function useAxios() {
  const { user } = useContext(UserContext);

  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      (config) => {
        if (user?.jwt) {
          // Add token to header
          config.headers.Authorization = `Bearer ${user.jwt}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(interceptor);
    }
  }, [user]);
  return api;
}
export default useAxios;