import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Label,
  Textarea,
  Plus,
  Edit,
  Trash2,
} from "@/components/ui/index";

import { getStatusColor } from "@/utils/status";
const MyComponent = ({ status }: { status: string }) => {
  return <Badge variant={getStatusColor(status)}>{status}</Badge>;
};

type Page = {
  _id?: string;
  title: string;
  slug: string;
  content?: string;
  lastUpdated?: string;
};

type PageFormProps = {
  initial: Page;
  onSave: (page: Page) => void;
  onCancel: () => void;
};

const emptyPage: Page = {
  title: "",
  slug: "",
  content: "",
};

import { API_URL } from "@/config/api";

export default function CreatePages(){
    const [pages, setPages] = useState<Page[]>([]);
    const [pageSearch, setPageSearch] = useState("");
    const [pageDialog, setPageDialog] = useState<{ open: boolean; page?: Page }>({
        open: false,
    });
    const [loadingPages, setLoadingPages] = useState(false);

    useEffect(() => {
    setLoadingPages(true);
    const params = [];
    if (pageSearch) params.push(`search=${encodeURIComponent(pageSearch)}`);
    fetch(`${API_URL}/pages${params.length ? "?" + params.join("&") : ""}`)
      .then((res) => res.json())
      .then(setPages)
      .finally(() => setLoadingPages(false));
  }, [pageSearch]);

  // === Page CRUD ===
  const handleSavePage = (page: Page) => {
    const method = page._id ? "PUT" : "POST";
    const url = page._id ? `${API_URL}/pages/${page._id}` : `${API_URL}/pages`;
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(page),
    }).then(() => {
      setPageDialog({ open: false });
      setLoadingPages(true);
      fetch(`${API_URL}/pages`)
        .then((res) => res.json())
        .then(setPages)
        .finally(() => setLoadingPages(false));
    });
  };
  const handleDeletePage = (id: string) => {
    fetch(`${API_URL}/pages/${id}`, { method: "DELETE" }).then(() =>
      setPages(pages.filter((p) => p._id !== id))
    );
  };

  return(
    <>
        <Card>
            <CardHeader>
              <CardTitle>Page Management</CardTitle>
              <CardDescription>Manage static pages and content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Input
                    placeholder="Search pages..."
                    className="max-w-sm"
                    value={pageSearch}
                    onChange={(e) => setPageSearch(e.target.value)}
                  />
                  <Button
                    onClick={() =>
                      setPageDialog({ open: true, page: emptyPage })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Page
                  </Button>
                </div>
                {loadingPages ? (
                  <p>Loading...</p>
                ) : (
                  <div className="space-y-2">
                    {pages.map((page) => (
                      <div
                        key={page._id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{page.title}</h4>
                          <p className="text-sm text-gray-600">
                            Last updated:{" "}
                            {page.lastUpdated
                              ? new Date(page.lastUpdated).toLocaleDateString()
                              : ""}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPageDialog({ open: true, page })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePage(page._id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* --- PAGE DIALOG --- */}
          <Dialog
            open={pageDialog.open}
            onOpenChange={(v) =>
              setPageDialog({ open: v, page: pageDialog.page })
            }
          >
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {pageDialog.page?._id ? "Edit Page" : "New Page"}
                </DialogTitle>
                <DialogDescription>
                  {pageDialog.page?._id ? "Edit page" : "Create a new page"}
                </DialogDescription>
              </DialogHeader>
              {pageDialog.page && (
                <PageForm
                  initial={pageDialog.page}
                  onSave={handleSavePage}
                  onCancel={() => setPageDialog({ open: false })}
                />
              )}
            </DialogContent>
          </Dialog>
    </>
  )
}

// --- Page Form ---
function PageForm({ initial, onSave, onCancel }: PageFormProps) {
  // Defensive: fallback to emptyPage if initial is undefined/null
  const realInitial = initial || emptyPage;
  const [title, setTitle] = useState(realInitial.title);
  const [slug, setSlug] = useState(realInitial.slug);
  const [content, setContent] = useState(realInitial.content || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...realInitial,
          title,
          slug,
          content,
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
        <Label>Slug</Label>
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Content</Label>
        <Textarea
          className="min-h-[200px]"
          placeholder="Page content..."
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