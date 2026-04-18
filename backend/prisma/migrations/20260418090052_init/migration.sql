-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "ice" TEXT NOT NULL,
    "if" TEXT,
    "rc" TEXT,
    CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "rib" TEXT NOT NULL,
    CONSTRAINT "Bank_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Checkbook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bankId" TEXT NOT NULL,
    "startNumber" INTEGER NOT NULL,
    "endNumber" INTEGER NOT NULL,
    "nextNumber" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Checkbook_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Check" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "number" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "issueDate" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "bankId" TEXT,
    "fromContactId" TEXT,
    "toContactId" TEXT,
    "invoiceId" TEXT,
    "remittanceId" TEXT,
    "replacementCheckId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Check_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Check_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Check_fromContactId_fkey" FOREIGN KEY ("fromContactId") REFERENCES "Contact" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Check_toContactId_fkey" FOREIGN KEY ("toContactId") REFERENCES "Contact" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Check_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Check_remittanceId_fkey" FOREIGN KEY ("remittanceId") REFERENCES "Remittance" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Check_replacementCheckId_fkey" FOREIGN KEY ("replacementCheckId") REFERENCES "Check" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Remittance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Remittance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Contact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Check_replacementCheckId_key" ON "Check"("replacementCheckId");
