# Contratos de enriquecimento do produto

Fonte: [product-workspace](src/app/features/catalog/products/product-workspace/product-workspace.ts) e os contratos que esse componente realmente usa.

Cada seção abaixo é um contexto isolado. A chave de um contexto não pertence a outro. Não misture `price`, `inventories` e os arrays de IDs no mesmo raciocínio.

Identidade visual, cores e design system não são contrato de produto. Estão em [identidade-visual.md](identidade-visual.md).

O cadastro principal **não** é enriquecimento. Ele só existe aqui como fronteira: o produto precisa já ter `id` antes de qualquer ponto abaixo.

---

## Fronteira — cadastro principal

Não é ponto de enriquecimento.

| | |
|---|---|
| Tela | [product-create](src/app/features/catalog/products/product-create/product-create.ts) |
| Rota | `POST /product` |
| Tipo | `CreateProductPayload` em [product-create.model.ts](src/app/core/models/products/product-create.model.ts) |

Campos do POST, e somente estes:

`category_id`, `manufacturer_id`, `part_origin_id`, `unit_id`, `internal_code`, `barcode`, `name`, `short_description`, `description`, `weight`, `height`, `width`, `length`, `featured`.

Regras locais da criação:

- Obrigatórios na UI: `name`, `internal_code`, `category_id`, `manufacturer_id`, `unit_id`.
- Não envia preço, estoque, imagem, OEM, códigos, equivalentes, aplicações, fornecedores, tags ou notas.
- Depois do POST, a navegação entra no workspace com `productJustCreated`. O banner pede enriquecimento de imagens, preços, estoque, OEM e aplicações.

Rotas do workspace, todas no mesmo componente:

- `catalog/products/:id/edit` — modo `edit`
- `catalog/products/:id/view` — modo `view` (`isReadOnly`)
- `catalog/products/:id` — tratado como `edit`

---

## Contrato comum do workspace

Vale para todos os contextos. Não descreve os campos de nenhum deles.

| | |
|---|---|
| Leitura | `GET /product/:id` via [ProductByIdService](src/app/core/services/product-by-id-service.ts) |
| Escrita | `PATCH /product/:id` via [ProductService.update](src/app/core/services/product-service.ts) |
| Tipo do patch | `UpdateProductPayload` em [product-request.model.ts](src/app/core/models/products/product-request.model.ts) |
| Tipo da leitura | `ProductResponse` em [product-response.model.ts](src/app/core/models/products/product-response.model.ts) |

Regras do patch, herdadas do backend `sometimes` / `array_key_exists`:

- Campo `undefined` **não é enviado**. O backend não altera essa chave.
- `null` só onde o tipo permite `null`.
- Array vazio **é** enviado quando a intenção é zerar a coleção. Por isso os IDs relacionais nascem `undefined` em `mapResponseToPayload` e só entram no formulário quando a aba correspondente é editada.
- `saveProduct` não manda o formulário inteiro. Monta um payload parcial a partir de `modifiedTabs`.
- Uma aba só entra em `modifiedTabs` quando algum handler dela chama `markCurrentTabAsModified`.
- `validateForm` roda em **todo** save, mas só bloqueia campos do cadastro principal: `name`, `internal_code`, `category_id`, `manufacturer_id`, `unit_id`. Nenhum ponto de enriquecimento tem validação de bloqueio hoje.
- `hasTabError` marca erro visual em `geral`, `comercial` e `inventario`, mas isso não impede o save.
- Modo `view` não deve mutar. Vários filhos respeitam `isReadOnly`; o botão de salvar some no header.
- Cancelar com formulário sujo abre confirmação. Sair sem salvar descarta o estado local.
- Depois de um save com sucesso, `modifiedTabs` zera e o formulário é remontado com `mapResponseToPayload`. Os IDs relacionais voltam a `undefined`.

Há dois kinds de contrato, e eles não se substituem:

