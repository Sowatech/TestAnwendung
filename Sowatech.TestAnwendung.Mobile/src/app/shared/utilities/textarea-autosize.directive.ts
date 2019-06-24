import { ElementRef, HostListener, Directive } from '@angular/core';

@Directive({
  selector: 'ion-textarea[autosize]'
})

export class TextareaAutosize {
  @HostListener('input', ['$event.target'])
  onInput(textArea: HTMLTextAreaElement): void {
    this.adjust(textArea);
  }
  
  constructor(public element: ElementRef) {
  }

  adjust(textArea: HTMLTextAreaElement = null): void {
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
  }
}