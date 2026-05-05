/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'New Arrivals' | 'Techwear' | 'Limited' | 'Archives' | 'Men' | 'Women' | 'Accessories' | 'Unisex';
  stock: number;
  imageUrl: string;
  createdAt: number;
}

export interface InventoryLog {
  id: string;
  productId: string;
  changeType: 'restock' | 'sale' | 'correction';
  quantity: number;
  timestamp: number;
  note?: string;
}

export interface AIInventoryAnalysis {
  status: 'low_stock' | 'healthy' | 'overstocked';
  recommendation: string;
  suggestedAction: string;
}
