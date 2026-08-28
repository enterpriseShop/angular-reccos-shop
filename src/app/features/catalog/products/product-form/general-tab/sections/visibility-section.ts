import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-product-visibility-section',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white dark:bg-slate-800 rounded-[12px] border border-gray-200/80 dark:border-slate-700/80 p-6 shadow-2xs space-y-4">
      <div class="border-b border-gray-100 dark:border-slate-700/60 pb-3">
        <h3 class="text-xs font-bold text-gray-900 dark:text-slate-200 uppercase tracking-wider">
          Visibilidade & Destaque
        </h3>
        <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Configurações de exibição do produto nas vitrines e canais de venda</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Status Ativo/Inativo -->
        @if (!isCreateMode()) {
        <div class="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl">
          <div class="space-y-0.5">
            <span class="text-xs font-bold text-gray-900 dark:text-slate-100 block">Produto Ativo no Catálogo</span>
            <span class="text-[11px] text-gray-500 dark:text-slate-400 block">Se desativado, o produto fica oculto nas buscas e vitrines</span>
          </div>
          <button
            type="button"
            [disabled]="isReadOnly()"
            (click)="booleanFieldToggle.emit({ field: 'active', currentValue: formActive() })"
            [class]="formActive() ? 'bg-[#4F8A6B]' : 'bg-gray-300 dark:bg-slate-700'"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50"
          >
            <span
              [class]="formActive() ? 'translate-x-5' : 'translate-x-0'"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
            ></span>
          </button>
        </div>
        }

        <!-- Destaque -->
        <div class="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl">
          <div class="space-y-0.5">
            <span class="text-xs font-bold text-gray-900 dark:text-slate-100 block">Produto em Destaque</span>
            <span class="text-[11px] text-gray-500 dark:text-slate-400 block">Exibir em banners e seções prioritárias da loja</span>
          </div>
          <button
            type="button"
            [disabled]="isReadOnly()"
            (click)="booleanFieldToggle.emit({ field: 'featured', currentValue: formFeatured() })"
            [class]="formFeatured() ? 'bg-[#4F8A6B]' : 'bg-gray-300 dark:bg-slate-700'"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50"
          >
            <span
              [class]="formFeatured() ? 'translate-x-5' : 'translate-x-0'"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
            ></span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProductVisibilitySectionComponent {
  readonly formActive = input<boolean>(true);
  readonly formFeatured = input<boolean>(false);
  readonly isReadOnly = input<boolean>(false);
  readonly isCreateMode = input<boolean>(false);

  readonly booleanFieldToggle = output<{ field: string; currentValue: boolean }>();
}
