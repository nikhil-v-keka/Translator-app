import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { TranslateDto } from "../models/translateDto.model";

@Injectable({
    providedIn: 'root'
})
export class TranslatorService {
    private apiUrl: string = 'http://localhost:8000';

    constructor(
        private httpClient: HttpClient
    ) { }

    getLanguages() {
        return this.httpClient.get(`${this.apiUrl}/languages`);
    }

    extractTextFromFile(fileContent: any, fileName: string): Observable<any> {
        return this.httpClient.post(`${this.apiUrl}/ocr/?filename=${fileName}`, fileContent);
    }

    translateText(translateOptions: TranslateDto) {
        return this.httpClient.post(`${this.apiUrl}/chat`, translateOptions);
    }

    downloadTranslatedPdf(htmlContent: string) {
        return this.httpClient.post(`${this.apiUrl}/pdf`, { html_content: htmlContent });
    }
}