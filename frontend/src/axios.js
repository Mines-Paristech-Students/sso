import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8100",
});

export default instance;
