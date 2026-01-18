import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  console.error("[MongoDB] ERROR: MONGODB_URI is not defined in .env.local");
  throw new Error("Please add MONGODB_URI to .env.local");
}

const uri = process.env.MONGODB_URI;
console.log("[MongoDB] Connecting to:", uri.replace(/\/\/.*@/, "//***:***@")); // Hide credentials in log

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In development, use a global variable to preserve the connection
// across hot reloads
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    console.log("[MongoDB] Creating new connection (development)");
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .then((client) => {
        console.log("[MongoDB] Connected successfully!");
        return client;
      })
      .catch((error) => {
        console.error("[MongoDB] Connection FAILED:", error.message);
        throw error;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  console.log("[MongoDB] Creating new connection (production)");
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then((client) => {
      console.log("[MongoDB] Connected successfully!");
      return client;
    })
    .catch((error) => {
      console.error("[MongoDB] Connection FAILED:", error.message);
      throw error;
    });
}

export default clientPromise;
