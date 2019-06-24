import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';

@Component({
  selector: 'swt-dropdown-container',
  templateUrl: './swt-dropdown-container.component.html',
  host: { '(document:click)': 'onDocumentClick($event)' }
})

export class DropDownContainerComponent {

  constructor(private elementRef: ElementRef) {
  }

  private onDocumentClick(event) {
    let clickInComponent = this.elementRef.nativeElement.contains(event.target);
    if (!clickInComponent) {
      this.collapse();
    }
  }

  @Input('width') width: string;
  @Input() displayValue: string;
  @Input() collapsed: boolean = true;
  @Input() allowClear: boolean = false;

  @Output() onClear = new EventEmitter<void>();
  @Output() onShow = new EventEmitter<void>();

  public toggleCollapse(event: any) {
    if (this.collapsed)
      this.onShow.emit();
    event.preventDefault();
    this.collapsed = !this.collapsed;
  }

  public collapse() {
    this.collapsed = true;
  }

  public expand() {
    this.collapsed = false;
  }

  clear(eventData: Event) {
    eventData.stopPropagation();
    this.onClear.emit();
  }
}
