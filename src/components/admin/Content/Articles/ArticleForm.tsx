import { Label, Input, Textarea, Button, Select, SelectTrigger, SelectItem, SelectContent, SelectValue}from "@/components/ui/index";
import { useState } from "react";
type Article = {
  _id?: string;
  title: string;
  category: string;
  status: "published" | "draft" | "review";
  author: string;
  publishDate?: string;
  views?: number;
  content?: string;
};

type ArticleFormProps = {
  initial: Article;
  onSave: (article: Article) => void;
  onCancel: () => void;
};

export default function ArticleForm({ initial, onSave, onCancel }: ArticleFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [category, setCategory] = useState(initial.category);
  const [status, setStatus] = useState<"published" | "draft" | "review">(
    initial.status
  );
  const [author, setAuthor] = useState(initial.author);
  const [content, setContent] = useState(initial.content || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...initial, title, category, status, author, content });
      }}
      className="space-y-4"
    >
      <div>
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
              <SelectItem value="Startup Legal">Startup Legal</SelectItem>
              <SelectItem value="Legal Issues">Legal Issues</SelectItem>
              <SelectItem value="ADR">ADR</SelectItem>
              <SelectItem value="IPR">IPR</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(v) =>
              setStatus(v as "draft" | "review" | "published")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="review">Under Review</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Author</Label>
        <Input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Content</Label>
        <Textarea
          className="min-h-[300px]"
          placeholder="Article content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
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