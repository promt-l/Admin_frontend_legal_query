import { useState, useEffect } from "react";
import {
  Input,
  Textarea,
  Label,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Button,
} from "@/components/ui/index";

export interface Assistance {
  _id?: string;
  heading: string;
  subheading: string;
  description: string;
  category: string;
  buttonText: string; 
  path: string;       
}

export default function AssistanceForm({
  initial,
  onSave,
  onCancel,
  categories,
}: {
  initial: Assistance;
  onSave: (assistance: Assistance) => void;
  onCancel: () => void;
  categories: string[];
}) {
  const [heading, setHeading] = useState(initial.heading);
  const [subheading, setSubheading] = useState(initial.subheading);
  const [description, setDescription] = useState(initial.description);
  const [category, setCategory] = useState(initial.category || "");
  const [buttonText, setButtonText] = useState(initial.buttonText); // New state
  const [path, setPath] = useState(initial.path);                   // New state

  useEffect(() => {
    setHeading(initial.heading);
    setSubheading(initial.subheading);
    setDescription(initial.description);
    setCategory(initial.category || "");
    setButtonText(initial.buttonText);
    setPath(initial.path);
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      alert("Please select a category");
      return;
    }
    onSave({
      ...initial,
      heading,
      subheading,
      description,
      category,
      buttonText,
      path,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category, Heading, Subheading, and Description fields remain the same... */}
       <div>
         <Label htmlFor="category">Category</Label>
         <Select value={category} onValueChange={(val) => setCategory(val)}>
           <SelectTrigger id="category">
             <SelectValue placeholder="Select category" />
           </SelectTrigger>
           <SelectContent>
             {categories.map((cat) => (
               <SelectItem key={cat} value={cat}> {cat} </SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>
       <div>
         <Label htmlFor="heading">Heading</Label>
         <Input id="heading" value={heading} onChange={(e) => setHeading(e.target.value)} placeholder="Assistance heading" required />
       </div>
       <div>
         <Label htmlFor="subheading">Subheading</Label>
         <Input id="subheading" value={subheading} onChange={(e) => setSubheading(e.target.value)} placeholder="Assistance subheading" required />
       </div>
       <div>
         <Label htmlFor="description">Description</Label>
         <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Assistance description" className="min-h-[150px]" required />
       </div>
      
      {/* New Fields */}
      <div>
        <Label htmlFor="buttonText">Button Text</Label>
        <Input
          id="buttonText"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          placeholder="e.g., Get Started"
          required
        />
      </div>

      <div>
        <Label htmlFor="path">Navigation Path</Label>
        <Input
          id="path"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="e.g., /startup-help"
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}