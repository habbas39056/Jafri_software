-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PurchaseOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "po_number" TEXT NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "po_date" DATETIME NOT NULL,
    "due_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "gst_percentage" REAL NOT NULL DEFAULT 18.0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PurchaseOrder_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PurchaseOrder" ("created_at", "customer_id", "due_date", "id", "po_date", "po_number", "status") SELECT "created_at", "customer_id", "due_date", "id", "po_date", "po_number", "status" FROM "PurchaseOrder";
DROP TABLE "PurchaseOrder";
ALTER TABLE "new_PurchaseOrder" RENAME TO "PurchaseOrder";
CREATE UNIQUE INDEX "PurchaseOrder_po_number_key" ON "PurchaseOrder"("po_number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
