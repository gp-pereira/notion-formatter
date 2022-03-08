import { Client } from "@notionhq/client";
import { Book, Paragraph } from "./Book";

export class Notion {
	private client: Client;

	constructor(token: string, private readonly database_id: string) {
		this.client = new Client({ auth: token });
	}

	async retrieve_books(): Promise<Book[]> {
		await this.timer();

		const books = await this.client.databases.query({
			database_id: this.database_id,
		});

		return books.results.map((book) => this.parse_book(book));
	}

	async retrieve_paragraphs(
		book: Book,
		cursor?: string
	): Promise<{ paragraphs: Paragraph[]; cursor: null | string }> {
		await this.timer();

		const response = await this.client.blocks.children.list({
			block_id: book.id,
			page_size: 200,
			start_cursor: cursor,
		});

		const paragraphs = response.results
			.filter(this.is_paragraph)
			.map(this.parse_paragraph);

		return { paragraphs, cursor: response.next_cursor };
	}

	private is_paragraph(block: any): boolean {
		return block.type === "paragraph" && block.paragraph.rich_text.length > 0;
	}

	async update_book(book: Book): Promise<Book> {
		await this.timer();

		const response = await this.client.pages.update({
			page_id: book.id,
			properties: {
				formatted_at: {
					type: "date",
					date: {
						start: book.formatted_at!.toISOString(),
					},
				},
			},
		});

		return { ...book, ...this.parse_book(response) };
	}

	async update_paragraph(paragraph: Paragraph) {
		await this.timer();

		const response = await this.client.blocks.update({
			block_id: paragraph.id,
			paragraph: {
				rich_text: [
					{
						type: "text",
						text: {
							content: paragraph.content,
						},
					},
				],
			},
		});

		return this.parse_paragraph(response);
	}

	private parse_book(book: any): Book {
		return {
			id: book.id,
			title: book.properties.Title.title[0]?.text.content ?? "",
			updated_at: new Date(book.last_edited_time),
			formatted_at: this.formatted_at(book.properties.formatted_at.date?.start),
		};
	}

	private formatted_at(date?: string): Date | null {
		return date ? new Date(date) : null;
	}

	private parse_paragraph(block: any): Paragraph {
		return {
			id: block.id,
			content: block.paragraph.rich_text[0]?.plain_text,
		};
	}

	private timer(): Promise<void> {
		const REQUESTS_DELAY = 400;
		return new Promise((resolve) => setTimeout(resolve, REQUESTS_DELAY));
	}
}