1. **Vínculo no produto** — chave dentro do `PATCH /product/:id`.
2. **Cadastro da entidade** — endpoint próprio do módulo de compatibilidade. O workspace, hoje, quase não chama esses endpoints.

---

## 1. Preço

Aba: `comercial`. Painel: [commercial-tab](src/app/features/catalog/products/product-form/commercial-tab/commercial-tab.ts).

Não usa endpoint próprio. Só o patch do produto.

### Leitura

`ProductResponse.pricing` (`ProductPricing`):

| Campo da API | Uso |
|---|---|
| `regular_price` | preço vigente de tabela |
| `promotional_price` | promoção; pode ser `null` |
| `promotion_start` / `promotion_end` | janela; podem ser `null` |
| `current_price` | calculado pelo backend; o front não envia |
| `is_on_promotion` | calculado pelo backend; o front não envia |
| `active` | o front não envia |

`mapResponseToPayload` só inclui `price` se `pricing` existir. Mapeamento:

- `pricing.regular_price` → `price.price`
- `pricing.promotional_price` → `price.promotional_price`
- `pricing.promotion_start` → `price.promotion_start`
- `pricing.promotion_end` → `price.promotion_end`

### Escrita

Chave exclusiva: `price`.

```ts
interface UpdateProductPricePayload {
  price?: number;
  promotional_price?: number | null;
  promotion_start?: string | null;
  promotion_end?: string | null;
}
```

Entra no PATCH somente se `modifiedTabs` contém `comercial` **e** `price` não é `undefined`.

### Regras da UI

- `price` está marcado como obrigatório no input. O workspace **não** valida isso no save.
- `promotional_price` vazio vira `null` (`updateNullableNumberField`). Valor preenchido vira `number` (`parseFloat`; inválido vira `null` só se a string for vazia; texto inválido vira `NaN`).
- `price` inválido ou vazio vira `0` (`parseFloat(...) || 0`).
- O toggle "Produto Faturado" está fixo em `true`. `toggleIsInvoiced` não escreve no payload. Não existe campo de faturamento em `UpdateProductPayload`.

### Lacuna deste contexto

Os inputs de data emitem `promotion_start_date` e `promotion_end_date`. `updateField` não mapeia esses nomes. As datas **não** entram em `price.promotion_start` / `price.promotion_end`.

---

## 2. Estoque

Aba: `inventario`. Painel: [inventory-tab](src/app/features/catalog/products/product-form/inventory-tab/inventory-tab.ts).

Não usa endpoint próprio. Só o patch do produto. Um produto pode ter vários depósitos.

### Leitura

`ProductResponse.inventories[]` (`ProductInventory`):

| Campo | Contrato |
|---|---|
| `id` | id do registro de estoque, não do depósito |
| `warehouse.id` / `name` / `code` | depósito |
| `quantity` | físico |
| `reserved_quantity` | reservado; a UI não edita, só exibe e soma |
| `available_quantity` | opcional na leitura; a UI recalcula `quantity - reserved_quantity` se o item está ativo |
| `minimum_quantity` | mínimo |
| `maximum_quantity` | máximo |
| `allow_backorder` | permite vender sem saldo |
| `active` | depósito ativo neste produto |

Se a API não mandar `inventories`, a chave fica `undefined` e um save de outra aba não mexe em estoque.

### Escrita

Chave exclusiva: `inventories`.

```ts
interface UpdateProductInventoryPayload {
  id?: string | null;
  warehouse_id: string;
  quantity: number;
  minimum_quantity?: number | null;
  maximum_quantity?: number | null;
  allow_backorder?: boolean | null;
  active?: boolean | null;
  reserved_quantity?: number;
}
```

Entra no PATCH somente se `modifiedTabs` contém `inventario`.

### Regras da UI

