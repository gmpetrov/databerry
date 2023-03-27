import axios from 'axios';

const triggerTaskRemoveDatasource = async (
  datastoreId: string,
  datasourceId: string
) => {
  return axios.post(
    `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/tasks/remove-datasource`,
    {
      datastoreId,
      datasourceId,
    }
  );
};

export default triggerTaskRemoveDatasource;
