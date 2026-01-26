import { T } from "../libs/types/common";
import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "..//libs/Errors";
import ProviderService from "../models/Provider.service";
import {
  ProviderInput,
  ProviderInquiry,
  ProviderUpdateInput,
} from "../libs/types/provider";

const providerController: T = {},
  providerService = new ProviderService();

/** ADMIN */
providerController.createProvider = async (req: Request, res: Response) => {
  try {
    console.log("createProvider");

    // since multer is involved, we should respond not throw err. Otherwise request stream might be left open and req hang forever
    if (!req.file) {
      return res
        .status(HttpCode.BAD_REQUEST)
        .json({ message: Message.CREATE_FAILED });
    }

    const data: ProviderInput = req.body;
    data.providerLogo = req.file?.path.replace(/\\/g, "/");
    if (typeof data.providerCategories === "string") {
      data.providerCategories = JSON.parse(data.providerCategories);
    }

    if (!Array.isArray(data.providerCategories)) {
      data.providerCategories = [];
    }

    await providerService.createProvider(data);

    res.send(
      `<script>alert("Provider has succesfully been created!"); window.location.replace('/admin/provider/all')</script>`,
    );
  } catch (err) {
    console.log("Error, createProvider:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

providerController.updateProvider = async (req: Request, res: Response) => {
  try {
    console.log("updateProvider");
    const data: ProviderUpdateInput = req.body;
    if (req.file) {
      data.providerLogo = req.file.path.replace(/\\/g, "/");
    }
    if (
      typeof data.providerCategories === "string" &&
      data.providerCategories
    ) {
      data.providerCategories = JSON.parse(data.providerCategories);
    }

    const id = req.params.id,
      result = await providerService.updateProvider(id, data);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, updateProvider:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

providerController.getProvidersByAdmin = async (
  req: Request,
  res: Response,
) => {
  try {
    console.log("getProvidersByAdmin");

    const result = await providerService.getProvidersByAdmin();

    res.render("providers", { providers: result });
  } catch (err) {
    console.log("Error, getProvidersByAdmin:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

providerController.deleteProvider = async (req: Request, res: Response) => {
  try {
    console.log("deleteProvider");
    const id = req.params.id;
    await providerService.deleteProvider(id);

    res.send(
      `<script>alert("Provider has succesfully been deleted!"); window.location.replace('/admin/provider/all')</script>`,
    );
  } catch (err) {
    console.log("Error, deleteProvider:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/** USER */
providerController.getProvider = async (req: Request, res: Response) => {
  try {
    console.log("getProvider");

    const id = req.params.id,
      result = await providerService.getProvider(id);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProvider:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

providerController.getProviders = async (req: Request, res: Response) => {
  try {
    console.log("getProviders");

    const { order, page, limit, isVerified, providerCategory, search } =
        req.query,
      inquiry: ProviderInquiry = {
        order: String(order),
        page: Number(page),
        limit: Number(limit),
      };
    if (isVerified !== undefined) {
      inquiry.isVerified = isVerified === "true";
    }
    if (providerCategory) {
      inquiry.providerCategory = String(providerCategory);
    }
    if (search) inquiry.search = String(search);

    const result = await providerService.getProviders(inquiry);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProviders:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

providerController.getTopProviders = async (req: Request, res: Response) => {
  try {
    console.log("getTopProviders");
    const result = await providerService.getTopProviders();

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getTopProviders:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default providerController;
