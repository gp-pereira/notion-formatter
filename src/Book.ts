export type Paragraph = {
	id: string;
	content: string;
};

export type Book = {
	id: string;
	title: string;
	updated_at: Date;
	formatted_at: Date | null;
};
