export class TranslateDto {
    language: string;
    text: string;

    constructor(args: any) {
        this.language = args.language;
        this.text = args.text;
    }
}