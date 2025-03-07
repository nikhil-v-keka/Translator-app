import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TranslatorService } from './services/translator.service';
import { FileUploadDetails } from './models/file-upload-details.model';
import { TranslateDto } from './models/translateDto.model';
import { saveAs } from 'file-saver';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule,
        // QuillModule.forRoot()
    ],
    styleUrl: './app.component.scss'
})
export class AppComponent {
    originalText: string = '';
    translatedText: string = '';
    targetLanguage: string = '';
    selectedFile: File | null = null;
    languages: any[] = [];

    private translateService = inject(TranslatorService);

    @ViewChild("editorContainer", { static: true })
    editorContainer: ElementRef | null = null;

    editor;
    
    ngOnInit() {
        this.translateService.getLanguages().subscribe({
            next: (data: any) => this.languages = data.languages
        });
        // if (this.editorContainer) {
        //     try {
        //         this.editor = new Quill(this.editorContainer.nativeElement, {
        //             modules: {
        //                 toolbar: [
        //                     [{ header: [1, 2, false] }],
        //                     ["bold", "italic", "underline", "strike"],
        //                     [{ list: "ordered" }, { list: "bullet" }],
        //                     ["link", "image", "video"],
        //                     [{ align: [] }],
        //                     [{ color: [] }, { background: [] }],
        //                     ["clean"],
        //                 ],
        //             },
        //             theme: "snow",
        //         });
        //     } catch (error) {
        //         console.error("Error creating Quill editor:", error);
        //     }
        // } else {
        //     console.error("Element with #editorContainer not found!");
        // }
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
        let translateDto = new TranslateDto({});
        translateDto.language = this.targetLanguage;
        translateDto.text = this.originalText.replace(/(\r\n|\n|\r)/gm, "");;
        this.translateService.translateText(translateDto).subscribe({
            next: (data: any) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.response, 'text/html');
                this.translatedText = doc.body.innerHTML;
            }
        })
    }

    downloadPdf() {
        this.translateService.downloadTranslatedPdf(this.translatedText).subscribe({
            next: (data: any) => {
                console.log(data);
                const blob = new Blob([data], { type: 'application/octet-stream' });
                saveAs(blob, 'Sample file');
            }
        });
    }
}