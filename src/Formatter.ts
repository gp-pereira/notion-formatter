import { Book, Paragraph } from "./Book";
import { Notion } from "./Notion";
import { timer } from "./timer";

const ONE_HOUR_DELAY = 1000 * 60 * 60;

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
		try {
			book = await this.notion.retrieve_paragraphs(book);

			book = {
				...book,
				paragraphs: this.format_paragraph(book.paragraphs!),
				formatted_at: new Date(Date.now() + ONE_HOUR_DELAY),
			};

			await this.notion.update_book(book);
			console.log("[INFO] Formatted book", book.title);

			return book;
		} catch (err) {
			console.log("[ERROR] Failed to format book", book.title, err);

			return book;
		}
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
