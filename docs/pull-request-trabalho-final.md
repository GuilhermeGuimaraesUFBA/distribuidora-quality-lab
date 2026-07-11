# TF - Grupo 3 - Consolidação da qualidade da distribuidora

## Branch

`grupo-3-estoque-arquitetura-ddd-clean-arch/trabalho-final`

## Contexto

O módulo de Estoque da distribuidora é responsável por registrar movimentações de entrada e retirada de produtos, controlar o saldo disponível por produto e impedir que operações inválidas coloquem o estoque em estado inconsistente.

A pergunta central deste trabalho é: **o módulo funciona apenas superficialmente ou possui qualidade suficiente para evoluir, ser testado, observado, operado e mantido?**

Esta entrega responde afirmativamente, com evidências técnicas de cada dimensão de qualidade atacada.

---

## O que foi melhorado

### 1. Arquitetura: DDD e Clean Architecture aplicados ao domínio

**Problema identificado:** Anemic Domain Model com regra de negócio espalhada entre camadas.

Antes desta entrega, a validação de saldo, o cálculo de retirada e a geração da movimentação estavam implementados de forma procedural diretamente nos Use Cases (`RegisterWithdrawalUseCase` e `RegisterEntryUseCase`). As entidades de domínio serviam apenas como estruturas de dados passivas.

**O que foi refatorado:**

| Artefato | Camada | Responsabilidade |
|---|---|---|
| `ProductInventory` (Aggregate Root) | `domain/aggregates` | Protege invariantes de saldo; aprova e processa retiradas e entradas |
| `StockBalance` (Value Object) | `domain/value-objects` | Encapsula o valor do saldo com imutabilidade e validações |
| `InventoryMovement` (Entity) | `domain/entities` | Representa uma movimentação; valida tipo, quantidade e motivo |
| `InventoryRepository` (interface) | `domain/repositories` | Contrato de persistência, o domínio não conhece TypeORM |
| `TypeOrmInventoryMovementEntity` | `infrastructure/persistence` | Entidade de persistência isolada da camada de domínio |
| `TypeOrmInventoryRepository` | `infrastructure/persistence` | Implementa o contrato; faz mapeamento entre persistência e domínio |
| `RegisterWithdrawalUseCase` | `application/use-cases` | Orquestrador limpo; delega lógica ao agregado |
| `RegisterEntryUseCase` | `application/use-cases` | Orquestrador limpo; delega lógica ao agregado |

### 2. Separação de infraestrutura do domínio

A entidade de domínio `InventoryMovement` foi isolada de qualquer dependência de TypeORM. A entidade de persistência `TypeOrmInventoryMovementEntity` foi criada na camada de infraestrutura. O repositório faz o mapeamento nos dois sentidos via `InventoryMovement.restore`.

### 3. Correção arquitetural no controller

Validação de regra de negócio que estava no controller foi removida. A regra de "quantidade deve ser positiva" é responsabilidade do domínio, o controller valida apenas o formato de entrada via `ValidationPipe`.

### 4. Melhoria de performance no repositório

A query de saldo foi refatorada para usar `createQueryBuilder` com `COALESCE(SUM(...), 0)` calculando o saldo diretamente no banco, evitando buscar todos os movimentos em memória.

### 5. Hardening do pipeline CI/CD

- Auditoria de segurança (`npm audit`) executada **sem bypass** (`|| true` removido);
- Threshold de cobertura de 70% agora **falha o job** quando não atingido;
- Dependências com vulnerabilidades altas atualizadas (`minimist → 1.2.8`, `lodash → 4.17.21`).

### 6. Observabilidade: tracing ativado no bootstrap

`setupTracing()` foi adicionado ao `bootstrap()` do `main.ts`, ativando o OpenTelemetry antes da criação da aplicação para garantir rastreabilidade desde o início da execução.

---

## Qual problema de qualidade foi atacado

O problema principal é o **Anemic Domain Model** combinado com **regra de negócio espalhada entre camadas**, que gerava:

- risco de inconsistência ao evoluir regras de saldo (dois use cases replicando a mesma lógica);
- acoplamento excessivo entre camada de aplicação e detalhes de negócio;
- testes de regra de negócio caros e dependentes de mocks complexos de repositório;
- domínio sem proteção real de invariantes, era possível criar estados inválidos diretamente.

---

## Quais testes ou evidências demonstram a melhoria

### Suíte de testes unitários (módulo inventory)

```
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

### Testes de integração

```
PASS test/integration/inventory.integration.spec.ts
```

### Evidências de execução, comandos executados localmente

```bash
npm run build
npm run lint:check
npm run test:unit
npm run test:property
npm run test:integration
npm run test:coverage
npm audit --omit=dev --audit-level=high
```

Resultado esperado:
- build sem erros;
- lint sem warnings;
- 65 testes unitários aprovados;
- cobertura acima de 70%;
- auditoria sem vulnerabilidades críticas ou altas em dependências de produção.

---

## Quais decisões técnicas foram tomadas

### 1. Aggregate Root como único ponto de acesso ao saldo

A decisão de criar `ProductInventory` como Aggregate Root, e não apenas mover o código para a entidade `InventoryMovement`, garante que o saldo e a movimentação sejam sempre tratados em conjunto. Não é possível criar uma movimentação de retirada sem que o agregado verifique o saldo disponível.

### 2. Value Object imutável para o saldo

`StockBalance` retorna uma nova instância a cada operação (`add`, `subtract`). Isso torna o fluxo previsível e elimina mutações acidentais de estado, o saldo anterior permanece acessível até que o novo seja explicitamente atribuído ao agregado.

### 3. Interface de repositório no domínio (inversão de dependência)

O domínio define o contrato (`InventoryRepository`). A infraestrutura implementa (`TypeOrmInventoryRepository`). O domínio nunca importa TypeORM. Essa decisão protege o núcleo de negócio de mudanças tecnológicas.

### 4. Query de saldo calculada no banco

O balanço é calculado via `SUM` com `CASE WHEN` diretamente no banco de dados, em vez de buscar todos os movimentos e somar em memória. Além de ser mais eficiente, o índice `idx_inventory_movements_product_id` foi adicionado para acelerar as consultas filtradas por produto.

### 5. Auditoria de segurança sem bypass como gate obrigatório

A decisão de remover o `|| true` da etapa de auditoria no CI transforma a verificação de segurança em um gate real, qualquer vulnerabilidade alta ou crítica em dependências de produção bloqueia o pipeline.
