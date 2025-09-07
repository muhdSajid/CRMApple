const isProduction = import.meta.env.MODE === "production";

// Use proxy path for development, full URL for production
export const apiDomain = isProduction ? "" : "";
export const authApiDomain = "http://localhost:8081";