"use client";

import { MileageLog } from "@/types/mileage";
import { Button } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPrinter } from "@tabler/icons-react";

interface PrintMilageLogProps {
  log: MileageLog;
}

// Helper function to get location based on purpose
const getLocation = (purpose: string) => {
  if (purpose.includes("Client")) {
    return "Client Office";
  } else if (purpose.includes("Meeting")) {
    return "Business Meeting";
  } else if (purpose.includes("Conference")) {
    return "Conference Center";
  } else if (purpose.includes("Site")) {
    return "Project Site";
  } else if (purpose.includes("Property")) {
    return "Property Location";
  } else if (purpose.includes("Delivery")) {
    return "Customer Address";
  } else if (purpose.includes("Pickup")) {
    return "Pickup Location";
  } else {
    return "Business Location";
  }
};

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

          .icon {
            display: inline-block;
            width: 24px;
            height: 24px;
            background-color: #e7f5ff;
            border-radius: 50%;
            text-align: center;
            line-height: 24px;
            margin-right: 10px;
            color: #228be6;
          }

          .icon-cyan {
            background-color: #e3fafc;
            color: #15aabf;
          }

          .icon-gray {
            background-color: #f1f3f5;
            color: #495057;
          }

          .icon-green {
            background-color: #ebfbee;
            color: #40c057;
          }

          .icon-yellow {
            background-color: #fff9db;
            color: #fcc419;
          }

          .summary-row {
            display: flex;
            margin-bottom: 15px;
          }

          .summary-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 10px;
          }

          .summary-content {
            display: flex;
            flex-direction: column;
          }

          .summary-columns {
            display: flex;
            justify-content: space-between;
            gap: 20px;
          }

          .summary-column {
            flex: 1;
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
            .summary-columns {
              flex-direction: column;
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
              <div class="divider"></div>
              
              <div class="summary-columns">
                <div class="summary-column">
                  <div class="summary-item">
                    <div class="icon">
                      <i>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                          <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                          <path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6"></path>
                          <path d="M6 9h11"></path>
                        </svg>
                      </i>
                    </div>
                    <div class="summary-content">
                      <div class="summary-label">Vehicle</div>
                      <div class="summary-value">${log.vehicle_info || "Not specified"}</div>
                    </div>
                  </div>
                  
                  <div class="summary-item">
                    <div class="icon">
                      <i>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z"></path>
                          <path d="M16 3v4"></path>
                          <path d="M8 3v4"></path>
                          <path d="M4 11h16"></path>
                          <path d="M11 15h1"></path>
                          <path d="M12 15v3"></path>
                        </svg>
                      </i>
                    </div>
                    <div class="summary-content">
                      <div class="summary-label">Period</div>
                      <div class="summary-value">
                        ${new Date(log.start_date).toLocaleDateString()} - 
                        ${new Date(log.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div class="summary-item">
                    <div class="icon">
                      <i>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M4 19l16 0"></path>
                          <path d="M4 15l4 -6l4 2l4 -5l4 4"></path>
                        </svg>
                      </i>
                    </div>
                    <div class="summary-content">
                      <div class="summary-label">Total Mileage</div>
                      <div class="summary-value">${log.total_mileage.toFixed(1)} miles</div>
                    </div>
                  </div>
                </div>
                
                <div class="summary-column">
                  <div class="summary-item">
                    <div class="icon icon-cyan">
                      <i>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                          <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                          <path d="M13.41 10.59l2.59 -2.59"></path>
                          <path d="M7 12a5 5 0 0 1 5 -5"></path>
                        </svg>
                      </i>
                    </div>
                    <div class="summary-content">
                      <div class="summary-label">Odometer Reading</div>
                      <div class="summary-value">
                        ${log.start_mileage.toFixed(1)} → ${log.end_mileage.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div class="summary-item">
                    <div class="icon icon-gray">
                      <i>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M5 12l-2 0l9 -9l9 9l-2 0"></path>
                          <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"></path>
                          <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"></path>
                        </svg>
                      </i>
                    </div>
                    <div class="summary-content">
                      <div class="summary-label">Personal Miles</div>
                      <div class="summary-value">${log.total_personal_miles.toFixed(1)} miles</div>
                    </div>
                  </div>
                  
                  <div class="summary-item">
                    <div class="icon icon-green">
                      <i>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M3 7m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-12z"></path>
                          <path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2"></path>
                          <path d="M12 7v1m0 8v1"></path>
                          <path d="M3 13a20 20 0 0 0 18 0"></path>
                        </svg>
                      </i>
                    </div>
                    <div class="summary-content">
                      <div class="summary-label">Business Miles</div>
                      <div class="summary-value">${log.total_business_miles.toFixed(1)} miles</div>
                    </div>
                  </div>
                </div>
                
                <div class="summary-column">
                  <div class="summary-item">
                    <div class="icon icon-yellow">
                      <i>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                          <path d="M14.8 9a2 2 0 0 0 -1.8 -1h-2a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-2a2 2 0 0 1 -1.8 -1"></path>
                          <path d="M12 6v2m0 8v2"></path>
                        </svg>
                      </i>
                    </div>
                    <div class="summary-content">
                      <div class="summary-label">Deduction Rate</div>
                      <div class="summary-value">$${log.business_deduction_rate?.toFixed(2) || "0.00"}/mile</div>
                    </div>
                  </div>
                  
                  <div class="summary-item">
                    <div class="icon icon-green">
                      <i>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2"></path>
                          <path d="M14 8h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5"></path>
                          <path d="M12 7v1m0 8v1"></path>
                        </svg>
                      </i>
                    </div>
                    <div class="summary-content">
                      <div class="summary-label">Tax Deduction</div>
                      <div class="summary-value" style="font-weight: 700; color: #40c057; font-size: 16px;">
                        $${log.business_deduction_amount?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                  </div>
                  
                  <div class="summary-item">
                    <div class="icon">
                      <i>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M3 21l18 0"></path>
                          <path d="M9 8l1 0"></path>
                          <path d="M9 12l1 0"></path>
                          <path d="M9 16l1 0"></path>
                          <path d="M14 8l1 0"></path>
                          <path d="M14 12l1 0"></path>
                          <path d="M14 16l1 0"></path>
                          <path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16"></path>
                        </svg>
                      </i>
                    </div>
                    <div class="summary-content">
                      <div class="summary-label">Business Type</div>
                      <div class="summary-value">${log.business_type || "Not specified"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <h2 class="entries-title">Mileage Log Entries</h2>
            
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Miles</th>
                  <th>Location</th>
                  <th>Purpose</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                ${log.log_entries
                  .map((entry) => {
                    const date = new Date(entry.date).toLocaleDateString();
                    const startMileage = entry.start_mileage.toFixed(1);
                    const endMileage = entry.end_mileage.toFixed(1);
                    const miles = entry.miles.toFixed(1);
                    const purpose = entry.purpose;
                    const type = entry.type;
                    // Generate location based on purpose if not available
                    const location =
                      "location" in entry
                        ? entry.location
                        : getLocation(purpose);

                    return `
                    <tr>
                      <td>${date}</td>
                      <td>${startMileage}</td>
                      <td>${endMileage}</td>
                      <td>${miles}</td>
                      <td>${location}</td>
                      <td>${purpose}</td>
                      <td>${type}</td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </body>
    </html>
  `;

  // Create a new window for printing
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    // Add a small delay to ensure content is loaded before printing
    setTimeout(() => {
      printWindow.print();
      // Close the window after print dialog is closed (or after a timeout)
      setTimeout(() => {
        printWindow.close();
      }, 500);
    }, 500);
  }
};

export function PrintMilageLog({ log }: PrintMilageLogProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Button
      leftSection={<IconPrinter size={16} />}
      onClick={() => printMileageLog(log)}
      variant="light"
      color="blue"
      size={isMobile ? "md" : "sm"}
      fullWidth={isMobile}
    >
      Print Log
    </Button>
  );
}
