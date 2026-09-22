import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME || "villagesquare-admin-webapp",
    attributes: {
      "service.namespace": "villagesquare",
      "deployment.environment":
        process.env.OTEL_DEPLOYMENT_ENVIRONMENT ||
        process.env.NODE_ENV ||
        "unknown",
    },
  });
}