- Disponível = `quantity - reserved_quantity`, e só conta se `active !== false`.
- Quantidade e mínimo: `Math.max(0, Number(value) || 0)`. Não aceita negativo na aba.
- Máximo vazio vira `null`. Máximo preenchido também é clamped em `>= 0`.
- Badge: inativo; sem estoque (`disponível <= 0`); abaixo do mínimo; caso contrário ok.
- Item novo ganha id local `draft-...`. `emitToParent` **remove** esse `id` antes de emitir. O backend deve criar o registro.
- Remover um depósito guarda o estado em cache local. Trocar de volta para o mesmo `warehouse_id` restaura quantidade, mínimo, máximo, backorder e active.
- A intenção da lista de depósitos é não repetir `warehouse_id`. `getWarehouseOptionsForItem` esconde depósitos já usados. `addWarehouseDirect`, porém, usa a lista completa de depósitos, não só os livres.
- `reserved_quantity` não tem editor. Vai no payload se já veio da API.

### Lacuna deste contexto

O pai ainda tem handlers antigos (`updateNumberField` de `quantity` / `min_quantity`, `toggleBackorder`) que alteram só `inventories[0]`. A aba atual não usa esses handlers: ela emite a lista inteira por `inventoriesChange`.

`hasTabError('inventario')` olha `warehouse_id`, `quantity`, `min_quantity`, `max_quantity`. `validateForm` não consulta essas chaves.

---

## 3. Mídia

Aba prevista: `midia`. Componente: [media-tab](src/app/features/catalog/products/product-form/media-tab/media-tab.ts).

**Não está montada.** O botão da sidebar está comentado. O workspace não importa o componente. `saveProduct` não tem ramo `midia`.

### Leitura

`ProductResponse.image` e `ProductResponse.icon` (string ou `null`). O contador da sidebar é `product().image ? 1 : 0`. Não há lista de imagens na resposta do produto.

### Contrato local, ainda não ligado ao save

```ts
interface MediaImageItem {
  id: string;
  url: string;
  name: string;
  size: string;
  isPrimary: boolean;
  order: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}
```

`UpdateProductPayload.icon` existe (`string | null`). Não é preenchido por nenhum handler do workspace.

### Regras que existem só como esboço

- `handleFiles` não faz upload.
- `executeDeleteImage` só fecha o diálogo.
- Não há regra de tipo, tamanho, quantidade máxima nem de imagem primária persistida.

---

## 4. OEM Codes

Aba: `oem`. Painel: [product-oem](src/app/features/catalog/products/product-form/compatibility-tab/components/product-oem/product-oem.ts).

Dois contratos. Não são a mesma operação.

### 4.1 Entidade OEM — cadastro do código

Serviço: [OemCodeService](src/app/core/services/code-oem-service.ts). Base: `/product-oem-codes`.

| Operação | Rota |
|---|---|
| Listar | `GET /product-oem-codes` |
| Opções | `GET /product-oem-codes/options` |
| Opções do produto | `GET /product-oem-codes/product/:productId/options` |
| Por fabricante | `GET /product-oem-codes/by-manufacturer` |
| Criar | `POST /product-oem-codes` |
| Atualizar | `PUT /product-oem-codes/:id` |
| Excluir | `DELETE /product-oem-codes/:id` |

Create/update da entidade:

```ts
interface ProductOemCodeRequest {
  manufacturer_id: string;
  oem_code: string;
}
```

Leitura usada no produto (`OemCode`): `id`, `oem_code`, `manufacturer`, `created_at`, `updated_at`.

O workspace, na abertura, chama só `getByManufacturer` com `page=1` e `per_page=10`. Não chama `getByProduct`. A lista exibida não é "OEMs deste produto"; é a página de códigos do fabricante consultado.

### 4.2 Vínculo com o produto

Chave exclusiva do PATCH: `oem_code_ids: string[]`.

