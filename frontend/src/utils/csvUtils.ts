/*
* Utility functions for exporting data as CSV files.
* Used code from https://luigicavalieri.com/blog/downloading-array-data-objects-as-csv-file-with-typescript/
* licensed under MIT License
* https://opensource.org/license/mit/
*/

export type CsvFormatValueCallback<DataItem> = (
  // eslint-disable-next-line
  value: any,
  dataItem: DataItem
) => string;

export interface CsvColumn<CallbackDataItem = Record<string, unknown>> {
  key: string;
  title: string;
  formatValue?: CsvFormatValueCallback<CallbackDataItem>;
}

export const downloadCsv = <DataItem = Record<string, unknown>>(
  data: DataItem[],
  columns: CsvColumn<DataItem>[],
  filename: string
) => {
  const nullToEmptyReplacer = (_key: string, value: unknown) => {
    return null === value ? "" : value;
  };

  // Converts a 'DataItem' object into an array of strings.
  const prepareDataItem = (item: DataItem) => {
    return columns.map((column) => {
      let value;
      const key = column.key as keyof DataItem;

      try {
        value = item[key] ?? "-";

        if (typeof column.formatValue === "function") {
          value = column.formatValue(item[key], item);
        }
      } catch {
        value = "-";
      }

      return JSON.stringify(value, nullToEmptyReplacer);
    });
  };

  const headingsRow = columns.map((column) => column.title).join(",");
  const contentRows = data.map((dataItem) => {
    return prepareDataItem(dataItem).join(",");
  });

  const csvDataString = [headingsRow, ...contentRows].join("\r\n");

  const universalBom = "\uFEFF";
  const blobParts = [universalBom + csvDataString];
  const blobOptions: BlobPropertyBag = {
    type: "text/csv;charset=UTF-8",
  };

  const file = new Blob(blobParts, blobOptions);
  const link = document.createElement("a");

  link.href = window.URL.createObjectURL(file);
  link.download = `${filename}.csv`;
  link.click();
};
