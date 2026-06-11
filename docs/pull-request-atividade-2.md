# Pull Request Simulado - Atividade 2

## Branch

`grupo-X/atividade-2`

## Titulo

Isola persistencia TypeORM do dominio de estoque

## Codigo alterado

- `InventoryMovement` deixou de usar decorators do TypeORM no dominio.
- Foi criada `TypeOrmInventoryMovementEntity` na infraestrutura para representar a tabela `inventory_movements`.
- `TypeOrmInventoryRepository` agora faz o mapeamento entre persistencia e dominio.
- `InventoryModule` registra a entidade de infraestrutura no `TypeOrmModule`.
- O teste unitario de `InventoryMovement` protege a regra de arquitetura e a reconstituicao do dominio.

## Comentario curto do conceito aplicado

Aplicamos Clean Architecture e DDD separando dominio de infraestrutura. A entidade de dominio `InventoryMovement` concentra as invariantes do movimento de estoque e nao conhece TypeORM. A persistencia fica na camada de infraestrutura, com mapper no repositorio.

## Teste ou evidencia de execucao

Comando usado para validar:

```bash
npx jest --testPathPattern=test/unit/inventory
npm run build
```

Evidencia esperada:

- o teste confirma que o arquivo de dominio nao importa TypeORM nem possui decorators de persistencia;
- o teste confirma que um movimento salvo so volta para o dominio via `InventoryMovement.restore`;
- uma retirada restaurada sem motivo continua sendo rejeitada pela regra de dominio.

## Demonstracao em sala

1. Mostrar o problema original: a entidade de dominio de estoque tinha `@Entity`, `@Column`, `@PrimaryGeneratedColumn` e `@CreateDateColumn`.
2. Explicar o risco: o dominio ficava dependente da tecnologia de banco, quebrando a direcao das dependencias da Clean Architecture.
3. Mostrar a refatoracao: `InventoryMovement` ficou puro, enquanto `TypeOrmInventoryMovementEntity` ficou na infraestrutura.
4. Mostrar o repositorio: ele traduz dados do TypeORM para o dominio usando `InventoryMovement.restore`.
5. Rodar o teste unitario e explicar que ele protege tanto a separacao entre camadas quanto a invariante de retirada com motivo obrigatorio.
