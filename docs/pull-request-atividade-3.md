# ATV3 - Grupo 3 - Evolução orientada por evidências

## Objetivo da Melhoria

Identificamos que o módulo de Estoque sofria com o antipadrão **Anemic Domain Model** e **Regra de Domínio Espalhada entre Camadas**. 

Antes dessa alteração, toda a lógica matemática de validar saldo, garantir limite de retirada e calcular o novo saldo estava implementada de forma procedural diretamente nos Casos de Uso (`RegisterWithdrawalUseCase` e `RegisterEntryUseCase`). As entidades de domínio serviam apenas como estruturas de dados.

## Melhoria Técnica

Aplicamos os conceitos de DDD introduzindo um novo **Aggregate Root** chamado `ProductInventory`. 
- **O que mudou no Domínio**: O `ProductInventory` agora encapsula o `StockBalance`. É de responsabilidade exclusiva deste Agregado aprovar e processar as retiradas (`withdraw`) e entradas (`addEntry`), garantindo que o saldo nunca fique negativo e gerando a entidade `InventoryMovement`.
- **O que mudou na Aplicação**: Nossos Casos de Uso voltaram a ser apenas orquestradores limpos. Eles agora carregam o Agregado através do saldo atual do repositório, delegam a ação de retirar/adicionar para o domínio, e apenas mandam salvar a movimentação gerada.

## Testes

**Antes:** A validação de negócio de que um estoque não poderia ficar negativo era testada fazendo _mocks_ complexos no repository e forçando o Caso de Uso a fazer a conta usando o Value Object isolado.

**Depois:** Escrevemos a suíte de testes `product-inventory.aggregate.spec.ts` dedicada 100% à regra de domínio isolada de qualquer infraestrutura ou caso de uso. Ajustamos os testes da camada de aplicação (`register-entry` e `register-withdrawal`) para acomodar as delegações limpas.

**Sucesso:**
Execução da suíte completa com **100% de aprovação**:
```bash
> jest test/unit/inventory

PASS test/unit/inventory/product-inventory.aggregate.spec.ts
PASS test/unit/inventory/inventory-movement.entity.spec.ts
PASS test/unit/inventory/stock-balance.vo.spec.ts
PASS test/unit/inventory/register-entry.use-case.spec.ts
PASS test/unit/inventory/register-withdrawal.use-case.spec.ts
PASS test/unit/inventory/get-balance.use-case.spec.ts
PASS test/unit/inventory/register-withdrawal.use-case.coverage.spec.ts
PASS test/unit/inventory/register-entry.use-case.coverage.spec.ts

Test Suites: 8 passed, 8 total
Tests:       65 passed, 65 total
```
