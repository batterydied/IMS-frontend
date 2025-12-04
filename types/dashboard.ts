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
  item_revenue: number;
}

export interface Appointment {
  invoice_date: string;  
  vendor_name: string; 
}
export interface InvoiceData {
  total_revenue: number;
  unique_vendors: number;
  monthly_sales: MonthlySale[];
  top_vendors: Vendor[];
  top_products_qty: Product[];
  product_sales: Product[];
  all_vendors: Vendor[];
  all_appointments: Appointment[];
}
