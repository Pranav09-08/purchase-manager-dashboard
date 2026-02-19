// Lightweight database connectivity check on startup
const supabase = require("../config/supabase");

async function initDatabase() {
  try {
    // Just test connection
    const { data, error } = await supabase
      .from("Company")
      .select("*")
      .limit(1);

    if (error) {
      console.log("Table not ready yet:", error.message);
    } else {
      console.log("Database connected successfully");
    }
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}

module.exports = initDatabase;
