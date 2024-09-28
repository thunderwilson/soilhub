import React from "react"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"

type SamplingDetailsProps = {
  index: number;
  localState: {
    samplesTaken: string;
    sampleMethod: string;
    otherSampleMethod?: string;
    sampleMethodAdditionalInfo: string;
    soilCategorization: string;
    otherSoilCategorization?: string;
    soilCategorizationAdditionalInfo: string;
  };
  updateLocalState: (field: string, value: any) => void;
}

export const SamplingDetails: React.FC<SamplingDetailsProps> = ({
  index,
  localState,
  updateLocalState
}) => {
  return (
    <div className="space-y-6">
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
    </div>
  )
}