# Identidade visual e design system

Fonte: [styles.css](../src/styles.css), [app-shell](../src/app/components/app-shell/app-shell.html) e os componentes em [design-system](../src/app/design-system).

Este documento descreve o padrão que a interface **já usa**. Não é um guia de marca externo. Se um componente contradiz um token, o componente vence até alguém unificar os dois.

O contrato de enriquecimento do produto não entra aqui. Ele está em [produto-enriquecimento.md](produto-enriquecimento.md).

---

## O que caracteriza o sistema

RECCOS Shop é um painel administrativo de catálogo de autopeças. A leitura visual é de ferramenta, não de vitrine.

- Superfície clara, borda fina, sombra quase nenhuma.
- Verde sage como única cor de marca. Status usa verde, âmbar, rosa e azul separados dessa marca.
- Tipografia Inter, títulos semibold, corpo pequeno (`text-xs` / `text-sm`).
- Ícones de traço, 24×24, `stroke-width` 2, cantos e junções arredondados.
- Tema claro e escuro no mesmo layout. O escuro troca o cinza Tailwind por slate.
- Componentes próprios em `src/app/design-system`. Angular Material está no `package.json` e **não** é usado nos templates.

Stack visual:

| Peça | Onde |
|---|---|
| Tailwind CSS 4, via `@import 'tailwindcss'` e `@theme` | [styles.css](../src/styles.css) |
| Fonte Inter, pesos 100–900 | Google Fonts no mesmo arquivo |
| Classes Tailwind nos templates e getters dos componentes | `src/app/design-system` e `src/app/layout` |
| Ícones inline em [app-icon](../src/app/design-system/icon/app-icon.html) | nomes no estilo Lucide; `lucide-angular` não é o renderer |

Não inventar paleta nova na feature. Reusar `app-button`, `app-badge`, `app-input`, `app-data-table`, `app-dialog`, `app-drawer`, `app-page-header`, `app-empty-state` e `app-error-state`.

---

## Marca

Wordmark no header: **RECCOS** em cinza quase preto, **SHOP** em `#4F8A6B`. Abaixo, rótulo mono `CATÁLOGO V2.4` em 10px, cinza, `tracking-wider`.

Marca compacta: quadrado 32×32, `rounded-xl`, fundo `#4F8A6B`, letra **R** branca, semibold. Hover vai para `#38624C`.

Avatar de usuário: círculo com fundo `#EAF4EE`, texto `#4F8A6B`, borda `#4F8A6B` a 20% de opacidade. No escuro, fundo `#4F8A6B/20` e texto `#5BAE6A`.

Título da aplicação no HTML: `RECCOS Shop Car`.

---

## Cores

Há duas camadas. A canônica está em [styles.css](../src/styles.css). A prática da UI repete os mesmos hexadecimais em classes Tailwind, quase sempre em maiúsculas (`#4F8A6B`). As utilities `bg-reccos-*` existem no `@theme` e **não são usadas** nos templates.

### Marca e status

| Token `@theme` | Hex | Papel |
|---|---|---|
| `--color-reccos-primary` | `#4F8A6B` | Ação principal, item ativo, wordmark SHOP, ponto de notificação |
| `--color-reccos-hover` | `#43765C` | Hover do botão primário |
| — | `#38624C` | Active do primário e hover da marca. Não está no `@theme` |
| `--color-reccos-light` | `#EAF4EE` | Fundo de seleção, badge primário, avatar, card de status da sidebar |
| `--color-reccos-success` | `#5BAE6A` | Sucesso, badge de produção, texto ativo no escuro |
| `--color-reccos-warning` | `#E9B949` | Aviso |
| `--color-reccos-error` | `#D66A6A` | Erro, perigo, borda de input inválido |
| `--color-reccos-info` | `#5A8DEE` | Informação |

Hover do perigo: `#C05959`. Hover do secundário claro: `#D8EADD`.

Verde de marca e verde de sucesso não são intercambiáveis. `#4F8A6B` é ação e navegação. `#5BAE6A` é confirmação de estado.

### Superfícies e texto

Definidas em `:root` e `html.dark`. O shell também grava os mesmos valores em classes (`bg-[#F7F8FA]`, `dark:bg-[#0F172A]`).

