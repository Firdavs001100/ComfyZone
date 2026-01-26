import { T } from "../libs/types/common";
import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "..//libs/Errors";
import ProviderService from "../models/Provider.service";
import { ProviderInput, ProviderUpdateInput } from "../libs/types/provider";

const providerController: T = {},
  providerService = new ProviderService();

/** PROVIDER */
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

    const result = await providerService.createProvider(data);

    res.status(HttpCode.OK).json(result);
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

    const result = await providerService.getProviders();

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
