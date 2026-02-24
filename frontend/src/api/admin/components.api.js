import apiClient from '../apiClient';

export const activateComponent = async (token, componentId) => {
  const { data } = await apiClient.put(`/api/components/${componentId}/active`, { active: true }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
