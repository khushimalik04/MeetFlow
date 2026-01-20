import { useQuery } from '@tanstack/react-query';
import { getAuthUser } from '../lib/api.js';
import { axiosInstance } from '../lib/axios.js';

const useAuthUser = () => {
  const authuser  = useQuery({
    queryKey: ['authUser'],
    queryFn: getAuthUser,
    retry: false,
  });
  return {isLoading: authuser.isLoading, authUser: authuser.data?.user};
};
//     queryFn: async () => {
//       const res = await axiosInstance.get("/auth/me");
//       return res.data;
//     },
//     retry: false,
//   });

//   return {
//     authUser: authData?.user,
//     isLoading
//   };
// };

export default useAuthUser;
