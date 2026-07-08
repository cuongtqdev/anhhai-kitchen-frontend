export enum MenuItemCategory {
  MainDish = 1,
  OptionalSide = 2,
  MandatorySide = 3,
}

// Types matching backend MenuItemResponse DTO
export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  stockCount: number;
  menuItemCategory: MenuItemCategory;
}

export interface CartSideDish {
  menuItem: MenuItem;
  quantity: number;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  sideDishes?: CartSideDish[];
  note?: string;
}

// Matching backend DiningMode enum
export enum DiningMode {
  DineIn = 0,
  TakeAway = 1,
  Delivery = 2,
}

// Matching backend CreateOrderCommand
export interface CreateOrderPayload {
  items: { menuItemId: number; quantity: number; note: string }[];
  diningMode: DiningMode;
  tableNumber: string | null;
  deliveryAddress: string | null;
  customerPhone: string | null;
  note: string | null;
}

// Matching backend OrderResponse
export interface OrderResponse {
  id: number;
  trackingToken: string;
  status: string;
  totalAmount: number;
}

// Order statuses matching backend OrderStatus enum
export enum OrderStatus {
  Pending = 0,
  Preparing = 1,
  Ready = 2,
  Completed = 3,
  Cancelled = 4,
}

// Full tracked order info for /theo-doi-don
export interface TrackedOrder {
  id: number;
  trackingToken: string;
  status: OrderStatus;
  diningMode: DiningMode;
  tableNumber: string | null;
  deliveryAddress: string | null;
  customerPhone: string | null;
  note: string | null;
  totalAmount: number;
  createdAt: string;
  items: {
    menuItemName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
}
