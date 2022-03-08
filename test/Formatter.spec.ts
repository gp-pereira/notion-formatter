import { Book } from "../src/Book";
import { Formatter } from "../src/Formatter";
import { Notion } from "../src/Notion";

const fake_notion = {
	retrieve_books: jest.fn(),
	retrieve_paragraphs: jest.fn(async (book) => book),
	update_book: jest.fn(async (book) => book),
	update_paragraph: jest.fn(async (book) => book),
} as any;

describe.only("Formatter", () => {
	const formatter = new Formatter(fake_notion);
	let book: Book;

	beforeEach(() => {
		book = {
			id: "d89f96c1-b90c-4f94-8c5c-e70cf0d0ae82",
			title: "Book One - Water",
			updated_at: new Date(),
			formatted_at: null,
		};

		fake_notion.retrieve_books.mockResolvedValue([book]);

		fake_notion.retrieve_paragraphs.mockResolvedValue({
			paragraphs: [{ content: "Hello\n World", id: 1 }],
			cursor: "",
		});

		jest.spyOn(console, "log").mockImplementation();
	});

	it("should iteratively update the book paragraphs", async () => {
		fake_notion.retrieve_paragraphs.mockResolvedValueOnce({
			paragraphs: [{ content: "Goodbye\n Mars", id: 2 }],
			cursor: "next",
		});

		await formatter.execute();

		expect(fake_notion.update_paragraph).toHaveBeenNthCalledWith(1, {
			content: "Goodbye Mars",
			id: 2,
		});

		expect(fake_notion.update_paragraph).toHaveBeenNthCalledWith(2, {
			content: "Hello World",
			id: 1,
		});

		expect(fake_notion.update_paragraph).toHaveBeenCalledTimes(2);
	});

	it("should update the book format date", async () => {
		await formatter.execute();

		expect(fake_notion.update_book).toHaveBeenCalledWith({
			...book,
			formatted_at: expect.any(Date),
		});
	});

	it("should not update the book format date in case of paragraph failure", async () => {
		fake_notion.retrieve_paragraphs.mockImplementationOnce(() => {
			throw new Error("Random external error");
		});

		await formatter.execute();

		expect(fake_notion.update_book).not.toHaveBeenCalled();
	});

	it("should not format a book before an external update is made", async () => {
		fake_notion.retrieve_books.mockResolvedValue([
			{
				...book,
				updated_at: new Date(1999, 10, 1),
				formatted_at: new Date(),
			},
		]);

		expect(fake_notion.update_book).not.toHaveBeenCalled();
	});
});
