import axios from "axios";

export default axios.create({
  baseURL: 'http://192.168.19.4:5000',
  withCredentials: true,
});