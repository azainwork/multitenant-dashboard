import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function GET() {
    const metrics = await prisma.metric.findMany({
        include: {business: true},
        orderBy: {createdAt: 'asc'}
    })

    const monthlyMap: Record<string, {revenue: number; expense: number}> = {}
    for (const m of metrics) {
        if(!monthlyMap[m.month]) monthlyMap[m.month] = {revenue: 0, expense:0}
        monthlyMap[m.month].revenue += m.revenue
        monthlyMap[m.month].expense += m.expense
    }

    const monthly = Object.entries(monthlyMap).map(([month, data]) => ({
        month, 
        ...data,
        profit: data.revenue - data.expense,
    }))

    const byBusiness = await prisma.business.findMany({
        include: {revenue: true},
    })

    const businessSummary = byBusiness.map((b) => ({
        name: b.name,
        type: b.type,
        totalRevenue: b.revenue.reduce((sum, m) => sum + m.revenue, 0),
        totalCustomers: b.revenue.reduce((sum, m) => sum + m.customers, 0),
    }))

    return NextResponse.json({monthly, businessSummary})
}