# 🥁 Agenda do Batera

Aplicativo completo para agendamento de shows, controle financeiro de cachês e gestão de apresentações para bateristas e músicos freelancers.

Disponível tanto na Web (PWA responsivo) quanto como aplicativo nativo **Android (APK)** compilado via Capacitor e GitHub Actions.

---

## 🚀 Funcionalidades Implementadas

### 1. Tela de Login e Cadastro
- **Salvamento Local & Nuvem (Firebase)**: Funcionamento offline-first com Dexie (IndexedDB) para garantir que você nunca perca nenhum dado de show mesmo sem conexão com a internet.
- **Cadastro Completo**: Nome completo, CPF com validação algorítmica real (módulo 11), e-mail, senha e instrumento.
- **Login com Google**: Conexão rápida com um toque.
- **Modo Local / Convidado**: Acesso imediato sem fricção.

### 2. Dashboard do Baterista
- **Estatísticas Financeiras em Tempo Real**:
  - Total de shows agendados
  - Cachê Total Previsto
  - Cachê Recebido (com porcentagem de recebimento)
  - Cachê Pendente a cobrar dos contratantes
  - Quantidade de shows a realizar, finalizados e cancelados
- **Filtros Dinâmicos**:
  - 🔍 **Nome do Cantor / Banda**: Busca em tempo real e autocompletar
  - 📍 **Nome do Estabelecimento / Local**: Filtro por bar, restaurante ou cerimonial
  - 📅 **Mês e Ano**: Seleção rápida por mês e ano de apresentação
  - 🎭 **Modalidade**: Filtro por *Particular* ou *Barzinho/Restaurante*
  - 💰 **Status do Cachê**: Filtro rápido por *Recebido* ou *Pendente*
  - 🎤 **Status do Show**: Filtro por *Pendente/Agendado*, *Finalizado* ou *Cancelado*
- **Listagem de Eventos**:
  - Cards visuais com data formatada, dia da semana e cálculo relativo ("Hoje", "Amanhã", etc.)
  - Badges coloridos de modalidade e situação
  - Alternância rápida de cachê recebido em 1 clique
  - Alternância de status do show (Pendente ➔ Finalizado ➔ Cancelado)
  - Botão de compartilhamento rápido com texto formatado pronto para enviar no WhatsApp da banda/cantor
  - Edição e exclusão segura com confirmação

### 3. Cadastro e Edição de Shows (+)
- Modal rápido acionado pelo botão flutuante **(+)** ou botão no topo:
  - **Valor do Cachê**: Com máscara monetária em tempo real (`R$ 0,00`)
  - **Data e Horário do Show**: Seleção de dia e hora de início
  - **Nome do Cantor / Banda**: Com histórico inteligente de cantores
  - **Nome do Estabelecimento / Local**: Com histórico de locais
  - **Modalidade**: *Particular* (casamentos, festas privadas) ou *Barzinho/Restaurante*
  - **Status do Cachê**: *Cachê Recebido* ou *Cachê Pendente*
  - **Status do Show**: *Show Pendente*, *Finalizado* ou *Cancelado*
  - **Observações do Baterista**: Horário de passagem de som, itens do kit de bateria, repertório, etc.

### 4. Recuperação de Senha
- Opção de recuperação via **CPF** ou **E-mail**.
- Validação algorítmica oficial do CPF brasileiro.
- Envio seguro de link e código de redefinição.

### 5. Backup & Sincronização
- Exportação de dados para arquivo JSON de backup.
- Importação de backup para restauração em qualquer aparelho.

---

## 📱 Geração e Download do APK Android

O repositório está configurado com workflow do **GitHub Actions** (`.github/workflows/build-apk.yml`):
- A cada push na branch `main`, o APK Android é automaticamente compilado utilizando o Gradle wrapper e a keystore de debug.
- O arquivo compilado `AgendaDoBatera.apk` é publicado na aba **Releases** do GitHub para download direto e instalação em smartphones Android (ex: Moto G52).

---

## 💻 Como Rodar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (Porta 3000)
npm run dev

# Executar testes unitários automatizados
npm test

# Compilar para produção Web
npm run build

# Sincronizar com Capacitor Android
npx cap sync android
```
