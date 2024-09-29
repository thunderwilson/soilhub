import React, { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { ChevronUp, ChevronDown } from "lucide-react"
import { AnalyticalSummaryTable } from "~/components/AnalyticalSummaryTable"
import { SamplingDetails } from "~/components/SamplingDetails"

const defaultContaminants = [
  "Arsenic", "Cadmium", "Copper", "Chromium", "Mercury", "Nickel", "Zinc", "Asbestos P/A"
]

type ConsignmentDetailProps = {
  index: number;
  formDataRef: React.MutableRefObject<any>;
  openSections: number[];
  toggleSection: (index: number) => void;
  availableContaminants: string[];
}

type AnalyticalRow = {
  id: string;
  contaminant: string;
  maximum: string;
  minimum: string;
  average: string;
  leachable: string;
}

export function ConsignmentDetails({ index, formDataRef, openSections, toggleSection, availableContaminants }: ConsignmentDetailProps) {
  const consignmentData = formDataRef.current.consignmentDetails[index] || {}
  const [localState, setLocalState] = useState<{
    materialDescription: string;
    expectedDeliveryDate: string;
    expectedDuration: string;
    expectedFrequency: string;
    expectedVolume: string;
    samplesTaken: string;
    sampleMethod: string;
    sampleMethodAdditionalInfo: string;
    soilCategorization: string;
    soilCategorizationAdditionalInfo: string;
    analyticalRows: AnalyticalRow[];
  }>({
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

  useEffect(() => {
    if (localState.analyticalRows.length === 0) {
      const initialRows = defaultContaminants.map((contaminant, index) => ({
        id: (index + 1).toString(),
        contaminant,
        maximum: "",
        minimum: "",
        average: "",
        leachable: ""
      }));
      updateLocalState('analyticalRows', initialRows);
    }
  }, []);

  const updateLocalState = (field: string, value: any) => {
    setLocalState(prev => {
      const updated = { ...prev, [field]: value }
      formDataRef.current.consignmentDetails[index] = updated
      return updated
    })
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
              <Input 
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
          <TabsContent value="sampling">
            <SamplingDetails
              index={index}
              localState={localState}
              updateLocalState={updateLocalState}
            />
          </TabsContent>
          <TabsContent value="analytical">
            <AnalyticalSummaryTable
              analyticalRows={localState.analyticalRows}
              updateAnalyticalRow={(id: string, field: keyof AnalyticalRow, value: string) => {
                const updatedRows = localState.analyticalRows.map(row => 
                  row.id === id ? { ...row, [field]: value } : row
                )
                updateLocalState('analyticalRows', updatedRows)
              }}
              removeAnalyticalRow={(id: string) => {
                const updatedRows = localState.analyticalRows.filter(row => row.id !== id)
                updateLocalState('analyticalRows', updatedRows)
              }}
              addAnalyticalRow={(contaminant: string) => {
                const newId = (localState.analyticalRows.length + 1).toString()
                const newRow: AnalyticalRow = { id: newId, contaminant, maximum: "", minimum: "", average: "", leachable: "" }
                updateLocalState('analyticalRows', [...localState.analyticalRows, newRow])
              }}
              availableContaminants={availableContaminants}
            />
          </TabsContent>
        </Tabs>
      </CollapsibleContent>
    </Collapsible>
  )
}