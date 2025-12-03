// types/dashboard.ts
export interface MonthlySale {
  month: string;
  revenue: number;
}
export interface Vendor {
  vendor_name: string;
  revenue: number;
}
export interface Product {
  description: string;
  quantity: number;
}
export interface InvoiceData {
  total_revenue: number;
  unique_vendors: number;
  monthly_sales: MonthlySale[];
  top_vendors: Vendor[];
  top_products_qty: Product[];
  product_sales: Product[];
  all_vendors: Vendor[];
}