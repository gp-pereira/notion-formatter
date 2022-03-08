import { Paragraph } from "../../src/Book";

class MockNotion {
	retrieve_books = jest.fn();
	update_book = jest.fn();
	update_paragraph = jest.fn();

	private paragraphs: Paragraph[][] = [];

	set_paragraphs(paragraphs: Paragraph[][]) {
		this.paragraphs = paragraphs;
	}

	iterate_paragraphs() {
		const paragraphs = this.paragraphs;
		let index = -1;

		return {
			[Symbol.asyncIterator]() {
				return {
					async next() {
						index += 1;

						return {
							done: index === paragraphs.length,
							value: paragraphs[index],
						};
					},
				};
			},
		};
	}
}

export const mock_notion = new MockNotion();