| Token | Claro | Escuro |
|---|---|---|
| `--bg-app` | `#F7F8FA` | `#0F172A` |
| `--bg-surface` | `#FFFFFF` | `#1E293B` |
| `--bg-surface-hover` | `#F3F4F6` | `#334155` |
| `--border-color` | `#E5E7EB` | `#334155` |
| `--text-main` | `#1F2937` | `#F8FAFC` |
| `--text-muted` | `#6B7280` | `#94A3B8` |

Na prática, superfície e borda vêm do par Tailwind `white` / `gray` no claro e `slate-800` / `slate-700` no escuro. Texto principal de título é `text-gray-900` / `dark:text-slate-100`. Texto secundário é `text-gray-500` / `dark:text-slate-400`. Texto de controle é `text-gray-700` / `dark:text-slate-200` ou `slate-300`.

### Status em fundo suave

Badge, toast e estados de erro não pintam o fundo com o hex cheio. Usam a escala Tailwind correspondente e o hex só no texto ou no ícone.

| Variante | Claro | Escuro |
|---|---|---|
| primary | fundo `#EAF4EE`, texto `#4F8A6B`, borda `#4F8A6B/30` | fundo `#4F8A6B/20`, texto `#5BAE6A` |
| success | `bg-emerald-50`, texto `#5BAE6A`, borda `emerald-200` | `bg-emerald-950/50`, texto `emerald-400` |
| warning | `bg-amber-50`, texto `amber-700`, borda `amber-200` | texto `#E9B949` |
| error | `bg-rose-50`, texto `#D66A6A`, borda `rose-200` | `bg-rose-950/50`, texto `rose-400` |
| info | `bg-blue-50`, texto `#5A8DEE`, borda `blue-200` | `bg-blue-950/50`, texto `blue-400` |
| neutral | `bg-gray-100`, texto `gray-700`, borda `gray-200` | `bg-slate-800`, texto `slate-300` |

Overlay de modal: `bg-slate-900/50` no claro, `bg-black/70` no escuro, com `backdrop-blur-xs`. Drawer e sidebar mobile usam `bg-slate-900/40` / `dark:bg-black/60`.

Scrollbar: polegar `rgba(156, 163, 175, 0.35)`, 5px, pill. Classe `.no-scrollbar` esconde; `.custom-scrollbar` deixa um pouco mais visível (0.4).

---

## Tipografia

Família: **Inter**, `sans-serif`. `body` aplica `font-family: 'Inter'` e `-webkit-font-smoothing: antialiased`. O shell repete `antialiased`.

| Uso | Classe observada |
|---|---|
| Título de página | `text-2xl sm:text-[28px] font-semibold tracking-tight` |
| Título de dialog/drawer | `text-base font-semibold` |
| Wordmark | `text-sm font-bold tracking-tight` |
| Rótulo de grupo da sidebar | `text-[11px] font-bold uppercase tracking-wider` |
| Corpo de tabela, input, botão médio | `text-xs` ou `text-sm` |
| Meta, helper, footer | `text-[10px]` ou `text-[11px]` |
| Código / versão | `font-mono` |

Não usar título display, serif nem outra família. Peso de ação é `font-medium` ou `font-semibold`. Item de menu ativo é `font-bold`.

Idioma da interface é português. `index.html` ainda declara `lang="en"`; isso não muda a voz visual.

---

## Forma, espaço e movimento

Raios recorrentes:

| Token visual | Onde |
|---|---|
| `rounded-[8px]` | Botão, input |
| `rounded-[10px]` | Item da sidebar |
| `rounded-[12px]` | Card, toolbar, tabela, toast, empty/error, card de API |
| `rounded-[16px]` | Dialog |
| `rounded-lg` / `rounded-xl` | Ícone-botão, marca, empty icon |
| `rounded-md` | Badge, submenu, skeleton |
| `rounded-full` | Avatar, ponto de status, scrollbar |

Sombras: `shadow-2xs` na tabela, `shadow-xs` em botão primário, toolbar e item ativo, `shadow-sm` em empty icon, `shadow-lg` no toast, `shadow-2xl` em dialog e drawer. Não usar sombra colorida.

Espaço de página: o conteúdo fica em `p-4 sm:p-5 lg:p-6`. Page header tem `mb-6`. Toolbar tem `mb-6` e padding `p-3`. Célula de tabela: `px-4 py-3.5`.

