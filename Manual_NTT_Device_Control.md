# Manual do Usuário — NTT Device Control
### Sistema de Gestão de Inventário de TI · Tech Refresh
**Versão 1.0 · Março 2026**

---

## Sumário

1. Introdução
2. Acesso ao Sistema
3. Perfis de Usuário
4. Dashboard
5. Equipamentos
6. Colaboradores
7. Atribuições
8. Fila de Preparação
9. Unidades
10. Importar Planilha
11. Relatórios
12. Clientes *(SUPERADMIN)*
13. Projetos
14. Configurações
15. Fluxo Completo — Tech Refresh

---

## 1. Introdução

O **NTT Device Control** é um sistema web desenvolvido pela NTT Data para gerenciar o inventário de equipamentos de TI durante projetos de **Tech Refresh** — substituição e renovação de equipamentos em empresas clientes.

O sistema permite:
- Cadastrar e rastrear equipamentos (notebooks, desktops, monitores, etc.)
- Gerenciar colaboradores e suas atribuições de equipamentos
- Acompanhar o ciclo de preparação e entrega de cada equipamento
- Gerar relatórios de progresso do projeto
- Controlar múltiplos clientes e projetos (SUPERADMIN)

**Acesso:** https://nttdevicecontrol.web.app

---

## 2. Acesso ao Sistema

### Tela de Login

Ao acessar o sistema, você verá a tela de login com os campos:
- **Email** — deve ser de um domínio autorizado
- **Senha** — mínimo 6 caracteres

Domínios autorizados:
- @nttdata.com
- @global.nttdata.com
- @gbsupport.net
- @grupobimbo.com
- @pasqualisolution.com.br

> **Atenção:** Caso o email ou senha estejam incorretos, uma mensagem de erro aparecerá em vermelho abaixo do cabeçalho do formulário.

### Recuperação de Senha

A alteração de senha é feita pelo próprio usuário na aba **Configurações → Segurança**.

---

## 3. Perfis de Usuário

O sistema possui 4 perfis com permissões diferentes:

| Perfil | Descrição |
|---|---|
| **SUPERADMIN** | Acesso total. Gerencia clientes, projetos e todos os dados. |
| **ADMIN** | Gerencia equipamentos, colaboradores, atribuições e relatórios do seu cliente. |
| **TÉCNICO** | Executa o checklist de preparação e entrega dos equipamentos. |
| **COLABORADOR** | Visualiza apenas seus próprios equipamentos atribuídos. |

---

## 4. Dashboard

O Dashboard é a tela inicial do sistema e apresenta uma visão geral do projeto ativo.

### Banner do Projeto Ativo
No topo da página é exibido o projeto em andamento com:
- Nome do projeto
- Descrição
- Data de início e data de fim

### Cards de Tech Refresh
Quatro métricas principais do projeto:
- **Total do Projeto** — total de equipamentos cadastrados
- **Agendadas** — atribuições com entrega pendente
- **Entregues** — equipamentos já entregues aos colaboradores
- **Faltam Entregar** — diferença entre total e entregues

### Cards de Resumo
- **Atribuído** — equipamentos em uso
- **Disponíveis** — equipamentos sem atribuição
- **Colaboradores** — total de colaboradores ativos
- **Unidades** — total de unidades cadastradas

### Alertas
O sistema exibe alertas automáticos quando:
- Há equipamentos em preparação há mais de 3 dias
- Há colaboradores sem equipamento atribuído

### Ciclo de Preparação
Mostra o andamento dos equipamentos em 4 etapas. **Clique em qualquer etapa para ver os equipamentos daquela fase:**
- **Aguardando Imagem** — equipamentos recém cadastrados
- **Com Imagem** — em processo de preparação
- **Ag. Entrega** — prontos e agendados para entrega
- **Entregues** — já entregues ao colaborador

### Gráficos
- **Por Marca** — distribuição de equipamentos por fabricante
- **Status dos Equipamentos** — pizza com Disponível / Em Uso / Manutenção
- **Por Tipo** — distribuição por tipo de equipamento
- **Por Unidade** — equipamentos atribuídos por unidade
- **Entregas por Mês** — histórico dos últimos 6 meses

### Filtro por Unidade *(ADMIN)*
No canto superior direito é possível filtrar todos os dados do dashboard por unidade específica.

### Sino de Notificações
O ícone de sino no cabeçalho exibe entregas agendadas para o dia atual. O badge laranja indica a quantidade. Clique para ver os detalhes.

---

## 5. Equipamentos

### Listagem
Exibe todos os equipamentos cadastrados com filtros por:
- Busca (marca, modelo, serial, patrimônio)
- Status (Disponível, Em Uso, Manutenção, Descartado)
- Tipo
- Unidade

