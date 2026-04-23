-- CreateTable
CREATE TABLE "Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customer_name" TEXT NOT NULL,
    "address" TEXT,
    "ntn" TEXT,
    "sales_tax_registration" TEXT,
    "vendor_code" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_name" TEXT NOT NULL,
    "product_code" TEXT NOT NULL,
    "unit_price" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "po_number" TEXT NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "po_date" DATETIME NOT NULL,
    "due_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PurchaseOrder_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "POItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "po_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rate" REAL NOT NULL,
    "total_amount" REAL NOT NULL,
    CONSTRAINT "POItem_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "PurchaseOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "POItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductionTracking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "po_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "ordered_qty" INTEGER NOT NULL,
    "delivered_qty" INTEGER NOT NULL DEFAULT 0,
    "rejected_qty" INTEGER NOT NULL DEFAULT 0,
    "pending_qty" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "last_updated" DATETIME NOT NULL,
    CONSTRAINT "ProductionTracking_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "PurchaseOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductionTracking_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Challan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gdn_number" TEXT NOT NULL,
    "po_id" INTEGER NOT NULL,
    "challan_date" DATETIME NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Challan_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "PurchaseOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Challan_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChallanItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "challan_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "delivered_qty" INTEGER NOT NULL,
    "remarks" TEXT,
    CONSTRAINT "ChallanItem_challan_id_fkey" FOREIGN KEY ("challan_id") REFERENCES "Challan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChallanItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "po_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "delivered_qty" INTEGER NOT NULL,
    "delivery_date" DATETIME NOT NULL,
    "invoice_id" INTEGER,
    CONSTRAINT "Delivery_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "PurchaseOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Delivery_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Delivery_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoice_number" TEXT NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "po_id" INTEGER NOT NULL,
    "invoice_date" DATETIME NOT NULL,
    "subtotal" REAL NOT NULL,
    "gst_amount" REAL NOT NULL,
    "total_amount" REAL NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Invoice_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "PurchaseOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoice_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rate" REAL NOT NULL,
    "amount" REAL NOT NULL,
    CONSTRAINT "InvoiceItem_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InvoiceItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesTaxInvoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoice_id" INTEGER NOT NULL,
    "gst_percentage" REAL NOT NULL,
    "gst_amount" REAL NOT NULL,
    "total_with_tax" REAL NOT NULL,
    CONSTRAINT "SalesTaxInvoice_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Warranty" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "warranty_start_date" DATETIME NOT NULL,
    "warranty_end_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "remarks" TEXT,
    CONSTRAINT "Warranty_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Warranty_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Warranty_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customer_id" INTEGER NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "payment_date" DATETIME NOT NULL,
    "amount_paid" REAL NOT NULL,
    "payment_method" TEXT NOT NULL,
    "remarks" TEXT,
    CONSTRAINT "Payment_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_product_code_key" ON "Product"("product_code");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_po_number_key" ON "PurchaseOrder"("po_number");

-- CreateIndex
CREATE UNIQUE INDEX "Challan_gdn_number_key" ON "Challan"("gdn_number");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoice_number_key" ON "Invoice"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "SalesTaxInvoice_invoice_id_key" ON "SalesTaxInvoice"("invoice_id");
