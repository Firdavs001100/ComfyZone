import express from "express";
import makeUploader from "./libs/utils/uploader";
import adminController from "./controller/admin.controller";
import productController from "./controller/product.controller";
import providerController from "./controller/provider.controller";
const routerAdmin = express.Router();

/** ADMIN */
routerAdmin.get("/", adminController.goHome);
routerAdmin
  .get("/signup", adminController.getSignup)
  .post(
    "/signup",
    makeUploader("members").single("memberImage"),
    adminController.processSignup,
  );
routerAdmin
  .get("/login", adminController.getLogin)
  .post("/login", adminController.processLogin);
routerAdmin.get("/logout", adminController.logout);
routerAdmin.get("/check-me", adminController.checkAuthSession);

/** PROVIDER */
routerAdmin.get("/provider/all", providerController.getProvidersByAdmin);
routerAdmin.post(
  "/provider/create",
  adminController.verifyAdmin,
  makeUploader("providers").single("providerLogo"),
  providerController.createProvider,
);
routerAdmin.post(
  "/provider/:id",
  adminController.verifyAdmin,
  makeUploader("providers").single("providerLogo"),
  providerController.updateProvider,
);

/** PRODUCT */
routerAdmin.get(
  "/product/all",
  adminController.verifyAdmin,
  productController.getAllProducts,
);
routerAdmin.post(
  "/product/create",
  adminController.verifyAdmin,
  makeUploader("products").array("productImages", 5),
  productController.createNewProduct,
);
routerAdmin.post(
  "/product/:id",
  adminController.verifyAdmin,
  productController.updateChosenProduct,
);

/** USER */
routerAdmin.get(
  "/users/all",
  adminController.verifyAdmin, // middleware
  adminController.getUsers,
);

routerAdmin.post(
  "/users/edit",
  adminController.verifyAdmin, // middleware
  adminController.updateChosenUser,
);
export default routerAdmin;
