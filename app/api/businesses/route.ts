import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function GET() {
    const businesses = await prisma.business.findMany({
        include: {revenue: true},
        orderBy: {createdAt: 'asc'},
    })
    return NextResponse.json(businesses)
}

export async function POST(req:NextRequest) {
    const body = await req.json()
    const business = await prisma.business.create({
        data: {
            name: body.name,
            type: body.type,
        },
    })
    return NextResponse.json(business)
}