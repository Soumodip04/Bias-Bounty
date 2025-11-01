// Export utilities for analysis results

export async function exportToPDF(results: any, datasetName: string) {
  try {
    const biasScore = results?.bias_score ?? results?.analysis?.bias_score ?? 0
    const fairness = results?.fairness_metrics ?? results?.analysis?.fairness_metrics
    const recs = results?.recommendations ?? results?.analysis?.recommendations ?? []
    const reportId = Math.random().toString(36).substring(7).toUpperCase()
    const timestamp = new Date().toLocaleString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    })
    
    // Create a printable HTML version with distinctive styling
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>BiasBounty Analysis Report - ${datasetName}</title>
        <style>
          @media print {
            body { margin: 0; }
            .page-break { page-break-before: always; }
          }
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            padding: 50px; 
            max-width: 900px; 
            margin: 0 auto;
            background: linear-gradient(to bottom, #faf5ff 0%, #ffffff 100%);
          }
          .header {
            background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(124, 58, 237, 0.3);
          }
          h1 { 
            margin: 0;
            font-size: 36px;
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .trophy { font-size: 42px; }
          .metadata {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 20px;
            font-size: 14px;
            opacity: 0.95;
          }
          .metadata-item {
            background: rgba(255, 255, 255, 0.15);
            padding: 10px;
            border-radius: 6px;
          }
          .metadata-label {
            font-size: 11px;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .metadata-value {
            font-weight: bold;
            margin-top: 4px;
            font-size: 15px;
          }
          h2 { 
            color: #7c3aed; 
            margin-top: 40px; 
            border-bottom: 3px solid #7c3aed; 
            padding-bottom: 10px;
            font-size: 24px;
          }
          .score-section {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin: 25px 0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
          .score { 
            font-size: 72px; 
            font-weight: 900; 
            color: ${biasScore > 70 ? '#ef4444' : biasScore > 40 ? '#f59e0b' : '#22c55e'}; 
            line-height: 1;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          .severity { 
            font-size: 28px; 
            color: #475569; 
            margin-top: 10px;
            font-weight: 600;
          }
          .metric { 
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 10px; 
            border-left: 5px solid #7c3aed;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          .recommendation { 
            background: linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%); 
            padding: 15px 20px; 
            margin: 12px 0; 
            border-left: 5px solid #7c3aed; 
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(124, 58, 237, 0.1);
            line-height: 1.6;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 25px 0; 
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            border-radius: 8px;
            overflow: hidden;
          }
          th, td { 
            border: 1px solid #e2e8f0; 
            padding: 16px; 
            text-align: left; 
          }
          th { 
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); 
            font-weight: 700;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background: #f8fafc;
          }
          tr:hover {
            background: #f1f5f9;
          }
          .footer { 
            margin-top: 60px; 
            padding-top: 30px; 
            border-top: 3px solid #e2e8f0; 
            text-align: center; 
            color: #64748b; 
          }
          .footer-logo {
            font-size: 24px;
            font-weight: bold;
            background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
          }
          .print-timestamp {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1><span class="trophy"></span> BiasBounty Analysis Report</h1>
          <div class="metadata">
            <div class="metadata-item">
              <div class="metadata-label">Dataset</div>
              <div class="metadata-value">${datasetName}</div>
            </div>
            <div class="metadata-item">
              <div class="metadata-label">Date</div>
              <div class="metadata-value">${timestamp}</div>
            </div>
            <div class="metadata-item">
              <div class="metadata-label">Report ID</div>
              <div class="metadata-value">${reportId}</div>
            </div>
          </div>
        </div>
        
        <h2>Overall Bias Score</h2>
        <div class="score-section">
          <div class="score">${Math.round(biasScore)}%</div>
          <div class="severity">Severity: ${biasScore > 70 ? 'High' : biasScore > 40 ? 'Medium' : 'Low'}</div>
        </div>
        
        <h2>Dataset Information</h2>
        <div class="metric">
          <strong>Rows:</strong> ${fairness?.dataset_info?.rows || 'N/A'}<br>
          <strong>Columns:</strong> ${fairness?.dataset_info?.columns || 'N/A'}<br>
          <strong>Analysis Type:</strong> Comprehensive
        </div>
        
        <h2>Detailed Analysis</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Status</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Demographic Bias</strong></td>
              <td>${fairness?.demographic_bias?.score > 50 ? '⚠️ Issues Found' : '✅ Acceptable'}</td>
              <td><strong>${Math.round(fairness?.demographic_bias?.score || 0)}%</strong></td>
            </tr>
            <tr>
              <td><strong>Text Bias</strong></td>
              <td>${fairness?.text_bias?.score > 50 ? '⚠️ Issues Found' : '✅ Acceptable'}</td>
              <td><strong>${Math.round(fairness?.text_bias?.score || 0)}%</strong></td>
            </tr>
            <tr>
              <td><strong>Statistical Bias</strong></td>
              <td>${fairness?.statistical_bias?.score > 50 ? '⚠️ Issues Found' : '✅ Acceptable'}</td>
              <td><strong>${Math.round(fairness?.statistical_bias?.score || 0)}%</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div class="page-break"></div>
        
        <h2>Recommendations</h2>
        ${recs.length > 0 ? recs.map((rec: string, idx: number) => `<div class="recommendation"><strong>${idx + 1}.</strong> ${rec}</div>`).join('') : '<p>No specific recommendations at this time.</p>'}
        
        <div class="footer">
          <div class="footer-logo">BiasBounty</div>
          <p><strong>AI-Powered Bias Detection Platform</strong></p>
          <p>https://bias-bounty.vercel.app</p>
          <div class="print-timestamp">Document generated on ${timestamp}</div>
        </div>
      </body>
      </html>
    `
    
    // Open print dialog
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
    
    return true
  } catch (error) {
    console.error('Export to PDF failed:', error)
    return false
  }
}

export async function exportToCSV(results: any, datasetName: string) {
  try {
    const biasScore = results?.bias_score ?? results?.analysis?.bias_score ?? 0
    const fairness = results?.fairness_metrics ?? results?.analysis?.fairness_metrics
    const recs = results?.recommendations ?? results?.analysis?.recommendations ?? []
    const reportId = Math.random().toString(36).substring(7).toUpperCase()
    const timestamp = new Date().toLocaleString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    })
    
    // Create CSV content with clear headers
    let csvContent = '========================================\n'
    csvContent += 'BIASBOUNTY ANALYSIS REPORT - CSV EXPORT\n'
    csvContent += '========================================\n\n'
    
    csvContent += 'REPORT METADATA\n'
    csvContent += 'Field,Value\n'
    csvContent += `Dataset Name,${datasetName}\n`
    csvContent += `Report ID,${reportId}\n`
    csvContent += `Generated Date,${timestamp}\n`
    csvContent += `Export Format,CSV (Comma-Separated Values)\n\n`
    
    csvContent += '========================================\n'
    csvContent += 'OVERALL BIAS ANALYSIS\n'
    csvContent += '========================================\n'
    csvContent += 'Metric,Value\n'
    csvContent += `Overall Bias Score,${Math.round(biasScore)}%\n`
    csvContent += `Severity Level,${biasScore > 70 ? 'High' : biasScore > 40 ? 'Medium' : 'Low'}\n`
    csvContent += `Risk Assessment,${biasScore > 70 ? 'Critical - Immediate Action Required' : biasScore > 40 ? 'Moderate - Review Recommended' : 'Low - Acceptable Range'}\n\n`
    
    csvContent += '========================================\n'
    csvContent += 'DATASET INFORMATION\n'
    csvContent += '========================================\n'
    csvContent += 'Property,Value\n'
    csvContent += `Total Rows,${fairness?.dataset_info?.rows || 'N/A'}\n`
    csvContent += `Total Columns,${fairness?.dataset_info?.columns || 'N/A'}\n`
    csvContent += `Analysis Type,Comprehensive\n`
    csvContent += `Processing Status,Complete\n\n`
    
    csvContent += '========================================\n'
    csvContent += 'BIAS SCORES BY CATEGORY\n'
    csvContent += '========================================\n'
    csvContent += 'Category,Score (%),Status,Description\n'
    csvContent += `Demographic Bias,${Math.round(fairness?.demographic_bias?.score || 0)},${fairness?.demographic_bias?.score > 50 ? 'Issues Found' : 'Acceptable'},Imbalance in demographic representation\n`
    csvContent += `Text Bias,${Math.round(fairness?.text_bias?.score || 0)},${fairness?.text_bias?.score > 50 ? 'Issues Found' : 'Acceptable'},Toxic or biased language detected\n`
    csvContent += `Statistical Bias,${Math.round(fairness?.statistical_bias?.score || 0)},${fairness?.statistical_bias?.score > 50 ? 'Issues Found' : 'Acceptable'},Statistical irregularities in data distribution\n\n`
    
    csvContent += '========================================\n'
    csvContent += 'DETAILED RECOMMENDATIONS\n'
    csvContent += '========================================\n'
    csvContent += 'Priority,Recommendation\n'
    if (recs.length > 0) {
      recs.forEach((rec: string, idx: number) => {
        const cleanRec = rec.replace(/"/g, '""').replace(/[\n\r]/g, ' ')
        csvContent += `${idx + 1},"${cleanRec}"\n`
      })
    } else {
      csvContent += '1,"No specific recommendations at this time. Continue monitoring data quality."\n'
    }
    
    csvContent += '\n========================================\n'
    csvContent += 'REPORT FOOTER\n'
    csvContent += '========================================\n'
    csvContent += 'Platform,BiasBounty - AI Bias Detection\n'
    csvContent += 'Website,https://bias-bounty.vercel.app\n'
    csvContent += `Report Generated,${timestamp}\n`
    csvContent += 'Export Format,CSV\n'
    csvContent += '========================================\n'
    
    // Create download link with timestamp in filename
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const sanitizedName = datasetName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
    const fileTimestamp = Date.now()
    link.setAttribute('href', url)
    link.setAttribute('download', `biasbounty-report-${sanitizedName}-${fileTimestamp}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    console.error('Export to CSV failed:', error)
    return false
  }
}

export async function shareResults(results: any, datasetName: string) {
  try {
    const biasScore = results?.bias_score ?? results?.analysis?.bias_score ?? 0
    const text = `I just analyzed "${datasetName}" on BiasBounty!\n\nBias Score: ${Math.round(biasScore)}%\nSeverity: ${biasScore > 70 ? 'High' : biasScore > 40 ? 'Medium' : 'Low'}\n\nTry it yourself at: ${window.location.origin}`
    
    if (navigator.share) {
      await navigator.share({
        title: 'BiasBounty Analysis Results',
        text: text,
        url: window.location.origin
      })
      return true
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (error) {
    console.error('Share failed:', error)
    return false
  }
}