- Na carga, `oemCodeIds` recebe `product.oem_codes.map(o => o.id)`.
- `mapResponseToPayload` **não** copia esses ids para o formulário.
- Selecionar, desselecionar, selecionar visíveis ou criar um OEM no drawer emite a lista completa de ids.
- `onOemSelectionChange` grava `oem_code_ids` e marca a aba `oem`.
- O PATCH leva `oem_code_ids` só se a aba `oem` foi modificada.
- Array com ids substitui o vínculo. Array vazio, se a aba foi modificada, é o contrato para zerar.

### Regras da UI

- Modo leitura não seleciona nem abre drawer.
- Busca e filtro de fabricante são locais, sobre a lista já carregada.
- Paginação do filho também é local (`slice`). O `onPaginationChange` não refaz a request.
- OEM recém-criado no drawer entra na lista local e é auto-selecionado.

### Lacunas deste contexto

- `openAddOemModal` cria id falso `oem-${Date.now()}`. Não chama `POST /product-oem-codes`.
- `setPrimaryOem` mexe em `is_primary` no objeto local. `OemCode` não tem esse campo e o PATCH não tem chave de OEM primário.
- `toggleOemStatus` não faz nada. Status de OEM não entra no patch do produto.
- O filho espera `registeredOemCodes`. O workspace não passa esse input.

---

## 5. Product Codes

Aba: `codigos`. Painel: [product-codes](src/app/features/catalog/products/product-form/compatibility-tab/components/product-codes/product-codes.ts).

Dois contratos. O workspace usa só o segundo, e de forma local.

### 5.1 Entidade — cadastro do código

Serviço: [ProductCodeService](src/app/core/services/product-code.ts). Base: `/product-codes`.

Create e update exigem:

```ts
interface CreateProductCodeDto {
  product_id: string;
  code_type_id: string;
  code: string;
  status_id: string | null;
}
```

O workspace **não** chama esse serviço. A aba não coleta `code_type_id` nem `status_id`.

### 5.2 Leitura no produto

`ProductResponse.codes[]` (`ProductAdditionalCodeSummary`):

| Campo | Contrato atual |
|---|---|
| `id` | id do código |
| `code` | valor |
| `type` | rótulo; o próprio model marca como possivelmente removível |
| `active` | `number` (`1` ativo no stub local) |

Contador da sidebar: `product().codes.length`.

### 5.3 Vínculo no PATCH

Chave exclusiva: `product_code_ids: string[]`.

Entra no PATCH só se a aba `codigos` foi modificada.

### Regras que o workspace executa hoje

- Adicionar abre `prompt` de código e tipo (default `EAN-13`). Não valida formato.
- Gera id local `pc-${Date.now()}`, anexa em `product.codes` e em `product_code_ids`.
- Remover tira o id das duas listas e marca a aba.
- `toggleProductCodeStatus` não altera `active` nem o payload.
- Paginação do filho é local, 5 itens.

Esse fluxo não cria o código em `/product-codes`. O id falso não é um id de backend.

---

## 6. Tipos de código

**Não é vínculo de produto.** Não tem chave em `UpdateProductPayload`. Não tem painel no workspace.

Existe como módulo de catálogo em [compatibility-modules.config.ts](src/app/core/config/compatibility-modules.config.ts):

- `workspaceTab`: `tipos-codigo`
- rota de menu: `/compatibility/code-types`
- serviço: `/product-code-types`
- o `countKey` reutiliza `productCodesCount` — não é uma contagem de tipos

Create do tipo (módulo de compatibilidade, fora do workspace):

```ts
interface CreateProductCodeTypeDto {
  name: string;
  active: boolean;
  status_id: string | null;
  description: string | null;
}
```

O Product Code de verdade depende de `code_type_id` vindo daqui. O workspace ainda não consome essa lista.

---

## 7. Equivalentes

Aba: `equivalentes`. Painel: [product-equivalents](src/app/features/catalog/products/product-form/compatibility-tab/components/product-equivalents/product-equivalents.ts).

### 7.1 Entidade

Serviço: [ProductEquivalentService](src/app/core/services/product-equivalent.ts). Base: `/product-equivalents`.

