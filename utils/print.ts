import { MileageLog } from "@/types/mileage";
//Print log
export const printMileageLog = (log: MileageLog) => {
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Mileage Log</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Mileage Log</h1>
          <p>Start Date: ${new Date(log.start_date).toLocaleDateString()}</p>
          <p>End Date: ${new Date(log.end_date).toLocaleDateString()}</p>
          <p>Total Mileage: ${log.total_mileage} miles</p>
          <p>Start Mileage: ${log.start_mileage}</p>
          <p>End Mileage: ${log.end_mileage}</p>
          <p>Total Personal Miles: ${log.total_personal_miles}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Business Purpose</th>
                <th>Destination</th>
                <th>Miles</th>
              </tr>
            </thead>
            <tbody>
              ${log.log_entries
                .map(
                  (entry) => `
                <tr>
                  <td>${new Date(entry.date).toLocaleDateString()}</td>
                  <td>${entry.businessPurpose}</td>
                  <td>${entry.destination}</td>
                  <td>${entry.milesDriven}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};
