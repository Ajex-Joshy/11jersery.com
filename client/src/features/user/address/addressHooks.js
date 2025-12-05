import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddressById,
} from "./addressApis";

const ADDRESS_KEY = ["addresses"];

export const useAddresses = () => {
  return useQuery({
    queryKey: ADDRESS_KEY,
    queryFn: getAddresses,
    staleTime: 1000 * 60 * 5, // optional
  });
};

export const useGetAddressById = (id, options = {}) => {
  return useQuery({
    queryKey: ["address", id],
    queryFn: () => getAddressById(id),
    enabled: !!id && id !== "new" && options.enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useAddAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_KEY });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ addressId, data }) => updateAddress(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_KEY });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_KEY });
    },
  });
};
