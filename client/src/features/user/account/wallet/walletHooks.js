import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../../api/axiosInstance";
export const WALLET_DATA_KEY = "walletData";

export const useWalletData = (params) => {
  return useQuery({
    queryKey: [WALLET_DATA_KEY, params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/wallet", { params });
      return data;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
  });
};
