/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getProductList, searchProduct } from "@/app/services/productService";
import { ProductItem } from "@/app/services/productService.types";
import { useDebounce } from "@/app/utils/hooks";
import { checkout } from "@/app/utils/checkout";

export const MIN_NUMBER_ITEM = 20;

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
      try {
        loadingRef.current = true;
        let data;
        if (debouncedKeyword) {
          data = await searchProduct({
            q: debouncedKeyword,
            skip: skipItemRef.current,
          });
        } else {
          data = await getProductList({ skip: skipItemRef.current });
        }

        if (data) {
          const { products } = data;
          setProductList((prevProductList) => [
            ...prevProductList,
            ...products,
          ]);
          if (data.total > data.skip + MIN_NUMBER_ITEM) {
            skipItemRef.current = data.skip + MIN_NUMBER_ITEM;
          } else {
            isEnableRef.current = false;
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        loadingRef.current = false;
      }
    }
  }, [debouncedKeyword]);

  const handleSearch = useCallback(async () => {
    try {
      const res = await searchProduct({
        q: debouncedKeyword,
      });

      setProductList(res.products);
      if (res.total < MIN_NUMBER_ITEM) {
        isEnableRef.current = false;
        return;
      }

      if (res.total > res.limit + MIN_NUMBER_ITEM) {
        skipItemRef.current = res.skip + MIN_NUMBER_ITEM;
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
      <button
        onClick={() => {
          checkout({
            lineItems: [
              { price: "price_1NryJjD5gJn0Tg7Wkt5o9LhL", quantity: 1 },
            ],
          });
        }}
      >
        Test here
      </button>
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
        <div className=" text-center mt-3">Empty</div>
      )}
    </div>
  );
};

export default ProductList;
