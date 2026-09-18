# 🥁 Agenda do Batera

Aplicativo completo para agendamento de shows, controle financeiro de cachês e gestão de apresentações para bateristas e músicos freelancers.

Disponível tanto na Web (PWA responsivo) quanto como aplicativo nativo **Android (APK)** compilado de forma automatizada via Capacitor e GitHub Actions, com foco em uma experiência rápida, moderna e **100% Offline-First**.

---

## 🚀 Funcionalidades Implementadas

### 1. Tela de Login e Cadastro (Segurança & Usabilidade)
* **Controle a sua Agenda de Shows 100% Offline**: Mensagem inspiradora que reforça o propósito do aplicativo.
* **Salvamento Local Indexado (Dexie/IndexedDB)**: O banco local garante funcionamento total em qualquer palco, pub ou estrada, sem necessidade de conexão ativa com a internet.
* **Olho Mágico (Visualização de Senhas)**: Botões de alternância (`Eye` / `EyeOff`) implementados nos campos de senha de login, cadastro e redefinição para facilitar a digitação correta em telas menores de celulares.
* **Mensagens de Erro Genéricas**: Em conformidade com as melhores práticas de segurança de credenciais, o sistema exibe mensagens genéricas como *"Usuário ou senha incorretos. Tente novamente."* para mitigar a enumeração e rastreamento de usuários existentes.
* **Redirecionamento Inteligente Pós-Cadastro**: Após criar uma nova conta, o usuário é direcionado imediatamente à aba de Login com seu usuário já pré-preenchido para um acesso ágil.

### 2. Recuperação de Senha Interativa (Zero Chaves Temporárias)
* **Validação de Usuário**: O fluxo agora é interativo em 2 etapas. Primeiro, o sistema valida se o nome de usuário digitado existe no banco local de dados.
* **Redefinição Direta**: Ao localizar o usuário, o sistema exibe uma saudação personalizada e habilita instantaneamente a inserção da nova senha escolhida diretamente pelo usuário, com o recurso de olho mágico integrado e sem o uso de senhas temporárias estáticas.

### 3. Dashboard do Baterista & Menu Superior
* **Saudação Dinâmica**: Substituição do texto genérico do menu por uma recepção pessoal baseada no primeiro nome do usuário logado (ex: *"Olá, José"*).
* **Estatísticas Financeiras em Tempo Real**:
  * Total de shows agendados
  * Cachê Total Previsto
  * Cachê Recebido (com percentual e barra de progresso visual)
  * Cachê Pendente a cobrar dos contratantes
  * Quantidade de shows a realizar, finalizados e cancelados
* **Filtros Dinâmicos e Busca**: Filtre de forma inteligente por Nome de Cantor/Banda, Estabelecimento/Local, Mês/Ano, Modalidade (Barzinho ou Particular), Status do Cachê e Status do Show.

### 4. Cadastro Inteligente de Cantores & Bandas
* **Cadastro Dedicado**: Gerenciador que armazena os cantores ou bandas sob a conta do usuário conectado de forma organizada.
* **Validação de Duplicidade (Case-Insensitive)**: Protege a consistência do banco de dados impedindo que nomes idênticos sejam insercidos para o mesmo baterista, mesmo variando letras maiúsculas e minúsculas.

### 5. Cadastro & Edição de Shows (+)
* Modal rápido e responsivo contendo:
  * **Valor do Cachê**: Com máscara monetária em tempo real (`R$ 0,00`)
  * **Data e Horário do Show**: Seletores customizados elegantes
  * **Histórico Inteligente**: Sugestões automáticas de Cantores e Estabelecimentos cadastrados anteriormente
  * **Observações**: Área dedicada para notas de passagens de som, kit de bateria, setlist e observações gerais.

### 6. Autodescarte de Alertas em todas as Telas (Regra dos 3 Segundos)
* Todos os alertas de aviso, erros de validação e mensagens de confirmação de sucesso em qualquer modal do aplicativo (`AuthModal`, `RecoveryModal`, `ShowModal`, `BandsModal`, `ExportSyncModal`) fecham-se de forma inteligente após exatamente **3 segundos**, mantendo a interface limpa e otimizada para o uso.

### 7. Backup & Sincronização
* **Exportação Completa**: Salve seus dados locais em um arquivo `.json` a qualquer momento.
* **Importação Segura**: Recupere ou mude seus dados para outro dispositivo importando o backup em segundos.

---

## 📱 Instalação e Atualização Perfeita no Celular (Padrão Oficial)

Para evitar qualquer falha de instalação ou conflito de pacotes (como o erro *"App não instalado"*) ao atualizar o aplicativo diretamente no telefone, o projeto segue o mesmo padrão de qualidade e assinatura consolidado em projetos oficiais do desenvolvedor:
* **Assinatura Constante com Keystore Permanente**: Utiliza uma chave `debug.keystore` dedicada no projeto para garantir que as assinaturas dos APKs gerados de forma sequencial permaneçam idênticas e permitam atualizações diretas.
* **Prevenção de Conflitos de Backup**: Configurado `android:allowBackup="false"` para prevenir carregamentos de cache em versões antigas e evitar erros de consistência após as atualizações.
* **Geração Automática do APK**: O workflow do **GitHub Actions** (`.github/workflows/build-apk.yml`) compila o APK a cada alteração na branch `main` e publica o executável final `AgendaDoBatera.apk` diretamente na aba **Releases** do repositório para download instantâneo.

---

## 💻 Como Executar Localmente

```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Iniciar o servidor de desenvolvimento local
npm run dev

# 3. Rodar os testes automatizados
npm test

# 4. Compilar a build de produção Web
npm run build

# 5. Sincronizar as alterações com o projeto Android
npx cap sync android
```
