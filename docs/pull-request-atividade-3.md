# ATV3 - Grupo 3 - Evolução orientada por evidências

## Objetivo da Melhoria

Identificamos que o módulo de Estoque sofria com o antipadrão **Anemic Domain Model** e **Regra de Domínio Espalhada entre Camadas**.

Antes dessa alteração, toda a lógica matemática de validar saldo, garantir limite de retirada e calcular o novo saldo estava implementada de forma procedural diretamente nos Casos de Uso (`RegisterWithdrawalUseCase` e `RegisterEntryUseCase`). As entidades de domínio serviam apenas como estruturas de dados.

![alt text](images/Screenshot_1.png)

Figura 1 – Implementação anterior da classe `RegisterWithdrawalUseCase` com regras de domínio no Caso de Uso

![alt text](images/Screenshot_4.png)

Figura 2 – Implementação anterior da classe `RegisterEntryUseCase` com regras de domínio no Caso de Uso

Essa abordagem concentrava responsabilidades de negócio na camada de aplicação, fazendo com que qualquer alteração nas regras de estoque exigisse modificações diretamente nos Casos de Uso. Além disso, diferentes operações poderiam acabar reproduzindo as mesmas validações, aumentando o risco de inconsistências e dificultando a manutenção do sistema.

A mudança implementada pela equipe reduziu de  forma significativa o acoplamento entre a camada de aplicação e as regras de negócio, centralizando o comportamento do estoque em um único ponto do domínio. Dessa forma, o conhecimento sobre disponibilidade de saldo, atualização do estoque e geração de movimentações deixou de estar espalhado pelos Casos de Uso e passou a ser encapsulado pelo `Aggregate`.

![alt text](images/Screenshot_2.png)

Figura 3 – Implementação da classe `RegisterWithdrawalUseCase` após as modificações das regras de domínio no Caso de Uso

![alt text](images/Screenshot_3.png)

Figura 4 – Implementação da classe `RegisterEntryUseCase` após as modificações das regras de domínio no Caso de Uso

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
