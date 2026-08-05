import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { InputComponent } from '../../../../../../design-system/input/input';

@Component({
  selector: 'app-product-basic-info-section',
  standalone: true,
  imports: [InputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white dark:bg-slate-800 rounded-[12px] border border-gray-200/80 dark:border-slate-700/80 p-6 shadow-2xs space-y-4">
      <div class="border-b border-gray-100 dark:border-slate-700/60 pb-3">
        <h3 class="text-xs font-bold text-gray-900 dark:text-slate-200 uppercase tracking-wider">
          Informações Básicas & Descrições
        </h3>
        <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Título, identificador URL e descrições técnicas e comerciais</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Nome do Produto -->
        <app-input
          label="Nome do Produto"
          [required]="true"
          placeholder="Ex.: Jogo de Pastilhas de Freio Dianteira"
          [value]="formName()"
          [disabled]="isReadOnly()"
          [error]="errors()['name']"
          (valueChange)="fieldChange.emit({ field: 'name', value: $event })"
        />

        <!-- Slug -->
        @if (!isCreateMode()) {
        <app-input
          label="Slug (URL amigável)"
          placeholder="Ex.: jogo-de-pastilhas-de-freio-dianteira"
          [value]="formSlug()"
          [disabled]="isReadOnly()"
          helperText="Gerado automaticamente ou personalizável"
          (valueChange)="fieldChange.emit({ field: 'slug', value: $event })"
        />
        }
      </div>

      <!-- Descrição Curta -->
      <app-input
        label="Descrição Curta"
        placeholder="Resumo comercial do produto em poucas palavras..."
        [value]="formShortDescription()"
        [disabled]="isReadOnly()"
        (valueChange)="fieldChange.emit({ field: 'short_description', value: $event })"
      />

      <!-- Descrição Detalhada -->
      <div>
        <label for="description-textarea" class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
          Descrição Detalhada
        </label>
        <textarea
          id="description-textarea"
          rows="5"
          [value]="formDescription()"
          [disabled]="isReadOnly()"
          (input)="onTextareaInput($event)"
          placeholder="Informações técnicas detalhadas sobre aplicação, especificações e composição..."
          class="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[8px] text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#4F8A6B] focus:ring-2 focus:ring-[#4F8A6B]/20 disabled:bg-gray-100 dark:disabled:bg-slate-900 min-h-[140px] transition-colors resize-y"
        ></textarea>
      </div>
    </div>
  `
})
export class ProductBasicInfoSectionComponent {
  readonly formName = input<string>('');
  readonly formSlug = input<string>('');
  readonly formShortDescription = input<string>('');
  readonly formDescription = input<string>('');
  readonly isReadOnly = input<boolean>(false);
  readonly isCreateMode = input<boolean>(false);
  readonly errors = input<Record<string, string>>({});

  readonly fieldChange = output<{ field: string; value: string }>();
  readonly descriptionChange = output<string>();

  onTextareaInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.descriptionChange.emit(val);
  }
}
