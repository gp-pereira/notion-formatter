import { Formatter } from "../src/Formatter";
import { Notion } from "../src/Notion";

const fake_notion = {
	retrieve_books: jest.fn(),
	retrieve_paragraphs: jest.fn(async (book) => book),
	update_book: jest.fn(async (book) => book),
	update_paragraphs: jest.fn(async (book) => book),
} as any;

describe.only("Formatter", () => {
	const formatter = new Formatter(fake_notion);

	const book = {
		id: "d89f96c1-b90c-4f94-8c5c-e70cf0d0ae82",
		title: "Book One - Water",
		updated_at: new Date(),
		formatted_at: null,
	};

	it("should retrieve all books and format them", async () => {
		fake_notion.retrieve_books.mockResolvedValue([book]);

		fake_notion.retrieve_paragraphs.mockImplementation(async (book: any) => ({
			...book,
			paragraphs: [
				{
					id: "d89f96c1-b90c-4f94-8c5c-e70cf0d0ae82",
					content:
						"This is a paragraph.\n     This belongs to the same paragraph.",
				},
				{
					id: "d89f96c1-b90c-4f94-8c5c-e70cf0d0ae82",
					content:
						"This is a paragraph.  \nThis belongs to the same paragraph.",
				},
				{
					id: "d89f96c1-b90c-4f94-8c5c-e70cf0d0ae82",
					content:
						"This is a paragraph.\n\n This belongs to the same paragraph.",
				},
			],
		}));

		const [formatted_book] = await formatter.execute();

		expect(formatted_book).toEqual({
			...book,
			formatted_at: expect.any(Date),
			paragraphs: [
				{
					id: "d89f96c1-b90c-4f94-8c5c-e70cf0d0ae82",
					content: "This is a paragraph. This belongs to the same paragraph.",
				},
				{
					id: "d89f96c1-b90c-4f94-8c5c-e70cf0d0ae82",
					content: "This is a paragraph. This belongs to the same paragraph.",
				},
				{
					id: "d89f96c1-b90c-4f94-8c5c-e70cf0d0ae82",
					content: "This is a paragraph. This belongs to the same paragraph.",
				},
			],
		});
	});

	it("should not format books before an external update is made", async () => {
		const now = new Date();

		fake_notion.retrieve_books.mockResolvedValue([
			{
				...book,
				updated_at: new Date(1999, 10, 1),
				formatted_at: now,
			},
		]);

		const formatted_books = await formatter.execute();

		expect(formatted_books).toEqual([]);
	});
});
