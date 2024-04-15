import { dataset } from "./dataset";

const info = await dataset.getInfo();
const count = info?.itemCount;
console.log(count);
const fileName = "stackoverflow";
if (count && count > 0) {
  dataset.exportToJSON(fileName);
  console.log(`Exported ${fileName} on storage/key_value_stores/default`);
}
