import React, { useState } from 'react';
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "~/components/ui/dialog"
import { Badge } from "~/components/ui/badge"
import { Mail, Eye, X } from "lucide-react"
import axios from 'axios';
// Import toast components
import { useToast } from "~/hooks/use-toast"
import { Toaster } from "~/components/ui/toaster"
import { DynamicSuccessPopup } from "~/components/dynamic-success-popup"

// Update the props to include attachment URLs
type EmailSubmissionProps = {
  formDataRef: React.MutableRefObject<any>;
  uploadedFiles: { file: File; url: string }[]; // Change this line
  generateEmailContent: () => Promise<string>;
};

export function EmailSubmission({ formDataRef, uploadedFiles, generateEmailContent }: EmailSubmissionProps) {
  // State for managing email addresses
  const [destinationEmails, setDestinationEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [replyToEmail, setReplyToEmail] = useState("");
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Add toast
  const { toast } = useToast()

  // Function to add an email to the list of destination emails
  const addEmail = () => {
    if (currentEmail && !destinationEmails.includes(currentEmail)) {
      setDestinationEmails([...destinationEmails, currentEmail]);
      setCurrentEmail("");
    }
  };

  // Function to remove an email from the list of destination emails
  const removeEmail = (email: string) => {
    setDestinationEmails(destinationEmails.filter(e => e !== email));
  };

  // Function to handle preview
  const handlePreview = async () => {
    if (!previewContent) {
      const content = await generateEmailContent();
      setPreviewContent(content);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Open the dialog immediately
    setIsSuccessPopupOpen(true);
    setIsProcessing(true);

    try {
      const emailContent = previewContent || await generateEmailContent();

      // Prepare the form data to be sent
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
        consignmentDetails: formDataRef.current.consignmentDetails.map((consignment: any, index: number) => ({
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
        attachments: uploadedFiles.map(({ file, url }) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          url: url, // Include the URL of the uploaded file
        })),
        htmlContent: emailContent,
      };

      // Send the form data to the server
      const response = await axios.post(
        'https://hook.us1.make.com/swsnm14i1t7qowyc3g4dmzo0ul2r0wrg',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Close the success popup and show an error message
      setIsSuccessPopupOpen(false);
      toast({
        title: "Error",
        description: "An error occurred while submitting the form. Please try again.",
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className="bg-gradient-to-r from-green-100 to-teal-100 border-green-300">
        <CardHeader>
          <CardTitle className="text-green-800">Email Your Completed Form as a PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instructions for the user */}
          <p className="text-sm text-green-800 mb-4">
            Enter the recipient's email address below. The PDF will be sent from <i>forms@soilhub.nz</i>.
            To receive replies directly, add your email address in the 'Reply To' field.
          </p>
          <p className="text-sm text-green-800 mb-4">
            Before sending, use the "Preview Email" button to review the content.
          </p>
          {/* Email input section */}
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
            {/* Display added email addresses */}
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
          {/* Reply-to email input */}
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
          {/* Custom message input */}
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
            {/* Email preview dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full bg-green-200 hover:bg-green-300 text-green-800 border-green-400"
                  onClick={handlePreview}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Email
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-green-800">Email Preview</DialogTitle>
                  <DialogDescription>
                    This is a preview of the email that will be sent.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 p-4">
                  <h3 className="font-bold">To: {destinationEmails.join(", ")}</h3>
                  <h3 className="font-bold">Reply To: {replyToEmail}</h3>
                  <h3 className="font-bold mt-2">Custom Message:</h3>
                  <p>{customMessage}</p>
                  {previewContent && <div dangerouslySetInnerHTML={{ __html: previewContent }} />}
                </div>
              </DialogContent>
            </Dialog>
            {/* Submit button */}
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleSubmit}>
              <Mail className="mr-2 h-4 w-4" />
              Email Form
            </Button>
          </div>
        </CardFooter>
      </Card>
      <Toaster />
      <DynamicSuccessPopup 
        isOpen={isSuccessPopupOpen} 
        setIsOpen={setIsSuccessPopupOpen}
        //isProcessing={isProcessing}
      />
    </>
  );
}