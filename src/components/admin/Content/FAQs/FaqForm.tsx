import { useState } from "react";
import {
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button
} from "@/components/ui/index";

type FAQ = {
  _id?: string;
  question: string;
  category: string;
  status: "published" | "draft" | "review";
  lastUpdated?: string;
  answer?: string;
};

type FaqFormProps = {
  initial: FAQ;
  onSave: (faq: FAQ) => void;
  onCancel: () => void;
};


export default function FaqForm({ initial, onSave, onCancel }: FaqFormProps) {
  const [question, setQuestion] = useState(initial.question);
  const [category, setCategory] = useState(initial.category);
  const [status, setStatus] = useState<"published" | "draft" | "review">(
    initial.status
  );
  const [answer, setAnswer] = useState(initial.answer || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...initial,
          question,
          category,
          status,
          answer,
          lastUpdated: new Date().toISOString(),
        });
      }}
      className="space-y-4"
    >
      <div>
        <Label>Question</Label>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Startup Compliance">Startup Compliance</SelectItem>
              <SelectItem value="Dispute Resolution">Dispute Resolution</SelectItem>
              <SelectItem value="Civil and Personal Issues">Civil and Personal Issues</SelectItem>
              <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
              <SelectItem value="Legal initiatives">Legal initiatives</SelectItem>
              
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(v) =>
              setStatus(v as "published" | "review")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="review">Under Review</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Answer</Label>
        <Textarea
          className="min-h-[150px]"
          placeholder="FAQ answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
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