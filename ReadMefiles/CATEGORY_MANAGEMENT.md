# Product Category Management

## Overview
The admin can now manage product categories that suppliers use when adding their products.

## Features

### Admin Panel
- **Tab Navigation**: Switch between "Registration Requests" and "Product Categories"
- **Add Categories**: Create new product categories with name, description, and specifications
- **Edit Categories**: Update existing category information
- **Activate/Deactivate**: Toggle category visibility for suppliers
- **Delete Categories**: Remove categories (only if no products use them)

### Supplier Dashboard
- **View Active Categories**: See all active categories defined by admin
- **Add Products by Category**: Select a category and add product details

## How to Use

### For Admin:
1. Login to admin panel at `/admin`
2. Click on **"Product Categories"** tab
3. Click **"+ Add Category"** button
4. Fill in category details:
   - Category Name (required) - e.g., "Battery", "Cable", "Inverter Case"
   - Description (optional) - Brief description of the category
   - Specifications Required (optional) - Expected specifications for products in this category
5. Click **"Add Category"**

#### Managing Existing Categories:
- **Edit**: Modify category name, description, or specifications
- **Activate/Deactivate**: Show or hide category from suppliers
- **Delete**: Remove category (only if no products reference it)

### For Suppliers:
1. Login to supplier dashboard
2. Go to Products page (navigate to `/products` or use navigation menu)
3. View **"Required Product Categories"** section
4. Click on any category card to add your product
5. Modal opens with category pre-selected
6. Fill in product details:
   - Description
   - Item Number
   - Size
   - Base Price
   - Stock Quantity
   - Discount %
   - Delivery Terms
   - CGST & SGST
7. Click **"Add Product"**

## API Endpoints

### Admin Endpoints:
- `GET /api/admin/categories` - Get all categories (including inactive)
- `POST /api/admin/categories` - Create new category
- `PUT /api/admin/categories/:categoryId` - Update category
- `DELETE /api/admin/categories/:categoryId` - Delete category

### Supplier Endpoints:
- `GET /api/categories` - Get active categories only (requires authentication)
- `POST /api/supplier/products` - Add product with categoryId

## Database Schema

### RequiredProductCategories Table:
```sql
CREATE TABLE RequiredProductCategories (
  id SERIAL PRIMARY KEY,
  categoryId TEXT UNIQUE NOT NULL,
  companyId TEXT,
  category_name TEXT NOT NULL,
  description TEXT,
  specifications_required TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Products Table Reference:
Products link to categories via `categoryId` foreign key.

## Workflow

1. **Admin creates categories** → e.g., "Battery 12V", "Solar Cable", "Junction Box"
2. **Categories become available** → Suppliers see them in their dashboard
3. **Suppliers add products** → Select category and fill product details
4. **Products display with category** → Each product shows its category badge

## Notes

- Only active categories are visible to suppliers
- Admin can deactivate categories instead of deleting them if products already reference them
- Suppliers must select a category when adding products
- Category information helps standardize product listings
