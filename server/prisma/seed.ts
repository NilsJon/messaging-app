import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.user.createMany({
        data: [
            { username: 'alice', password: 'password123' },
            { username: 'bob', password: 'password456' },
            { username: 'nils', password: 'password789' },
        ],
        skipDuplicates: true,
    });
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(() => {
    prisma.$disconnect();
});
