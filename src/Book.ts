export type Paragraph = {
	id: string;
	content: string;
};

export type Book = {
	id: string;
	paragraphs?: Paragraph[];

	updated_at: Date;
	formatted_at: Date | null;
};
