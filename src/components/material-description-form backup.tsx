"use client"

// Importing necessary libraries and components
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
import { ChevronDown, ChevronUp, Download,Plus, X, Mail, Eye, MinusIcon, PlusIcon, FileText } from "lucide-react"
import { Excalidraw, exportToBlob, exportToSvg } from "@excalidraw/excalidraw"
import { Badge } from "~/components/ui/badge"
import { useDropzone } from 'react-dropzone'
import axios from 'axios';

// Default list of contaminants
const defaultContaminants = [
  "Arsenic", "Cadmium", "Copper", "Chromium", "Mercury", "Nickel", "Zinc", "Asbestos P/A"
]

// Predefined list of contaminants including the default ones
const predefinedContaminants = [
  ...defaultContaminants,
  "Barium", "Beryllium", "Boron", "Manganese", "Selenium", "Friable Asbestos", "Non-friable Asbestos",
  "Benzene", "Toluene", "Ethyl benzene", "Xylene", "TPH C7 - C14", "TPH C10- C14", "TPH C15 - C36",
  "Naphthalene", "Phenols (total)", "BaP (eq)", "Total DDT", "Chlordane", "Dieldrin", "Endrin", "PCBs"
]

// Type definition for an analytical row
type AnalyticalRow = {
  id: string;
  contaminant: string;
  maximum: string;
  minimum: string;
  average: string;
  leachable: string;
}

// Type definition for consignment details
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

