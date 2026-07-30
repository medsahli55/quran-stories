// netlify/edge-functions/auth-gate.js
//
// Simple password gate for the whole site using HTTP Basic Auth.
// Set SITE_PASSWORD in Netlify: Site settings → Environment variables.
// Username can be anything (e.g. "kissas"); only the password is checked.

export default async (request, context) => {
  const password = Netlify.env.get("SITE_PASSWORD");

  // If no password is configured, don't lock anyone out by accident.
  if (!password) {
    return context.next();
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const separatorIndex = decoded.indexOf(":");
      const suppliedPassword = decoded.slice(separatorIndex + 1);

      if (suppliedPassword === password) {
        return context.next();
      }
    }
  }

  return new Response("Password required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Kissas", charset="UTF-8"',
    },
  });
};

export const config = {
  path: "/*",
};