```ts
interface CreateProductEquivalentDto {
  product_id: string;
  equivalent_product_id: string;
  observation?: string | null;
}
```

Update deixa os três campos opcionais. O workspace **não** chama esse serviço.

### 7.2 Leitura no produto

`ProductResponse.equivalents[]`:

| Campo | Contrato |
|---|---|
| `id` | id do relacionamento, não do produto equivalente |
| `observation` | texto ou `null` |
| `product` | `{ id, name, slug }` do produto de origem |
| `equivalent_product` | `{ id, name, slug }` do outro produto |

Contador: `product().equivalents.length`.

### 7.3 Vínculo no PATCH

Chave exclusiva: `equivalent_product_ids: string[]`.

Entra no PATCH só se a aba `equivalentes` foi modificada.

### Regras do stub atual

- Adicionar pede nome e observação (`prompt`). Default da observação: `Compatibilidade direta`.
- Monta objeto local com `product` vazio e `equivalent_product.id` igual a um id falso `eq-${Date.now()}`.
- Esse id falso é o que vai para `equivalent_product_ids`. Não é o id de um produto existente.
- Remover filtra as duas listas.
- `toggleEquivalentStatus` não faz nada. A resposta não tem campo de status.

---

## 8. Aplicações veiculares

Aba: `compatibilidade`. Painel: [product-vehicle-applications](src/app/features/catalog/products/product-form/compatibility-tab/components/product-vehicle-applications/product-vehicle-applications.ts).

De novo, entidade e vínculo são contratos diferentes. Os modelos também são diferentes.

### 8.1 Entidade — aplicação de veículo

Serviço: [VehicleApplicationService](src/app/core/services/vehicle-application.ts). Base: `/vehicle-applications`.

```ts
interface VehicleApplicationRequest {
  vehicle_version_id: string;      // obrigatório
  vehicle_engine_id?: string | null;
  year_from?: number | null;
  year_to?: number | null;
  notes?: string | null;
  active?: boolean;
}
```

`VehicleApplicationResponse` traz `brand`, `model`, `version`, `engine`, anos, `notes`, `active`.

O drawer de vínculo do workspace não carrega essa lista: `loadAvailableVehicleApps` está vazio, `filteredAvailableVehicleApps` devolve `[]`, `toggleVehicleLink` só faz `console.log`, `onNewVehicleSaved` só fecha o drawer.

### 8.2 Leitura no produto

`ProductResponse.applications[]` (`ProductVehicleApplication`) é um recorte de exibição, não o request da entidade:

| Campo | Contrato |
|---|---|
| `id` | id da aplicação |
| `manufacturer` | referência |
| `model` | string, não o objeto de modelo |
| `year_from` | number |
| `year_to` | number ou `null` |
| `engine` | string ou `null` |
| `details` | string ou `null` |
| `status` | boolean |
| `created_at` / `updated_at` | auditoria |

Contador: `product().applications.length`. Paginação local de 5.

### 8.3 Vínculo no PATCH

Chave exclusiva: `application_ids: string[]`.

`saveProduct` inclui essa chave só se a aba `compatibilidade` está em `modifiedTabs` **e** `application_ids` não é `undefined`.

### Regras efetivas

- Remover: o filho emite a lista de ids restantes e também emite o id removido. O pai filtra `product.applications` e `application_ids`, e marca a aba.
- `onVehicleApplicationsChange` atualiza só a lista de exibição. Não escreve `application_ids`.
- `onVehicleApplicationIdsChange` escreve `application_ids` e **não** marca a aba. Sozinho, não garante que o save envie a chave.
- `openAddVehicleModal` só acrescenta um id falso `veh-${Date.now()}` em `application_ids`. Não cria aplicação e não atualiza a tabela.
- `toggleVehicleStatus` não faz nada.

---

## 9. Fornecedores

Aba: `fornecimento`.

O painel [administration-tab](src/app/features/catalog/products/product-form/administration-tab/administration-tab.ts) existe, mas **não está montado** no HTML do workspace. Os handlers do pai existem e não têm tela ligada.

