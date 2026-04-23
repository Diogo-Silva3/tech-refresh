========================================
BACKUP COMPLETO DO SISTEMA TECH REFRESH
Data: 23/04/2026 10:53:41 UTC
========================================

ARQUIVOS DE BACKUP:
==================

1. backup_backend_20260423_105341.tar.gz (72 MB)
   - Código do backend
   - Configurações
   - Node modules
   - Scripts de migração

2. backup_frontend_20260423_105341.tar.gz (2.0 MB)
   - Código do frontend (React)
   - Build compilado
   - Configurações

3. backup_portal_20260423_105341.tar.gz (1.5 MB)
   - Código do portal
   - Arquivos HTML
   - Configurações

LOCALIZAÇÃO NO VPS:
==================
- Backend: /var/www/apps/tech-refresh-backend/
- Frontend: /var/www/apps/tech-refresh-frontend/
- Portal: /var/www/apps/portal-tech-refresh/
- Backups: /backups/

COMO RESTAURAR:
===============

1. Backend:
   tar -xzf backup_backend_20260423_105341.tar.gz -C /
   cd /var/www/apps/tech-refresh-backend
   npm install
   pm2 restart ntt-backend

2. Frontend:
   tar -xzf backup_frontend_20260423_105341.tar.gz -C /
   cd /var/www/apps/tech-refresh-frontend
   npm install
   npm run build

3. Portal:
   tar -xzf backup_portal_20260423_105341.tar.gz -C /
   pm2 restart portal-tech-refresh

INFORMAÇÕES IMPORTANTES:
=======================
- Backup feito em: 23/04/2026 10:53:41 UTC
- Versão do sistema: v2.1
- Projetos: TECH REFRESH LAPTOP 2026, TECH REFRESH DESKTOP 2026, TECH REFRESH TABLETS 2026
- Status: ✓ Todos os serviços online
- Middleware de sincronização: DESATIVADO (para evitar alterações automáticas)

SEGURANÇA:
==========
✓ Backend está com código corrigido (sem middleware de sincronização)
✓ Dashboard está contabilizando corretamente
✓ Dados não vão mudar sozinhos mais
✓ Todos os projetos com números corretos

PRÓXIMOS PASSOS:
================
1. Guardar este backup em local seguro
2. Fazer backup regularmente (recomendado: semanal)
3. Testar restauração em ambiente de teste antes de usar em produção

========================================
