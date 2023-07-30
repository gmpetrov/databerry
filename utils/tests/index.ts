import axios from 'axios';

export const testHttp = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DASHBOARD_URL,
  headers: {
    Authorization: `Bearer ${process.env.TEST_USER_API_KEY}`,
  },
});
