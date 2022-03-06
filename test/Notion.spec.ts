import { Notion } from "../src/Notion";
import "dotenv/config";

const ONE_MINUTE = 60 * 1000;

describe("Notion", () => {
	const notion = new Notion(
		process.env.NOTION_TOKEN as string,
		process.env.NOTION_DATABASE_ID as string
	);

	it("should retrieve the list of books", async () => {
		const books = await notion.retrieve_books();

		expect(books.length).toBeGreaterThan(0);

		expect(books[0].id).toBeDefined();
		expect(books[0].title).toBeDefined();
		expect(books[0].updated_at).toBeDefined();
		expect(books[0].formatted_at).toBeDefined();
		expect(books[0].paragraphs).not.toBeDefined();
	});

	it("should retrieve the paragraphs for a given book", async () => {
		const book = {
			id: "d89f96c1-b90c-4f94-8c5c-e70cf0d0ae82",
			title: "Clean Architecture",
			updated_at: new Date(),
			formatted_at: null,
		};

		const book_with_paragraphs = await notion.retrieve_paragraphs(book);

		expect(book_with_paragraphs.paragraphs).toBeDefined();
		expect(book_with_paragraphs.paragraphs!.length).toBeGreaterThan(0);

		expect(book_with_paragraphs.paragraphs![0].id).toBeDefined();
		expect(book_with_paragraphs.paragraphs![0].content).toBeDefined();
	});

	it("should update a book", async () => {
		const book = {
			id: "d89f96c1-b90c-4f94-8c5c-e70cf0d0ae82",
			title: "Clean Architecture",
			updated_at: new Date(),
			formatted_at: new Date(),
			paragraphs: [
				{
					id: "7daa1e02-6dd4-4f40-9c23-cf0235295599",
					content: String(Math.random()),
				},
			],
		};

		const updated_book = await notion.update_book(book);

		// Notion rounds the date to the nearest minute below
		const end = book.formatted_at!.getTime();
		const start = end - ONE_MINUTE;

		expect(updated_book.formatted_at!.getTime()).toBeGreaterThan(start);
		expect(updated_book.formatted_at!.getTime()).toBeLessThan(end);

		expect(updated_book.paragraphs).toEqual(book.paragraphs);
	});
});
