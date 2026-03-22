import { NextResponse, NextRequest } from "next/server"; 
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { success } from "zod";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter })

export async function PATCH(req:NextRequest, {params}: {params: {id: string}}) {
    const body = await req.json()
    const transaction = await prisma.transaction.update({
        where: {id: params.id},
        data: {
            businessId: body.businessId,
            amount: parseFloat(body.amount),
            type: body.type,
            status: body.status,
            description: body.description,
        }
    })
    return NextResponse.json(transaction)
}

export async function DELETE(_:NextRequest, {params}: {params: {id: string}}) {
    await prisma.transaction.delete({where: {id: params.id}})
    return NextResponse.json({success: true})
}