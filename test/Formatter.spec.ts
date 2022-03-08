import { Book } from "../src/Book";
import { Formatter } from "../src/Formatter";
import { mock_notion } from "./mocks/MockNotion";

describe("Formatter", () => {
	const formatter = new Formatter(mock_notion as any);
	let book: Book;

	beforeEach(() => {
		book = {
			id: "d89f96c1-b90c-4f94-8c5c-e70cf0d0ae82",
			title: "Book One - Water",
			updated_at: new Date(),
			formatted_at: null,
		};

		mock_notion.retrieve_books.mockResolvedValue([book]);

		jest.spyOn(console, "log").mockImplementation();
	});

	it("should iteratively update the book paragraphs", async () => {
		mock_notion.set_paragraphs([
			[{ content: "Goodbye\n Mars", id: "2" }],
			[{ content: "Hello\n World", id: "1" }],
		]);

		await formatter.execute();

		expect(mock_notion.update_paragraph).toHaveBeenNthCalledWith(1, {
			content: "Goodbye Mars",
			id: "2",
		});

		expect(mock_notion.update_paragraph).toHaveBeenNthCalledWith(2, {
			content: "Hello World",
			id: "1",
		});

		expect(mock_notion.update_paragraph).toHaveBeenCalledTimes(2);
	});

	it("should update the book format date", async () => {
		await formatter.execute();

		expect(mock_notion.update_book).toHaveBeenCalledWith({
			...book,
			formatted_at: expect.any(Date),
		});
	});

	it("should not update paragraph if formatting does not change the content", async () => {
		mock_notion.set_paragraphs([[{ content: "Goodbye Mars", id: "2" }]]);

		await formatter.execute();

		expect(mock_notion.update_paragraph).not.toHaveBeenCalled();
	});

	it("should continue to update the book in case of paragraph failure", async () => {
		mock_notion.update_paragraph.mockImplementationOnce(() => {
			throw new Error("Random external error");
		});

		await formatter.execute();

		expect(mock_notion.update_book).toHaveBeenCalled();
	});

	it("should not format a book before an external update is made", async () => {
		mock_notion.retrieve_books.mockResolvedValue([
			{
				...book,
				updated_at: new Date(1999, 10, 1),
				formatted_at: new Date(),
			},
		]);

		expect(mock_notion.update_book).not.toHaveBeenCalled();
	});
});
