  const { data:authData, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/me");
      return res.data;
    },
    retry: false,
  });
