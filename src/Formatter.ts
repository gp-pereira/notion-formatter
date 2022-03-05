import { Book, Paragraph } from "./Book";
import { Notion } from "./Notion";

const FIVE_MINUTES_DELAY = 1000 * 60 * 5;

export class Formatter {
	constructor(private readonly notion: Notion) {}

	async execute(): Promise<Book[]> {
		const books = await this.notion.retrieve_books();

		return Promise.all(
			books
				.filter((book) => this.should_format(book))
				.map((book) => this.format_book(book))
		);
	}

	private should_format(book: Book): boolean {
		if (!book.formatted_at) return true;
		return book.formatted_at < book.updated_at;
	}

	private async format_book(book: Book): Promise<Book> {
		book = await this.notion.retrieve_paragraphs(book);

		return {
			...book,
			paragraphs: this.format_paragraph(book.paragraphs!),
			formatted_at: new Date(Date.now() + FIVE_MINUTES_DELAY),
		};
	}

	private format_paragraph(paragraph: Paragraph[]): Paragraph[] {
		return paragraph.map((paragraph) => {
			return {
				...paragraph,
				content: paragraph.content.replace(/\n/g, " ").replace(/\s+/g, " "),
			};
		});
	}
}
