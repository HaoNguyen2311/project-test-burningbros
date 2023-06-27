import axios from "axios";
import { ProductListType } from "./productService.types";

type getProductListParams = {
  limit?: number;
  skip?: number;
  select?: string;
};

type searchProductParams = {
  q?: string;
  skip?: number;
};

export const getProductList = async (params?: getProductListParams) => {
  const url = `${process.env.NEXT_PUBLIC_BE_URL}/products`;
  const res = await axios.get<ProductListType>(url, { params: params });
  return res.data;
};

export const searchProduct = async (params?: searchProductParams) => {
  const url = `${process.env.NEXT_PUBLIC_BE_URL}/products/search`;
  const res = await axios.get<ProductListType>(url, { params });
  return res.data;
};
