import postgres from 'postgres';

export async function checkHealth(connectionString?: string): Promise<void> {
  // Check database connectivity
  try {
    if (!connectionString) {
      throw new Error('No database connection string provided');
    }

    // Create a direct postgres connection for health check to avoid drizzle version conflicts
    const client = postgres(connectionString, {
      prepare: false,
      max: 1, // Only need one connection for health check
    });

    // Simple query to test database connection
    await client`SELECT 1 as test`;

    // Close the connection
    await client.end();
  } catch (error) {
    throw new Error(
      `Database connection failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }

  // Add other health checks here as needed:
  // - External service connectivity
  // - File system access
  // - Memory usage checks
  // - etc.
}
