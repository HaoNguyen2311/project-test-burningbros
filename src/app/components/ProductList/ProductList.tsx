/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getProductList, searchProduct } from "@/app/services/productService";
import { ProductItem } from "@/app/services/productService.types";
import { useDebounce } from "@/app/utils/hooks";

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
  const [keyword, setKeyword] = useState("");

  const debouncedKeyword = useDebounce(keyword, 300);

  const skipItemRef = useRef(0);
  const loadingRef = useRef(false);
  const isEnableRef = useRef(true);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(async () => {
    if (
      itemRef?.current &&
      itemRef.current?.getBoundingClientRect().bottom <= window.innerHeight &&
      !loadingRef.current &&
      isEnableRef.current
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
        if (data.total > data.skip + 20) {
          skipItemRef.current = data.skip + 20;
        } else {
          isEnableRef.current = false;
        }
      }

      loadingRef.current = false;
    }
  }, [debouncedKeyword]);

  const handleSearch = useCallback(async () => {
    try {
      const res = await searchProduct({
        q: debouncedKeyword,
      });

      setProductList(res.products);
      if (res.total < 20) {
        isEnableRef.current = false;
        return;
      }

      if (res.total > res.limit + 20) {
        skipItemRef.current = res.skip + 20;
      } else {
        skipItemRef.current = res.limit;
      }
    } catch (error) {
      console.log(error);
    }
  }, [debouncedKeyword]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    isEnableRef.current = true;
    handleSearch();
  }, [debouncedKeyword, handleSearch]);

  return (
    <div className="max-w-[1440px] px-[100px] mx-auto py-[100px]">
      <input
        className="border p-2 rounded-md mb-4"
        onChange={(e) => {
          setKeyword(e.target.value);
        }}
        placeholder="Search"
        type="text"
      />
      {!!productList.length ? (
        <div ref={itemRef} className="grid grid-cols-4 gap-3 ">
          {!!productList &&
            productList.map((prod) => {
              return (
                <div
                  className="border rounded-xl p-2 cursor-pointer flex flex-col"
                  key={prod.id}
                >
                  <img
                    className="w-full  aspect-[238/158]"
                    src={prod.thumbnail}
                    alt="Thumbnail Image"
                  />
                  <h3 className="font-medium text-lg">{prod.title}</h3>
                  <p className="text-sm mt-auto">{prod.description}</p>
                  <p className="font-medium text-base">{`${prod.price}$`}</p>
                </div>
              );
            })}
        </div>
      ) : (
        <div className=" text-center mt-3">...Loading</div>
      )}
    </div>
  );
};

export default ProductList;
