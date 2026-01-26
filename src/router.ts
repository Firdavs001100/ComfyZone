import express from "express";
import memberController from "./controller/member.controller";
import makeUploader from "./libs/utils/uploader";
import providerController from "./controller/provider.controller";
import productController from "./controller/product.controller";
import orderController from "./controller/order.controller";

const router = express.Router();

/** MEMBER */
router.post("/member/login", memberController.login);
router.post("/member/signup", memberController.signup);
router.post(
  "/member/logout",
  memberController.verifyAuth,
  memberController.logout,
);
router.get(
  "/member/detail",
  memberController.verifyAuth,
  memberController.getMemberDetail,
);

router.post(
  "/member/update",
  memberController.verifyAuth,
  makeUploader("members").single("memberImage"),
  memberController.updateMember,
);

/** PROVIDER */
router.get("/provider/all", providerController.getProviders);
router.get("/provider/top-providers", providerController.getTopProviders);
router.get(
  "/provider/:id",
  memberController.retrieveAuth,
  providerController.getProvider,
);
/** PRODUCT */
router.get("/product/all", productController.getProducts);
router.get(
  "/product/:id",
  memberController.retrieveAuth,
  productController.getProduct,
);

/** ORDER */
router.post(
  "/order/create",
  memberController.verifyAuth,
  orderController.createOrder,
);
router.get(
  "/order/all",
  memberController.verifyAuth,
  orderController.getMyOrders,
);
router.post(
  "/order/update",
  memberController.verifyAuth,
  orderController.updateOrder,
);

export default router;
