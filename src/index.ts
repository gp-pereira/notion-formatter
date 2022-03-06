import { Formatter } from "./Formatter";
import { Notion } from "./Notion";
import "dotenv/config";

async function main() {
	const notion = new Notion(
		process.env.NOTION_TOKEN as string,
		process.env.NOTION_DATABASE_ID as string
	);

	const formatter = new Formatter(notion);

	console.log("[INFO] Started formatting books");

	await formatter.execute();

	console.log("[INFO] Done formatting books");
}

main();
