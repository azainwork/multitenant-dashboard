-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VIEWER');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('FNB', 'PROPERTY', 'CARWASH', 'ADVERTISING', 'TECH');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('COMPLETED', 'PENDING', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BusinessType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metric" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "expense" DOUBLE PRECISION NOT NULL,
    "customers" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Metric" ADD CONSTRAINT "Metric_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
