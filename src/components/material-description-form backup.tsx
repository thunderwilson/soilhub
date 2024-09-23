"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { ChevronDown, ChevronUp, Plus, X, Mail, Eye, MinusIcon, PlusIcon } from "lucide-react"
import { Excalidraw, exportToBlob, exportToSvg } from "@excalidraw/excalidraw";
import { Badge } from "~/components/ui/badge"

const defaultContaminants = [
  "Arsenic", "Cadmium", "Copper", "Chromium", "Mercury", "Nickel", "Zinc", "Asbestos P/A"
]

const predefinedContaminants = [
  ...defaultContaminants,
  "Barium", "Beryllium", "Boron", "Manganese", "Selenium", "Friable Asbestos", "Non-friable Asbestos",
  "Benzene", "Toluene", "Ethyl benzene", "Xylene", "TPH C7 - C14", "TPH C10- C14", "TPH C15 - C36",
  "Naphthalene", "Phenols (total)", "BaP (eq)", "Total DDT", "Chlordane", "Dieldrin", "Endrin", "PCBs"
]

type AnalyticalRow = {
  id: string;
  contaminant: string;
  maximum: string;
  minimum: string;
  average: string;
  leachable: string;
}

type ConsignmentDetail = {
  materialDescription: string;
  expectedDeliveryDate: string;
  expectedDuration: string;
  expectedFrequency: string;
  expectedVolume: string;
  samplesTaken: string;
  sampleMethod: string;
  otherSampleMethod?: string;
  sampleMethodAdditionalInfo: string;
  soilCategorization: string;
  otherSoilCategorization?: string;
  soilCategorizationAdditionalInfo: string;
  analyticalRows: AnalyticalRow[];
}

