import { Book, Paragraph } from "./Book";
import { Notion } from "./Notion";

export class Formatter {
	constructor(private readonly notion: Notion) {}

	async execute(): Promise<void> {
		const books = await this.notion.retrieve_books();

		for (const book of books) {
			if (!this.should_format(book)) continue;

			console.log(`\n[INFO] Formatting book ${book.title}`);

			await this.update_paragraphs(book);
			await this.update_book(book);

			console.log("[INFO] Done formatting book");
		}
	}

	private should_format(book: Book): boolean {
		if (!book.formatted_at) return true;
		return book.formatted_at < book.updated_at;
	}

	private async update_paragraphs(book: Book): Promise<void> {
		for await (const paragraphs of this.notion.iterate_paragraphs(book)) {
			console.log(`[INFO]   Updating batch of ${paragraphs.length} paragraphs`);

			for (let i = 0; i < paragraphs.length; i++) {
				try {
					const paragraph = paragraphs[i];
					const formatted = this.format_paragraph(paragraph);

					if (formatted.content == paragraph.content) continue;
					await this.notion.update_paragraph(formatted);

					console.log(`[INFO]     Updated paragraph ${i}`);
				} catch (err) {
					console.log("[ERROR]    Failed to format paragraph", err);
				}
			}

			console.log("[INFO]   Done updating batch");
		}
	}

	private format_paragraph(paragraph: Paragraph): Paragraph {
		return {
			...paragraph,
			content: paragraph.content.replace(/\n/g, " ").replace(/\s+/g, " "),
		};
	}

	private async update_book(book: Book): Promise<void> {
		const delay = +1 * 60 * 60 * 1000;

		book.formatted_at = new Date(Date.now() + delay);
		await this.notion.update_book(book);
	}
}
