import axios from 'axios';

const triggerTaskLoadDatasource = async (
  datasourceId: string,
  datasourceText?: string
) => {
  return axios.post(
    `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/tasks/load-datasource`,
    {
      datasourceId,
      datasourceText,
    }
  );
};

export default triggerTaskLoadDatasource;
