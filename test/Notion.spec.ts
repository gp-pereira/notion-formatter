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
	});

	const book = {
		id: "d89f96c1-b90c-4f94-8c5c-e70cf0d0ae82",
		title: "Clean Architecture",
		updated_at: new Date(),
		formatted_at: new Date(),
	};

	it("should update book format date", async () => {
		const end = book.formatted_at!.getTime();
		const start = end - ONE_MINUTE;

		const updated_book = await notion.update_book(book);

		expect(updated_book.formatted_at!.getTime()).toBeGreaterThan(start);
		expect(updated_book.formatted_at!.getTime()).toBeLessThan(end);
	});

	it("should retrieve the paragraphs for a given book", async () => {
		for await (const paragraphs of notion.iterate_paragraphs(book)) {
			expect(paragraphs.length).toBeGreaterThan(0);

			expect(paragraphs[0].id).toBeDefined();
			expect(paragraphs[0].content).toBeDefined();

			break;
		}
	});
});
