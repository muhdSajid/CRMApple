const isProduction = import.meta.env.MODE !== "production";
export const apiDomain = isProduction ? "" : "http://localhost:8081";
export const authApiDomain = "http://localhost:8081";