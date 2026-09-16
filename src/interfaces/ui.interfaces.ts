import type { ColorPaletteProp } from "@mui/joy";
import type { IconType } from "react-icons/lib";

export interface BreadcrumbItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

export interface DynamicBreadcrumbProps {
  homeIcon?: React.ReactNode;
  separator?: React.ReactNode;
  maxItems?: number;
  showHome?: boolean;
  capitalizeItems?: boolean;
  replaceMap?: Record<string, string>;
}
export interface CategoryMenuProps {
  hoveredCategory: string | null;
  setHoveredCategory: (id: string | null) => void;
  hoveredBrand: string | null;
  setHoveredBrand: (id: string | null) => void;
  onClose: () => void;
}

export interface MenuProps {
    component?:any;
  menu_items?: Array<{ name?: string; to?: string; icon?: IconType }>;
  onClick?: (id: number) => void;
  action_button?: Array<{ title?: string; color?:ColorPaletteProp; function?: () => void; icon?:IconType ;to?:string;}>;

}


export interface ScheduleProps{
  user_role: 'customer' | 'manager';
  addressData: any[]; 
  paymentData: any[];
  orderData: any[];
  productsData?: any[];
  topOrders?: any[];
  orderSummary?: any;
}

export interface TabConfig {
  title: string;
  value: number;
  component: React.ReactNode;
  roles: ('customer' | 'manager')[];
  order: number;
}

export interface ToastProp {
  id: string;
  message: string;
  color?: ColorPaletteProp;
  action?: { label: string; onClick: () => void };
}


