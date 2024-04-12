import { Dataset } from "crawlee";
export const dataset = await Dataset.open("stackoverflow");
const data = await dataset.getData();
if (data.count > 0) dataset.exportToCSV("stackoverflow");
