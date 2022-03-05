export type Paragraph = {
	id: string;
	content: string;
};

export type Book = {
	id: string;
	title: string;
	paragraphs?: Paragraph[];

	updated_at: Date;
	formatted_at: Date | null;
};
