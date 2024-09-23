export const generateEmailContent = (formData: { siteAddress: any; siteHistory: any; expectedConsignments: any; consignmentDetails: any[]; }) => {
  let content = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
          h2 { color: #2980b9; margin-top: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .section { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Material Description Form Summary</h1>
        
        <div class="section">
          <h2>Site Information</h2>
          <p><strong>Site Address:</strong> ${formData.siteAddress}</p>
          <p><strong>Site History:</strong> ${formData.siteHistory}</p>
          <p><strong>Expected Consignments:</strong> ${formData.expectedConsignments}</p>
        </div>
  `

  formData.consignmentDetails.forEach((consignment, index) => {
    content += `
      <div class="section">
        <h2>Consignment ${index + 1} Details</h2>
        <p><strong>Material Description:</strong> ${consignment.materialDescription}</p>
        <p><strong>Expected Delivery Date:</strong> ${consignment.expectedDeliveryDate}</p>
        <p><strong>Expected Duration:</strong> ${consignment.expectedDuration}</p>
        <p><strong>Expected Frequency:</strong> ${consignment.expectedFrequency}</p>
        <p><strong>Expected Volume:</strong> ${consignment.expectedVolume}</p>
        
        <h3>Sampling Information</h3>
        <p><strong>Number of Samples Taken:</strong> ${consignment.samplesTaken}</p>
        <p><strong>Sample Method:</strong> ${consignment.sampleMethod}</p>
    `

    if (consignment.sampleMethod === 'other') {
      content += `<p><strong>Other Sample Method:</strong> ${consignment.otherSampleMethod}</p>`
    }

    content += `
        <p><strong>Additional Sampling Information:</strong> ${consignment.sampleMethodAdditionalInfo}</p>
        <p><strong>Soil Categorization:</strong> ${consignment.soilCategorization}</p>
    `

    if (consignment.soilCategorization === 'other') {
      content += `<p><strong>Other Soil Categorization:</strong> ${consignment.otherSoilCategorization}</p>`
    }

    content += `
        <p><strong>Additional Soil Categorization Information:</strong> ${consignment.soilCategorizationAdditionalInfo}</p>
        <h3>Analytical Summary</h3>
    `

    if (consignment.analyticalRows && consignment.analyticalRows.length > 0) {
      content += `
        <table>
          <tr>
            <th>Contaminant</th>
            <th>Maximum (mg/kg)</th>
            <th>Minimum (mg/kg)</th>
            <th>Average (mg/kg)</th>
            <th>Leachable (mg/L)</th>
          </tr>
      `

      consignment.analyticalRows.forEach((row: { contaminant: any; maximum: any; minimum: any; average: any; leachable: any; }) => {
        content += `
          <tr>
            <td>${row.contaminant}</td>
            <td>${row.maximum}</td>
            <td>${row.minimum}</td>
            <td>${row.average}</td>
            <td>${row.leachable}</td>
          </tr>
        `
      })

      content += `</table>`
    } else {
      content += `<p>No analytical data available for this consignment.</p>`
    }

    content += `</div>`
  })

  content += `
      </body>
    </html>
  `

  return content
};

export const updateFormData = (formDataRef: { current: any; }, field: any, value: any) => {
  formDataRef.current = {
    ...formDataRef.current,
    [field]: value,
  };
};