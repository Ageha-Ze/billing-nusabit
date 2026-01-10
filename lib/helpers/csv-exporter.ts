export function convertToCsv<T extends Record<string, any>>(data: T[], columns: { header: string, accessorKey: keyof T }[]): string {
  if (!data.length) {
    return '';
  }

  // Extract headers
  const headers = columns.map(col => col.header);
  const accessorKeys = columns.map(col => col.accessorKey);

  let csv = headers.join(',') + '\n';

  // Extract data rows
  data.forEach(row => {
    const values = accessorKeys.map(key => {
      let value = row[key];
      // Handle nested properties (e.g., client.name)
      if (typeof key === 'string' && key.includes('.')) {
        const path = key.split('.');
        value = path.reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : '', row);
      }

      // Basic CSV escaping for values that contain commas or newlines
      if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
        value = `"${value.replace(/