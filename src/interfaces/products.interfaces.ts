export interface ProductDataProps{
    products:[],
    summary:{},
    sales:{}
};


export interface ProductCardProps {
  id: string | number;
  name: string | undefined;
  price: number | undefined;
  image: string;
  discount?: number;
  status?:string;
  description?: string;
  rating?: number;
  reviews_count?: number;
  views_count?: number;
}

export interface ProductDetailsProps {
image_url?: string | undefined;
name: string | undefined;
categories: string[];
brands: string[];
description: string | undefined;
price: number | undefined;
stock: number;
discount: number;
status: string | undefined;
}