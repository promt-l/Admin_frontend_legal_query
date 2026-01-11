import { Label, Input, Textarea, Button}from "@/components/ui/index";
import { useState } from "react";
type About = {
  _id?: string;
  title: string;
  subtitle?: string;
  content: string;
  imageUrl?: string;
  lastUpdated?: string;
};

const emptyAbout: About = {
  title: "",
  subtitle: "",
  content: "",
  imageUrl: "",
};

export default function AboutForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: About;
  onSave: (about: About) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle || "");
  const [content, setContent] = useState(initial.content || "");
  const [imageUrl, setImageUrl] = useState(initial.imageUrl || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...initial,
          title,
          subtitle,
          content,
          imageUrl,
          lastUpdated: new Date().toISOString(),
        });
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
      <div>
        <Label>Subtitle</Label>
        <Input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Optional"
        />
      </div>
      <div>
        <Label>Content</Label>
        <Textarea
          className="min-h-[150px]"
          placeholder="About section content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Image URL</Label>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      {imageUrl && (
        <div className="mb-2">
          <img
            src={imageUrl}
            alt="Preview"
            className="h-24 w-24 object-cover rounded"
          />
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}