### Cadastrar Equipamento
Clique em **+ Novo Equipamento** e preencha:
- Tipo (Notebook, Desktop, Monitor, etc.)
- Marca e Modelo
- Número de Série *(Serial Number)*
- Patrimônio
- Status
- Unidade
- Técnico responsável
- Observações

### Detalhe do Equipamento
Ao clicar em um equipamento, você acessa:
- Todas as informações cadastradas
- QR Code para identificação física
- Histórico de atribuições
- Histórico de etapas de preparação
- Botão para editar ou descartar

### QR Code
Cada equipamento possui um QR Code único. Ao escanear, o sistema abre diretamente a página de detalhe do equipamento.

---

## 6. Colaboradores

### Listagem
Exibe todos os colaboradores ativos com filtros por nome, unidade e status de atribuição.

### Cadastrar Colaborador
Clique em **+ Novo Colaborador** e preencha:
- Nome completo
- Email
- Função / Cargo
- Unidade

### Detalhe do Colaborador
Ao clicar em um colaborador, você acessa:
- Dados cadastrais
- Equipamento atualmente atribuído
- Histórico de atribuições anteriores

### Importar Colaboradores
É possível importar colaboradores em massa via planilha Excel. Baixe o modelo disponível na página de Importação.

---

## 7. Atribuições

As atribuições registram qual equipamento está com qual colaborador.

### Criar Atribuição
Clique em **+ Nova Atribuição** e selecione:
- Colaborador
- Equipamento (apenas disponíveis)
- Data de agendamento *(opcional)*
- Observações

Ao criar uma atribuição, o equipamento muda automaticamente para status **Em Uso**.

### Status de Entrega
Cada atribuição possui um status de entrega:
- **Pendente** — agendada mas ainda não entregue
- **Entregue** — equipamento entregue ao colaborador

### Encerrar Atribuição
Ao encerrar uma atribuição, o equipamento volta para status **Disponível**.

### Filtros
- Por status de entrega (Pendente / Entregue)
- Por colaborador
- Por equipamento

---

## 8. Fila de Preparação

A fila de preparação é onde os técnicos acompanham e executam o processo de preparação dos equipamentos antes da entrega.

### Filtros por Etapa
- **Todos** — todos os equipamentos em processo
- **Aguardando Imagem** — sem nenhum item do checklist marcado
- **Imagem Instalada** — com pelo menos 1 item marcado
- **Softwares Instalados** *(etapa intermediária)*
- **Asset Registrado** — checklist de preparação 100% completo
- **Agendado p/ Entrega** — prontos para entrega

### Checklist de Preparação
Ao clicar em um equipamento, expande o card com duas abas:

**Aba Preparação (8 itens):**
1. Imagem instalada
2. Drivers instalados
3. Office instalado
4. Antivírus instalado
5. VPN instalada
6. Agente de monitoramento instalado
7. Teste de rede realizado
8. Teste de login realizado

Clique em **Salvar Preparação** após marcar os itens. O status avança automaticamente conforme o progresso.

**Aba Entrega (5 itens):**
1. Login funcionando
2. Email configurado
3. Rede funcionando
4. Impressora funcionando
5. Sistemas da empresa funcionando

> Os itens de entrega já vêm **pré-marcados** automaticamente. O técnico desmarca apenas o que não estiver ok e clica em **Confirmar Entrega**.

Ao confirmar a entrega com todos os itens marcados, o equipamento muda automaticamente para **Em Uso**.

### Barra de Progresso
Cada card exibe uma barra de progresso azul indicando o percentual de conclusão do checklist de preparação.

---

## 9. Unidades

Unidades são as filiais, departamentos ou locais físicos da empresa cliente.

### Cadastrar Unidade
Clique em **+ Nova Unidade** e informe:
- Nome da unidade
- Endereço *(opcional)*

### Uso das Unidades
- Equipamentos podem ser vinculados a uma unidade
- Colaboradores pertencem a uma unidade
- O dashboard pode ser filtrado por unidade

---

## 10. Importar Planilha

Permite importar equipamentos e colaboradores em massa via arquivo Excel (.xlsx).

### Importar Equipamentos
1. Clique em **Baixar Modelo** para obter o arquivo Excel padrão
2. Preencha os dados seguindo o modelo
3. Faça o upload do arquivo
4. Revise os dados na pré-visualização
5. Confirme a importação

**Colunas do modelo de equipamentos:**
- Tipo, Marca, Modelo, Serial Number, Patrimônio, Status, Unidade, Técnico

### Importar Colaboradores
Mesmo processo, com o modelo de colaboradores:
- Nome, Email, Função, Unidade

> **Atenção:** Equipamentos importados chegam com status **Aguardando Imagem**. Os técnicos devem passar pelo checklist de preparação antes da entrega.

---

## 11. Relatórios

A página de relatórios permite exportar dados do projeto.