export function MaterialDescriptionFormComponent() {
  const [consignments, setConsignments] = useState(1)
  const [openSections, setOpenSections] = useState<number[]>([])
  const formDataRef = useRef({
    siteAddress: "",
    siteHistory: "",
    expectedConsignments: 1,
    consignmentDetails: [] as ConsignmentDetail[],
  })
  const [destinationEmails, setDestinationEmails] = useState<string[]>([])
  const [currentEmail, setCurrentEmail] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [showEmailPreview, setShowEmailPreview] = useState(false)
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [initialData, setInitialData] = useState(null);
  const [excalidrawPNG, setExcalidrawPNG] = useState<string | null>(null);

  useEffect(() => {
    // Load the tutorial image
    fetch("/tutorial.excalidraw")
      .then((response) => response.json())
      .then((data) => {
        console.log("Loaded tutorial data:", data); // Add this log
        setInitialData(data);
      })
      .catch((error) => console.error("Error loading tutorial data:", error));
  }, []);

  const captureExcalidrawPNG = async () => {
    if (excalidrawAPI) {
      try {
        const elements = excalidrawAPI.getSceneElements();
        const appState = excalidrawAPI.getAppState();
        const files = excalidrawAPI.getFiles();

        const blob = await exportToBlob({
          elements,
          appState,
          files,
          mimeType: "image/png",
          quality: 1,
        });
        const url = URL.createObjectURL(blob);
        setExcalidrawPNG(url);
        console.log("Excalidraw PNG generated:", url);
      } catch (error) {
        console.error("Error generating Excalidraw PNG:", error);
      }
    }
  };

  const onExcalidrawChange = () => {
    console.log("Excalidraw changed");
  };

  // Add this effect to clean up the URL object
  useEffect(() => {
    return () => {
      if (excalidrawPNG) {
        URL.revokeObjectURL(excalidrawPNG);
      }
    };
  }, [excalidrawPNG]);

  const toggleSection = (index: number) => {
    setOpenSections(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const updateFormData = (field: string, value: any) => {
    formDataRef.current = {
      ...formDataRef.current,
      [field]: value,
    }
  }

  const updateConsignments = (newValue: number) => {
    const validValue = Math.max(1, newValue)
    setConsignments(validValue)
    updateFormData("expectedConsignments", validValue)
  }

  const ConsignmentDetails = React.memo(({ index }: { index: number }) => {
    const consignmentData = formDataRef.current.consignmentDetails[index] || {}
    const [localState, setLocalState] = useState<ConsignmentDetail>({
      materialDescription: "",
      expectedDeliveryDate: "",
      expectedDuration: "",
      expectedFrequency: "",
      expectedVolume: "",
      samplesTaken: "",
      sampleMethod: "",
      sampleMethodAdditionalInfo: "",
      soilCategorization: "",
      soilCategorizationAdditionalInfo: "",
      analyticalRows: [],
      ...consignmentData
    })

    const updateLocalState = (field: string, value: any) => {
      setLocalState(prev => {
        const updated = { ...prev, [field]: value }
        formDataRef.current.consignmentDetails[index] = updated
        return updated
      })
    }

    const [analyticalRows, setAnalyticalRows] = useState<AnalyticalRow[]>(
      localState.analyticalRows.length > 0 ? localState.analyticalRows :
      defaultContaminants.map((contaminant, i) => ({
        id: (i + 1).toString(),
        contaminant,
        maximum: "",
        minimum: "",
        average: "",
        leachable: ""
      }))
    )
    const [newContaminant, setNewContaminant] = useState("")
    const [filteredContaminants, setFilteredContaminants] = useState<string[]>([])

    const availableContaminants = useMemo(() => {
      const existingContaminants = new Set(analyticalRows.map(row => row.contaminant.toLowerCase()))
      return predefinedContaminants.filter(contaminant => !existingContaminants.has(contaminant.toLowerCase()))
    }, [analyticalRows])

    const addAnalyticalRow = (contaminantToAdd: string) => {
      if (contaminantToAdd && !analyticalRows.some(row => row.contaminant.toLowerCase() === contaminantToAdd.toLowerCase())) {
        const newId = (analyticalRows.length + 1).toString()
        const updatedRows = [...analyticalRows, { id: newId, contaminant: contaminantToAdd, maximum: "", minimum: "", average: "", leachable: "" }]
        setAnalyticalRows(updatedRows)
        updateLocalState('analyticalRows', updatedRows)
        setNewContaminant("")
        setFilteredContaminants([])
      }
    }

    const removeAnalyticalRow = (id: string) => {
      const updatedRows = analyticalRows.filter(row => row.id !== id)
      setAnalyticalRows(updatedRows)
      updateLocalState('analyticalRows', updatedRows)
    }

    const updateAnalyticalRow = (id: string, field: keyof AnalyticalRow, value: string) => {
      const updatedRows = analyticalRows.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
      setAnalyticalRows(updatedRows)
      updateLocalState('analyticalRows', updatedRows)
    }

    const handleContaminantSearch = (value: string) => {
      setNewContaminant(value)
      if (value.trim() === "") {
        setFilteredContaminants([])
      } else {
        setFilteredContaminants(
          availableContaminants.filter(contaminant => 
            contaminant.toLowerCase().includes(value.toLowerCase())
          )
        )
      }
    }

    return (
      <Collapsible
        open={openSections.includes(index)}
        onOpenChange={() => toggleSection(index)}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between mb-2">
            Consignment {index + 1} Details
            {openSections.includes(index) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mb-4">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="sampling">Sampling Details</TabsTrigger>
              <TabsTrigger value="analytical">Analytical Summary</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="space-y-4">
              <div>
                <Label htmlFor={`materialDescription-${index}`}>Material Description</Label>
                <Textarea 
                  id={`materialDescription-${index}`} 
                  value={localState.materialDescription}
                  onChange={(e) => updateLocalState("materialDescription", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`expectedDeliveryDate-${index}`}>Expected date of delivery commencement</Label>
                  <Input 
                    id={`expectedDeliveryDate-${index}`} 
                    type="date" 
                    value={localState.expectedDeliveryDate}
                    onChange={(e) => updateLocalState("expectedDeliveryDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`expectedDuration-${index}`}>Expected duration of delivery</Label>
                  <Input 
                    id={`expectedDuration-${index}`} 
                    value={localState.expectedDuration}
                    onChange={(e) => updateLocalState("expectedDuration", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`expectedFrequency-${index}`}>Expected frequency of deliveries</Label>
                  <Input 
                    id={`expectedFrequency-${index}`} 
                    value={localState.expectedFrequency}
                    onChange={(e) => updateLocalState("expectedFrequency", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`expectedVolume-${index}`}>Expected solid volume of consignment</Label>
                  <Input 
                    id={`expectedVolume-${index}`} 
                    value={localState.expectedVolume}
                    onChange={(e) => updateLocalState("expectedVolume", e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="sampling" className="space-y-6">
              <div>
                <Label htmlFor={`samplesTaken-${index}`}>Number of samples taken</Label>
                <Input 
                  type="number" 
                  id={`samplesTaken-${index}`} 
                  value={localState.samplesTaken}
                  onChange={(e) => updateLocalState("samplesTaken", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-base font-medium mb-2 block">How were samples taken</Label>
                <RadioGroup 
                  className="space-y-2" 
                  value={localState.sampleMethod}
                  onValueChange={(value) => updateLocalState("sampleMethod", value)}
                >
                  {['inSitu', 'stockpiles', 'other'].map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={method} 
                        id={`${method}-${index}`}
                        className="border-2 border-green-600 text-green-600 focus:border-green-700 focus:ring-green-700"
                      />
                      <Label 
                        htmlFor={`${method}-${index}`} 
                        className="text-sm font-normal cursor-pointer"
                      >
                        {method === 'inSitu' ? 'In-situ' : 
                         method === 'stockpiles' ? 'Stockpiles' : 'Other'}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {localState.sampleMethod === "other" && (
                  <Input 
                    className="mt-2" 
                    placeholder="Please specify other sample method" 
                    id={`otherSampleMethodText-${index}`}
                    value={localState.otherSampleMethod || ""}
                    onChange={(e) => updateLocalState("otherSampleMethod", e.target.value)}
                  />
                )}
              </div>
              <div>
                <Label htmlFor={`sampleMethodAdditionalInfo-${index}`}>Additional information about sampling method</Label>
                <Textarea 
                  id={`sampleMethodAdditionalInfo-${index}`} 
                  value={localState.sampleMethodAdditionalInfo}
                  onChange={(e) => updateLocalState("sampleMethodAdditionalInfo", e.target.value)}
                  placeholder="Provide any additional context or details about how samples were taken"
                />
              </div>
              <div>
                <Label className="text-base font-medium mb-2 block">Soil categorised by</Label>
                <RadioGroup 
                  className="space-y-2" 
                  value={localState.soilCategorization}
                  onValueChange={(value) => updateLocalState("soilCategorization", value)}
                >
                  {['highestConcentration', '95UCL', 'other'].map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={method} 
                        id={`${method}-${index}`}
                        className="border-2 border-green-600 text-green-600 focus:border-green-700 focus:ring-green-700"
                      />
                      <Label 
                        htmlFor={`${method}-${index}`} 
                        className="text-sm font-normal cursor-pointer"
                      >
                        {method === 'highestConcentration' ? 'Highest concentration' : 
                         method === '95UCL' ? '95%UCL average' : 'Other'}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {localState.soilCategorization === "other" && (
                  <Input 
                    className="mt-2" 
                    placeholder="Please specify other soil categorization method" 
                    id={`otherSoilCategorizationText-${index}`}
                    value={localState.otherSoilCategorization || ""}
                    onChange={(e) => updateLocalState("otherSoilCategorization", e.target.value)}
                  />
                )}
              </div>
              <div>
                <Label htmlFor={`soilCategorizationAdditionalInfo-${index}`}>Additional information about soil categorization</Label>
                <Textarea 
                  id={`soilCategorizationAdditionalInfo-${index}`} 
                  value={localState.soilCategorizationAdditionalInfo}
                  onChange={(e) => updateLocalState("soilCategorizationAdditionalInfo", e.target.value)}
                  placeholder="Provide any additional context or details about soil categorization"
                />
              </div>
            </TabsContent>
            <TabsContent value="analytical">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contaminant</TableHead>
                    <TableHead>Maximum reported Contaminant concentration (total) mg/kg dry weight</TableHead>
                    <TableHead>Minimum reported Contaminant concentration (total) mg/kg dry weight</TableHead>
                    <TableHead>Average reported Contaminant concentration (total) mg/kg dry weight Or 95%UCL average</TableHead>
                    <TableHead>If available: Maximum Leachable Concentration (mg/L)</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyticalRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.contaminant}</TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={row.maximum}
                          onChange={(e) => updateAnalyticalRow(row.id, "maximum", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={row.minimum}
                          onChange={(e) => updateAnalyticalRow(row.id, "minimum", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={row.average}
                          onChange={(e) => updateAnalyticalRow(row.id, "average", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={row.leachable}
                          onChange={(e) => updateAnalyticalRow(row.id, "leachable", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAnalyticalRow(row.id)}
                          aria-label={`Remove ${row.contaminant}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center space-x-2 mt-4">
                <div className="relative flex-grow">
                  <Input
                    placeholder="Search or add new contaminant"
                    value={newContaminant}
                    onChange={(e) => handleContaminantSearch(e.target.value)}
                  />
                  {filteredContaminants.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredContaminants.map((contaminant) => (
                        <li
                          key={contaminant}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            addAnalyticalRow(contaminant)
                          }}
                        >
                          {contaminant}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Button onClick={() => addAnalyticalRow(newContaminant)} disabled={!newContaminant || analyticalRows.some(row => row.contaminant.toLowerCase() === newContaminant.toLowerCase())}>
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CollapsibleContent>
      </Collapsible>
    )
  })

  const generateEmailContent = () => {
    const formData = formDataRef.current
    let content = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            h1 { color: #2c3e50; border-bottom: 2px solid #22c55e; padding-bottom: 10px; }
            h2 { color: #16a34a; margin-top: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f0fdf4; }
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

          <div class="section">
            <h2>Plan of Proposed Works</h2>
            ${excalidrawPNG 
              ? `<img src="${excalidrawPNG}" alt="Plan of Proposed Works" style="max-width: 100%; height: auto;">`
              : '<p>No plan uploaded. Please draw a plan using the Excalidraw tool.</p>'}
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

        consignment.analyticalRows.forEach(row => {
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
  }

  const addEmail = () => {
    if (currentEmail && !destinationEmails.includes(currentEmail)) {
      setDestinationEmails([...destinationEmails, currentEmail])
      setCurrentEmail("")
    }
  }

  const removeEmail = (email: string) => {
    setDestinationEmails(destinationEmails.filter(e => e !== email))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formDataRef.current)
    
    // For email functionality, you would integrate with your email service here
    // This is a placeholder for the email sending logic
    console.log("Sending email to:", destinationEmails)
    console.log("Email content:", generateEmailContent())
    console.log("Custom message:", customMessage)

    // Show a success message or handle any next steps
    alert("Form submitted and email sent successfully!")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-800 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Surplus Soil Information Sheet</h1>
          <p className="mb-2">
            This form provides a simple template for describing surplus soil to a receiving facility. 
            Please note that individual facilities may have more or fewer requirements as part of their Waste Acceptance Criteria.
          </p>
          <p className="mb-2">
            This form is free to use and feedback is invited to help improve practices around the management of surplus soil.
          </p>
          <p>
            <a 
              href="mailto:tom@sephira.nz" 
              className="text-green-200 hover:text-green-100 inline-flex items-center"
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact us for feedback
            </a>
          </p>
          <p className="mt-4 text-sm">
            This form is a work in progress and no guarantees are made about its function.
          </p>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-8">
        <div className="bg-white bg-opacity-90 rounded-lg shadow-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-green-800">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Complete the relevant fields below to describe your consignment(s) of surplus soil.</li>
            <li>Compose an email in the Email Submission section and click preview to review.</li>
            <li>Click Send Email to send the contents of your form as an attachment to the destination address.</li>
          </ol>
        </div>

        <form className="space-y-8 bg-white bg-opacity-80 backdrop-blur-md rounded-lg shadow-xl p-6" onSubmit={handleSubmit}>
          <section>
            <h2 className="text-3xl font-bold mb-4 text-green-800">Material Description</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="siteAddress">Site Address</Label>
                <Input 
                  id="siteAddress" 
                  defaultValue={formDataRef.current.siteAddress}
                  onBlur={(e) => updateFormData("siteAddress", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="planOfWorks">Plan of proposed works (drawing/map/aerial etc.)</Label>
                <div className="w-full h-[600px] border border-gray-300 rounded-md overflow-hidden">
                  {initialData ? (
                    <Excalidraw
                      onChange={onExcalidrawChange}
                      initialData={initialData}
                      excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
                    />
                  ) : (
                    <div>Loading tutorial...</div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="siteHistory">History of Site Activity</Label>
                <Textarea 
                  id="siteHistory" 
                  defaultValue={formDataRef.current.siteHistory}
                  onBlur={(e) => updateFormData("siteHistory", e.target.value)}
                  className="h-32"
                />
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Label htmlFor="expectedConsignments">Expected Consignments</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => updateConsignments(consignments - 1)}
                    aria-label="Decrease consignments"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </Button>
                  <Input 
                    id="expectedConsignments" 
                    type="text" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={consignments}
                    onChange={(e) => updateConsignments(parseInt(e.target.value) || 1)}
                    className="w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => updateConsignments(consignments + 1)}
                    aria-label="Increase consignments"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-green-800">Consignment Details</h2>
            <div className="space-y-4">
              {Array.from({ length: consignments }, (_, i) => (
                <ConsignmentDetails key={i} index={i} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-green-800">Email Submission</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-r from-green-100 to-teal-100 border-green-300">
                <CardHeader>
                  <CardTitle className="text-green-800">Email Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="destinationEmail">Destination Email Addresses</Label>
                    <div className="flex space-x-2">
                      <Input 
                        id="destinationEmail" 
                        type="email" 
                        value={currentEmail}
                        onChange={(e) => setCurrentEmail(e.target.value)}
                        placeholder="Enter an email address"
                        className="bg-white flex-grow"
                      />
                      <Button 
                        type="button" 
                        onClick={addEmail}
                        disabled={!currentEmail || destinationEmails.includes(currentEmail)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {destinationEmails.map((email, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        >
                          {email}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEmail(email)}
                            className="ml-1 h-4 w-4 p-0 text-green-700 hover:text-green-900 hover:bg-green-200 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    {destinationEmails.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">No email addresses added yet.</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="customMessage">Custom Message</Label>
                    <Textarea 
                      id="customMessage" 
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={4}
                      className="bg-white"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full bg-green-200 hover:bg-green-300 text-green-800 border-green-400"
                        onClick={async () => {
                          await captureExcalidrawPNG();
                          setShowEmailPreview(prev => !prev);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview Email
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-green-800">Email Preview</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 p-4">
                        <h3 className="font-bold">To: {destinationEmails.join(", ")}</h3>
                        <h3 className="font-bold mt-2">Custom Message:</h3>
                        <p>{customMessage}</p>
                        <h3 className="font-bold mt-4">Form Data:</h3>
                        <div dangerouslySetInnerHTML={{ __html: generateEmailContent() }} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
              <Card className="bg-gradient-to-r from-teal-100 to-blue-100 border-teal-300">
                <CardHeader>
                  <CardTitle className="text-green-800">Submit Form</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-800 mb-4">
                    Please review your form entries and email details before submitting. 
                    Use the "Preview Email" button to check the content of the email that will be sent.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Mail className="mr-2 h-4 w-4" />
                    Submit Form and Send Email
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>
        </form>
      </div>

      <footer className="bg-green-800 text-white py-6 mt-8">
        <div className="container mx-auto px-4">
          <p>
            This form is based on the 'Surplus Soil Information Sheet' featured in the document:
          </p>
          <p className="font-semibold mt-2">
            Technical Guidelines: Characterising Surplus Soil for Disposal
          </p>
          <p>
            Waste Management Institute New Zealand Incorporated (WasteMINZ) September 2024
          </p>
        </div>
      </footer>
    </div>
  )
}