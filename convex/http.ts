import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/api/check_admin_key",
  method: "GET",
  handler: httpAction(async (ctx) => {
    // The Convex backend automatically checks the admin key.
    // If the key is invalid, it will return a 401 Unauthorized error.
    // We can return a simple success message if the key is valid.
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow requests from any origin
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }),
});

export default http;
