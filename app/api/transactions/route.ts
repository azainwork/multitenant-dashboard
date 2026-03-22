import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function GET(req: NextRequest) {
    const {searchParams} = new URL(req.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const businessId = searchParams.get('businessId')

    const where:any = {}
    if (type) where.type = type
    if (status) where.status = status
    if (businessId) where.businessId = businessId

    const transactions = await prisma.transaction.findMany({
        where,
        orderBy: {createdAt: 'desc'}
    })
    return NextResponse.json(transactions)
}

export async function POST(req:NextRequest) {
    const body = await req.json()
    const transaction = await prisma.transaction.create({
        data: {
            businessId: body.businessId,
            amount: parseFloat(body.amount),
            type: body.type,
            status: body.status,
            description: body.description
        },
    })
    return NextResponse.json(transaction)
}