### Leitura

`ProductResponse.suppliers[]` (`ProductSupplier`):

| Campo | Contrato |
|---|---|
| `id` | id do vínculo produto-fornecedor |
| `product_id` / `supplier_id` | pontas do vínculo |
| `supplier` | `{ id, name? }` |
| `supplier_code` | código no fornecedor, ou `null` |
| `purchase_price` | number |
| `lead_time_days` | number |
| `minimum_order_quantity` | number |
| `preferred` | boolean |
| `active` | boolean |
| `observation` | string ou `null` |

Contador: `product().suppliers.length`. Não há serviço de fornecedor chamado pelo workspace.

### Escrita prevista no PATCH

Chave exclusiva: `supplier_ids: string[]`.

Só entra se a aba `fornecimento` foi modificada. Preço de compra, lead time, quantidade mínima, preferencial e observação **não** têm chave no `UpdateProductPayload`.

### Regras do handler, sem UI

- `openAddSupplierModal` pede nome e código, cria id `sup-${Date.now()}` e um objeto que não bate com `ProductSupplier` (`supplier_name`, `pivot`).
- `setPreferentialSupplier` altera `preferred` só na lista local.
- `toggleSupplierStatus` não faz nada.
- Não há endpoint de fornecedor neste fluxo.

---

## 10. Tags

Aba: `tags`. Mesma situação da aba de fornecedores: handler no pai, painel de administração não montado.

### Leitura

`ProductResponse.tags[]`:

| Campo | Contrato |
|---|---|
| `id` | id da tag |
| `name` | rótulo |
| `active` | boolean |

Contador: `product().tags.length`. `availableTags` no workspace é um array vazio fixo. Não há carga de catálogo de tags.

### Escrita

Chave exclusiva: `tag_ids: string[]`.

`toggleTag` só roda fora de `view`. Se o id já está na lista, remove; senão, acrescenta. Marca a aba `tags`. Tag nova local entra com `name: ''`.

O PATCH leva `tag_ids` só se a aba foi modificada. Não envia nome nem `active`.

---

## 11. Notas e alertas

Aba: `observacoes`.

Não é um contrato de persistência hoje.

- Contador fixo em `0`. Não lê `product`.
- `ProductNote` existe (`id`, `note`, `type`, `active`, `description`, `date`, `author`, `status`, `created_at`, `updated_at`) e o painel de administração sabe paginar notas.
- O workspace não monta esse painel.
- `openAddNoteModal`, `removeNote` e `toggleNoteStatus` estão comentados.
- `UpdateProductPayload` não tem chave de notas.
- `saveProduct` não tem ramo `observacoes`.

---

## Mapa rápido — o que o save realmente pode enviar

| Contexto | Aba que libera a chave | Chave no `PATCH /product/:id` | Painel montado no workspace |
|---|---|---|---|
| Preço | `comercial` | `price` | sim |
| Estoque | `inventario` | `inventories` | sim |
| Mídia | nenhuma | `icon` existe no tipo e não é preenchida | não |
| OEM | `oem` | `oem_code_ids` | sim |
| Product Codes | `codigos` | `product_code_ids` | sim |
| Tipos de código | nenhuma | nenhuma | não |
| Equivalentes | `equivalentes` | `equivalent_product_ids` | sim |
| Aplicações | `compatibilidade` | `application_ids` | sim |
| Fornecedores | `fornecimento` | `supplier_ids` | não |
| Tags | `tags` | `tag_ids` | não |
| Notas | nenhuma | nenhuma | não |

Abas `geral`, `classification`, `logistics` e `visibility` não são enriquecimento. Se qualquer uma delas for modificada, o save manda o bloco escalar do produto (`name`, `slug`, descrições, classificação, código, dimensões, `featured`, `active`). `visibility` nem tem botão na sidebar; a seção de visibilidade abre junto com `logistics`.
