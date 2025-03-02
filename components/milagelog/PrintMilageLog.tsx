"use client";

import { MileageLog } from "@/types/mileage";
import { Button } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPrinter } from "@tabler/icons-react";

interface PrintMilageLogProps {
  log: MileageLog;
}

// Export a reusable function to print mileage logs
export const printMileageLog = (log: MileageLog) => {
  const printContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0;
            padding: 20px;
            color: #333;
          }
          
          .container {
            max-width: 1000px;
            margin: 0 auto;
          }
          
          .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            padding: 24px;
            background-color: white;
          }
          
          .header { 
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
          }
          
          h1 {
            font-size: 24px;
            margin: 0 0 10px 0;
            color: #333;
          }
          
          .subtitle {
            color: #777;
            font-size: 14px;
            margin: 0 0 20px 0;
          }
          
          .summary-title {
            font-size: 18px;
            margin: 0 0 15px 0;
            font-weight: 600;
          }
          
          .summary-container {
            background-color: #f9f9f9;
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          
          .summary-group {
            margin-bottom: 15px;
          }
          
          .summary-label {
            color: #777;
            font-size: 12px;
            margin-bottom: 4px;
          }
          
          .summary-value {
            font-weight: 600;
            font-size: 14px;
          }
          
          .highlight-value {
            color: #228be6;
          }
          
          .tax-value {
            color: #40c057;
            font-size: 16px;
            font-weight: 700;
          }
          
          .divider {
            height: 1px;
            background-color: #eee;
            margin: 15px 0;
          }
          
          .entries-title {
            font-size: 18px;
            margin: 20px 0 15px 0;
            font-weight: 600;
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse;
            font-size: 14px;
          }
          
          th, td { 
            border: 1px solid #eee; 
            padding: 10px; 
            text-align: left; 
          }
          
          th { 
            background-color: #f5f5f5;
            font-weight: 600;
            color: #555;
          }
          
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          tr:hover {
            background-color: #f0f0f0;
          }
          
          @media print {
            body {
              padding: 0;
            }
            .page-break {
              page-break-before: always;
            }
            .card {
              border: none;
              box-shadow: none;
            }
            @page {
              size: landscape;
              margin: 0.5cm;
            }
            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 100%;
            }
          }
          
          @media screen and (max-width: 768px) {
            .summary-grid {
              grid-template-columns: 1fr;
            }
            table {
              font-size: 12px;
            }
            th, td {
              padding: 8px;
            }
            h1 {
              font-size: 20px;
            }
            .card {
              padding: 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <h1>Mileage Log</h1>
              <p class="subtitle">Tax deduction record for business travel</p>
            </div>
            
            <div class="summary-container">
              <h2 class="summary-title">Summary</h2>
              
              <div class="summary-grid">
                <div>
                  <div class="summary-group">
                    <div class="summary-label">Vehicle</div>
                    <div class="summary-value">${log.vehicle_info?.name || 'Not specified'}</div>
                  </div>
                  
                  <div class="summary-group">
                    <div class="summary-label">Period</div>
                    <div class="summary-value">${new Date(log.start_date).toLocaleDateString()} - ${new Date(log.end_date).toLocaleDateString()}</div>
                  </div>
                  
                  <div class="summary-group">
                    <div class="summary-label">Personal Miles</div>
                    <div class="summary-value">${log.total_personal_miles} miles</div>
                  </div>
                </div>
                
                <div>
                  <div class="summary-group">
                    <div class="summary-label">Total Mileage</div>
                    <div class="summary-value">${log.total_mileage} miles</div>
                  </div>
                  
                  <div class="summary-group">
                    <div class="summary-label">Business Miles</div>
                    <div class="summary-value highlight-value">${log.total_business_miles} miles</div>
                  </div>
                  
                  <div class="summary-group">
                    <div class="summary-label">Deduction Rate</div>
                    <div class="summary-value">$${log.business_deduction_rate?.toFixed(2) || '0.00'}/mile</div>
                  </div>
                </div>
                
                <div>
                  <div class="summary-group">
                    <div class="summary-label">Odometer Reading</div>
                    <div class="summary-value">${log.start_mileage} → ${log.end_mileage}</div>
                  </div>
                  
                  <div class="summary-group">
                    <div class="summary-label">Tax Deduction</div>
                    <div class="summary-value tax-value">$${log.business_deduction_amount?.toFixed(2) || '0.00'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <h2 class="entries-title">Mileage Log Entries</h2>
            
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Odometer Start</th>
                  <th>Odometer End</th>
                  <th>Total Miles</th>
                  <th>Business Miles</th>
                  <th>Personal Miles</th>
                  <th>Location</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                ${log.log_entries
                  .map(
                    (entry) => `
                  <tr>
                    <td>${new Date(entry.date).toLocaleDateString()}</td>
                    <td>${entry.vehicle}</td>
                    <td>${entry.startMileage}</td>
                    <td>${entry.endMileage}</td>
                    <td>${entry.totalMiles}</td>
                    <td>${entry.businessMiles}</td>
                    <td>${entry.personalMiles}</td>
                    <td>${entry.location}</td>
                    <td>${entry.businessPurpose}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }
};

export const PrintMilageLog: React.FC<PrintMilageLogProps> = ({ log }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handlePrint = () => {
    printMileageLog(log);
  };

  return (
    <Button
      leftSection={<IconPrinter />}
      onClick={handlePrint}
      variant="light"
      color="blue"
      fullWidth={isMobile}
      size={isMobile ? "md" : "sm"}
    >
      Print Log
    </Button>
  );
};