Movimento curto: `duration-150` em botão e dialog, `duration-200` em sidebar, overlay e toast, `duration-300` no slide do drawer. Curva da sidebar e do conteúdo: `ease-in-out`.

Foco: `focus:outline-none` mais `focus:ring-2`. Botão primário usa `focus:ring-[#4F8A6B]` com offset. Input usa `focus:ring-[#4F8A6B]/20` e, em erro, `focus:ring-[#D66A6A]/20`.

Desabilitado: `opacity-50` e `cursor-not-allowed` no botão; input vai para `bg-gray-100` / `dark:bg-slate-900`.

---

## Shell

O app é um frame fixo. Fonte: [app-shell](../src/app/components/app-shell/app-shell.html), [header](../src/app/layout/header/header.html), [sidebar](../src/app/layout/sidebar/sidebar.html), [content](../src/app/layout/content/content.html), [footer](../src/app/layout/footer/footer.html).

| Região | Medida | Fundo |
|---|---|---|
| Header | altura `64px`, `z-30`, borda inferior | `white` / `dark:slate-800` |
| Sidebar | `280px` aberta, `72px` recolhida; mobile é drawer | igual ao header, borda direita |
| Conteúdo | `pt-[64px] pb-[36px]`, `lg:pl` acompanha a sidebar | `#F7F8FA` / `#0F172A` |
| Footer | altura `36px`, `z-30` | igual ao header |

Sidebar começa abaixo do header (`top-[64px]`). Abaixo de `lg`, ela sai da tela (`-translate-x-full`) e o overlay fecha no clique ou Escape.

Item ativo: fundo `#EAF4EE`, texto `#4F8A6B`, ícone na mesma cor, `rounded-[10px]`, `shadow-xs`. No escuro: fundo `#4F8A6B/20`, texto `#5BAE6A`. Subitem ativo repete esse par, com `border-l-2` no grupo.

Header, da esquerda para a direita: toggle do menu, marca, busca global (só `md+`), tema, notificações, divisor vertical, menu do usuário. Ponto de não lido é 8px, `#4F8A6B`, com anel da cor da superfície.

Footer: nome, separador `•`, “Plataforma de Catálogo & Autopeças”; à direita, pill **Produção** em emerald/`#5BAE6A`, versão mono e copyright.

Card inferior da sidebar, só quando expandida: fundo `#EAF4EE`, borda `#4F8A6B/20`, ponto pulsante `#4F8A6B`, título “API Reccos Conectada”.

---

## Tema

[ThemeService](../src/app/core/services/theme.ts) liga a classe `dark` em `document.documentElement`.

- Chave: `localStorage.reccos_theme`, valores `dark` ou `light`.
- Sem valor salvo, segue `prefers-color-scheme`.
- Toggle no header: ícone `moon` no claro, `sun` no escuro.

Toda superfície nova precisa do par claro/escuro. Não deixar texto `gray-900` sem `dark:text-slate-100`, nem fundo branco sem `dark:bg-slate-800`.

---

## Componentes

Todos em [src/app/design-system](../src/app/design-system). CSS próprio desses arquivos está vazio ou quase vazio; o visual mora na classe Tailwind.

### `app-button`

Variantes: `primary` (default), `secondary`, `outline`, `ghost`, `danger`. Tamanhos: `sm` `px-3 py-1.5 text-xs`, `md` `px-4 py-2 text-sm`, `lg` `px-5 py-2.5 text-base`.

| Variante | Uso |
|---|---|
| primary | Salvar, criar, ação da empty state |
| secondary | Ação de apoio sobre o verde claro |
| outline | Cancelar, “Tentar novamente” |
| ghost | Ação terciária, sem caixa |
| danger | Exclusão e ação irreversível |

Ícone à esquerda ou à direita via `iconStart` / `iconEnd`. `loading` bloqueia o clique. `fullWidth` existe.

### `app-badge`

`primary | success | warning | error | info | neutral`. Tamanho `sm` é 10px; `md` é `text-xs`. Sempre com borda de 1px e `rounded-md`. Não usar badge como botão.

### `app-input` e `app-search-input`

Label `text-xs font-medium`. Obrigatório marca `*` em `text-red-500`. Input `rounded-[8px]`, borda `gray-200` / `dark:slate-700`, foco na marca. Erro troca a borda para `#D66A6A` e mostra `alert-circle` na mesma cor. Helper fica em texto muted.

