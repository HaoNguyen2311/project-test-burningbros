"use client";
import { getProductList, searchProduct } from "@/app/services/productService";
import {
  ProductItem,
  ProductListType,
} from "@/app/services/productService.types";
import { useDebounce } from "@/app/utils/hooks";
import { useCallback, useEffect, useRef, useState } from "react";

const fetchProductList = async (skipItem: number) => {
  try {
    const res = await getProductList({
      skip: skipItem,
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};

const ProductList = () => {
  const [productList, setProductList] = useState<ProductItem[]>([]);
  const [isEnable, setIsEnable] = useState(true);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 300);
  const skipItemRef = useRef(0);
  const loadingRef = useRef(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleScroll = async () => {
    if (
      itemRef?.current &&
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight &&
      !loadingRef.current &&
      isEnable
    ) {
      loadingRef.current = true;
      let data;
      if (debouncedKeyword) {
        data = await searchProduct({
          q: debouncedKeyword,
          skip: skipItemRef.current,
        });
      } else {
        data = await fetchProductList(skipItemRef.current);
      }
      if (data) {
        const { products } = data;
        setProductList((prevProductList) => [...prevProductList, ...products]);
        if (data.total >= data.skip + 20) {
          skipItemRef.current = data.skip + 20;
        } else {
          setIsEnable(false);
        }
      }

      loadingRef.current = false;
    }
  };

  const handleSearch = useCallback(async () => {
    const res = await searchProduct({
      q: debouncedKeyword,
    });
    setProductList(res.products);
    skipItemRef.current = res.limit + 20;
  }, [debouncedKeyword]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [debouncedKeyword, isEnable]);

  useEffect(() => {
    setIsEnable(true);
    handleSearch();
  }, [debouncedKeyword, handleSearch]);

  return (
    <div className="max-w-[1440px] px-[100px] mx-auto py-[100px]">
      <input
        onChange={(e) => {
          setKeyword(e.target.value);
        }}
        placeholder="Search"
        type="text"
      />
      <div ref={itemRef} className="grid grid-cols-4 gap-3">
        {!!productList &&
          productList.map((prod) => {
            return (
              <div
                className="border rounded-xl p-2 cursor-pointer"
                key={prod.id}
              >
                <img
                  className="w-full flex-1 aspect-[238/158]"
                  src={prod.thumbnail}
                  alt="Thumbnail Image"
                />
                <h3>{prod.title}</h3>
                <p>{prod.description}</p>
                <p>{`${prod.price}$`}</p>
              </div>
            );
          })}
      </div>
      {loadingRef.current && (
        <div className=" text-center mt-3">...Loading</div>
      )}
    </div>
  );
};

export default ProductList;
