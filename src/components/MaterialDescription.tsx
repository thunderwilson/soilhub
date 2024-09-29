import React from 'react';
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Button } from "~/components/ui/button"
import { ChevronUp, ChevronDown, Minus, Plus } from "lucide-react"
import { Excalidraw } from "@excalidraw/excalidraw"

type MaterialDescriptionProps = {
  formDataRef: React.MutableRefObject<any>;
  updateFormData: (field: string, value: any) => void;
  consignments: number;
  updateConsignments: (newValue: number) => void;
  isExcalidrawVisible: boolean;
  setIsExcalidrawVisible: React.Dispatch<React.SetStateAction<boolean>>;
  excalidrawAPI: any;
  setExcalidrawAPI: React.Dispatch<React.SetStateAction<any>>;
  initialData: any;
  onExcalidrawChange: () => void;
};

export function MaterialDescription({
  formDataRef,
  updateFormData,
  consignments,
  updateConsignments,
  isExcalidrawVisible,
  setIsExcalidrawVisible,
  excalidrawAPI,
  setExcalidrawAPI,
  initialData,
  onExcalidrawChange
}: MaterialDescriptionProps) {
  const handleExcalidrawToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsExcalidrawVisible(!isExcalidrawVisible);
  };

  return (
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
                    loadScene: false,
                    saveToActiveFile: false,
                    export: false,
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
              <Minus className="h-4 w-4" />
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
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}