### Tipos de Relatório
- **Inventário Completo** — todos os equipamentos com status e atribuições
- **Entregas** — equipamentos entregues por período
- **Colaboradores sem Equipamento** — lista de colaboradores sem atribuição ativa
- **Por Unidade** — resumo por unidade

### Exportar
Os relatórios podem ser exportados em formato **Excel (.xlsx)** ou **PDF**.

---

## 12. Clientes *(SUPERADMIN)*

Exclusivo para o perfil SUPERADMIN. Permite gerenciar os clientes (empresas) que utilizam o sistema.

### Cadastrar Cliente
Clique em **+ Novo Cliente** e preencha:
- Nome do cliente
- CNPJ
- Nome, email e senha do administrador inicial

### Editar Cliente
Clique no ícone de lápis no card do cliente para editar nome e CNPJ.

### Ativar / Desativar Cliente
O botão no rodapé do card permite desativar ou reativar um cliente. Clientes desativados não conseguem acessar o sistema.

### Alternar entre Clientes
No menu lateral, o SUPERADMIN pode selecionar qual cliente está visualizando através do seletor **"Cliente"** no topo do sidebar.

---

## 13. Projetos

Projetos organizam o trabalho de Tech Refresh por período e cliente.

### Criar Projeto
Clique em **+ Novo Projeto** e preencha:
- Nome do projeto
- Descrição
- Data de início
- Data de fim
- Cliente *(SUPERADMIN pode designar a qualquer cliente)*

### Projeto Ativo
Apenas um projeto pode estar ativo por vez. O projeto ativo aparece no banner do Dashboard com nome, descrição e datas.

Para ativar um projeto, clique em **Definir como Ativo** no card do projeto.

### Editar Projeto
Clique no ícone de lápis no card para editar as informações do projeto.

---

## 14. Configurações

### Aba Perfil
Exibe as informações do usuário logado: nome, email, perfil, função, unidade e empresa.

### Aba Segurança
Permite alterar a senha do usuário logado.
1. Digite a nova senha (mínimo 6 caracteres)
2. Confirme a nova senha
3. Clique em **Alterar Senha**

### Aba Sistema *(ADMIN)*

**Informações:** versão do sistema e empresa.

**QR Codes:** botão para regenerar os QR Codes de todos os equipamentos.

**Domínios Permitidos:** lista dos domínios de email autorizados a acessar o sistema.

**Usuários do Sistema:** gerenciamento de usuários com acesso ao sistema (ADMIN e TÉCNICO).
- Criar novo usuário com nome, email, função, perfil e senha
- Editar usuário existente
- Desativar usuário
- SUPERADMIN pode designar o cliente (empresa) de cada usuário

---

## 15. Fluxo Completo — Tech Refresh

Este é o fluxo recomendado para execução de um projeto de Tech Refresh:

### Passo 1 — Configuração Inicial *(SUPERADMIN/ADMIN)*
1. Criar o cliente no sistema *(SUPERADMIN)*
2. Criar o projeto com datas de início e fim
3. Definir o projeto como ativo
4. Cadastrar as unidades da empresa cliente
5. Criar usuários técnicos e designar ao cliente

### Passo 2 — Importação de Dados *(ADMIN)*
1. Importar colaboradores via planilha
2. Importar equipamentos via planilha
3. Verificar se os dados foram importados corretamente

### Passo 3 — Preparação dos Equipamentos *(TÉCNICO)*
1. Acessar **Fila de Preparação**
2. Selecionar um equipamento em **Aguardando Imagem**
3. Executar os itens do checklist de preparação conforme concluídos
4. Clicar em **Salvar Preparação** — o status avança automaticamente
5. Quando todos os 8 itens estiverem marcados, o equipamento vai para **Asset Registrado**

### Passo 4 — Agendamento de Entrega *(TÉCNICO/ADMIN)*
1. Acessar **Atribuições**
2. Criar nova atribuição vinculando colaborador + equipamento
3. Definir data e horário de agendamento
4. O equipamento aparece no sino de notificações no dia agendado

### Passo 5 — Entrega ao Colaborador *(TÉCNICO)*
1. Acessar **Fila de Preparação → Agendado p/ Entrega**
2. Abrir o equipamento e ir para a aba **Entrega**
3. Os 5 itens já vêm pré-marcados — desmarcar o que não estiver ok
4. Clicar em **Confirmar Entrega**
5. O equipamento muda para **Em Uso** e a atribuição fica como **Entregue**

### Passo 6 — Acompanhamento *(ADMIN)*
1. Acessar o **Dashboard** para ver o progresso geral
2. Verificar alertas de equipamentos atrasados
3. Exportar relatórios conforme necessário

---

*Manual gerado em Março de 2026 · NTT Data · Sistema NTT Device Control v1.0*
