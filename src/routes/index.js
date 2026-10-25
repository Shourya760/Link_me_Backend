import userRoutes from "./user.routes.js"
import profileRoutes from "./profile.routes.js"


const registerRoutes = (app) => {
  app.use("/api", userRoutes);
  app.use("/api", profileRoutes);
};

export default registerRoutes;
