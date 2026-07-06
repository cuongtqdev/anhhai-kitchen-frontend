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
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}
