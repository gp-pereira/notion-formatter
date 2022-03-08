import { Book, Paragraph } from "./Book";
import { Notion } from "./Notion";

export class Formatter {
	constructor(private readonly notion: Notion) {}

	async execute(): Promise<void> {
		const books = await this.notion.retrieve_books();

		for (const book of books) {
			if (!this.should_format(book)) continue;

			try {
				console.log(`[INFO] Formatting book ${book.title}`);

				const iterator = this.iterate_paragraphs(book);

				for await (const paragraphs of iterator) {
					console.log(
						`[INFO] Updating batch of ${paragraphs.length} paragraphs`
					);

					for (let i = 0; i < paragraphs.length; i++) {
						const paragraph = paragraphs[i];
						const formatted = this.format_paragraph(paragraph);

						if (formatted.content == paragraph.content) continue;
						await this.notion.update_paragraph(formatted);

						console.log(
							`[INFO] Updated paragraph ${i} of ${paragraphs.length}`
						);
					}

					console.log(
						`[INFO] Done updating batch of ${paragraphs.length} paragraphs`
					);
				}

				book.formatted_at = new Date();
				await this.notion.update_book(book);

				console.log(`[INFO] Done formatting book ${book.title}`);
			} catch (err) {
				console.log("[ERROR] Failed to format book", book.title, err);
			}
		}
	}

	private should_format(book: Book): boolean {
		if (!book.formatted_at) return true;
		return book.formatted_at < book.updated_at;
	}

	private format_paragraph(paragraph: Paragraph): Paragraph {
		return {
			...paragraph,
			content: paragraph.content.replace(/\n/g, " ").replace(/\s+/g, " "),
		};
	}

	private iterate_paragraphs(book: Book): AsyncIterable<Paragraph[]> {
		const notion = this.notion;
		let next_cursor = "start";
		let curr_cursor = "start";

		return {
			[Symbol.asyncIterator]() {
				return {
					async next() {
						const { paragraphs, cursor } = await notion.retrieve_paragraphs(
							book,
							next_cursor == "start" ? undefined : next_cursor
						);

						next_cursor = curr_cursor;
						curr_cursor = cursor as string;

						return {
							done: !next_cursor,
							value: paragraphs,
						};
					},
				};
			},
		};
	}
}