### `app-page-header` e `app-breadcrumb`

Título + subtítulo muted + slot `[actions]`. Breadcrumb em `text-xs`, separador `chevron-right`, hover `#4F8A6B`, item atual semibold. Primeiro elo fixo: ícone `box` + “Reccos Shop”.

### `app-toolbar`

Faixa branca, `rounded-[12px]`, borda `gray-100`, `shadow-xs`, `mb-6`. Slot `[start]` para busca/filtro, `[end]` para ações.

### `app-data-table` e `app-pagination`

Tabela: fundo de superfície, borda `gray-200/80`, `shadow-2xs`, topo `rounded-[12px]`. Cabeçalho `uppercase tracking-wider`, fundo `gray-50/80`. Linha com hover `gray-50/80` e cursor pointer. Loading substitui células por `app-skeleton`. Vazio chama `app-empty-state`.

Paginação cola embaixo (`rounded-b-[12px]`, borda superior) e fala “Mostrando X a Y de Z registros”.

### `app-dialog` e `app-drawer`

Dialog central, `rounded-[16px]`, `shadow-2xl`, header e footer em `bg-gray-50/50`. Tamanhos: `sm` `max-w-md`, `md` `max-w-lg`, `lg` `max-w-2xl`, `xl` `max-w-4xl`. Conteúdo com `max-h-[75vh]`.

Drawer entra pela direita. Larguras: `sm` `max-w-sm`, `md` `max-w-md`, `lg` `max-w-xl`. Ícone do título, quando existe, é `#4F8A6B`.

Os dois fecham no backdrop e no Escape. Botão de fechar é ghost com ícone `x`.

### `app-empty-state` e `app-error-state`

Empty: caixa tracejada `rounded-[12px]`, ícone grande em cartão branco, título `text-sm`, descrição `text-xs`, ação primária `sm` com `plus`.

Error: mesma caixa, borda e fundo rose, ícone `alert-circle` em `#D66A6A`, ação outline “Tentar novamente” com `refresh-cw`.

### `app-toast`

Canto inferior direito, acima do footer (`bottom-12 right-6`), `z-50`, `rounded-[12px]`, `shadow-lg`. Tipos `success | error | warning | info` mudam a borda e a cor do ícone, não o fundo. Fundo continua superfície.

### `app-skeleton`

`animate-pulse`, `bg-gray-200` / `dark:bg-slate-700`, `rounded-md`.

### `app-icon`

SVG próprio, `fill="none"`, `stroke="currentColor"`, `viewBox="0 0 24 24"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`. Tamanho default `w-5 h-5`. A cor vem do texto do pai.

Nomes disponíveis: `box`, `layout-dashboard`, `layers`, `car`, `shopping-bag`, `upload-cloud`, `bar-chart-3`, `bell`, `settings`, `help-circle`, `search`, `chevron-down`, `chevron-right`, `chevron-left`, `chevrons-left`, `chevrons-right`, `menu`, `x`, `plus`, `plus-circle`, `sun`, `moon`, `user`, `filter`, `refresh-cw`, `trash-2`, `edit`, `check`, `alert-circle`, `info`, `external-link`, `download`, `upload`, `folder-plus`, `building`, `package-check`, `log-out`, `star`, `copy`, `eye`, `arrow-left`, `image`, `archive`, `receipt`.

Ícone novo entra nesse switch. Não misturar outra biblioteca de ícones na mesma tela.

---

## Regras para não quebrar o padrão

- Ação principal é `#4F8A6B`. Não usar azul, roxo ou preto como cor de marca.
- Status não reutiliza o verde da marca. Sucesso é `#5BAE6A`.
- Perigo é `#D66A6A` / rose, nunca vermelho puro do Tailwind (`red-500` só no asterisco de obrigatório).
- Fundo de app não é branco puro. Branco é superfície.
- Borda de painel é `gray-200/80` ou `gray-100`, não uma linha preta.
- Raio de controle é 8px. Raio de painel é 12px. Raio de modal é 16px.
- Texto de interface fica em 12–14px, exceto o título da página.
- Toda classe de cor clara tem par `dark:`.
- Preferir o componente do design system a recriar botão, badge, input ou tabela na feature.
- Não introduzir Angular Material, outra fonte ou outro set de ícones para “padronizar”. O padrão já está nos componentes acima.
