import { T } from "../libs/types/common";
import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "..//libs/Errors";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import {
  ProductInput,
  ProductInquiry,
  ProductUpdateInput,
} from "../libs/types/product";
import ProductService from "../models/Product.service";
import { ProductCategory, ProductType } from "../libs/enums/products.enum";
import { shapeIntoMongooseObjectId } from "../libs/config";

const productService = new ProductService();

const productController: T = {};

/** SPA */
productController.getProducts = async (req: Request, res: Response) => {
  try {
    const {
      order = "createdAt",
      page = 1,
      limit = 12,
      productCategory,
      productType,
      productProvider,
      search,
      minPrice,
      maxPrice,
    } = req.query;

    const inquiry: ProductInquiry = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
    };

    if (productCategory)
      inquiry.productCategory = productCategory as ProductCategory;
    if (productType) inquiry.productType = productType as ProductType;
    if (productProvider)
      inquiry.productProvider = shapeIntoMongooseObjectId(productProvider);
    if (search) inquiry.search = String(search);

    if (minPrice !== undefined) inquiry.minPrice = Number(minPrice);
    if (maxPrice !== undefined) inquiry.maxPrice = Number(maxPrice);

    const result = await productService.getProducts(inquiry);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.error("getProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

productController.getProduct = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getProduct");
    const { id } = req.params,
      memberId = req.member?._id ?? null,
      result = await productService.getProduct(memberId, id);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProduct: ", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/** BSSR */
productController.getAllProducts = async (req: Request, res: Response) => {
  try {
    console.log("getAllProducts");

    const result = await productService.getAllProducts();
    res.render("products", { products: result });
  } catch (err) {
    console.log("Error, getAllProducts: ", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.createNewProduct = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    console.log("createNewProduct");

    if (!req.files?.length)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);

    const data: ProductInput = req.body;
    data.productImages = req.files?.map((ele) => {
      return ele.path.replace(/\\/g, "/");
    });

    await productService.createNewProduct(data);
    res.send(
      `<script>alert("Product has succesfully been created!"); window.location.replace('/admin/product/all')</script>`,
    );
  } catch (err) {
    console.log("Error, createNewProduct: ", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script>alert("${message}"); window.location.replace('/admin/product/all')</script>`,
    );
  }
};

productController.updateChosenProduct = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    const id = req.params.id;
    const data: ProductUpdateInput = req.body;

    // Parse the list of images the user wants to remove
    let removeImages: string[] = [];
    if (req.body.removeImages) {
      try {
        removeImages = JSON.parse(req.body.removeImages);
      } catch {
        removeImages = [];
      }
    }

    // Paths of newly uploaded files
    const newImages: string[] =
      Array.isArray(req.files) && req.files.length > 0
        ? req.files.map((f) => f.path.replace(/\\/g, "/"))
        : [];

    data.newImages = newImages;
    data.removeImages = removeImages;

    // Remove the raw productImages field so the service doesn't
    // accidentally overwrite the array with just the new files
    delete data.productImages;

    const result = await productService.updateChosenProduct(id, data);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default productController;