// Main component for the material description form
export function MaterialDescriptionFormComponent() {
  // State variables
  const [consignments, setConsignments] = useState(1) // Number of consignments
  const [openSections, setOpenSections] = useState<number[]>([]) // Sections that are open
  const formDataRef = useRef({
    siteAddress: "",
    siteHistory: "",
    expectedConsignments: 1,
    consignmentDetails: [] as ConsignmentDetail[],
  }) // Reference to form data
  const [destinationEmails, setDestinationEmails] = useState<string[]>([]) // List of destination emails
  const [currentEmail, setCurrentEmail] = useState("") // Current email being added
  const [customMessage, setCustomMessage] = useState("") // Custom message for the email
  const [showEmailPreview, setShowEmailPreview] = useState(false) // Flag to show email preview
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null) // Excalidraw API instance
  const [initialData, setInitialData] = useState(null) // Initial data for Excalidraw
  const [excalidrawPNG, setExcalidrawPNG] = useState<string | null>(null) // PNG data for Excalidraw
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]) // List of uploaded files
  const [isExcalidrawVisible, setIsExcalidrawVisible] = useState(false) // Flag to show/hide Excalidraw
  const [replyToEmail, setReplyToEmail] = useState("") // Reply-to email address

  // Effect to load the tutorial image for Excalidraw
  useEffect(() => {
    fetch("/tutorial.excalidraw")
      .then((response) => response.json())
      .then((data) => {
        console.log("Loaded tutorial data:", data); // Add this log
        setInitialData(data);
      })
      .catch((error) => console.error("Error loading tutorial data:", error));
  }, []);

  // Function to capture Excalidraw drawing as PNG
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

  // Function to handle changes in Excalidraw
  const onExcalidrawChange = () => {
    console.log("Excalidraw changed");
  };

  // Effect to clean up the URL object for Excalidraw PNG
  useEffect(() => {
    return () => {
      if (excalidrawPNG) {
        URL.revokeObjectURL(excalidrawPNG);
      }
    };
  }, [excalidrawPNG]);

  // Function to toggle the visibility of a section
  const toggleSection = (index: number) => {
    setOpenSections(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  // Function to update form data
  const updateFormData = (field: string, value: any) => {
    formDataRef.current = {
      ...formDataRef.current,
      [field]: value,
    }
  }

  // Function to update the number of consignments
  const updateConsignments = (newValue: number) => {
    const validValue = Math.max(1, newValue)
    setConsignments(validValue)
    updateFormData("expectedConsignments", validValue)
  }

  // Component to render consignment details
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

    // Function to update local state
    const updateLocalState = (field: string, value: any) => {
      setLocalState(prev => {
        const updated = { ...prev, [field]: value }
        formDataRef.current.consignmentDetails[index] = updated
        return updated
      })
    }

    // State variables for analytical rows and contaminants
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

    // Memoized list of available contaminants
    const availableContaminants = useMemo(() => {
      const existingContaminants = new Set(analyticalRows.map(row => row.contaminant.toLowerCase()))
      return predefinedContaminants.filter(contaminant => !existingContaminants.has(contaminant.toLowerCase()))
    }, [analyticalRows])

    // Function to add a new analytical row
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

    // Function to remove an analytical row
    const removeAnalyticalRow = (id: string) => {
      const updatedRows = analyticalRows.filter(row => row.id !== id)
      setAnalyticalRows(updatedRows)
      updateLocalState('analyticalRows', updatedRows)
    }

    // Function to update an analytical row
    const updateAnalyticalRow = (id: string, field: keyof AnalyticalRow, value: string) => {
      const updatedRows = analyticalRows.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
      setAnalyticalRows(updatedRows)
      updateLocalState('analyticalRows', updatedRows)
    }

    // Function to handle contaminant search
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
    const formData = formDataRef.current;
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
          <h1></h1>
          
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
    `;

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
      `;

      if (consignment.sampleMethod === 'other') {
        content += `<p><strong>Other Sample Method:</strong> ${consignment.otherSampleMethod}</p>`;
      }

      content += `
          <p><strong>Additional Sampling Information:</strong> ${consignment.sampleMethodAdditionalInfo}</p>
          <p><strong>Soil Categorization:</strong> ${consignment.soilCategorization}</p>
      `;

      if (consignment.soilCategorization === 'other') {
        content += `<p><strong>Other Soil Categorization:</strong> ${consignment.otherSoilCategorization}</p>`;
      }

      content += `
          <p><strong>Additional Soil Categorization Information:</strong> ${consignment.soilCategorizationAdditionalInfo}</p>
          <h3>Analytical Summary</h3>
      `;

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
        `;

        consignment.analyticalRows.forEach(row => {
          content += `
            <tr>
              <td>${row.contaminant}</td>
              <td>${row.maximum}</td>
              <td>${row.minimum}</td>
              <td>${row.average}</td>
              <td>${row.leachable}</td>
            </tr>
          `;
        });

        content += `</table>`;
      } else {
        content += `<p>No analytical data available for this consignment.</p>`;
      }

      content += `</div>`;
    });

    content += `
        </body>
      </html>
    `;

    return content;
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

  const onDrop = (acceptedFiles: File[]) => {
    setUploadedFiles([...uploadedFiles, ...acceptedFiles]);
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter(file => file.name !== fileName));
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleExcalidrawToggle = (event: { preventDefault: () => void }) => {
    event.preventDefault(); // Prevent form submission
    setIsExcalidrawVisible(!isExcalidrawVisible);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate the email content
    const emailContent = generateEmailContent();

    // Prepare the data to be sent
    const formData = {
      emailDetails: {
        to: destinationEmails,
        replyTo: replyToEmail,
        customMessage: customMessage,
      },
      siteInformation: {
        siteAddress: formDataRef.current.siteAddress,
        siteHistory: formDataRef.current.siteHistory,
        expectedConsignments: formDataRef.current.expectedConsignments,
      },
      consignmentDetails: formDataRef.current.consignmentDetails.map((consignment, index) => ({
        consignmentNumber: index + 1,
        materialDescription: consignment.materialDescription,
        expectedDeliveryDate: consignment.expectedDeliveryDate,
        expectedDuration: consignment.expectedDuration,
        expectedFrequency: consignment.expectedFrequency,
        expectedVolume: consignment.expectedVolume,
        samplingDetails: {
          samplesTaken: consignment.samplesTaken,
          sampleMethod: consignment.sampleMethod,
          otherSampleMethod: consignment.otherSampleMethod,
          sampleMethodAdditionalInfo: consignment.sampleMethodAdditionalInfo,
          soilCategorization: consignment.soilCategorization,
          otherSoilCategorization: consignment.otherSoilCategorization,
          soilCategorizationAdditionalInfo: consignment.soilCategorizationAdditionalInfo,
        },
        analyticalSummary: consignment.analyticalRows,
      })),
      attachments: uploadedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
      htmlContent: emailContent,
    };

    try {
      // Send the data to the webhook
      const response = await axios.post(
        'https://hook.us1.make.com/swsnm14i1t7qowyc3g4dmzo0ul2r0wrg',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        alert("Form submitted successfully!");
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-800 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Surplus Soil Information Sheet</h1>
          <p className="mb-2">
            This form provides a simple template for desribing surplus soil consignments. Receiving facilities may require more, or different, information than the inputs on this form. 
          </p>

          <p className="mb-2">
            Feedback is invited to help improve practices and build tools to support the management of surplus soil.
          </p>
          <p>
            <a 
              href="mailto:tom@sephira.nz" 
              className="text-green-200 hover:text-green-100 inline-flex items-center"
            >
              <Mail className="mr-2 h-4 w-4" />
              Feedback
            </a>
            <a 
              href="https://github.com" 
              className="text-green-200 hover:text-green-100 inline-flex items-center ml-4"
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.165c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.775.42-1.305.763-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.467-2.38 1.235-3.22-.123-.305-.535-1.53.117-3.18 0 0 1.008-.322 3.3 1.23.957-.266 1.98-.4 3-.405 1.02.005 2.043.14 3 .405 2.29-1.552 3.297-1.23 3.297-1.23.653 1.65.24 2.875.118 3.18.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.62-5.475 5.92.43.37.823 1.1.823 2.22v3.293c0 .32.22.694.825.577C20.565 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Free and Open Source
            </a>
          </p>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-8">
        <div className="bg-white bg-opacity-90 rounded-lg shadow-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-green-800">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Complete the relevant fields below to describe your consignment(s) of surplus soil.</li>
            <li>Compose an email in the Email Submission section and click preview to review.</li>
            <li>Click Send Email to send the contents of your form to the destination address.</li>
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
                <Button variant="outline" className="w-full justify-between mb-2" onClick={handleExcalidrawToggle}>
                  {isExcalidrawVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Toggle Plan of Proposed Works
                </Button>
                <div className={`w-full h-[600px] border border-gray-300 rounded-md overflow-hidden ${isExcalidrawVisible ? '' : 'hidden'}`}>
                  {initialData ? (
                    <Excalidraw
                      onChange={onExcalidrawChange}
                      initialData={initialData}
                      excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
                      UIOptions={{
                        canvasActions: {
                          loadScene: false, // Disable "Open"
                          saveToActiveFile: false, // Disable "Save to"
                          export: false, // Disable "Export image"
                        },

                      }}
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
            <h2 className="text-3xl font-bold mb-4 text-green-800">Attachments</h2>
            <div className="space-y-4">
              <div {...getRootProps({ className: 'dropzone' })} className="dropzone border-2 border-dashed border-gray-300 p-4 rounded-md">
                <input {...getInputProps()} />
                <p>Drag 'n' drop or select other relevant documents or images (reports, lab data, site photos etc.)</p>
              </div>
              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold">Uploaded Files</h3>
                  <ul className="list-disc list-inside">
                    {uploadedFiles.map((file, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span>{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.name)}
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-green-800">Next Steps</h2>
            <div className="grid md:grid-cols-1 gap-6">
              <Card className="bg-gradient-to-r from-green-100 to-teal-100 border-green-300">
                <CardHeader>
                  <CardTitle className="text-green-800">Email Your Completed Form as a PDF</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                
                <p className="text-sm text-green-800 mb-4">
                Enter the recipient's email address below. The PDF will be sent from <i>forms@soilhub.nz</i>.
                To receive replies directly, add your email address in the 'Reply To' field.
                </p>
                <p className="text-sm text-green-800 mb-4">
                Before sending, use the "Preview Email" button to review the content.
                </p>
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
                    <Label htmlFor="replyToEmail">'Reply To' Email Address</Label>
                    <Input 
                      id="replyToEmail" 
                      type="email" 
                      placeholder="Replies will be sent here."
                      className="bg-white"
                      value={replyToEmail}
                      onChange={(e) => setReplyToEmail(e.target.value)}
                    />
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
                  <div className="flex flex-col space-y-4 w-full">
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
                          <h3 className="font-bold">Reply To: {replyToEmail}</h3>

                          <h3 className="font-bold mt-2">Custom Message:</h3>
                          <p>{customMessage}</p>
                          {/* <h3 className="font-bold mt-4">Form Data:</h3> */}
                          <div dangerouslySetInnerHTML={{ __html: generateEmailContent() }} />
                          {uploadedFiles.length > 0 && (
                            <div className="mt-4">
                              <h3 className=" text-green-600">Attachments</h3>
                              <ul className="list-disc list-inside">
                                {uploadedFiles.map((file, index) => (
                                  <li key={index} className="flex items-center space-x-2">
                                    {file.type === "application/pdf" && <FileText className="h-4 w-4 text-gray-500" />}
                                    <span>{file.name}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <Mail className="mr-2 h-4 w-4" />
                      Email Form
                    </Button>
                  </div>
                </CardFooter>
              </Card>
              {/* <Card className="bg-gradient-to-r from-teal-100 to-blue-100 border-teal-300">
                <CardHeader>
                  <CardTitle className="text-green-800">Download Form</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-800 mb-4">
                    Click the button below if you would prefer to download a PDF version of the completed form. 
                  </p>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Download className="mr-2 h-4 w-4" />
                    Download Form
                  </Button>
                </CardFooter>
              </Card> */}
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
          <p className="mt-4">
            <a 
              href="https://linkedin.com" 
              className="text-green-200 hover:text-green-100 inline-flex items-center"
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.25c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.25h-3v-5.5c0-1.38-.02-3.16-1.93-3.16-1.93 0-2.23 1.51-2.23 3.06v5.6h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.58v5.6z"/>
              </svg>
              Made with ❤️ by Tom Wilson
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}