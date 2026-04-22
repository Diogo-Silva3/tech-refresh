const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pedro = await prisma.usuario.findFirst({
    where: {
      OR: [
        { nome: { contains: 'PEDRO' } },
        { id: 128 }
      ]
    },
    select: { id: true, nome: true, projetoId: true, role: true }
  });
  
  console.log('PEDRO:', JSON.stringify(pedro, null, 2));
  
  if (pedro?.projetoId) {
    const projeto = await prisma.projeto.findUnique({
      where: { id: pedro.projetoId },
      select: { id: true, nome: true }
    });
    console.log('PROJETO:', JSON.stringify(projeto, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
