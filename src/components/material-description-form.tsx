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
import { AnalyticalSummaryTable } from "~/components/AnalyticalSummaryTable"
import { SamplingDetails } from "~/components/SamplingDetails"
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Instructions } from '~/components/Instructions'
import { MaterialDescription } from '~/components/MaterialDescription'
import { ConsignmentDetails } from '~/components/ConsignmentDetails'

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
      <Header />

      <div className="container mx-auto p-4 space-y-8">
        <Instructions />

        <form className="space-y-8 bg-white bg-opacity-80 backdrop-blur-md rounded-lg shadow-xl p-6" onSubmit={handleSubmit}>
          <MaterialDescription
            formDataRef={formDataRef}
            updateFormData={updateFormData}
            consignments={consignments}
            updateConsignments={updateConsignments}
            isExcalidrawVisible={isExcalidrawVisible}
            setIsExcalidrawVisible={setIsExcalidrawVisible}
            excalidrawAPI={excalidrawAPI}
            setExcalidrawAPI={setExcalidrawAPI}
            initialData={initialData}
            onExcalidrawChange={onExcalidrawChange}
          />

          <section>
            <h2 className="text-3xl font-bold mb-4 text-green-800">Consignment Details</h2>
            <div className="space-y-4">
              {Array.from({ length: consignments }, (_, i) => (
                <ConsignmentDetails 
                  key={i} 
                  index={i} 
                  formDataRef={formDataRef}
                  openSections={openSections}
                  toggleSection={toggleSection}
                  availableContaminants={predefinedContaminants}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-green-800">Attachments (<i>coming soon</i>)</h2>
            <div className="space-y-4">
              <div className="dropzone border-2 border-dashed border-gray-300 p-4 rounded-md bg-gray-200 cursor-not-allowed">
                <input disabled />
                <p className="text-gray-500">Upload relevant documents or images (reports, lab data, site photos etc.) (Disabled)</p>
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
            <h2 className="text-3xl font-bold mb-4 text-green-800">Submit Form</h2>
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
                              {/* <h3 className=" text-green-600">Attachments</h3>
                              <ul className="list-disc list-inside">
                                {uploadedFiles.map((file, index) => (
                                  <li key={index} className="flex items-center space-x-2">
                                    {file.type === "application/pdf" && <FileText className="h-4 w-4 text-gray-500" />}
                                    <span>{file.name}</span>
                                  </li>
                                ))}
                              </ul> */}
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

      <Footer />
    </div>
  )
}