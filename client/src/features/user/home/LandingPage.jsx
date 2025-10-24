import React, { useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";

const LandingPage = () => {
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await axiosInstance.get("/home");
        console.log("Home data:", response.data);
      } catch (error) {
        console.error("Error fetching home data:", error);
      }
    };
    fetchHomeData();
  }, []);
  return <div>LandingPage</div>;
};

export default LandingPage;
