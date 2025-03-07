import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// import { saveAs } from 'file-saver';

import { TranslatorService } from './services/translator.service';
import { FileUploadDetails } from './models/file-upload-details.model';
import { TranslateDto } from './models/translateDto.model';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
    ],
    styleUrl: './app.component.scss'
})
export class AppComponent {
    originalText: string = '';
    translatedText: string = '';
    targetLanguage: string = '';
    selectedFile: File | null = null;
    languages: any[] = [];
    isTranslationInProgress: boolean;

    private translateService = inject(TranslatorService);

    @ViewChild("editorContainer", { static: true })
    editorContainer: ElementRef | null = null;

    editor;

    ngOnInit() {
        this.translateService.getLanguages().subscribe({
            next: (data: any) => this.languages = data.languages
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            this.selectedFile = file;
            const filename = this.selectedFile.name;
            const formData = new FormData();
            formData.append('file', file, file.name)
            this.translateService.extractTextFromFile(formData, filename).subscribe({
                next: (data: FileUploadDetails) => {
                    this.originalText = data.text;
                }
            })

        } else {
            alert('Please select a valid PDF file');
        }
    }

    translate() {
        this.translatedText = '';
        let translateDto = new TranslateDto({});
        translateDto.language = this.targetLanguage;
        translateDto.text = this.originalText.replace(/(\r\n|\n|\r)/gm, "");;
        this.isTranslationInProgress = true;
        this.translateService.translateText(translateDto).subscribe({
            next: (data: any) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.response, 'text/html');
                this.translatedText = doc.body.innerHTML;
            },
            complete: () => this.isTranslationInProgress = false
        })
    }

    downloadPdf() {
        this.translateService.downloadTranslatedPdf(this.translatedText).subscribe({
            next: (data: any) => {
                console.log(data);
                // const blob = new Blob([data], { type: 'application/octet-stream' });
                // saveAs(blob, 'Sample file');
            }
        });
    }
}