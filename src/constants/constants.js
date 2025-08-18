const isProduction = import.meta.env.MODE !== "production";
export const apiDomain = isProduction ? "" : "http://localhost:5000";