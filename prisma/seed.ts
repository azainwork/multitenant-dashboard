import { PrismaClient, BusinessType, TransactionType, TransactionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("DATABASE_URL:", process.env.DATABASE_URL)
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.upsert({
        where: {email: 'admin@istana.com'},
        update: {},
        create: {
            email: 'admin@istana.com',
            name: 'Admin',
            password: hashedPassword,
            role: 'ADMIN'
        },
    })

    const businesses = await Promise.all([
        prisma.business.upsert({
            where: {id: 'fnb-001'},
            update: {},
            create: {id: 'fnb-001', name: 'Istana F&B', type: BusinessType.FNB},
        }),
        prisma.business.upsert({
            where: { id: 'prop-001' },
            update: {},
            create: { id: 'prop-001', name: 'Istana Properti', type: BusinessType.PROPERTY },
        }),
        prisma.business.upsert({
            where: { id: 'car-001' },
            update: {},
            create: { id: 'car-001', name: 'Istana Carwash', type: BusinessType.CARWASH },
        }),
        prisma.business.upsert({
            where: { id: 'adv-001' },
            update: {},
            create: { id: 'adv-001', name: 'Istana Advertising', type: BusinessType.ADVERTISING },
        }),
    ])

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const revenueBase: Record<string, number> = {
        'fnb-001': 85000000,
        'prop-001': 220000000,
        'car-001': 45000000,
        'adv-001': 130000000,
    }

    for (const biz of businesses) {
        for (let i=0; i<months.length; i++) {
            const base = revenueBase[biz.id]
            const vairance = 0.85 + Math.random() * 0.3
            await prisma.metric.create({
                data: {
                    businessId: biz.id,
                    month: months[i],
                    revenue: Math.round(base * vairance),
                    expense: Math.round(base * vairance * 0.6),
                    customers: Math.round(200 + Math.random() * 300),
                }
            })
        }
    }

    const txData = [
        { businessId: 'fnb-001', amount: 15000000, type: TransactionType.INCOME, status: TransactionStatus.COMPLETED, description: 'Penjualan bulan Juni' },
        { businessId: 'fnb-001', amount: 3500000, type: TransactionType.EXPENSE, status: TransactionStatus.COMPLETED, description: 'Pembelian bahan baku' },
        { businessId: 'prop-001', amount: 85000000, type: TransactionType.INCOME, status: TransactionStatus.COMPLETED, description: 'DP unit Blok A' },
        { businessId: 'prop-001', amount: 12000000, type: TransactionType.INCOME, status: TransactionStatus.PENDING, description: 'Biaya renovasi' },
        { businessId: 'car-001', amount: 8500000, type: TransactionType.INCOME, status: TransactionStatus.COMPLETED, description: 'Revenue mingguan' },
        { businessId: 'adv-001', amount: 45000000, type: TransactionType.INCOME, status: TransactionStatus.COMPLETED, description: 'Kontrak iklan Q2' },
    ]

    for (const tx of txData) {
        await prisma.transaction.create({data: tx})
    }

    const users = await prisma.user.findMany()
    console.log("USERS AFTER SEED:", users)

    console.log('Seed seesai!')
}

main().catch(console.error).finally(() => prisma.$disconnect())