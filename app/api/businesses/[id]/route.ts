import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function PATCH(req:NextRequest, {params}: {params: {id:string}}) {
    const body = await req.json()
    const business = await prisma.business.update({
        where: {id: params.id},
        data: {name: body.name, type: body.type},
    })
    return NextResponse.json(business)
}

export async function DELETE(_:NextRequest, {params}: {params: {id:string}}) {
    await prisma.metric.deleteMany({where: {businessId: params.id}})
    await prisma.metric.delete({where: {id: params.id}})
    return NextResponse.json({success: true})
}
