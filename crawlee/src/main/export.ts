import { Dataset } from "crawlee";
export const dataset = await Dataset.open("stackoverflow");
const data = await dataset.getData();
const fileName = "stackoverflow";
if (data.count > 0) {
  dataset.exportToCSV(fileName);
  console.log(`Exported ${fileName} on storage/key_value_stores/default`);
}
