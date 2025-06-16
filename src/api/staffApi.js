import apiClient from '../config/config';

// Create Manager
export const createManager = async (managerData) => {
  try {
    const response = await apiClient.post('/users/managers', managerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create School Nurse
export const createSchoolNurse = async (nurseData) => {
  try {
    const response = await apiClient.post('/users/school-nurses', nurseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}; 