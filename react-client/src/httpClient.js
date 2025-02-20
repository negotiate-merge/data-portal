import axios from "axios";

export default axios.create({
  baseURL: '/api',  // 'http://34.129.37.135:5000',
  withCredentials: true,
});