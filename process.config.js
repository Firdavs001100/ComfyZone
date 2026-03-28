module.exports = {
  apps: [
    {
      name: "COMFYZONE", // App name in PM2
      cwd: "./", // Current working directory
      script: "./dist/server.js", // Entry point
      watch: false, // Disable watch mode in production

      instances: 1, // Number of instances
      exec_mode: "cluster", // Cluster mode for load balancing

      env: {
        // Production environment
        NODE_ENV: "production",
      },

      env_development: {
        // Development environment
        NODE_ENV: "development",
      },
    },
  ],
};
