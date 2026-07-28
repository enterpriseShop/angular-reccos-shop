import { Directive, ElementRef, HostListener, input, inject, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  readonly tooltipText = input<string>('', { alias: 'appTooltip' });
  readonly tooltipPosition = input<'top' | 'bottom' | 'left' | 'right'>('top');

  private tooltipElement: HTMLElement | null = null;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.tooltipText()) return;
    this.createTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.destroyTooltip();
  }

  private createTooltip(): void {
    if (this.tooltipElement) return;

    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.appendChild(this.tooltipElement, this.renderer.createText(this.tooltipText()));

    // Apply styles
    const classes = [
      'fixed',
      'z-50',
      'px-2.5',
      'py-1',
      'text-xs',
      'font-medium',
      'text-white',
      'bg-gray-900',
      'dark:bg-slate-700',
      'rounded-md',
      'shadow-md',
      'pointer-events-none',
      'whitespace-nowrap',
      'transition-opacity',
      'duration-150',
    ];
    classes.forEach((cls) => this.renderer.addClass(this.tooltipElement, cls));

    this.renderer.appendChild(document.body, this.tooltipElement);
    this.positionTooltip();
  }

  private positionTooltip(): void {
    if (!this.tooltipElement) return;

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();

    let top = 0;
    let left = 0;

    const pos = this.tooltipPosition();

    if (pos === 'top') {
      top = hostRect.top - tooltipRect.height - 6;
      left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
    } else if (pos === 'bottom') {
      top = hostRect.bottom + 6;
      left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
    } else if (pos === 'left') {
      top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
      left = hostRect.left - tooltipRect.width - 6;
    } else if (pos === 'right') {
      top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
      left = hostRect.right + 6;
    }

    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }

  private destroyTooltip(): void {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }
}
