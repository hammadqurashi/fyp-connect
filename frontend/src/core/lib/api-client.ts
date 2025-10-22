import { AppConfig } from "@/core/config";
import axios from "axios";

const ApiClient = axios.create({
  baseURL: `${AppConfig.baseUrl}/api/v1`,
});

export default ApiClient;
