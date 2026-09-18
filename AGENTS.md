# Regras do Projeto - Agenda do Batera

## Política Obrigatória de Versionamento Incremental
A cada nova alteração que for feita e commitada no repositório, por mínima que seja:
1. A versão deve **avançar numericamente de forma sequencial** (ex: 1.0.0 -> 1.0.1).
2. Devem ser atualizados simultaneamente:
   - `src/version.ts`: Atualizar `APP_VERSION` (ex: `'1.0.0'`) e `APP_BUILD_NUMBER` (+1).
   - `package.json`: Atualizar o campo `"version"` (ex: `"1.0.0"`).
   - `android/app/build.gradle`: Incrementar `versionCode` (+1) e atualizar `versionName` (ex: `"1.0.0"`).
3. Na interface do aplicativo, exibir estritamente apenas o nome da versão (`vX.Y.Z`).

## Estrutura e Boas Práticas
- **Offline-First com Dexie (IndexedDB)**: O banco local garante funcionamento 100% offline para o baterista registrar e consultar seus shows e cachês em qualquer local, mesmo sem internet.
- **Nuvem & Sincronização (Firebase)**: Autenticação via formulário e Google, sincronização em nuvem e recuperação de senha.
- **Capacitor & Android**: O diretório `android` contém o projeto nativo configurado com `debug.keystore` para compilação automatizada no GitHub Actions.
- **GitHub Actions (CI & Build APK)**:
  - `ci.yml`: Validação com TypeScript lint, testes unitários Vitest e build Vite.
  - `build-apk.yml`: Compilação do APK Android (`assembleDebug`) e publicação da release com download do `.apk`.
