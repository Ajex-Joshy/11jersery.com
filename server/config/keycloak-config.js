import session from "express-session";
import Keycloak from "keycloak-connect";

// 1. Create a session store
const memoryStore = new session.MemoryStore();

// 2. Define the configuration object manually
// We are adding "bearer-only" and "use-resource-role-mappings"
const keycloakConfig = {
  realm: "11jersey.com",
  "auth-server-url": "http://127.0.0.1:8080/",
  "ssl-required": "external",
  resource: "11jersey.com-api",
  credentials: {
    secret: "pmWj4Iyz9gGL52JLS8gX0SMe44ZnStKl",
  },
  "bearer-only": true,
  "confidential-port": 0,
  "verify-token-audience": false,
  "user-resource-role-mappings": true,
};
// 3. Initialize Keycloak with the config object
//    This bypasses the keycloak.json file
const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

// 4. Use ES module export to match your server.js
export { keycloak, memoryStore };
